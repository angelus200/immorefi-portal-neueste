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

// Sende Willkommens-E-Mail an neue Kunden
export async function sendWelcomeEmail(data: {
  customerEmail: string;
  customerName: string;
}): Promise<boolean> {
  const welcomeEmailHtml = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Willkommen bei NON DOM Group</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #00B4D8 0%, #0096B4 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0 0 10px 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                Willkommen bei
              </h1>
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                NON <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 4px;">DOM</span> GROUP
              </h1>
              <p style="margin: 15px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                Ihr Partner für Immobilien-Refinanzierung
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">
                👋 Herzlich willkommen, ${data.customerName}!
              </h2>

              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Wir freuen uns sehr, Sie im <strong>ImmoRefi Portal</strong> begrüßen zu dürfen!
              </p>

              <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Mit Ihrem Zugang haben Sie nun Zugriff auf alle Funktionen unseres Portals für eine professionelle Immobilien-Refinanzierung.
              </p>

              <!-- Features Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-radius: 8px; margin-bottom: 30px; border: 1px solid #bae6fd;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px 0; color: #0c4a6e; font-size: 18px; font-weight: bold;">🎯 Ihre Vorteile im Überblick</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #075985; font-size: 14px;">✓ Finanzierungsberechnungen</td>
                        <td style="padding: 8px 0; color: #0c4a6e; font-size: 14px; text-align: right;">Zinsen & ROE kalkulieren</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #075985; font-size: 14px;">✓ Dokumentenverwaltung</td>
                        <td style="padding: 8px 0; color: #0c4a6e; font-size: 14px; text-align: right;">Sicher & zentral</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #075985; font-size: 14px;">✓ Digitale Vertragsabwicklung</td>
                        <td style="padding: 8px 0; color: #0c4a6e; font-size: 14px; text-align: right;">Schnell & papierlos</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #075985; font-size: 14px;">✓ Direkter Support</td>
                        <td style="padding: 8px 0; color: #0c4a6e; font-size: 14px; text-align: right;">Persönliche Beratung</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Next Steps Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 8px; margin-bottom: 30px; border: 1px solid #fde68a;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px 0; color: #78350f; font-size: 18px; font-weight: bold;">📋 Ihre nächsten Schritte</h3>
                    <ol style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                      <li style="margin-bottom: 8px;"><strong>Portal erkunden:</strong> Machen Sie sich mit den Funktionen vertraut</li>
                      <li style="margin-bottom: 8px;"><strong>Profil vervollständigen:</strong> Ergänzen Sie Ihre Unternehmensdaten</li>
                      <li style="margin-bottom: 8px;"><strong>Dokumente hochladen:</strong> Laden Sie relevante Unterlagen hoch</li>
                      <li style="margin-bottom: 8px;"><strong>Kontakt aufnehmen:</strong> Bei Fragen stehen wir Ihnen gerne zur Verfügung</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://portal.immoportal.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #00B4D8 0%, #0096B4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(0, 180, 216, 0.3);">
                      Zum Portal
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Contact Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-top: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px; font-weight: bold;">💬 Haben Sie Fragen?</h3>
                    <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                      Unser Team steht Ihnen gerne zur Verfügung:
                    </p>
                    <p style="margin: 10px 0 0 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                      📧 <a href="mailto:info@non-dom.group" style="color: #00B4D8; text-decoration: none;">info@non-dom.group</a><br>
                      🌐 <a href="https://portal.immoportal.app" style="color: #00B4D8; text-decoration: none;">portal.immoportal.app</a>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Wir freuen uns auf die Zusammenarbeit mit Ihnen und stehen Ihnen jederzeit bei Fragen zur Seite.
              </p>

              <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 16px; font-weight: 600;">
                Mit freundlichen Grüßen<br>
                Ihr NON DOM Group Team
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
  if (resend) {
    try {
      const result = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: data.customerEmail,
        replyTo: EMAIL_CONFIG.replyTo,
        subject: '🎉 Willkommen im ImmoRefi Portal - NON DOM Group',
        html: welcomeEmailHtml,
      });

      console.log(`[Email] Welcome email sent to ${data.customerEmail}`, result);
      return true;
    } catch (error) {
      console.error(`[Email] Failed to send welcome email:`, error);

      // Fallback: Benachrichtige Owner, dass Willkommens-E-Mail fehlgeschlagen ist
      await notifyOwner({
        title: `⚠️ Willkommens-E-Mail fehlgeschlagen`,
        content: `
Konnte Willkommens-E-Mail nicht senden an:

**Name:** ${data.customerName}
**E-Mail:** ${data.customerEmail}

Bitte manuell kontaktieren.
        `.trim()
      });

      return false;
    }
  } else {
    console.log(`[Email] No Resend API key - cannot send welcome email to ${data.customerEmail}`);

    // Fallback: Benachrichtige Owner über neuen User
    await notifyOwner({
      title: `👋 Neuer Benutzer registriert`,
      content: `
Neuer Benutzer im Portal:

**Name:** ${data.customerName}
**E-Mail:** ${data.customerEmail}

(Willkommens-E-Mail konnte nicht gesendet werden - kein RESEND_API_KEY)
      `.trim()
    });

    return true;
  }
}

