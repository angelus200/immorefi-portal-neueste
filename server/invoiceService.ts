import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import { invoices, invoiceItems, invoiceCounters } from "../drizzle/schema";

// Type definitions
type Invoice = typeof invoices.$inferSelect;
type InsertInvoice = typeof invoices.$inferInsert;
type InvoiceItem = typeof invoiceItems.$inferSelect;
type InsertInvoiceItem = typeof invoiceItems.$inferInsert;

// Firmeninformationen für die Rechnung
const COMPANY_INFO = {
  name: "Marketplace24-7 GmbH",
  tradingAs: "NON DOM Group",
  street: "Kantonsstrasse 1",
  zip: "8807",
  city: "Freienbach SZ",
  country: "Schweiz",
  email: "info@non-dom.group",
  phone: "0800 70 800 44",
  website: "https://non-dom.group",
  vatId: "CHE-351.662.058 MWST",
  commercialRegister: "CH-130.4.033.363-2",
  bankName: "RELIO AG",
  bankCity: "Zürich",
  ibanChf: "CH44 8305 0000 1111 2749 1",
  ibanEur: "CH06 8305 0100 1111 5183 8",
  ibanGbp: "CH25 8305 0200 1111 5061 8",
  bic: "REOICHZ2XXX"
};

// Generiere die nächste Rechnungsnummer
export async function getNextInvoiceNumber(tenantId?: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const currentYear = new Date().getFullYear();
  
  // Hole oder erstelle den Zähler für das aktuelle Jahr
  const existingCounter = await db.select()
    .from(invoiceCounters)
    .where(
      tenantId 
        ? and(eq(invoiceCounters.year, currentYear), eq(invoiceCounters.tenantId, tenantId))
        : eq(invoiceCounters.year, currentYear)
    )
    .limit(1);
  
  let nextNumber: number;
  
  if (existingCounter.length === 0) {
    // Erstelle neuen Zähler
    await db.insert(invoiceCounters).values({
      tenantId: tenantId || null,
      year: currentYear,
      lastNumber: 1,
      prefix: "RE"
    });
    nextNumber = 1;
  } else {
    // Inkrementiere den Zähler
    nextNumber = existingCounter[0].lastNumber + 1;
    await db.update(invoiceCounters)
      .set({ lastNumber: nextNumber })
      .where(eq(invoiceCounters.id, existingCounter[0].id));
  }
  
  // Format: RE-2026-00001
  return `RE-${currentYear}-${String(nextNumber).padStart(5, '0')}`;
}

// Erstelle eine neue Rechnung
export async function createInvoice(data: {
  tenantId?: number;
  userId?: number;
  orderId?: number;
  contractId?: number;
  type: "analysis" | "shop" | "installment" | "final" | "credit_note";
  customerName: string;
  customerEmail?: string;
  customerCompany?: string;
  customerAddress?: string;
  customerVatId?: string;
  description?: string;
  items: Array<{
    description: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
  }>;
  vatRate?: number;
  currency?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  notes?: string;
  createdBy?: number;
}): Promise<Invoice> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const invoiceNumber = await getNextInvoiceNumber(data.tenantId);
  const vatRate = data.vatRate ?? 7.7; // Schweizer MwSt
  const currency = data.currency ?? "CHF";
  
  // Berechne Nettobetrag aus Positionen
  const netAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const vatAmount = netAmount * (vatRate / 100);
  const grossAmount = netAmount + vatAmount;
  
  // Erstelle Rechnung
  const invoiceDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // 30 Tage Zahlungsziel
  
  const result = await db.insert(invoices).values({
    tenantId: data.tenantId,
    userId: data.userId,
    orderId: data.orderId,
    contractId: data.contractId,
    invoiceNumber,
    invoiceDate,
    dueDate,
    type: data.type,
    status: "sent",
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerCompany: data.customerCompany,
    customerAddress: data.customerAddress,
    customerVatId: data.customerVatId,
    description: data.description,
    netAmount,
    vatRate,
    vatAmount,
    grossAmount,
    currency,
    installmentNumber: data.installmentNumber,
    totalInstallments: data.totalInstallments,
    notes: data.notes,
    createdBy: data.createdBy
  });
  
  const invoiceId = result[0].insertId;
  
  // Erstelle Rechnungspositionen
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    await db.insert(invoiceItems).values({
      invoiceId,
      position: i + 1,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit || "Stück",
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice
    });
  }
  
  // Hole die erstellte Rechnung
  const invoice = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  return invoice[0];
}

// Hole Rechnung mit Positionen
export async function getInvoiceWithItems(invoiceId: number): Promise<{
  invoice: Invoice;
  items: InvoiceItem[];
} | null> {
  const db = await getDb();
  if (!db) return null;
  
  const invoice = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  if (invoice.length === 0) return null;
  
  const items = await db.select().from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, invoiceId))
    .orderBy(invoiceItems.position);
  
  return { invoice: invoice[0], items };
}

// Hole alle Rechnungen eines Benutzers
export async function getInvoicesByUserId(userId: number): Promise<Invoice[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(invoices)
    .where(eq(invoices.userId, userId))
    .orderBy(desc(invoices.createdAt));
}

