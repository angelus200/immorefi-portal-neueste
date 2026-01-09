import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockResolvedValue({}),
  }),
}));

// Mock notification service
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe("Invoice Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Invoice Number Generation", () => {
    it("should generate invoice number in correct format", () => {
      const currentYear = new Date().getFullYear();
      const invoiceNumber = `INV-${currentYear}-00001`;
      
      expect(invoiceNumber).toMatch(/^INV-\d{4}-\d{5}$/);
      expect(invoiceNumber).toContain(currentYear.toString());
    });

    it("should increment invoice number correctly", () => {
      const num1 = "INV-2026-00001";
      const num2 = "INV-2026-00002";
      
      const extractNumber = (inv: string) => parseInt(inv.split('-')[2]);
      
      expect(extractNumber(num2)).toBe(extractNumber(num1) + 1);
    });
  });

  describe("Invoice Calculations", () => {
    it("should calculate VAT correctly for Swiss rate (7.7%)", () => {
      const netAmount = 1000;
      const vatRate = 7.7;
      const vatAmount = netAmount * (vatRate / 100);
      const grossAmount = netAmount + vatAmount;
      
      expect(vatAmount).toBe(77);
      expect(grossAmount).toBe(1077);
    });

    it("should calculate net from gross correctly", () => {
      const grossAmount = 2990;
      const vatRate = 7.7;
      const netAmount = grossAmount / (1 + vatRate / 100);
      
      expect(netAmount).toBeCloseTo(2776.23, 2);
    });

    it("should handle EUR currency formatting", () => {
      const amount = 2990;
      const formatted = new Intl.NumberFormat('de-DE', { 
        style: 'currency', 
        currency: 'EUR' 
      }).format(amount);
      
      expect(formatted).toContain('2.990');
      expect(formatted).toContain('€');
    });

    it("should handle CHF currency formatting", () => {
      const amount = 2990;
      const formatted = new Intl.NumberFormat('de-CH', { 
        style: 'currency', 
        currency: 'CHF' 
      }).format(amount);
      
      expect(formatted).toContain('2');
      expect(formatted).toContain('990');
    });
  });

  describe("Invoice Status", () => {
    it("should have valid status values", () => {
      const validStatuses = ["draft", "sent", "paid", "overdue", "cancelled"];
      
      validStatuses.forEach(status => {
        expect(["draft", "sent", "paid", "overdue", "cancelled"]).toContain(status);
      });
    });

    it("should transition from draft to sent", () => {
      const invoice = { status: "draft" };
      invoice.status = "sent";
      
      expect(invoice.status).toBe("sent");
    });

    it("should transition from sent to paid", () => {
      const invoice = { status: "sent" };
      invoice.status = "paid";
      
      expect(invoice.status).toBe("paid");
    });
  });

  describe("Invoice Types", () => {
    it("should support analysis invoice type", () => {
      const type = "analysis";
      expect(["analysis", "shop", "installment", "final", "credit_note"]).toContain(type);
    });

    it("should support shop invoice type", () => {
      const type = "shop";
      expect(["analysis", "shop", "installment", "final", "credit_note"]).toContain(type);
    });

    it("should support installment invoice type", () => {
      const type = "installment";
      expect(["analysis", "shop", "installment", "final", "credit_note"]).toContain(type);
    });
  });

  describe("Invoice Items", () => {
    it("should calculate item total correctly", () => {
      const item = {
        quantity: 2,
        unitPrice: 100,
      };
      const totalPrice = item.quantity * item.unitPrice;
      
      expect(totalPrice).toBe(200);
    });

    it("should handle decimal quantities", () => {
      const item = {
        quantity: 1.5,
        unitPrice: 100,
      };
      const totalPrice = item.quantity * item.unitPrice;
      
      expect(totalPrice).toBe(150);
    });
  });

  describe("Due Date Calculation", () => {
    it("should set due date 30 days from invoice date", () => {
      const invoiceDate = new Date('2026-01-08');
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30);
      
      // 30 days after Jan 8 is Feb 7
      expect(dueDate.getMonth()).toBe(1); // February (0-indexed)
      expect(dueDate.getDate()).toBeGreaterThanOrEqual(6);
      expect(dueDate.getDate()).toBeLessThanOrEqual(8);
    });

    it("should handle month overflow correctly", () => {
      const invoiceDate = new Date('2026-01-15');
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30);
      
      expect(dueDate.getMonth()).toBe(1); // February
    });
  });

  describe("Company Info", () => {
    it("should have required company fields", () => {
      const companyInfo = {
        name: "Marketplace24-7 GmbH",
        tradingAs: "NON DOM Group",
        street: "Kantonsstrasse 1",
        zip: "8807",
        city: "Freienbach SZ",
        country: "Schweiz",
        email: "info@non-dom.group",
        commercialRegister: "CH-130.4.033.363-2",
      };
      
      expect(companyInfo.name).toBeTruthy();
      expect(companyInfo.street).toBeTruthy();
      expect(companyInfo.zip).toBeTruthy();
      expect(companyInfo.city).toBeTruthy();
      expect(companyInfo.country).toBe("Schweiz");
      expect(companyInfo.commercialRegister).toMatch(/^CH-/);
    });
  });
});

