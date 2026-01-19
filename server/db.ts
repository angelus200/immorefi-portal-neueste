import { eq, desc, and, gte, lte, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import type { QuestionnaireStatus } from './types/questionnaire';
import {
  InsertUser, users,
  tenants, InsertTenant, Tenant,
  memberships, InsertMembership, Membership,
  leads, InsertLead, Lead,
  contacts, InsertContact, Contact,
  deals, InsertDeal, Deal,
  pipelineStages, InsertPipelineStage, PipelineStage,
  tasks, InsertTask, Task,
  files, InsertFile, File,
  auditLogs, InsertAuditLog, AuditLog,
  notes, InsertNote, Note,
  questionnaires, InsertQuestionnaire,
  questionnaireResponses, InsertQuestionnaireResponse,
  onboardingData, InsertOnboardingData, OnboardingData,
  onboardingDocuments, InsertOnboardingDocument, OnboardingDocument,
  downloadStats, InsertDownloadStat, DownloadStat,
  invoices, InsertInvoice, Invoice,
  invoiceItems, InsertInvoiceItem, InvoiceItem,
  invoiceCounters, InsertInvoiceCounter, InvoiceCounter,
  conversations, InsertConversation, Conversation,
  messages, InsertMessage, Message,
  customerNotes, InsertCustomerNote, CustomerNote,
  staffCalendars, InsertStaffCalendar, StaffCalendar,
  bookings, InsertBooking, Booking,
  contractTemplates, InsertContractTemplate, ContractTemplate,
  partnerLogos, InsertPartnerLogo, PartnerLogo,
  videos, InsertVideo, Video
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================
// USER FUNCTIONS
// ============================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "phone", "company", "loginMethod", "ghlContactId", "street", "zip", "city", "country", "website"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      // Owner bekommt immer Superadmin-Rolle
      values.role = 'superadmin';
      updateSet.role = 'superadmin';
    } else {
      // Neue Benutzer bekommen standardmäßig Client-Rolle
      values.role = 'client';
      // Nicht im updateSet, damit bestehende Rollen nicht überschrieben werden
    }
    if (user.source !== undefined) {
      values.source = user.source;
      updateSet.source = user.source;
    }
    if (user.status !== undefined) {
      values.status = user.status;
      updateSet.status = user.status;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserOnboardingStatus(userId: number, completed: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ onboardingCompleted: completed }).where(eq(users.id, userId));
}

export async function updateUserOnboarding(
  userId: number,
  data: {
    hasSeenWelcome?: boolean;
    hasCompletedTour?: boolean;
    onboardingProgress?: any;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function getUserOnboardingStatus(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select({
      hasSeenWelcome: users.hasSeenWelcome,
      hasCompletedTour: users.hasCompletedTour,
      onboardingProgress: users.onboardingProgress,
      onboardingCompleted: users.onboardingCompleted,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return result[0] || null;
}

export async function updateUserPreferences(
  userId: number,
  data: {
    emailNotifications?: boolean;
    marketingEmails?: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(data).where(eq(users.id, userId));
}

// ============================================
// TENANT FUNCTIONS
// ============================================

export async function createTenant(tenant: InsertTenant) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tenants).values(tenant);
  return result[0].insertId;
}

export async function getTenantById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTenantBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllTenants() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tenants).orderBy(desc(tenants.createdAt));
}

export async function updateTenant(id: number, data: Partial<InsertTenant>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tenants).set(data).where(eq(tenants.id, id));
}

// ============================================
// MEMBERSHIP FUNCTIONS
// ============================================

export async function createMembership(membership: InsertMembership) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(memberships).values(membership);
  return result[0].insertId;
}

export async function getMembershipsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memberships).where(eq(memberships.userId, userId));
}

export async function getMembershipsByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memberships).where(eq(memberships.tenantId, tenantId));
}

export async function getUserMembership(userId: number, tenantId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.tenantId, tenantId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateMembership(id: number, data: Partial<InsertMembership>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(memberships).set(data).where(eq(memberships.id, id));
}

// ============================================
// PIPELINE STAGE FUNCTIONS
// ============================================

export async function createPipelineStage(stage: InsertPipelineStage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(pipelineStages).values(stage);
  return result[0].insertId;
}

export async function getPipelineStagesByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pipelineStages)
    .where(eq(pipelineStages.tenantId, tenantId))
    .orderBy(asc(pipelineStages.order));
}

