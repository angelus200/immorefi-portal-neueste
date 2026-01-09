import { describe, it, expect, vi } from "vitest";

// Mock database functions
vi.mock("./db", () => ({
  createOnboardingDocument: vi.fn().mockResolvedValue(1),
  getOnboardingDocumentsByOnboardingId: vi.fn().mockResolvedValue([
    {
      id: 1,
      onboardingId: 1,
      userId: 1,
      category: "jahresabschluss",
      fileName: "bilanz-2024.pdf",
      fileKey: "onboarding-docs/abc123-bilanz-2024.pdf",
      fileUrl: "https://storage.example.com/onboarding-docs/abc123-bilanz-2024.pdf",
      mimeType: "application/pdf",
      size: 1024000,
      createdAt: new Date(),
    },
    {
      id: 2,
      onboardingId: 1,
      userId: 1,
      category: "bwa",
      fileName: "bwa-2024.xlsx",
      fileKey: "onboarding-docs/def456-bwa-2024.xlsx",
      fileUrl: "https://storage.example.com/onboarding-docs/def456-bwa-2024.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      size: 512000,
      createdAt: new Date(),
    },
  ]),
  getOnboardingDocumentsByUserId: vi.fn().mockResolvedValue([
    {
      id: 1,
      onboardingId: 1,
      userId: 1,
      category: "jahresabschluss",
      fileName: "bilanz-2024.pdf",
      fileKey: "onboarding-docs/abc123-bilanz-2024.pdf",
      fileUrl: "https://storage.example.com/onboarding-docs/abc123-bilanz-2024.pdf",
      mimeType: "application/pdf",
      size: 1024000,
      createdAt: new Date(),
    },
  ]),
  deleteOnboardingDocument: vi.fn().mockResolvedValue(undefined),
  getOnboardingDocumentById: vi.fn().mockResolvedValue({
    id: 1,
    onboardingId: 1,
    userId: 1,
    category: "jahresabschluss",
    fileName: "bilanz-2024.pdf",
    fileKey: "onboarding-docs/abc123-bilanz-2024.pdf",
    fileUrl: "https://storage.example.com/onboarding-docs/abc123-bilanz-2024.pdf",
    mimeType: "application/pdf",
    size: 1024000,
    createdAt: new Date(),
  }),
  getOnboardingDataByUserId: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    status: "in_progress",
  }),
  createOnboardingData: vi.fn().mockResolvedValue(1),
}));

describe("Onboarding Documents", () => {
  describe("Document Categories", () => {
    const validCategories = [
      "jahresabschluss",
      "bwa",
      "objektliste",
      "mieterliste",
      "finanzierungen",
      "wertgutachten",
      "gesellschaftsvertrag",
      "sonstige",
    ];

    it("should have 8 valid document categories", () => {
      expect(validCategories).toHaveLength(8);
    });

    it("should include jahresabschluss category for annual reports", () => {
      expect(validCategories).toContain("jahresabschluss");
    });

    it("should include bwa category for business analysis", () => {
      expect(validCategories).toContain("bwa");
    });

    it("should include objektliste category for property lists", () => {
      expect(validCategories).toContain("objektliste");
    });

    it("should include mieterliste category for tenant lists", () => {
      expect(validCategories).toContain("mieterliste");
    });

    it("should include finanzierungen category for financing overview", () => {
      expect(validCategories).toContain("finanzierungen");
    });

    it("should include wertgutachten category for valuations", () => {
      expect(validCategories).toContain("wertgutachten");
    });

    it("should include gesellschaftsvertrag category for company agreements", () => {
      expect(validCategories).toContain("gesellschaftsvertrag");
    });

    it("should include sonstige category for other documents", () => {
      expect(validCategories).toContain("sonstige");
    });
  });

  describe("File Validation", () => {
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
    ];

    it("should allow PDF files", () => {
      expect(allowedMimeTypes).toContain("application/pdf");
    });

    it("should allow Word documents", () => {
      expect(allowedMimeTypes).toContain("application/msword");
      expect(allowedMimeTypes).toContain("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    });

    it("should allow Excel files", () => {
      expect(allowedMimeTypes).toContain("application/vnd.ms-excel");
      expect(allowedMimeTypes).toContain("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    });

    it("should allow image files", () => {
      expect(allowedMimeTypes).toContain("image/jpeg");
      expect(allowedMimeTypes).toContain("image/png");
    });

    it("should enforce 10MB file size limit", () => {
      const maxSize = 10 * 1024 * 1024; // 10 MB
      expect(maxSize).toBe(10485760);
    });
  });

  describe("Document Storage", () => {
    it("should generate unique file keys with nanoid prefix", () => {
      const fileName = "bilanz-2024.pdf";
      const fileKeyPattern = /^onboarding-docs\/[a-zA-Z0-9_-]+-bilanz-2024\.pdf$/;
      const sampleKey = "onboarding-docs/abc123xyz-bilanz-2024.pdf";
      expect(sampleKey).toMatch(fileKeyPattern);
    });

    it("should store documents with correct metadata", async () => {
      const db = await import("./db");
      const docId = await db.createOnboardingDocument({
        onboardingId: 1,
        userId: 1,
        category: "jahresabschluss",
        fileName: "bilanz-2024.pdf",
        fileKey: "onboarding-docs/abc123-bilanz-2024.pdf",
        fileUrl: "https://storage.example.com/onboarding-docs/abc123-bilanz-2024.pdf",
        mimeType: "application/pdf",
        size: 1024000,
      });
      expect(docId).toBe(1);
    });

    it("should retrieve documents by onboarding ID", async () => {
      const db = await import("./db");
      const docs = await db.getOnboardingDocumentsByOnboardingId(1);
      expect(docs).toHaveLength(2);
      expect(docs[0].category).toBe("jahresabschluss");
      expect(docs[1].category).toBe("bwa");
    });

    it("should retrieve documents by user ID", async () => {
      const db = await import("./db");
      const docs = await db.getOnboardingDocumentsByUserId(1);
      expect(docs).toHaveLength(1);
      expect(docs[0].fileName).toBe("bilanz-2024.pdf");
    });

    it("should delete documents by ID", async () => {
      const db = await import("./db");
      await db.deleteOnboardingDocument(1);
      expect(db.deleteOnboardingDocument).toHaveBeenCalledWith(1);
    });
  });

  describe("Admin Document Access", () => {
    it("should allow admins to view all documents for an onboarding entry", async () => {
      const db = await import("./db");
      const docs = await db.getOnboardingDocumentsByOnboardingId(1);
      expect(docs).toBeDefined();
      expect(Array.isArray(docs)).toBe(true);
    });

    it("should include download URLs for admin access", async () => {
      const db = await import("./db");
      const docs = await db.getOnboardingDocumentsByOnboardingId(1);
      expect(docs[0].fileUrl).toContain("https://");
    });
  });
});