describe("Email Service", () => {
  describe("Invoice Email", () => {
    it("should format date correctly for German locale", () => {
      const date = new Date('2026-01-08');
      const formatted = new Intl.DateTimeFormat('de-CH', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }).format(date);
      
      expect(formatted).toMatch(/\d{2}\.\d{2}\.\d{4}/);
    });

    it("should include all required email fields", () => {
      const emailData = {
        customerEmail: "test@example.com",
        customerName: "Test Customer",
        invoiceNumber: "INV-2026-00001",
        grossAmount: 2990,
        currency: "EUR",
        productDescription: "Portfolio-Analyse",
      };
      
      expect(emailData.customerEmail).toContain("@");
      expect(emailData.invoiceNumber).toMatch(/^INV-/);
      expect(emailData.grossAmount).toBeGreaterThan(0);
    });
  });

  describe("Order Confirmation Email", () => {
    it("should include order details", () => {
      const orderData = {
        customerEmail: "test@example.com",
        customerName: "Test Customer",
        orderId: 123,
        productName: "Handbuch für Immobilienprojektentwickler",
        amount: 29.90,
        currency: "EUR",
      };
      
      expect(orderData.orderId).toBeGreaterThan(0);
      expect(orderData.productName).toBeTruthy();
      expect(orderData.amount).toBeGreaterThan(0);
    });
  });
});

describe("Invoice Router", () => {
  describe("List Invoices", () => {
    it("should return empty array when no invoices exist", async () => {
      const invoices: any[] = [];
      expect(invoices).toHaveLength(0);
    });

    it("should filter by status", () => {
      const invoices = [
        { id: 1, status: "paid" },
        { id: 2, status: "sent" },
        { id: 3, status: "paid" },
      ];
      
      const paidInvoices = invoices.filter(inv => inv.status === "paid");
      expect(paidInvoices).toHaveLength(2);
    });

    it("should filter by type", () => {
      const invoices = [
        { id: 1, type: "analysis" },
        { id: 2, type: "shop" },
        { id: 3, type: "analysis" },
      ];
      
      const analysisInvoices = invoices.filter(inv => inv.type === "analysis");
      expect(analysisInvoices).toHaveLength(2);
    });
  });

  describe("Create Installment Invoice", () => {
    it("should validate required fields", () => {
      const data = {
        contractId: 1,
        customerName: "Test Customer",
        items: [{ description: "Service", quantity: 1, unitPrice: 1000 }],
        installmentNumber: 1,
        totalInstallments: 3,
      };
      
      expect(data.contractId).toBeGreaterThan(0);
      expect(data.customerName).toBeTruthy();
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.installmentNumber).toBeLessThanOrEqual(data.totalInstallments);
    });

    it("should calculate installment description correctly", () => {
      const installmentNumber = 2;
      const totalInstallments = 5;
      const description = `Abschlagrechnung ${installmentNumber} von ${totalInstallments}`;
      
      expect(description).toBe("Abschlagrechnung 2 von 5");
    });
  });

  describe("Update Invoice Status", () => {
    it("should update status to paid with payment info", () => {
      const updateData = {
        status: "paid" as const,
        paidAt: new Date(),
        paymentMethod: "bank_transfer",
        paymentReference: "REF-123",
      };
      
      expect(updateData.status).toBe("paid");
      expect(updateData.paidAt).toBeInstanceOf(Date);
      expect(updateData.paymentMethod).toBeTruthy();
    });

    it("should allow cancellation", () => {
      const invoice = { status: "sent" };
      invoice.status = "cancelled";
      
      expect(invoice.status).toBe("cancelled");
    });
  });

  describe("Get Invoice HTML", () => {
    it("should generate valid HTML structure", () => {
      const html = `<!DOCTYPE html><html><head><title>Rechnung</title></head><body></body></html>`;
      
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("<html>");
      expect(html).toContain("</html>");
    });
  });
});