export async function updatePipelineStage(id: number, tenantId: number, data: Partial<InsertPipelineStage>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(pipelineStages).set(data)
    .where(and(eq(pipelineStages.id, id), eq(pipelineStages.tenantId, tenantId)));
}

export async function deletePipelineStage(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(pipelineStages).where(and(eq(pipelineStages.id, id), eq(pipelineStages.tenantId, tenantId)));
}

// ============================================
// TASK FUNCTIONS
// ============================================

export async function createTask(task: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tasks).values(task);
  return result[0].insertId;
}

export async function getTasksByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.tenantId, tenantId)).orderBy(desc(tasks.createdAt));
}

export async function getTasksByDealId(dealId: number, tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks)
    .where(and(eq(tasks.dealId, dealId), eq(tasks.tenantId, tenantId)))
    .orderBy(desc(tasks.createdAt));
}

export async function updateTask(id: number, tenantId: number, data: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tasks).set(data).where(and(eq(tasks.id, id), eq(tasks.tenantId, tenantId)));
}

// ============================================
// FILE FUNCTIONS
// ============================================

export async function createFile(file: InsertFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(files).values(file);
  return result[0].insertId;
}

export async function getFilesByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(files).where(eq(files.tenantId, tenantId)).orderBy(desc(files.createdAt));
}

export async function getFilesByDealId(dealId: number, tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(files)
    .where(and(eq(files.dealId, dealId), eq(files.tenantId, tenantId)))
    .orderBy(desc(files.createdAt));
}

export async function getFileById(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(files)
    .where(and(eq(files.id, id), eq(files.tenantId, tenantId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// AUDIT LOG FUNCTIONS
// ============================================

export async function createAuditLog(log: InsertAuditLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(auditLogs).values(log);
  return result[0].insertId;
}

export async function getAuditLogsByTenantId(tenantId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLogs)
    .where(eq(auditLogs.tenantId, tenantId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

export async function getAllAuditLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  const logs = await db.select({
    id: auditLogs.id,
    tenantId: auditLogs.tenantId,
    userId: auditLogs.userId,
    action: auditLogs.action,
    entityType: auditLogs.entityType,
    entityId: auditLogs.entityId,
    ipAddress: auditLogs.ipAddress,
    createdAt: auditLogs.createdAt,
    userName: users.name,
    userEmail: users.email,
  })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
  return logs;
}

export async function updateUserRole(userId: number, role: "superadmin" | "tenant_admin" | "staff" | "client") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// ============================================
// NOTE FUNCTIONS
// ============================================

export async function createNote(note: InsertNote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notes).values(note);
  return result[0].insertId;
}

export async function getNotesByDealId(dealId: number, tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notes)
    .where(and(eq(notes.dealId, dealId), eq(notes.tenantId, tenantId)))
    .orderBy(desc(notes.createdAt));
}

// ============================================
// QUESTIONNAIRE FUNCTIONS
// ============================================

export async function createQuestionnaire(questionnaire: InsertQuestionnaire) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(questionnaires).values(questionnaire);
  return result[0].insertId;
}

export async function getQuestionnairesByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(questionnaires).where(eq(questionnaires.tenantId, tenantId));
}

// Calculate questionnaire completion status based on responses
export function calculateQuestionnaireStatus(
  responses: any,
  questionnaireSchema: any
): QuestionnaireStatus {
  if (!responses || typeof responses !== 'object') {
    return "unvollständig";
  }

  // If no schema provided, assume all fields are optional
  if (!questionnaireSchema || !questionnaireSchema.questions) {
    return Object.keys(responses).length > 0 ? "abgeschlossen" : "unvollständig";
  }

  // Check if all required fields are filled
  const requiredQuestions = questionnaireSchema.questions.filter((q: any) => q.required);

  for (const question of requiredQuestions) {
    const answer = responses[question.id];

    // Check if answer exists and is not empty
    if (answer === undefined || answer === null || answer === '') {
      return "unvollständig";
    }

    // For array answers (multi-select), check if at least one option is selected
    if (Array.isArray(answer) && answer.length === 0) {
      return "unvollständig";
    }
  }

  return "abgeschlossen";
}

export async function createQuestionnaireResponse(response: InsertQuestionnaireResponse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get questionnaire schema to calculate status
  let status = "unvollständig";
  let completedAt = null;

  if (response.questionnaireId) {
    const questionnaire = await db.select()
      .from(questionnaires)
      .where(eq(questionnaires.id, response.questionnaireId))
      .limit(1);

    if (questionnaire.length > 0) {
      status = calculateQuestionnaireStatus(response.responses, questionnaire[0].schema);
      if (status === "abgeschlossen") {
        completedAt = new Date();
      }
    }
  }

  const result = await db.insert(questionnaireResponses).values({
    ...response,
    status,
    completedAt,
  });
  return result[0].insertId;
}

export async function updateQuestionnaireResponse(
  id: number,
  data: Partial<InsertQuestionnaireResponse>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // If responses are being updated, recalculate status
  if (data.responses) {
    const existingResponse = await db.select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.id, id))
      .limit(1);

    if (existingResponse.length > 0) {
      const questionnaire = await db.select()
        .from(questionnaires)
        .where(eq(questionnaires.id, existingResponse[0].questionnaireId))
        .limit(1);

      if (questionnaire.length > 0) {
        const status = calculateQuestionnaireStatus(data.responses, questionnaire[0].schema);
        data.status = status;

        if (status === "abgeschlossen") {
          data.completedAt = new Date();
        } else {
          data.completedAt = null;
        }
      }
    }
  }

  await db.update(questionnaireResponses).set(data).where(eq(questionnaireResponses.id, id));
}

