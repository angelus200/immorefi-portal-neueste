import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database module with all required functions
vi.mock("./db", () => ({
  getDb: vi.fn(() => Promise.resolve(null)),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getUserById: vi.fn(),
  getAllUsers: vi.fn(() => Promise.resolve([])),
  // Tenant functions
  createTenant: vi.fn(() => Promise.resolve(1)),
  getTenantById: vi.fn(() => Promise.resolve(null)),
  getTenantBySlug: vi.fn(() => Promise.resolve(null)),
  getAllTenants: vi.fn(() => Promise.resolve([])),
  updateTenant: vi.fn(() => Promise.resolve()),
  // Membership functions
  createMembership: vi.fn(() => Promise.resolve(1)),
  getMembershipsByUserId: vi.fn(() => Promise.resolve([])),
  getMembershipsByTenantId: vi.fn(() => Promise.resolve([])),
  getUserMembership: vi.fn(() => Promise.resolve(null)),
  updateMembership: vi.fn(() => Promise.resolve()),
  // Lead functions
  createLead: vi.fn(() => Promise.resolve(1)),
  getLeadsByTenantId: vi.fn(() => Promise.resolve([])),
  getLeadById: vi.fn(() => Promise.resolve(null)),
  updateLead: vi.fn(() => Promise.resolve()),
  // Contact functions
  createContact: vi.fn(() => Promise.resolve(1)),
  getContactsByTenantId: vi.fn(() => Promise.resolve([])),
  getContactById: vi.fn(() => Promise.resolve(null)),
  updateContact: vi.fn(() => Promise.resolve()),
  // Pipeline functions
  createPipelineStage: vi.fn(() => Promise.resolve(1)),
  getPipelineStagesByTenantId: vi.fn(() => Promise.resolve([])),
  updatePipelineStage: vi.fn(() => Promise.resolve()),
  deletePipelineStage: vi.fn(() => Promise.resolve()),
  // Deal functions
  createDeal: vi.fn(() => Promise.resolve(1)),
  getDealsByTenantId: vi.fn(() => Promise.resolve([])),
  getDealById: vi.fn(() => Promise.resolve(null)),
  updateDeal: vi.fn(() => Promise.resolve()),
  getDealsByStageId: vi.fn(() => Promise.resolve([])),
  // Task functions
  createTask: vi.fn(() => Promise.resolve(1)),
  getTasksByTenantId: vi.fn(() => Promise.resolve([])),
  getTasksByDealId: vi.fn(() => Promise.resolve([])),
  updateTask: vi.fn(() => Promise.resolve()),
  // File functions
  createFile: vi.fn(() => Promise.resolve(1)),
  getFilesByTenantId: vi.fn(() => Promise.resolve([])),
  getFilesByDealId: vi.fn(() => Promise.resolve([])),
  getFileById: vi.fn(() => Promise.resolve(null)),
  // Audit functions
  createAuditLog: vi.fn(() => Promise.resolve(1)),
  getAuditLogsByTenantId: vi.fn(() => Promise.resolve([])),
  getAllAuditLogs: vi.fn(() => Promise.resolve([])),
  // Note functions
  createNote: vi.fn(() => Promise.resolve(1)),
  getNotesByDealId: vi.fn(() => Promise.resolve([])),
  // Questionnaire functions
  createQuestionnaire: vi.fn(() => Promise.resolve(1)),
  getQuestionnairesByTenantId: vi.fn(() => Promise.resolve([])),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(user?: AuthenticatedUser): TrpcContext {
  return {
    user: user || null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAuthenticatedUser(overrides?: Partial<AuthenticatedUser>): AuthenticatedUser {
  return {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "tenant_admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
}

describe("appRouter", () => {
  describe("auth.me", () => {
    it("returns null for unauthenticated users", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeNull();
    });

    it("returns user data for authenticated users", async () => {
      const user = createAuthenticatedUser();
      const ctx = createTestContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toEqual(user);
      expect(result?.email).toBe("test@example.com");
    });
  });

  describe("auth.logout", () => {
    it("clears the session cookie and reports success", async () => {
      const user = createAuthenticatedUser();
      const ctx = createTestContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result).toEqual({ success: true });
      expect(ctx.res.clearCookie).toHaveBeenCalled();
    });
  });

  describe("tenant.list", () => {
    it("returns empty array when no tenants exist", async () => {
      const user = createAuthenticatedUser({ role: "superadmin" });
      const ctx = createTestContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.tenant.list();

      expect(result).toEqual([]);
    });
  });

  describe("contact.list", () => {
    it("returns empty array when no contacts exist", async () => {
      const user = createAuthenticatedUser();
      const ctx = createTestContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.contact.list({ tenantId: 1 });

      expect(result).toEqual([]);
    });
  });

  describe("lead.list", () => {
    it("returns empty array when no leads exist", async () => {
      const user = createAuthenticatedUser();
      const ctx = createTestContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.lead.list({ tenantId: 1 });

      expect(result).toEqual([]);
    });
  });

  describe("deal.list", () => {
    it("returns empty array when no deals exist", async () => {
      const user = createAuthenticatedUser();
      const ctx = createTestContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.deal.list({ tenantId: 1 });

      expect(result).toEqual([]);
    });
  });

  describe("pipeline.stages", () => {
    it("returns empty array when no pipeline stages exist", async () => {
      const user = createAuthenticatedUser();
      const ctx = createTestContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.pipeline.stages({ tenantId: 1 });

      expect(result).toEqual([]);
    });
  });

  describe("audit.list", () => {
    it("returns empty array when no audit logs exist", async () => {
      const user = createAuthenticatedUser({ role: "superadmin" });
      const ctx = createTestContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.audit.list({ tenantId: 1 });

      expect(result).toEqual([]);
    });
  });

  describe("user.list", () => {
    it("returns empty array when no users exist", async () => {
      const user = createAuthenticatedUser({ role: "superadmin" });
      const ctx = createTestContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.list();

      expect(result).toEqual([]);
    });
  });
});
