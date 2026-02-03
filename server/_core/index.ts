import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import net from "net";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
// import { registerOAuthRoutes } from "./oauth"; // Removed: Using Clerk instead
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // CORS configuration - MUST be before other middleware
  // Enable CORS with credentials support for cookies
  app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? (process.env.FRONTEND_URL || true) // In production, specify your frontend URL
      : true, // In development, allow all origins
    credentials: true, // CRITICAL: Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  }));

  console.log('[CORS] Configured with credentials: true');

  // Stripe webhook needs raw body - MUST be before express.json()
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    try {
      const { stripe } = await import('../stripe');
      const { updateOrderByStripeSessionId, createAuditLog, getOrderByStripeSessionId, getUserById } = await import('../db');
      const { createInvoiceFromStripePayment, generateInvoiceHtml, getInvoiceWithItems } = await import('../invoiceService');
      const { sendInvoiceEmail, sendOrderConfirmationEmail, sendAdminOrderNotification } = await import('../emailService');
      
      let event;
      
      if (webhookSecret && sig) {
        try {
          event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err: any) {
          console.error(`[Webhook] Signature verification failed:`, err.message);
          return res.status(400).send(`Webhook Error: ${err.message}`);
        }
      } else {
        // For testing without signature verification
        event = JSON.parse(req.body.toString());
      }
      
      console.log(`[Webhook] Received event: ${event.type} (${event.id})`);
      
      // Handle test events
      if (event.id.startsWith('evt_test_')) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }
      
      // Handle checkout.session.completed
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        if (session.payment_status === 'paid') {
          await updateOrderByStripeSessionId(session.id, {
            status: 'completed',
            stripePaymentIntentId: session.payment_intent as string,
            stripeCustomerId: session.customer as string,
            paidAt: new Date(),
          });
          
          await createAuditLog({
            userId: session.metadata?.user_id ? parseInt(session.metadata.user_id) : undefined,
            action: 'update',
            entityType: 'order',
            newValues: { 
              sessionId: session.id, 
              status: 'completed',
              productId: session.metadata?.product_id,
            },
          });
          
          console.log(`[Webhook] Order completed for session: ${session.id}`);
          
          // Generate invoice for the payment
          try {
            const order = await getOrderByStripeSessionId(session.id);
            if (order) {
              const user = order.userId ? await getUserById(order.userId) : null;
              const productType = order.productId === 'ANALYSE' ? 'analysis' : 'shop';
              
              // Get amount from session
              const amount = session.amount_total ? session.amount_total / 100 : 0;
              
              const invoice = await createInvoiceFromStripePayment({
                userId: order.userId,
                orderId: order.id,
                productType,
                productName: order.productName,
                amount,
                customerEmail: session.customer_details?.email || user?.email || '',
                customerName: session.customer_details?.name || user?.name || undefined,
                stripePaymentId: session.payment_intent as string,
              });
              
              console.log(`[Webhook] Invoice created: ${invoice.invoiceNumber}`);
              
              // Send invoice email notification
              try {
                const invoiceWithItems = await getInvoiceWithItems(invoice.id);
                if (invoiceWithItems) {
                  const invoiceHtml = generateInvoiceHtml(invoiceWithItems.invoice, invoiceWithItems.items);
                  
                  await sendInvoiceEmail({
                    customerEmail: invoice.customerEmail || '',
                    customerName: invoice.customerName,
                    invoiceNumber: invoice.invoiceNumber,
                    grossAmount: invoice.grossAmount,
                    currency: invoice.currency,
                    productDescription: order.productName,
                    invoiceDate: invoice.invoiceDate || new Date(),
                    dueDate: invoice.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    invoiceHtml,
                  });
                  
                  // Also send order confirmation
                  await sendOrderConfirmationEmail({
                    customerEmail: invoice.customerEmail || '',
                    customerName: invoice.customerName,
                    orderId: order.id,
                    productName: order.productName,
                    amount: invoice.grossAmount,
                    currency: invoice.currency,
                  });

                  // Send admin notification about new order
                  await sendAdminOrderNotification({
                    customerEmail: invoice.customerEmail || '',
                    customerName: invoice.customerName,
                    orderId: order.id,
                    productName: order.productName,
                    amount: invoice.grossAmount,
                    currency: invoice.currency,
                    orderDate: order.createdAt || new Date(),
                  });

                  // GoHighLevel Integration: Create/update contact and add to CRM
                  try {
                    const { ghlService } = await import('../services/gohighlevel');
                    await ghlService.processNewOrder({
                      email: invoice.customerEmail || '',
                      name: invoice.customerName,
                      productName: order.productName,
                      amount: invoice.grossAmount,
                      currency: invoice.currency,
                      orderId: order.id,
                      orderDate: order.createdAt || new Date(),
                    });
                    console.log(`[Webhook] GoHighLevel contact processed for ${invoice.customerEmail}`);
                  } catch (ghlError) {
                    console.error('[Webhook] Error processing GoHighLevel contact:', ghlError);
                    // Don't fail the webhook if GHL processing fails
                  }

                  console.log(`[Webhook] Invoice email notification sent for ${invoice.invoiceNumber}`);
                }
              } catch (emailError) {
                console.error('[Webhook] Error sending invoice email:', emailError);
              }
            }
          } catch (invoiceError) {
            console.error('[Webhook] Error creating invoice:', invoiceError);
            // Don't fail the webhook if invoice creation fails
          }
        }
      }
      
      // Handle payment_intent.payment_failed
      if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object;
        console.log(`[Webhook] Payment failed: ${paymentIntent.id}`);
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error('[Webhook] Error processing webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Calendly webhook for booking creation
  app.post('/api/webhooks/calendly', express.json(), async (req, res) => {
    try {
      console.log('[Calendly Webhook] Received event:', req.body.event);

      const event = req.body;

      // Handle invitee.created event (new booking)
      if (event.event === 'invitee.created') {
        const { payload } = event;
        const invitee = payload.invitee;
        const eventData = payload.event;

        console.log('[Calendly Webhook] New booking:', {
          inviteeUri: invitee.uri,
          eventUri: eventData.uri,
          email: invitee.email,
          name: invitee.name,
        });

        // Import DB functions
        const { createBooking, getUserByEmail, getAllActiveStaffCalendars } = await import('../db');
        const { sendBookingConfirmationEmail } = await import('../emailService');

        // Find customer by email
        const customer = await getUserByEmail(invitee.email);
        if (!customer) {
          console.warn('[Calendly Webhook] Customer not found for email:', invitee.email);
          return res.json({ received: true, warning: 'Customer not found' });
        }

        // Find staff calendar by Calendly URL (match against calendlyUrl in staff_calendars)
        const staffCalendars = await getAllActiveStaffCalendars();
        const matchingCalendar = staffCalendars.find(cal =>
          cal.calendlyUrl && eventData.uri.includes(cal.calendlyUrl)
        );

        if (!matchingCalendar) {
          console.warn('[Calendly Webhook] No matching staff calendar found for event:', eventData.uri);
          return res.json({ received: true, warning: 'No matching staff calendar' });
        }

        // Create booking in database
        await createBooking({
          userId: customer.id,
          staffCalendarId: matchingCalendar.id,
          calendlyEventId: eventData.uri,
          calendlyInviteeId: invitee.uri,
          title: eventData.name || 'Beratungsgespräch',
          description: null,
          startTime: new Date(eventData.start_time),
          endTime: new Date(eventData.end_time),
          meetingUrl: eventData.location?.join_url || null,
          status: 'confirmed',
          customerNotes: invitee.questions_and_answers?.map((qa: any) => `${qa.question}: ${qa.answer}`).join('\n') || null,
        });

        // Send confirmation email
        try {
          await sendBookingConfirmationEmail({
            customerEmail: invitee.email,
            customerName: invitee.name || customer.name || 'Kunde',
            staffName: matchingCalendar.name,
            bookingTitle: eventData.name || 'Beratungsgespräch',
            startTime: new Date(eventData.start_time),
            endTime: new Date(eventData.end_time),
            meetingUrl: eventData.location?.join_url,
            description: null,
          });
        } catch (emailError) {
          console.error('[Calendly Webhook] Failed to send confirmation email:', emailError);
          // Don't fail the webhook if email fails
        }

        console.log('[Calendly Webhook] Booking created successfully');
      }

      // Handle invitee.canceled event
      if (event.event === 'invitee.canceled') {
        const { payload } = event;
        const invitee = payload.invitee;

        console.log('[Calendly Webhook] Booking cancelled:', invitee.uri);

        const { getBookingByCalendlyEventId, updateBooking } = await import('../db');
        const { sendBookingCancelledEmail } = await import('../emailService');

        // Find and cancel booking
        const booking = await getBookingByCalendlyEventId(invitee.event);
        if (booking) {
          await updateBooking(booking.id, { status: 'cancelled' });

          // Send cancellation email
          try {
            const { getUserById } = await import('../db');
            const customer = await getUserById(booking.userId);

            if (customer && customer.email) {
              await sendBookingCancelledEmail({
                customerEmail: customer.email,
                customerName: customer.name || 'Kunde',
                bookingTitle: booking.title,
                startTime: booking.startTime,
              });
            }
          } catch (emailError) {
            console.error('[Calendly Webhook] Failed to send cancellation email:', emailError);
          }

          console.log('[Calendly Webhook] Booking cancelled successfully');
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error('[Calendly Webhook] Error processing webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // GoHighLevel webhook for contact/opportunity updates
  app.post('/api/webhooks/gohighlevel', express.json(), async (req, res) => {
    try {
      console.log('[GHL Webhook] Received event:', JSON.stringify(req.body).substring(0, 500));

      const { type, contact, opportunity } = req.body;

      switch (type) {
        case 'ContactCreate':
        case 'ContactUpdate': {
          console.log('[GHL Webhook] Contact event:', type, contact?.id);

          // FIX 2: Process contact events from GHL → Portal
          if (!contact || !contact.id) {
            console.warn('[GHL Webhook] Missing contact data');
            break;
          }

          const {
            getLeadByGHLContactId,
            updateLead,
            getContactByGHLContactId,
            updateContact,
            createLead
          } = await import('../db');

          // Check if contact exists as Lead
          const existingLead = await getLeadByGHLContactId(contact.id);
          if (existingLead) {
            await updateLead(existingLead.id, existingLead.tenantId, {
              name: contact.name || contact.firstName || '',
              email: contact.email,
              phone: contact.phone,
              company: contact.companyName,
              lastSyncedAt: new Date(),
            });
            console.log(`[GHL Webhook] Lead updated: ${existingLead.id}`);
            break;
          }

          // Check if contact exists as Contact
          const existingContact = await getContactByGHLContactId(contact.id);
          if (existingContact) {
            await updateContact(existingContact.id, existingContact.tenantId, {
              name: contact.name || contact.firstName || '',
              email: contact.email,
              phone: contact.phone,
              company: contact.companyName,
              street: contact.address1,
              city: contact.city,
              zip: contact.postalCode,
              country: contact.country,
              website: contact.website,
              lastSyncedAt: new Date(),
            });
            console.log(`[GHL Webhook] Contact updated: ${existingContact.id}`);
            break;
          }

          // Create new lead if contact doesn't exist (ContactCreate event)
          if (type === 'ContactCreate' && contact.email) {
            const leadId = await createLead({
              tenantId: 1,
              ghlContactId: contact.id,
              name: contact.name || contact.firstName || '',
              email: contact.email,
              phone: contact.phone,
              company: contact.companyName,
              source: 'ghl',
              status: 'new',
              lastSyncedAt: new Date(),
            });
            console.log(`[GHL Webhook] New lead created from GHL: ${leadId}`);
          }
          break;
        }

        case 'OpportunityStatusChange': {
          console.log('[GHL Webhook] Opportunity event:', type, opportunity?.id);

          // FIX 2: Process opportunity status changes
          if (!opportunity || !opportunity.id) {
            console.warn('[GHL Webhook] Missing opportunity data');
            break;
          }

          const { getDealByGHLOpportunityId, updateDeal } = await import('../db');

          // Check if deal exists with this GHL opportunity ID
          const existingDeal = await getDealByGHLOpportunityId(opportunity.id);
          if (existingDeal) {
            // Map GHL status to portal stage
            const statusMapping: Record<string, 'new' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'> = {
              'open': 'new',
              'won': 'won',
              'lost': 'lost',
              'abandoned': 'lost',
            };
            const newStage = statusMapping[opportunity.status?.toLowerCase()] || 'new';

            await updateDeal(existingDeal.id, existingDeal.tenantId, {
              stage: newStage,
              value: opportunity.monetaryValue,
              lastSyncedAt: new Date(),
            });
            console.log(`[GHL Webhook] Deal updated: ${existingDeal.id} → ${newStage}`);
          } else {
            console.log(`[GHL Webhook] No deal found for opportunity: ${opportunity.id}`);
          }
          break;
        }

        default:
          console.log('[GHL Webhook] Unknown event type:', type);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('[GHL Webhook] Error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Cookie parser for reading cookies from requests
  app.use(cookieParser());

  // Debug endpoint to inspect cookies and headers
  app.get('/api/debug/auth', (req, res) => {
    res.json({
      headers: {
        cookie: req.headers.cookie || 'missing',
        authorization: req.headers.authorization || 'missing',
      },
      cookies: req.cookies,
      signedCookies: req.signedCookies,
      allCookieNames: Object.keys(req.cookies || {}),
    });
  });

  // File upload endpoint
  app.post('/api/upload', async (req, res) => {
    try {
      const { fileName, mimeType, data } = req.body;
      
      if (!fileName || !data) {
        return res.status(400).json({ error: 'fileName and data are required' });
      }
      
      const { storagePut } = await import('../storage');
      const { nanoid } = await import('nanoid');
      
      // Generate unique file key
      const fileKey = `onboarding-docs/${nanoid()}-${fileName}`;
      
      // Convert base64 to buffer
      const buffer = Buffer.from(data, 'base64');
      
      // Upload to S3
      const result = await storagePut(fileKey, buffer, mimeType || 'application/octet-stream');
      
      res.json({ key: result.key, url: result.url });
    } catch (error) {
      console.error('[Upload] Error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  // Static file serving for local uploads
  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));
  console.log('[Storage] Local file serving enabled at /uploads');

  // OAuth callback - REMOVED: Using Clerk authentication instead
  // registerOAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
