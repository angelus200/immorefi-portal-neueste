import { Resend } from 'resend';
import { notifyOwner } from "./_core/notification";
import { ENV } from "./_core/env";

// Resend Client initialisieren
const resend = ENV.resendApiKey ? new Resend(ENV.resendApiKey) : null;

// E-Mail-Konfiguration
const EMAIL_CONFIG = {
  from: "NON DOM Group <info@non-dom.group>",
  replyTo: "info@non-dom.group",
};

// E-Mail-Template für Rechnungsversand
function generateInvoiceEmailHtml(data: {
  customerName: string;
  invoiceNumber: string;
  grossAmount: number;
  currency: string;
  productDescription: string;
  invoiceDate: string;
  dueDate: string;
}): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', { 
      style: 'currency', 
      currency: data.currency 
    }).format(amount);
  };

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ihre Rechnung von NON DOM Group</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #00B4D8 0%, #0096B4 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                NON <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 4px;">DOM</span> GROUP
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">
                Ihre Rechnung ${data.invoiceNumber}
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Guten Tag ${data.customerName},
              </p>
              
              <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                vielen Dank für Ihren Kauf. Anbei finden Sie Ihre Rechnung.
              </p>
              
              <!-- Invoice Summary Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Rechnungsnummer:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right; font-weight: 600;">${data.invoiceNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Rechnungsdatum:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${data.invoiceDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Fällig bis:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${data.dueDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Produkt:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${data.productDescription}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 16px; border-top: 1px solid #e5e7eb;"></td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 18px; font-weight: bold;">Gesamtbetrag:</td>
                        <td style="padding: 8px 0; color: #00B4D8; font-size: 18px; text-align: right; font-weight: bold;">${formatCurrency(data.grossAmount)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                Die vollständige Rechnung mit Zahlungsinformationen finden Sie im Anhang dieser E-Mail.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://immorefi.non-dom.group/invoices" style="display: inline-block; background: linear-gradient(135deg, #00B4D8 0%, #0096B4 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Rechnungen ansehen
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                Bei Fragen zu Ihrer Rechnung stehen wir Ihnen gerne zur Verfügung.
              </p>
              
              <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                Mit freundlichen Grüßen,<br>
                <strong>Ihr NON DOM Group Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-align: center;">
                Marketplace24-7 GmbH | Kantonsstrasse 1 | 8807 Freienbach SZ | Schweiz
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                UID: CHE-351.662.058 MWST | E-Mail: info@non-dom.group
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Sende Rechnung per E-Mail direkt an Kunden via Resend
export async function sendInvoiceEmail(data: {
  customerEmail: string;
  customerName: string;
  invoiceNumber: string;
  grossAmount: number;
  currency: string;
  productDescription: string;
  invoiceDate: Date;
  dueDate: Date;
  invoiceHtml: string; // HTML der Rechnung für PDF-Anhang
}): Promise<boolean> {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-CH', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  };

  const emailHtml = generateInvoiceEmailHtml({
    customerName: data.customerName,
    invoiceNumber: data.invoiceNumber,
    grossAmount: data.grossAmount,
    currency: data.currency,
    productDescription: data.productDescription,
    invoiceDate: formatDate(data.invoiceDate),
    dueDate: formatDate(data.dueDate),
  });

  // Versuche E-Mail via Resend zu senden
  if (resend && data.customerEmail) {
    try {
      const result = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: data.customerEmail,
        replyTo: EMAIL_CONFIG.replyTo,
        subject: `Ihre Rechnung ${data.invoiceNumber} - NON DOM Group`,
        html: emailHtml,
        attachments: [
          {
            filename: `Rechnung_${data.invoiceNumber}.html`,
            content: Buffer.from(data.invoiceHtml).toString('base64'),
          }
        ],
      });

      console.log(`[Email] Invoice ${data.invoiceNumber} sent to ${data.customerEmail} via Resend`, result);
      
      // Benachrichtige auch den Owner
      await notifyOwner({
        title: `✅ Rechnung ${data.invoiceNumber} versendet`,
        content: `
Rechnung erfolgreich per E-Mail versendet:

**Kunde:** ${data.customerName}
**E-Mail:** ${data.customerEmail}
**Rechnungsnummer:** ${data.invoiceNumber}
**Betrag:** ${new Intl.NumberFormat('de-CH', { style: 'currency', currency: data.currency }).format(data.grossAmount)}
**Produkt:** ${data.productDescription}
        `.trim()
      });
      
      return true;
    } catch (error) {
      console.error(`[Email] Failed to send invoice via Resend:`, error);
      
      // Fallback: Benachrichtige Owner für manuellen Versand
      await notifyOwner({
        title: `⚠️ Rechnung ${data.invoiceNumber} - Versand fehlgeschlagen`,
        content: `
E-Mail-Versand fehlgeschlagen. Bitte manuell versenden:

**Kunde:** ${data.customerName}
**E-Mail:** ${data.customerEmail}
**Rechnungsnummer:** ${data.invoiceNumber}
**Betrag:** ${new Intl.NumberFormat('de-CH', { style: 'currency', currency: data.currency }).format(data.grossAmount)}
**Produkt:** ${data.productDescription}

Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}

Die Rechnung kann im Admin-Bereich unter /admin/invoices heruntergeladen werden.
        `.trim()
      });
      
      return false;
    }
  } else {
    // Kein Resend API-Key oder keine E-Mail-Adresse - benachrichtige Owner
    console.log(`[Email] No Resend API key or customer email - notifying owner for manual send`);
    
    await notifyOwner({
      title: `📧 Rechnung ${data.invoiceNumber} erstellt`,
      content: `
Neue Rechnung erstellt - bitte manuell versenden:

**Kunde:** ${data.customerName}
**E-Mail:** ${data.customerEmail || 'Keine E-Mail-Adresse'}
**Rechnungsnummer:** ${data.invoiceNumber}
**Betrag:** ${new Intl.NumberFormat('de-CH', { style: 'currency', currency: data.currency }).format(data.grossAmount)}
**Produkt:** ${data.productDescription}
**Rechnungsdatum:** ${formatDate(data.invoiceDate)}
**Fällig bis:** ${formatDate(data.dueDate)}

Die Rechnung kann im Admin-Bereich unter /admin/invoices heruntergeladen werden.
      `.trim()
    });
    
    return true;
  }
}