export async function getQuestionnaireResponseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select()
    .from(questionnaireResponses)
    .where(eq(questionnaireResponses.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getQuestionnaireResponsesByDealId(dealId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(questionnaireResponses)
    .where(eq(questionnaireResponses.dealId, dealId));
}


// ============================================
// CONTRACT FUNCTIONS
// ============================================

import { 
  contracts, InsertContract, Contract,
  contractAssignments, InsertContractAssignment, ContractAssignment,
  contractAcceptances, InsertContractAcceptance, ContractAcceptance
} from "../drizzle/schema";

export async function createContract(contract: InsertContract) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contracts).values(contract);
  return result[0].insertId;
}

export async function getContractsByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contracts)
    .where(eq(contracts.tenantId, tenantId))
    .orderBy(desc(contracts.createdAt));
}

export async function getActiveContractsByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contracts)
    .where(and(eq(contracts.tenantId, tenantId), eq(contracts.status, "active")))
    .orderBy(desc(contracts.createdAt));
}

export async function getContractById(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(contracts)
    .where(and(eq(contracts.id, id), eq(contracts.tenantId, tenantId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateContract(id: number, tenantId: number, data: Partial<InsertContract>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contracts).set(data)
    .where(and(eq(contracts.id, id), eq(contracts.tenantId, tenantId)));
}

export async function deleteContract(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contracts).where(and(eq(contracts.id, id), eq(contracts.tenantId, tenantId)));
}

// Contract Assignments
export async function createContractAssignment(assignment: InsertContractAssignment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contractAssignments).values(assignment);
  return result[0].insertId;
}

export async function getContractAssignmentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contractAssignments)
    .where(eq(contractAssignments.userId, userId))
    .orderBy(desc(contractAssignments.createdAt));
}

export async function getContractAssignmentsByContractId(contractId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contractAssignments)
    .where(eq(contractAssignments.contractId, contractId))
    .orderBy(desc(contractAssignments.createdAt));
}

export async function getContractAssignmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(contractAssignments)
    .where(eq(contractAssignments.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteContractAssignment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contractAssignments).where(eq(contractAssignments.id, id));
}

// Contract Acceptances
export async function createContractAcceptance(acceptance: InsertContractAcceptance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contractAcceptances).values(acceptance);
  return result[0].insertId;
}

export async function getContractAcceptancesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contractAcceptances)
    .where(eq(contractAcceptances.userId, userId))
    .orderBy(desc(contractAcceptances.acceptedAt));
}

export async function getContractAcceptancesByContractId(contractId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contractAcceptances)
    .where(eq(contractAcceptances.contractId, contractId))
    .orderBy(desc(contractAcceptances.acceptedAt));
}