// ============================================
// BOOKING REMINDER E-MAILS
// ============================================

// Booking Confirmation
export async function sendBookingConfirmationEmail(data: {
  customerEmail: string;
  customerName: string;
  staffName: string;
  bookingTitle: string;
  startTime: Date;
  endTime: Date;
  meetingUrl?: string;
  description?: string;
}): Promise<boolean> {
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('de-CH', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const emailHtml = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terminbestätigung - NON DOM Group</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #00B4D8 0%, #0096B4 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                ✓ Termin bestätigt
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">
                Hallo ${data.customerName},
              </h2>

              <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Ihr Termin wurde erfolgreich gebucht. Wir freuen uns auf das Gespräch mit Ihnen!
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-radius: 8px; margin-bottom: 30px; border: 1px solid #bae6fd;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px 0; color: #0c4a6e; font-size: 18px; font-weight: bold;">📅 Termindetails</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #075985; font-size: 14px;">Termin:</td>
                        <td style="padding: 8px 0; color: #0c4a6e; font-size: 14px; text-align: right; font-weight: 600;">${data.bookingTitle}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #075985; font-size: 14px;">Berater:</td>
                        <td style="padding: 8px 0; color: #0c4a6e; font-size: 14px; text-align: right;">${data.staffName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #075985; font-size: 14px;">Datum & Zeit:</td>
                        <td style="padding: 8px 0; color: #0c4a6e; font-size: 14px; text-align: right;">${formatDateTime(data.startTime)}</td>
                      </tr>
                      ${data.description ? `
                      <tr>
                        <td colspan="2" style="padding-top: 16px; border-top: 1px solid #bae6fd;"></td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 8px 0; color: #075985; font-size: 14px;">${data.description}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              ${data.meetingUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.meetingUrl}" style="display: inline-block; background: linear-gradient(135deg, #00B4D8 0%, #0096B4 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Zum Online-Meeting
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                Mit freundlichen Grüßen,<br>
                <strong>Ihr NON DOM Group Team</strong>
              </p>
            </td>
          </tr>

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

  if (resend && data.customerEmail) {
    try {
      const result = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: data.customerEmail,
        replyTo: EMAIL_CONFIG.replyTo,
        subject: `Terminbestätigung: ${data.bookingTitle} - NON DOM Group`,
        html: emailHtml,
      });

      console.log(`[Email] Booking confirmation sent to ${data.customerEmail}`, result);
      return true;
    } catch (error) {
      console.error(`[Email] Failed to send booking confirmation:`, error);
      return false;
    }
  }

  return false;
}

// 24h Reminder
export async function sendBookingReminder24h(data: {
  customerEmail: string;
  customerName: string;
  staffName: string;
  bookingTitle: string;
  startTime: Date;
  meetingUrl?: string;
}): Promise<boolean> {
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('de-CH', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const emailHtml = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terminerinnerung - NON DOM Group</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🔔 Erinnerung: Ihr Termin morgen
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">
                Hallo ${data.customerName},
              </h2>

              <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Dies ist eine freundliche Erinnerung an Ihren Termin morgen.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 8px; margin-bottom: 30px; border: 1px solid #fde68a;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px 0; color: #78350f; font-size: 18px; font-weight: bold;">📅 Termindetails</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #92400e; font-size: 14px;">Termin:</td>
                        <td style="padding: 8px 0; color: #78350f; font-size: 14px; text-align: right; font-weight: 600;">${data.bookingTitle}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #92400e; font-size: 14px;">Berater:</td>
                        <td style="padding: 8px 0; color: #78350f; font-size: 14px; text-align: right;">${data.staffName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #92400e; font-size: 14px;">Datum & Zeit:</td>
                        <td style="padding: 8px 0; color: #78350f; font-size: 14px; text-align: right;">${formatDateTime(data.startTime)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${data.meetingUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.meetingUrl}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Zum Online-Meeting
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                Wir freuen uns auf das Gespräch mit Ihnen!<br>
                <strong>Ihr NON DOM Group Team</strong>
              </p>
            </td>
          </tr>

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

  if (resend && data.customerEmail) {
    try {
      const result = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: data.customerEmail,
        replyTo: EMAIL_CONFIG.replyTo,
        subject: `🔔 Erinnerung: ${data.bookingTitle} morgen - NON DOM Group`,
        html: emailHtml,
      });

      console.log(`[Email] 24h reminder sent to ${data.customerEmail}`, result);
      return true;
    } catch (error) {
      console.error(`[Email] Failed to send 24h reminder:`, error);
      return false;
    }
  }

  return false;
}

// 1h Reminder
export async function sendBookingReminder1h(data: {
  customerEmail: string;
  customerName: string;
  staffName: string;
  bookingTitle: string;
  startTime: Date;
  meetingUrl?: string;
}): Promise<boolean> {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('de-CH', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const emailHtml = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Termin in 1 Stunde - NON DOM Group</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                ⏰ Ihr Termin beginnt in 1 Stunde
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">
                Hallo ${data.customerName},
              </h2>

              <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Ihr Termin mit <strong>${data.staffName}</strong> beginnt gleich um <strong>${formatTime(data.startTime)} Uhr</strong>.
              </p>

              ${data.meetingUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.meetingUrl}" style="display: inline-block; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);">
                      Jetzt zum Meeting
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fee2e2; border-radius: 8px; margin: 30px 0; border: 1px solid #fecaca;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                      <strong>💡 Tipp:</strong> Klicken Sie einige Minuten vor Beginn auf den Meeting-Link, um sicherzustellen, dass Ihre Kamera und Ihr Mikrofon funktionieren.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                Wir freuen uns auf Sie!<br>
                <strong>Ihr NON DOM Group Team</strong>
              </p>
            </td>
          </tr>

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

  if (resend && data.customerEmail) {
    try {
      const result = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: data.customerEmail,
        replyTo: EMAIL_CONFIG.replyTo,
        subject: `⏰ In 1 Stunde: ${data.bookingTitle} - NON DOM Group`,
        html: emailHtml,
      });

      console.log(`[Email] 1h reminder sent to ${data.customerEmail}`, result);
      return true;
    } catch (error) {
      console.error(`[Email] Failed to send 1h reminder:`, error);
      return false;
    }
  }

  return false;
}

// Booking Cancelled
export async function sendBookingCancelledEmail(data: {
  customerEmail: string;
  customerName: string;
  bookingTitle: string;
  startTime: Date;
}): Promise<boolean> {
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('de-CH', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const emailHtml = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Termin abgesagt - NON DOM Group</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                ✕ Termin abgesagt
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">
                Hallo ${data.customerName},
              </h2>

              <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Ihr Termin wurde abgesagt:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Termin:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right; font-weight: 600; text-decoration: line-through;">${data.bookingTitle}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Datum & Zeit:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-align: right; text-decoration: line-through;">${formatDateTime(data.startTime)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://immorefi.non-dom.group/booking" style="display: inline-block; background: linear-gradient(135deg, #00B4D8 0%, #0096B4 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Neuen Termin buchen
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                Bei Fragen stehen wir Ihnen gerne zur Verfügung.<br>
                <strong>Ihr NON DOM Group Team</strong>
              </p>
            </td>
          </tr>

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

  if (resend && data.customerEmail) {
    try {
      const result = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: data.customerEmail,
        replyTo: EMAIL_CONFIG.replyTo,
        subject: `Termin abgesagt: ${data.bookingTitle} - NON DOM Group`,
        html: emailHtml,
      });

      console.log(`[Email] Cancellation email sent to ${data.customerEmail}`, result);
      return true;
    } catch (error) {
      console.error(`[Email] Failed to send cancellation email:`, error);
      return false;
    }
  }

  return false;
}

export { EMAIL_CONFIG };