// Sende Bestellbestätigung per E-Mail
export async function sendOrderConfirmationEmail(data: {
  customerEmail: string;
  customerName: string;
  orderId: number;
  productName: string;
  amount: number;
  currency: string;
}): Promise<boolean> {
  const orderEmailHtml = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bestellbestätigung - NON DOM Group</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #00B4D8 0%, #0096B4 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                NON <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 4px;">DOM</span> GROUP
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">
                ✓ Bestellung bestätigt
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Guten Tag ${data.customerName},
              </p>
              
              <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                vielen Dank für Ihre Bestellung! Wir haben Ihre Zahlung erhalten.
              </p>
              
              <!-- Order Summary Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Bestellnummer:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right; font-weight: 600;">#${data.orderId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Produkt:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${data.productName}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 16px; border-top: 1px solid #e5e7eb;"></td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 18px; font-weight: bold;">Betrag:</td>
                        <td style="padding: 8px 0; color: #00B4D8; font-size: 18px; text-align: right; font-weight: bold;">${new Intl.NumberFormat('de-CH', { style: 'currency', currency: data.currency }).format(data.amount)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                Ihre Rechnung wird Ihnen in einer separaten E-Mail zugestellt.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://immorefi.non-dom.group/orders" style="display: inline-block; background: linear-gradient(135deg, #00B4D8 0%, #0096B4 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Bestellungen ansehen
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                Mit freundlichen Grüßen,<br>
                <strong>Ihr NON DOM Group Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-align: center;">
                Marketplace24-7 GmbH | Kantonsstrasse 1 | 8807 Freienbach SZ | Schweiz
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                UID: CHE-351.662.058 MWST | E-Mail: info@non-dom.group
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Versuche E-Mail via Resend zu senden
  if (resend && data.customerEmail) {
    try {
      const result = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: data.customerEmail,
        replyTo: EMAIL_CONFIG.replyTo,
        subject: `Bestellbestätigung #${data.orderId} - NON DOM Group`,
        html: orderEmailHtml,
      });

      console.log(`[Email] Order confirmation #${data.orderId} sent to ${data.customerEmail} via Resend`, result);
      return true;
    } catch (error) {
      console.error(`[Email] Failed to send order confirmation via Resend:`, error);
    }
  }

  // Fallback: Benachrichtige Owner
  try {
    await notifyOwner({
      title: `🛒 Neue Bestellung #${data.orderId}`,
      content: `
Neue Bestellung eingegangen:

**Kunde:** ${data.customerName}
**E-Mail:** ${data.customerEmail || 'Keine E-Mail-Adresse'}
**Bestellnummer:** #${data.orderId}
**Produkt:** ${data.productName}
**Betrag:** ${new Intl.NumberFormat('de-CH', { style: 'currency', currency: data.currency }).format(data.amount)}

Die Rechnung wurde automatisch erstellt und kann im Admin-Bereich heruntergeladen werden.
      `.trim()
    });
    
    console.log(`[Email] Order notification sent for order #${data.orderId}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send order notification:`, error);
    return false;
  }
}