export async function getContractAcceptanceByAssignmentId(assignmentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(contractAcceptances)
    .where(eq(contractAcceptances.assignmentId, assignmentId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllContractAcceptancesByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contractAcceptances)
    .where(eq(contractAcceptances.tenantId, tenantId))
    .orderBy(desc(contractAcceptances.acceptedAt));
}


// ============================================
// ORDER FUNCTIONS (Stripe)
// ============================================

import { orders, InsertOrder, Order } from "../drizzle/schema";

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(order);
  return result[0].insertId;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderByStripeSessionId(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders)
    .where(eq(orders.stripeSessionId, sessionId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function updateOrder(id: number, data: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set(data).where(eq(orders.id, id));
}

export async function updateOrderByStripeSessionId(sessionId: string, data: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set(data).where(eq(orders.stripeSessionId, sessionId));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt));

  // Format to include user data
  return result.map(row => ({
    ...row.orders,
    user: row.users ? {
      name: row.users.name,
      email: row.users.email,
      company: row.users.company,
    } : null
  }));
}

export async function hasUserPurchasedProduct(userId: number, productId: string) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(orders)
    .where(and(
      eq(orders.userId, userId),
      eq(orders.productId, productId),
      eq(orders.status, 'completed')
    ))
    .limit(1);
  return result.length > 0;
}


// ============================================
// ONBOARDING DATA FUNCTIONS
// ============================================

export async function createOnboardingData(data: InsertOnboardingData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(onboardingData).values(data);
  return result[0].insertId;
}

export async function getOnboardingDataByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(onboardingData)
    .where(eq(onboardingData.userId, userId))
    .orderBy(desc(onboardingData.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOnboardingDataById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(onboardingData)
    .where(eq(onboardingData.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateOnboardingData(id: number, data: Partial<InsertOnboardingData>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(onboardingData).set(data).where(eq(onboardingData.id, id));
}

export async function updateOnboardingDataByUserId(userId: number, data: Partial<InsertOnboardingData>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(onboardingData).set(data).where(eq(onboardingData.userId, userId));
}

export async function getAllOnboardingData() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(onboardingData)
    .leftJoin(users, eq(onboardingData.userId, users.id))
    .orderBy(desc(onboardingData.createdAt));

  // Format to include user data
  return result.map(row => ({
    ...row.onboarding_data,
    user: row.users ? {
      name: row.users.name,
      email: row.users.email,
      company: row.users.company,
    } : null
  }));
}

export async function getCompletedOnboardingData() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(onboardingData)
    .where(eq(onboardingData.status, 'completed'))
    .orderBy(desc(onboardingData.completedAt));
}

export async function markOnboardingAsReviewed(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(onboardingData)
    .set({ status: 'reviewed' })
    .where(eq(onboardingData.id, id));
}


// ============================================
// ONBOARDING DOCUMENTS FUNCTIONS
// ============================================

export async function createOnboardingDocument(data: InsertOnboardingDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(onboardingDocuments).values(data);
  return result[0].insertId;
}

export async function getOnboardingDocumentsByOnboardingId(onboardingId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(onboardingDocuments)
    .where(eq(onboardingDocuments.onboardingId, onboardingId))
    .orderBy(desc(onboardingDocuments.createdAt));
}

export async function getOnboardingDocumentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(onboardingDocuments)
    .where(eq(onboardingDocuments.userId, userId))
    .orderBy(desc(onboardingDocuments.createdAt));
}

export async function deleteOnboardingDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(onboardingDocuments).where(eq(onboardingDocuments.id, id));
}

export async function getOnboardingDocumentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(onboardingDocuments)
    .where(eq(onboardingDocuments.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// DOWNLOAD STATISTICS
// ============================================

export async function createDownloadStat(data: InsertDownloadStat) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(downloadStats).values(data);
  return result[0].insertId;
}

export async function getDownloadStats() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(downloadStats)
    .orderBy(desc(downloadStats.createdAt));
}

export async function getDownloadStatsByProduct(productType: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(downloadStats)
    .where(eq(downloadStats.productType, productType))
    .orderBy(desc(downloadStats.createdAt));
}

export async function getDownloadStatsCount() {
  const db = await getDb();
  if (!db) return { total: 0, handbuch: 0, analyse: 0 };
  
  const allStats = await db.select().from(downloadStats);
  const handbuchStats = allStats.filter(s => s.productType === 'handbuch');
  const analyseStats = allStats.filter(s => s.productType === 'analyse');
  
  return {
    total: allStats.length,
    handbuch: handbuchStats.length,
    analyse: analyseStats.length,
  };
}