// Hole alle Rechnungen (Admin)
export async function getAllInvoices(tenantId?: number): Promise<Invoice[]> {
  const db = await getDb();
  if (!db) return [];
  
  if (tenantId) {
    return db.select().from(invoices)
      .where(eq(invoices.tenantId, tenantId))
      .orderBy(desc(invoices.createdAt));
  }
  
  return db.select().from(invoices).orderBy(desc(invoices.createdAt));
}

// Aktualisiere Rechnungsstatus
export async function updateInvoiceStatus(
  invoiceId: number, 
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled",
  paymentInfo?: { paidAt?: Date; paymentMethod?: string; paymentReference?: string }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: Partial<InsertInvoice> = { status };
  
  if (paymentInfo) {
    if (paymentInfo.paidAt) updateData.paidAt = paymentInfo.paidAt;
    if (paymentInfo.paymentMethod) updateData.paymentMethod = paymentInfo.paymentMethod;
    if (paymentInfo.paymentReference) updateData.paymentReference = paymentInfo.paymentReference;
  }
  
  await db.update(invoices).set(updateData).where(eq(invoices.id, invoiceId));
}

// Generiere HTML für PDF-Rechnung
export function generateInvoiceHtml(invoice: Invoice, items: InvoiceItem[]): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', { 
      style: 'currency', 
      currency: invoice.currency || 'CHF' 
    }).format(amount);
  };
  
  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('de-CH', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(new Date(date));
  };
  
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.position}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.quantity} ${item.unit}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.unitPrice)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.totalPrice)}</td>
    </tr>
  `).join('');
  
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Rechnung ${invoice.invoiceNumber}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #1f2937; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 24pt; font-weight: bold; color: #00B4D8; }
    .logo span { background: rgba(0,180,216,0.1); padding: 2px 6px; border-radius: 4px; }
    .company-info { text-align: right; font-size: 9pt; color: #6b7280; }
    .invoice-title { font-size: 28pt; font-weight: bold; color: #00B4D8; margin-bottom: 20px; }
    .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .customer-info { max-width: 50%; }
    .invoice-details { text-align: right; }
    .invoice-details table { margin-left: auto; }
    .invoice-details td { padding: 4px 0; }
    .invoice-details td:first-child { padding-right: 20px; color: #6b7280; }
    table.items { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    table.items th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
    table.items th:nth-child(3), table.items th:nth-child(4), table.items th:nth-child(5) { text-align: right; }
    .totals { margin-left: auto; width: 300px; }
    .totals table { width: 100%; }
    .totals td { padding: 8px 0; }
    .totals td:first-child { color: #6b7280; }
    .totals td:last-child { text-align: right; font-weight: 500; }
    .totals tr.total { border-top: 2px solid #00B4D8; font-size: 14pt; font-weight: bold; }
    .totals tr.total td { padding-top: 12px; color: #00B4D8; }
    .payment-info { margin-top: 40px; padding: 20px; background: #f9fafb; border-radius: 8px; }
    .payment-info h3 { margin: 0 0 10px 0; font-size: 12pt; color: #374151; }
    .payment-info p { margin: 4px 0; font-size: 10pt; color: #6b7280; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 9pt; color: #6b7280; text-align: center; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 10pt; font-weight: 600; }
    .status-paid { background: #d1fae5; color: #065f46; }
    .status-sent { background: #dbeafe; color: #1e40af; }
    .status-overdue { background: #fee2e2; color: #991b1b; }
    .status-draft { background: #f3f4f6; color: #374151; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">NON <span>DOM</span> <small style="font-size: 10pt; color: #6b7280;">GROUP</small></div>
    </div>
    <div class="company-info">
      <strong>${COMPANY_INFO.name}</strong><br>
      ${COMPANY_INFO.street}<br>
      ${COMPANY_INFO.zip} ${COMPANY_INFO.city}<br>
      ${COMPANY_INFO.country}<br>
      <br>
      Tel: ${COMPANY_INFO.phone}<br>
      ${COMPANY_INFO.email}<br>
      ${COMPANY_INFO.website}
    </div>
  </div>
  
  <div class="invoice-title">
    RECHNUNG
    <span class="status-badge status-${invoice.status}">${
      invoice.status === 'paid' ? 'Bezahlt' :
      invoice.status === 'sent' ? 'Offen' :
      invoice.status === 'overdue' ? 'Überfällig' :
      invoice.status === 'cancelled' ? 'Storniert' : 'Entwurf'
    }</span>
  </div>
  
  <div class="invoice-meta">
    <div class="customer-info">
      <strong>Rechnungsempfänger:</strong><br>
      ${invoice.customerCompany ? `<strong>${invoice.customerCompany}</strong><br>` : ''}
      ${invoice.customerName}<br>
      ${invoice.customerAddress ? invoice.customerAddress.replace(/\n/g, '<br>') : ''}
      ${invoice.customerVatId ? `<br>USt-IdNr.: ${invoice.customerVatId}` : ''}
    </div>
    <div class="invoice-details">
      <table>
        <tr><td>Rechnungsnummer:</td><td><strong>${invoice.invoiceNumber}</strong></td></tr>
        <tr><td>Rechnungsdatum:</td><td>${formatDate(invoice.invoiceDate)}</td></tr>
        <tr><td>Fällig bis:</td><td>${formatDate(invoice.dueDate)}</td></tr>
        ${invoice.installmentNumber ? `<tr><td>Abschlag:</td><td>${invoice.installmentNumber} von ${invoice.totalInstallments}</td></tr>` : ''}
      </table>
    </div>
  </div>
  
  ${invoice.description ? `<p style="margin-bottom: 20px;">${invoice.description}</p>` : ''}
  
  <table class="items">
    <thead>
      <tr>
        <th style="width: 50px;">Pos.</th>
        <th>Beschreibung</th>
        <th style="width: 100px;">Menge</th>
        <th style="width: 120px;">Einzelpreis</th>
        <th style="width: 120px;">Gesamt</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>
  
  <div class="totals">
    <table>
      <tr><td>Nettobetrag:</td><td>${formatCurrency(invoice.netAmount)}</td></tr>
      <tr><td>MwSt. (${invoice.vatRate}%):</td><td>${formatCurrency(invoice.vatAmount)}</td></tr>
      <tr class="total"><td>Gesamtbetrag:</td><td>${formatCurrency(invoice.grossAmount)}</td></tr>
    </table>
  </div>
  
  <div class="payment-info">
    <h3>Zahlungsinformationen</h3>
    <p><strong>Bank:</strong> ${COMPANY_INFO.bankName}, ${COMPANY_INFO.bankCity}</p>
    <p><strong>BIC/SWIFT:</strong> ${COMPANY_INFO.bic}</p>
    <table style="margin: 10px 0; border-collapse: collapse;">
      <tr><td style="padding: 3px 10px 3px 0;"><strong>IBAN (CHF):</strong></td><td>${COMPANY_INFO.ibanChf}</td></tr>
      <tr><td style="padding: 3px 10px 3px 0;"><strong>IBAN (EUR):</strong></td><td>${COMPANY_INFO.ibanEur}</td></tr>
      <tr><td style="padding: 3px 10px 3px 0;"><strong>IBAN (GBP):</strong></td><td>${COMPANY_INFO.ibanGbp}</td></tr>
    </table>
    <p><strong>Verwendungszweck:</strong> ${invoice.invoiceNumber}</p>
    <p style="margin-top: 10px;">Bitte überweisen Sie den Betrag innerhalb von 30 Tagen unter Angabe der Rechnungsnummer.</p>
  </div>
  
  <div class="footer">
    <p>${COMPANY_INFO.name} | ${COMPANY_INFO.street}, ${COMPANY_INFO.zip} ${COMPANY_INFO.city} | ${COMPANY_INFO.country}</p>
    <p>Handelsregister: ${COMPANY_INFO.commercialRegister} | E-Mail: ${COMPANY_INFO.email}</p>
  </div>
</body>
</html>
  `;
}