// Sende Admin-Benachrichtigung bei neuer Bestellung per E-Mail
export async function sendAdminOrderNotification(data: {
  customerEmail: string;
  customerName: string;
  orderId: number;
  productName: string;
  amount: number;
  currency: string;
  orderDate: Date;
}): Promise<boolean> {
  const adminEmails = ['c.herr@angelus.group', 'b.brendel@angelus.group'];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: data.currency
    }).format(amount);
  };

  const adminEmailHtml = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Neue Bestellung - NON DOM Group</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #00B4D8 0%, #0096B4 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🛒 Neue Bestellung eingegangen
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">
                Admin-Benachrichtigung
              </h2>

              <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Eine neue Bestellung wurde erfolgreich abgeschlossen und bezahlt.
              </p>

              <!-- Order Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: bold;">Bestelldetails</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Bestellnummer:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right; font-weight: 600;">#${data.orderId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Bestelldatum:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${formatDate(data.orderDate)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Produkt:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right;">${data.productName}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 16px; border-top: 1px solid #e5e7eb;"></td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 18px; font-weight: bold;">Betrag:</td>
                        <td style="padding: 8px 0; color: #00B4D8; font-size: 18px; text-align: right; font-weight: bold;">${formatCurrency(data.amount)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Customer Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-radius: 8px; margin-bottom: 30px; border: 1px solid #bae6fd;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px 0; color: #0c4a6e; font-size: 18px; font-weight: bold;">Kundendetails</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #075985; font-size: 14px;">Name:</td>
                        <td style="padding: 8px 0; color: #0c4a6e; font-size: 14px; text-align: right; font-weight: 600;">${data.customerName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #075985; font-size: 14px;">E-Mail:</td>
                        <td style="padding: 8px 0; color: #0c4a6e; font-size: 14px; text-align: right;"><a href="mailto:${data.customerEmail}" style="color: #0284c7; text-decoration: none;">${data.customerEmail}</a></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Items -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 8px; margin-bottom: 30px; border: 1px solid #fde68a;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                      <strong>📋 Nächste Schritte:</strong><br>
                      • Rechnung wurde automatisch erstellt und per E-Mail versendet<br>
                      • Bestellung im Admin-Bereich verfügbar<br>
                      • Bei Bedarf Kunde für Follow-up kontaktieren
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://portal.immoportal.app/admin/orders" style="display: inline-block; background: linear-gradient(135deg, #00B4D8 0%, #0096B4 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Bestellung im Admin-Bereich ansehen
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 12px; line-height: 1.6; text-align: center;">
                Diese E-Mail wurde automatisch generiert und an alle Administratoren versendet.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-align: center;">
                Marketplace24-7 GmbH | Kantonsstrasse 1 | 8807 Freienbach SZ | Schweiz
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                UID: CHE-351.662.058 MWST | E-Mail: info@non-dom.group
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Versuche E-Mail via Resend an beide Admins zu senden
  if (resend) {
    try {
      const result = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: adminEmails,
        replyTo: EMAIL_CONFIG.replyTo,
        subject: `🛒 Neue Bestellung #${data.orderId} - ${data.productName}`,
        html: adminEmailHtml,
      });

      console.log(`[Email] Admin notification for order #${data.orderId} sent to ${adminEmails.join(', ')} via Resend`, result);
      return true;
    } catch (error) {
      console.error(`[Email] Failed to send admin notification via Resend:`, error);

      // Fallback: Benachrichtige Owner via internes System
      await notifyOwner({
        title: `🛒 Neue Bestellung #${data.orderId}`,
        content: `
Neue Bestellung eingegangen (E-Mail-Versand an Admins fehlgeschlagen):

**Bestellnummer:** #${data.orderId}
**Kunde:** ${data.customerName}
**E-Mail:** ${data.customerEmail}
**Produkt:** ${data.productName}
**Betrag:** ${formatCurrency(data.amount)}
**Datum:** ${formatDate(data.orderDate)}

Die Rechnung wurde automatisch erstellt und kann im Admin-Bereich heruntergeladen werden.
        `.trim()
      });

      return false;
    }
  } else {
    console.log(`[Email] No Resend API key - cannot send admin notification`);

    // Fallback: Benachrichtige Owner via internes System
    await notifyOwner({
      title: `🛒 Neue Bestellung #${data.orderId}`,
      content: `
Neue Bestellung eingegangen:

**Bestellnummer:** #${data.orderId}
**Kunde:** ${data.customerName}
**E-Mail:** ${data.customerEmail}
**Produkt:** ${data.productName}
**Betrag:** ${formatCurrency(data.amount)}
**Datum:** ${formatDate(data.orderDate)}

Die Rechnung wurde automatisch erstellt und kann im Admin-Bereich heruntergeladen werden.
      `.trim()
    });

    return true;
  }
}

export { EMAIL_CONFIG };