export async function getDownloadStatsByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(downloadStats)
    .where(
      and(
        gte(downloadStats.createdAt, startDate),
        lte(downloadStats.createdAt, endDate)
      )
    )
    .orderBy(desc(downloadStats.createdAt));
}
// ============================================
// CHAT SYSTEM FUNCTIONS
// ============================================

// Conversations
export async function createConversation(data: InsertConversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(conversations).values(data);
  return result[0].insertId;
}

export async function getConversationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getConversationsByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(conversations)
    .where(eq(conversations.customerId, customerId))
    .orderBy(desc(conversations.lastMessageAt));
}

export async function getAllConversations(status?: "open" | "closed" | "archived") {
  const db = await getDb();
  if (!db) return [];

  if (status) {
    return db.select().from(conversations)
      .where(eq(conversations.status, status))
      .orderBy(desc(conversations.lastMessageAt));
  }

  return db.select().from(conversations)
    .orderBy(desc(conversations.lastMessageAt));
}

export async function updateConversationStatus(id: number, status: "open" | "closed" | "archived") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(conversations)
    .set({ status, updatedAt: new Date() })
    .where(eq(conversations.id, id));
}

export async function updateConversationLastMessage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(conversations)
    .set({ lastMessageAt: new Date(), updatedAt: new Date() })
    .where(eq(conversations.id, id));
}

// Messages
export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(messages).values(data);

  // Update lastMessageAt in conversation
  await updateConversationLastMessage(data.conversationId);

  return result[0].insertId;
}

export async function getMessagesByConversation(conversationId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt))
    .limit(limit);
}

export async function markMessageAsRead(messageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(messages)
    .set({ readAt: new Date() })
    .where(eq(messages.id, messageId));
}

export async function markConversationMessagesAsRead(conversationId: number, readByRole: "admin" | "customer") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Mark all unread messages from the OTHER role as read
  // If admin is reading, mark customer messages as read, and vice versa
  const senderRole = readByRole === "admin" ? "customer" : "admin";

  await db.update(messages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.senderRole, senderRole),
        eq(messages.readAt, null)
      )
    );
}

export async function getUnreadMessageCount(conversationId: number, forRole: "admin" | "customer") {
  const db = await getDb();
  if (!db) return 0;

  // Count unread messages from the OTHER role
  // If checking for admin, count customer messages, and vice versa
  const senderRole = forRole === "admin" ? "customer" : "admin";

  const result = await db.select().from(messages)
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.senderRole, senderRole),
        eq(messages.readAt, null)
      )
    );

  return result.length;
}

export async function getTotalUnreadMessageCount(forRole: "admin" | "customer") {
  const db = await getDb();
  if (!db) return 0;

  // Count all unread messages from the OTHER role
  const senderRole = forRole === "admin" ? "customer" : "admin";

  const result = await db.select().from(messages)
    .where(
      and(
        eq(messages.senderRole, senderRole),
        eq(messages.readAt, null)
      )
    );

  return result.length;
}

// ============================================
// CUSTOMER NOTES FUNCTIONS
// ============================================

export async function createCustomerNote(note: InsertCustomerNote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(customerNotes).values(note);
  return result;
}

export async function getCustomerNotes(customerId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(customerNotes)
    .where(eq(customerNotes.customerId, customerId))
    .orderBy(desc(customerNotes.createdAt));
}

export async function getCustomerNotesByOrder(orderId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(customerNotes)
    .where(eq(customerNotes.orderId, orderId))
    .orderBy(desc(customerNotes.createdAt));
}

export async function deleteCustomerNote(noteId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(customerNotes).where(eq(customerNotes.id, noteId));
}

export async function updateUser(userId: number, updates: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(updates).where(eq(users.id, userId));
}

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete related data first
  await db.delete(customerNotes).where(eq(customerNotes.customerId, userId));
  await db.delete(conversations).where(eq(conversations.customerId, userId));
  await db.delete(onboardingData).where(eq(onboardingData.userId, userId));
  await db.delete(orders).where(eq(orders.userId, userId));

  // Delete user
  await db.delete(users).where(eq(users.id, userId));
}