// Erstelle Rechnung für Stripe-Zahlung (Analyse oder Shop)
export async function createInvoiceFromStripePayment(data: {
  userId: number;
  orderId: number;
  productType: "analysis" | "shop";
  productName: string;
  amount: number; // Bruttobetrag in EUR/CHF
  customerEmail: string;
  customerName?: string;
  stripePaymentId?: string;
}): Promise<Invoice> {
  // Berechne Netto aus Brutto (Schweizer MwSt 7.7%)
  const vatRate = 7.7;
  const netAmount = data.amount / (1 + vatRate / 100);
  const unitPrice = netAmount;
  
  return createInvoice({
    userId: data.userId,
    orderId: data.orderId,
    type: data.productType === "analysis" ? "analysis" : "shop",
    customerName: data.customerName || data.customerEmail,
    customerEmail: data.customerEmail,
    description: data.productType === "analysis" 
      ? "Portfolio-Analyse & Strukturierungsdiagnose" 
      : "Shop-Bestellung",
    items: [{
      description: data.productName,
      quantity: 1,
      unit: "Stück",
      unitPrice: unitPrice
    }],
    vatRate,
    currency: "EUR", // Stripe-Zahlungen sind in EUR
    notes: data.stripePaymentId ? `Stripe Payment ID: ${data.stripePaymentId}` : undefined
  });
}

// Erstelle manuelle Abschlagrechnung
export async function createInstallmentInvoice(data: {
  tenantId?: number;
  userId?: number;
  contractId: number;
  customerName: string;
  customerEmail?: string;
  customerCompany?: string;
  customerAddress?: string;
  customerVatId?: string;
  description: string;
  items: Array<{
    description: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
  }>;
  installmentNumber: number;
  totalInstallments: number;
  vatRate?: number;
  currency?: string;
  notes?: string;
  createdBy?: number;
}): Promise<Invoice> {
  return createInvoice({
    ...data,
    type: "installment"
  });
}

export { COMPANY_INFO };
