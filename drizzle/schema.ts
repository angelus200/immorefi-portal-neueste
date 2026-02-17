import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, float } from "drizzle-orm/mysql-core";

// ============================================
// USER & AUTHENTICATION
// ============================================

export const roleEnum = mysqlEnum("role", ["superadmin", "tenant_admin", "staff", "client"]);
export const userSourceEnum = mysqlEnum("userSource", ["portal", "ghl", "manual"]);
export const userStatusEnum = mysqlEnum("userStatus", ["active", "inactive", "blocked"]);

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  company: varchar("company", { length: 255 }),
  // Address fields
  street: varchar("street", { length: 255 }),
  zip: varchar("zip", { length: 20 }),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  website: varchar("website", { length: 255 }),
  // Status
  status: userStatusEnum.default("active").notNull(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum.default("client").notNull(),
  source: userSourceEnum.default("portal").notNull(),
  ghlContactId: varchar("ghlContactId", { length: 64 }),
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(),
  // Onboarding system fields
  hasSeenWelcome: boolean("hasSeenWelcome").default(false).notNull(),
  hasCompletedTour: boolean("hasCompletedTour").default(false).notNull(),
  onboardingProgress: json("onboardingProgress").$type<{
    profileCompleted?: boolean;
    firstBooking?: boolean;
    firstDocument?: boolean;
    firstOrder?: boolean;
  }>(),
  // Email notification preferences
  emailNotifications: boolean("emailNotifications").default(true).notNull(),
  marketingEmails: boolean("marketingEmails").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// TENANT / MULTI-MANDANTEN
// ============================================

export const tenants = mysqlTable("tenants", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  logoUrl: text("logoUrl"),
  primaryColor: varchar("primaryColor", { length: 7 }).default("#00B4D8"),
  secondaryColor: varchar("secondaryColor", { length: 7 }).default("#FF6B6B"),
  legalImprint: text("legalImprint"),
  legalPrivacy: text("legalPrivacy"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

// ============================================
// MEMBERSHIP (User-Tenant Relationship)
// ============================================

export const membershipRoleEnum = mysqlEnum("membershipRole", ["tenant_admin", "staff", "client"]);

export const memberships = mysqlTable("memberships", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tenantId: int("tenantId").notNull(),
  role: membershipRoleEnum.default("client").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Membership = typeof memberships.$inferSelect;
export type InsertMembership = typeof memberships.$inferInsert;

// ============================================
// CRM: LEADS
// ============================================

export const leadStatusEnum = mysqlEnum("leadStatus", ["new", "contacted", "qualified", "converted", "lost"]);
export const leadSourceEnum = mysqlEnum("source", ["website", "referral", "ghl", "manual"]); // DB-Spalte: "source" (nicht "leadSource"!)

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  contactId: int("contactId"),
  ghlContactId: varchar("ghlContactId", { length: 64 }), // GoHighLevel Sync
  // Contact information
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  company: varchar("company", { length: 255 }),
  // Lead details
  status: leadStatusEnum.default("new").notNull(),
  source: leadSourceEnum.default("manual"), // nullable in DB (varchar legacy)
  capitalNeed: varchar("capitalNeed", { length: 100 }), // Kapitalbedarf
  timeHorizon: varchar("timeHorizon", { length: 100 }), // Zeithorizont
  description: text("description"), // Beschreibung
  notes: text("notes"), // Interne Notizen
  assignedTo: int("assignedTo"), // User ID des zugewiesenen Mitarbeiters
  // Sync
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ============================================
// CRM: CONTACTS
// ============================================

export const contactTypeEnum = mysqlEnum("contactType", ["kunde", "partner", "lieferant"]);

export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  ghlContactId: varchar("ghlContactId", { length: 64 }), // GoHighLevel Sync
  // Contact information
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  company: varchar("company", { length: 255 }),
  type: contactTypeEnum.default("kunde").notNull(),
  // Address
  street: varchar("street", { length: 255 }),
  zip: varchar("zip", { length: 20 }),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  website: varchar("website", { length: 255 }),
  // Notes
  notes: text("notes"),
  // Sync
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

// ============================================
// PIPELINE STAGES
// ============================================

export const pipelineStages = mysqlTable("pipeline_stages", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  order: int("order").notNull(),
  color: varchar("color", { length: 7 }).default("#00B4D8"),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PipelineStage = typeof pipelineStages.$inferSelect;
export type InsertPipelineStage = typeof pipelineStages.$inferInsert;

// ============================================
// DEALS
// ============================================

export const dealStageEnum = mysqlEnum("dealStage", ["new", "qualified", "proposal", "negotiation", "won", "lost"]);

export const deals = mysqlTable("deals", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  ghlOpportunityId: varchar("ghlOpportunityId", { length: 64 }), // GoHighLevel Sync
  // Relations
  contactId: int("contactId").notNull(),
  leadId: int("leadId"), // Optional: ursprünglicher Lead
  stageId: int("stageId").notNull(), // Pipeline Stage ID
  stage: dealStageEnum.default("new").notNull(), // Stage enum für einfache Queries
  assignedTo: int("assignedTo"), // User ID des zugewiesenen Mitarbeiters (alias für ownerId)
  // Deal details
  name: varchar("name", { length: 255 }).notNull(),
  value: float("value"), // Deal-Wert in EUR
  currency: varchar("currency", { length: 3 }).default("EUR"),
  probability: int("probability").default(0), // Wahrscheinlichkeit 0-100%
  expectedCloseDate: timestamp("expectedCloseDate"), // Erwartetes Abschlussdatum
  notes: text("notes"), // Interne Notizen
  // Status
  closedAt: timestamp("closedAt"),
  // Sync
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Deal = typeof deals.$inferSelect;
export type InsertDeal = typeof deals.$inferInsert;

// ============================================
// TASKS
// ============================================

export const taskStatusEnum = mysqlEnum("taskStatus", ["todo", "in_progress", "done", "cancelled"]);

export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  dealId: int("dealId"),
  assigneeId: int("assigneeId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: taskStatusEnum.default("todo").notNull(),
  dueAt: timestamp("dueAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// ============================================
// FILES
// ============================================

export const fileCategoryEnum = mysqlEnum("fileCategory", ["document", "contract", "financial", "identification", "other"]);

export const files = mysqlTable("files", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  userId: int("userId"), // Customer/user this file belongs to
  dealId: int("dealId"),
  category: fileCategoryEnum.default("document").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  size: int("size"),
  uploadedBy: int("uploadedBy"), // Admin who uploaded the file
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type File = typeof files.$inferSelect;
export type InsertFile = typeof files.$inferInsert;

// ============================================
// QUESTIONNAIRES (Onboarding)
// ============================================

export const questionnaires = mysqlTable("questionnaires", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  version: int("version").default(1).notNull(),
  schema: json("schema"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Questionnaire = typeof questionnaires.$inferSelect;
export type InsertQuestionnaire = typeof questionnaires.$inferInsert;

export const questionnaireResponses = mysqlTable("questionnaire_responses", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  questionnaireId: int("questionnaireId").notNull(),
  dealId: int("dealId"),
  userId: int("userId"),
  responses: json("responses"),
  status: varchar("status", { length: 50 }).default("unvollständig").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuestionnaireResponse = typeof questionnaireResponses.$inferSelect;
export type InsertQuestionnaireResponse = typeof questionnaireResponses.$inferInsert;

// ============================================
// AUDIT LOG
// ============================================

export const auditActionEnum = mysqlEnum("auditAction", [
  "create", "update", "delete", "login", "logout", "view", "download", "upload", "move", "assign"
]);

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"),
  userId: int("userId"),
  action: auditActionEnum.notNull(),
  entityType: varchar("entityType", { length: 100 }).notNull(),
  entityId: int("entityId"),
  oldValues: json("oldValues"),
  newValues: json("newValues"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ============================================
// NOTES
// ============================================

export const notes = mysqlTable("notes", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  dealId: int("dealId").notNull(),
  authorId: int("authorId").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;


// ============================================
// CONTRACTS (Vertragsvorlagen & Anerkennung)
// ============================================

export const contractTypeEnum = mysqlEnum("contractType", [
  "analysis",           // Analyse & Strukturierungsdiagnose
  "fund_structuring",   // Fondsstrukturierung
  "cln_amc",           // CLN/AMC Strukturierung
  "mandate",           // Mandatsvertrag
  "nda",               // Vertraulichkeitsvereinbarung
  "other"              // Sonstige
]);

export const contractStatusEnum = mysqlEnum("contractStatus", [
  "draft",      // Entwurf
  "active",     // Aktiv/Freigegeben
  "archived"    // Archiviert
]);

export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: contractTypeEnum.default("other").notNull(),
  description: text("description"),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileContent: text("fileContent", { length: 16777215 }), // LONGTEXT for storing file as base64
  fileMimeType: varchar("fileMimeType", { length: 100 }), // e.g., application/pdf
  version: varchar("version", { length: 20 }).default("1.0").notNull(),
  status: contractStatusEnum.default("draft").notNull(),
  // Rechtliche Hinweise
  governingLaw: varchar("governingLaw", { length: 100 }).default("Schweizer Recht"),
  arbitrationClause: text("arbitrationClause"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

// Zuweisung von Verträgen an Kunden
export const contractAssignments = mysqlTable("contract_assignments", {
  id: int("id").autoincrement().primaryKey(),
  contractId: int("contractId").notNull(),
  userId: int("userId").notNull(),
  tenantId: int("tenantId").notNull(),
  assignedBy: int("assignedBy").notNull(),
  note: text("note"),
  dueDate: timestamp("dueDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContractAssignment = typeof contractAssignments.$inferSelect;
export type InsertContractAssignment = typeof contractAssignments.$inferInsert;

// Protokollierung der Vertragsanerkennung (Checkbox-Bestätigung)
export const contractAcceptances = mysqlTable("contract_acceptances", {
  id: int("id").autoincrement().primaryKey(),
  assignmentId: int("assignmentId").notNull(),
  contractId: int("contractId").notNull(),
  userId: int("userId").notNull(),
  tenantId: int("tenantId").notNull(),
  // Bestätigungsdetails
  acceptedAt: timestamp("acceptedAt").notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  // Checkbox-Bestätigungstext der akzeptiert wurde
  confirmationText: text("confirmationText").notNull(),
  // Zusätzliche Metadaten
  contractVersion: varchar("contractVersion", { length: 20 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContractAcceptance = typeof contractAcceptances.$inferSelect;
export type InsertContractAcceptance = typeof contractAcceptances.$inferInsert;


// ============================================
// ORDERS (Stripe Purchases)
// ============================================

export const orderStatusEnum = mysqlEnum("orderStatus", [
  "pending",     // Zahlung ausstehend
  "completed",   // Zahlung erfolgreich
  "failed",      // Zahlung fehlgeschlagen
  "refunded"     // Erstattet
]);

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"),
  userId: int("userId").notNull(),
  // Stripe IDs
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  // Product info
  productId: varchar("productId", { length: 100 }).notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  // Status
  status: orderStatusEnum.default("pending").notNull(),
  // Timestamps
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;


// ============================================
// ONBOARDING DATA (Analyse-Fragebogen)
// ============================================

export const onboardingStatusEnum = mysqlEnum("onboardingStatus", [
  "in_progress",  // Noch nicht abgeschlossen
  "completed",    // Abgeschlossen
  "reviewed"      // Von Admin geprüft
]);

export const onboardingData = mysqlTable("onboarding_data", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tenantId: int("tenantId"),
  status: onboardingStatusEnum.default("in_progress").notNull(),
  
  // Step 1: Kontaktdaten
  anrede: varchar("anrede", { length: 20 }),
  titel: varchar("titel", { length: 20 }),
  vorname: varchar("vorname", { length: 100 }),
  nachname: varchar("nachname", { length: 100 }),
  telefon: varchar("telefon", { length: 50 }),
  position: varchar("position", { length: 100 }),
  
  // Step 2: Unternehmen
  firmenname: varchar("firmenname", { length: 255 }),
  rechtsform: varchar("rechtsform", { length: 50 }),
  gruendungsjahr: varchar("gruendungsjahr", { length: 10 }),
  handelsregister: varchar("handelsregister", { length: 50 }),
  umsatzsteuerID: varchar("umsatzsteuerID", { length: 50 }),
  strasse: varchar("strasse", { length: 255 }),
  plz: varchar("plz", { length: 20 }),
  ort: varchar("ort", { length: 100 }),
  land: varchar("land", { length: 50 }),
  website: varchar("website", { length: 255 }),
  
  // Step 3: Immobilienportfolio
  portfolioGroesse: varchar("portfolioGroesse", { length: 50 }),
  anzahlObjekte: varchar("anzahlObjekte", { length: 50 }),
  objektarten: json("objektarten"), // Array of strings
  standorte: text("standorte"),
  gesamtmietflaeche: varchar("gesamtmietflaeche", { length: 50 }),
  leerstandsquote: varchar("leerstandsquote", { length: 20 }),
  durchschnittlicheMietrendite: varchar("durchschnittlicheMietrendite", { length: 20 }),
  
  // Step 4: Finanzierung
  aktuelleFinanzierungen: varchar("aktuelleFinanzierungen", { length: 50 }),
  durchschnittlicherZinssatz: varchar("durchschnittlicherZinssatz", { length: 20 }),
  restlaufzeiten: varchar("restlaufzeiten", { length: 50 }),
  tilgungsstruktur: varchar("tilgungsstruktur", { length: 50 }),
  sicherheiten: text("sicherheiten"),
  bankbeziehungen: text("bankbeziehungen"),
  
  // Step 5: Projektziele
  kapitalbedarf: varchar("kapitalbedarf", { length: 50 }),
  verwendungszweck: varchar("verwendungszweck", { length: 100 }),
  zeithorizont: varchar("zeithorizont", { length: 50 }),
  gewuenschteStruktur: varchar("gewuenschteStruktur", { length: 50 }),
  investorentyp: varchar("investorentyp", { length: 50 }),
  projektbeschreibung: text("projektbeschreibung"),
  besondereAnforderungen: text("besondereAnforderungen"),
  
  // Step 6: Zustimmungen
  agbAkzeptiert: boolean("agbAkzeptiert").default(false),
  datenschutzAkzeptiert: boolean("datenschutzAkzeptiert").default(false),
  
  // Timestamps
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OnboardingData = typeof onboardingData.$inferSelect;
export type InsertOnboardingData = typeof onboardingData.$inferInsert;


// ============================================
// ONBOARDING DOCUMENTS
// ============================================

export const onboardingDocCategoryEnum = mysqlEnum("onboardingDocCategory", [
  "jahresabschluss",      // Jahresabschlüsse
  "bwa",                  // BWA und Summen-/Saldenliste
  "objektliste",          // Objektliste mit Eckdaten
  "mieterliste",          // Aktuelle Mieterliste
  "finanzierungen",       // Übersicht bestehender Finanzierungen
  "wertgutachten",        // Aktuelle Wertgutachten
  "gesellschaftsvertrag", // Gesellschaftsvertrag / Satzung
  "sonstige"              // Sonstige Dokumente
]);

export const onboardingDocuments = mysqlTable("onboarding_documents", {
  id: int("id").autoincrement().primaryKey(),
  onboardingId: int("onboardingId").notNull(),
  userId: int("userId").notNull(),
  category: onboardingDocCategoryEnum.default("sonstige").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  size: int("size"), // in bytes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OnboardingDocument = typeof onboardingDocuments.$inferSelect;
export type InsertOnboardingDocument = typeof onboardingDocuments.$inferInsert;

// ============================================
// DOWNLOAD STATISTICS
// ============================================

export const downloadStats = mysqlTable("download_stats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  productType: varchar("productType", { length: 50 }).notNull(), // 'handbuch', 'analyse', etc.
  productName: varchar("productName", { length: 255 }).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  referrer: text("referrer"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DownloadStat = typeof downloadStats.$inferSelect;
export type InsertDownloadStat = typeof downloadStats.$inferInsert;


// ============================================
// INVOICES (Rechnungen)
// ============================================

export const invoiceStatusEnum = mysqlEnum("invoiceStatus", [
  "draft",      // Entwurf
  "sent",       // Versendet
  "paid",       // Bezahlt
  "overdue",    // Überfällig
  "cancelled"   // Storniert
]);

export const invoiceTypeEnum = mysqlEnum("invoiceType", [
  "analysis",        // Analyse & Strukturierungsdiagnose
  "shop",            // Shop-Kauf (Handbuch)
  "installment",     // Abschlagrechnung
  "final",           // Schlussrechnung
  "credit_note"      // Gutschrift
]);

export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"),
  userId: int("userId"),
  orderId: int("orderId"), // Verknüpfung zu Stripe-Order falls vorhanden
  contractId: int("contractId"), // Verknüpfung zu Vertrag falls vorhanden
  
  // Rechnungsnummer
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  invoiceDate: timestamp("invoiceDate").notNull(),
  dueDate: timestamp("dueDate"),
  
  // Typ und Status
  type: invoiceTypeEnum.default("shop").notNull(),
  status: invoiceStatusEnum.default("draft").notNull(),
  
  // Kundeninformationen (zum Zeitpunkt der Rechnungsstellung)
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerCompany: varchar("customerCompany", { length: 255 }),
  customerAddress: text("customerAddress"),
  customerVatId: varchar("customerVatId", { length: 50 }),
  
  // Rechnungsdetails
  description: text("description"),
  
  // Beträge
  netAmount: float("netAmount").notNull(), // Nettobetrag
  vatRate: float("vatRate").default(7.7).notNull(), // MwSt-Satz (Schweiz: 7.7%)
  vatAmount: float("vatAmount").notNull(), // MwSt-Betrag
  grossAmount: float("grossAmount").notNull(), // Bruttobetrag
  currency: varchar("currency", { length: 3 }).default("CHF").notNull(),
  
  // Für Abschlagrechnungen
  installmentNumber: int("installmentNumber"), // z.B. 1, 2, 3
  totalInstallments: int("totalInstallments"), // Gesamtanzahl Abschläge
  
  // PDF
  pdfFileKey: varchar("pdfFileKey", { length: 500 }),
  pdfUrl: text("pdfUrl"),
  
  // Zahlungsinformationen
  paidAt: timestamp("paidAt"),
  paymentMethod: varchar("paymentMethod", { length: 50 }), // stripe, bank_transfer, etc.
  paymentReference: varchar("paymentReference", { length: 255 }),
  
  // Metadaten
  notes: text("notes"), // Interne Notizen
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// Rechnungspositionen
export const invoiceItems = mysqlTable("invoice_items", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull(),
  
  position: int("position").notNull(), // Positionsnummer
  description: varchar("description", { length: 500 }).notNull(),
  quantity: float("quantity").default(1).notNull(),
  unit: varchar("unit", { length: 20 }).default("Stück"),
  unitPrice: float("unitPrice").notNull(), // Einzelpreis netto
  totalPrice: float("totalPrice").notNull(), // Gesamtpreis netto
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = typeof invoiceItems.$inferInsert;

// Rechnungsnummern-Zähler
export const invoiceCounters = mysqlTable("invoice_counters", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"),
  year: int("year").notNull(),
  lastNumber: int("lastNumber").default(0).notNull(),
  prefix: varchar("prefix", { length: 20 }).default("RE").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InvoiceCounter = typeof invoiceCounters.$inferSelect;
export type InsertInvoiceCounter = typeof invoiceCounters.$inferInsert;

// ============================================
// CHAT SYSTEM (Konversationen & Nachrichten)
// ============================================

export const conversationStatusEnum = mysqlEnum("conversationStatus", [
  "open",      // Aktive Konversation
  "closed",    // Geschlossene Konversation
  "archived"   // Archivierte Konversation
]);

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId"),  // Optional: Bezug zu einer Bestellung
  customerId: int("customerId").notNull(), // User ID des Kunden
  status: conversationStatusEnum.default("open").notNull(),
  lastMessageAt: timestamp("lastMessageAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

export const messageSenderRoleEnum = mysqlEnum("messageSenderRole", [
  "admin",    // Nachricht von Admin/Support
  "customer"  // Nachricht vom Kunden
]);

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(), // User ID des Absenders
  senderRole: messageSenderRoleEnum.notNull(),
  content: text("content").notNull(),
  readAt: timestamp("readAt"), // Null = ungelesen
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ============================================
// CUSTOMER NOTES (Kundennotizen)
// ============================================

export const customerNoteSourceEnum = mysqlEnum("customerNoteSource", [
  "ghl-import",  // Importiert aus GoHighLevel
  "admin",       // Erstellt von Admin
  "system"       // Automatisch vom System
]);

export const customerNotes = mysqlTable("customer_notes", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),  // User ID des Kunden
  orderId: int("orderId"),                   // Optional: Bezug zu Bestellung
  content: text("content").notNull(),
  source: customerNoteSourceEnum.default("admin").notNull(),
  createdBy: int("createdBy"),              // User ID des Erstellers (bei admin/system)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomerNote = typeof customerNotes.$inferSelect;
export type InsertCustomerNote = typeof customerNotes.$inferInsert;

// ============================================
// BOOKINGS (Terminbuchungssystem)
// ============================================

export const bookingStatusEnum = mysqlEnum("bookingStatus", [
  "pending",      // Ausstehend
  "confirmed",    // Bestätigt
  "cancelled",    // Abgesagt
  "completed",    // Erledigt
  "no_show"       // Nicht erschienen
]);

// Staff Calendars - Calendly-Integration für Mitarbeiter
export const staffCalendars = mysqlTable("staff_calendars", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // User ID des Mitarbeiters
  name: varchar("name", { length: 255 }).notNull(), // z.B. "Thomas Gross - Erstberatung"
  description: text("description"), // z.B. "30 Min Erstgespräch"
  calendlyUrl: varchar("calendlyUrl", { length: 500 }), // Calendly Buchungslink
  avatarUrl: varchar("avatarUrl", { length: 500 }), // Optional: Profilbild URL
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StaffCalendar = typeof staffCalendars.$inferSelect;
export type InsertStaffCalendar = typeof staffCalendars.$inferInsert;

// Bookings - Terminbuchungen
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // User ID des Kunden
  staffCalendarId: int("staffCalendarId").notNull(), // Verknüpfung zum Staff Calendar
  // Calendly IDs
  calendlyEventId: varchar("calendlyEventId", { length: 100 }),
  calendlyInviteeId: varchar("calendlyInviteeId", { length: 100 }),
  // Termin-Details
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  meetingUrl: varchar("meetingUrl", { length: 500 }), // Zoom/Meet Link
  // Status
  status: bookingStatusEnum.default("pending").notNull(),
  customerNotes: text("customerNotes"), // Notizen des Kunden
  // Erinnerungen
  reminder24hSent: boolean("reminder24hSent").default(false).notNull(),
  reminder1hSent: boolean("reminder1hSent").default(false).notNull(),
  reminderSmsSent: boolean("reminderSmsSent").default(false).notNull(), // Für später
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// ============================================
// CONTRACT TEMPLATES
// ============================================

export const contractTemplates = mysqlTable("contract_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(), // fondstrukturierung, anleihen, etc.
  content: text("content", { length: 16777215 }).notNull(), // LONGTEXT for contract template
  placeholders: json("placeholders").$type<string[]>(), // Array of placeholder names
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContractTemplate = typeof contractTemplates.$inferSelect;
export type InsertContractTemplate = typeof contractTemplates.$inferInsert;

// Partner Logos - Logo management system
export const partnerLogos = mysqlTable("partner_logos", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["presse", "mitgliedschaft", "auszeichnung", "partner"]).notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
  linkUrl: varchar("linkUrl", { length: 500 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PartnerLogo = typeof partnerLogos.$inferSelect;
export type InsertPartnerLogo = typeof partnerLogos.$inferInsert;

// ============================================
// VIDEOS (Video Management System)
// ============================================

export const videos = mysqlTable("videos", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  youtubeUrl: varchar("youtubeUrl", { length: 500 }).notNull(),
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;

// ============================================
// NEWSLETTER SUBSCRIBERS
// ============================================

export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("firstName", { length: 100 }),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  confirmed: boolean("confirmed").default(false).notNull(),
  ghlContactId: varchar("ghlContactId", { length: 100 }),
  unsubscribedAt: timestamp("unsubscribedAt"),
  source: varchar("source", { length: 50 }).default("landing_page").notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;