// ============================================
// CRM LEADS FUNCTIONS
// ============================================

export async function createLead(lead: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(leads).values(lead);
  return result[0].insertId;
}

export async function getLeadsByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).where(eq(leads.tenantId, tenantId)).orderBy(desc(leads.createdAt));
}

export async function getLeadById(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(leads)
    .where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateLead(id: number, tenantId: number, data: Partial<InsertLead>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(leads).set(data).where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)));
}

export async function deleteLead(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(leads).where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)));
}

export async function getLeadByGHLContactId(ghlContactId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(leads)
    .where(eq(leads.ghlContactId, ghlContactId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// CRM CONTACTS FUNCTIONS (Extended)
// ============================================

export async function createContact(contact: InsertContact) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contacts).values(contact);
  return result[0].insertId;
}

export async function getContactsByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contacts).where(eq(contacts.tenantId, tenantId)).orderBy(desc(contacts.createdAt));
}

export async function getContactById(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateContact(id: number, tenantId: number, data: Partial<InsertContact>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contacts).set(data).where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId)));
}

export async function deleteContact(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contacts).where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId)));
}

export async function getContactByGHLContactId(ghlContactId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(contacts)
    .where(eq(contacts.ghlContactId, ghlContactId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// CRM DEALS FUNCTIONS (Extended)
// ============================================

export async function createDeal(deal: InsertDeal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(deals).values(deal);
  return result[0].insertId;
}

export async function getDealsByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deals).where(eq(deals.tenantId, tenantId)).orderBy(desc(deals.createdAt));
}

export async function getDealById(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(deals)
    .where(and(eq(deals.id, id), eq(deals.tenantId, tenantId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDeal(id: number, tenantId: number, data: Partial<InsertDeal>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(deals).set(data).where(and(eq(deals.id, id), eq(deals.tenantId, tenantId)));
}

export async function deleteDeal(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(deals).where(and(eq(deals.id, id), eq(deals.tenantId, tenantId)));
}

export async function getDealsByStageId(stageId: number, tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deals)
    .where(and(eq(deals.stageId, stageId), eq(deals.tenantId, tenantId)))
    .orderBy(desc(deals.createdAt));
}

export async function getDealsByContactId(contactId: number, tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deals)
    .where(and(eq(deals.contactId, contactId), eq(deals.tenantId, tenantId)))
    .orderBy(desc(deals.createdAt));
}

export async function getDealByGHLOpportunityId(ghlOpportunityId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(deals)
    .where(eq(deals.ghlOpportunityId, ghlOpportunityId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// STAFF CALENDAR FUNCTIONS
// ============================================

export async function createStaffCalendar(calendar: InsertStaffCalendar) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(staffCalendars).values(calendar);
  return result[0].insertId;
}

export async function getStaffCalendarsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(staffCalendars)
    .where(eq(staffCalendars.userId, userId))
    .orderBy(desc(staffCalendars.createdAt));
}

export async function getStaffCalendarById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(staffCalendars)
    .where(eq(staffCalendars.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllActiveStaffCalendars() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(staffCalendars)
    .where(eq(staffCalendars.isActive, true))
    .orderBy(desc(staffCalendars.createdAt));
}

export async function updateStaffCalendar(id: number, data: Partial<InsertStaffCalendar>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(staffCalendars).set(data).where(eq(staffCalendars.id, id));
}

export async function deleteStaffCalendar(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(staffCalendars).where(eq(staffCalendars.id, id));
}

// ============================================
// BOOKING FUNCTIONS
// ============================================

export async function createBooking(booking: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bookings).values(booking);
  return result[0].insertId;
}

export async function getBookingsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings)
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.startTime));
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllBookings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings)
    .orderBy(desc(bookings.startTime));
}

export async function getUpcomingBookings(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();

  if (userId) {
    return db.select().from(bookings)
      .where(and(
        eq(bookings.userId, userId),
        gte(bookings.startTime, now)
      ))
      .orderBy(asc(bookings.startTime));
  }

  return db.select().from(bookings)
    .where(gte(bookings.startTime, now))
    .orderBy(asc(bookings.startTime));
}

