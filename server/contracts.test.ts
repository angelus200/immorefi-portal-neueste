import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  getDb: vi.fn(() => Promise.resolve({})),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  createContractTemplate: vi.fn(() => Promise.resolve({ id: 1, name: "Test Contract", type: "analysis", status: "draft" })),
  createContract: vi.fn(() => Promise.resolve(1)),
  getContractTemplatesByTenantId: vi.fn(() => Promise.resolve([
    { id: 1, name: "Test Contract", type: "analysis", status: "active", tenantId: 1 }
  ])),
  getContractsByTenantId: vi.fn(() => Promise.resolve([
    { id: 1, name: "Test Contract", type: "analysis", status: "active", tenantId: 1 }
  ])),
  getContractTemplateById: vi.fn(() => Promise.resolve({ id: 1, name: "Test Contract", type: "analysis", status: "active", tenantId: 1 })),
  updateContractTemplate: vi.fn(() => Promise.resolve({ id: 1, name: "Test Contract", type: "analysis", status: "active" })),
  assignContractToUser: vi.fn(() => Promise.resolve({ id: 1, contractId: 1, userId: 2, tenantId: 1 })),
  getContractAssignmentsByUserId: vi.fn(() => Promise.resolve([
    { id: 1, contractId: 1, userId: 2, tenantId: 1, isAccepted: false, contract: { id: 1, name: "Test Contract" } }
  ])),
  createContractAcceptance: vi.fn(() => Promise.resolve({ id: 1, contractId: 1, userId: 2, acceptedAt: new Date() })),
  getContractAssignmentById: vi.fn(() => Promise.resolve({ id: 1, contractId: 1, userId: 2, tenantId: 1, contract: { id: 1, version: "1.0" } })),
  getAllContractAcceptancesByTenantId: vi.fn(() => Promise.resolve([
    { id: 1, contractId: 1, userId: 2, acceptedAt: new Date(), confirmationText: "Accepted" }
  ])),
  getContractAcceptancesByUserId: vi.fn(() => Promise.resolve([])),
  getContractAcceptanceByAssignmentId: vi.fn(() => Promise.resolve(null)),
  markContractAssignmentAccepted: vi.fn(() => Promise.resolve({ id: 1, isAccepted: true })),
  getContractById: vi.fn(() => Promise.resolve({ id: 1, name: "Test Contract", version: "1.0" })),
  createAuditLog: vi.fn(() => Promise.resolve({ id: 1 })),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "superadmin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    onboardingCompleted: true,
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: { "x-forwarded-for": "127.0.0.1" },
      ip: "127.0.0.1",
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createClientContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "client-user",
    email: "client@example.com",
    name: "Client User",
    loginMethod: "manus",
    role: "client",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    onboardingCompleted: true,
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: { "x-forwarded-for": "127.0.0.1" },
      ip: "127.0.0.1",
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("contract router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("contract.create", () => {
    it("allows admin to create a contract", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.contract.create({
        tenantId: 1,
        name: "Test Contract",
        type: "analysis",
        fileKey: "contracts/test.pdf",
        fileName: "test.pdf",
        governingLaw: "Schweizer Recht",
        arbitrationClause: "Schiedsgerichtsvereinbarung",
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });
  });

  describe("contract.list", () => {
    it("returns contracts for tenant", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.contract.list({ tenantId: 1 });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("contract.myAssignments", () => {
    it("returns assigned contracts for client", async () => {
      const ctx = createClientContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.contract.myAssignments();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("contract.accept", () => {
    it("allows client to accept a contract with confirmation text", async () => {
      const ctx = createClientContext();
      const caller = appRouter.createCaller(ctx);

      const confirmationText = "Ich bestätige als Unternehmer, dass ich den Vertrag gelesen habe. Es gilt Schweizer Recht.";

      const result = await caller.contract.accept({
        assignmentId: 1,
        confirmationText,
      });

      expect(result).toBeDefined();
    });
  });

  describe("contract.getAcceptances", () => {
    it("returns all acceptances for tenant", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.contract.getAcceptances({ tenantId: 1 });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