export async function getBookingByCalendlyEventId(calendlyEventId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bookings)
    .where(eq(bookings.calendlyEventId, calendlyEventId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateBooking(id: number, data: Partial<InsertBooking>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bookings).set(data).where(eq(bookings.id, id));
}

export async function deleteBooking(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(bookings).where(eq(bookings.id, id));
}

// Get bookings that need reminders
export async function getBookingsNeedingReminder24h() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  return db.select().from(bookings)
    .where(and(
      eq(bookings.reminder24hSent, false),
      gte(bookings.startTime, in24h),
      lte(bookings.startTime, in25h),
      eq(bookings.status, 'confirmed')
    ));
}

export async function getBookingsNeedingReminder1h() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  const in1h = new Date(now.getTime() + 60 * 60 * 1000);
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  return db.select().from(bookings)
    .where(and(
      eq(bookings.reminder1hSent, false),
      gte(bookings.startTime, in1h),
      lte(bookings.startTime, in2h),
      eq(bookings.status, 'confirmed')
    ));
}

// ============================================
// CONTRACT TEMPLATE FUNCTIONS
// ============================================

export async function getContractTemplates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contractTemplates)
    .where(eq(contractTemplates.isActive, true))
    .orderBy(asc(contractTemplates.category), asc(contractTemplates.name));
}

export async function getContractTemplateById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(contractTemplates)
    .where(eq(contractTemplates.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createContractTemplate(template: InsertContractTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contractTemplates).values(template);
  return result[0].insertId;
}

export async function updateContractTemplate(id: number, data: Partial<InsertContractTemplate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contractTemplates).set(data).where(eq(contractTemplates.id, id));
}

export async function deleteContractTemplate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Soft delete by setting isActive to false
  await db.update(contractTemplates).set({ isActive: false }).where(eq(contractTemplates.id, id));
}

// ============================================
// Partner Logo Functions
// ============================================

export async function getPartnerLogos(category?: string) {
  const db = await getDb();
  if (!db) return [];

  if (category) {
    return db.select().from(partnerLogos)
      .where(and(
        eq(partnerLogos.isActive, true),
        eq(partnerLogos.category, category as any)
      ))
      .orderBy(asc(partnerLogos.sortOrder), asc(partnerLogos.name));
  }

  return db.select().from(partnerLogos)
    .where(eq(partnerLogos.isActive, true))
    .orderBy(asc(partnerLogos.category), asc(partnerLogos.sortOrder), asc(partnerLogos.name));
}

export async function getAllPartnerLogos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(partnerLogos)
    .orderBy(asc(partnerLogos.category), asc(partnerLogos.sortOrder), asc(partnerLogos.name));
}

export async function getPartnerLogoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(partnerLogos)
    .where(eq(partnerLogos.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createPartnerLogo(logo: InsertPartnerLogo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(partnerLogos).values(logo);
  return result[0].insertId;
}

export async function updatePartnerLogo(id: number, data: Partial<InsertPartnerLogo>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(partnerLogos).set(data).where(eq(partnerLogos.id, id));
}

export async function deletePartnerLogo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Soft delete by setting isActive to false
  await db.update(partnerLogos).set({ isActive: false }).where(eq(partnerLogos.id, id));
}

export async function reorderPartnerLogos(updates: { id: number; sortOrder: number }[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Update each logo's sortOrder
  for (const update of updates) {
    await db.update(partnerLogos)
      .set({ sortOrder: update.sortOrder })
      .where(eq(partnerLogos.id, update.id));
  }
}

// ============================================
// VIDEO FUNCTIONS
// ============================================

export async function getVideos() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(videos)
    .where(eq(videos.isActive, true))
    .orderBy(asc(videos.sortOrder), asc(videos.title));
}

export async function getAllVideos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(videos).orderBy(asc(videos.sortOrder), asc(videos.title));
}

export async function getVideoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createVideo(video: InsertVideo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(videos).values(video);
  return result[0].insertId;
}

export async function updateVideo(id: number, data: Partial<InsertVideo>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(videos).set(data).where(eq(videos.id, id));
}

export async function deleteVideo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Soft delete by setting isActive to false
  await db.update(videos).set({ isActive: false }).where(eq(videos.id, id));
}

export async function reorderVideos(updates: { id: number; sortOrder: number }[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Update each video's sortOrder
  for (const update of updates) {
    await db.update(videos)
      .set({ sortOrder: update.sortOrder })
      .where(eq(videos.id, update.id));
  }
}
