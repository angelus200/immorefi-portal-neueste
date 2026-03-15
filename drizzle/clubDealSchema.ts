import {
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const clubDealProjectTypeEnum = mysqlEnum("clubDealProjectType", [
  "residential",
  "commercial",
  "mixed",
  "renovation",
  "development",
]);

export const clubDealInvestmentTypeEnum = mysqlEnum("clubDealInvestmentType", [
  "nachrangdarlehen",
  "stille_beteiligung",
  "anleihe",
  "genussrecht",
]);

export const clubDealProjectStatusEnum = mysqlEnum("clubDealProjectStatus", [
  "draft",
  "pending_review",
  "active",
  "fully_funded",
  "closed",
  "cancelled",
]);

export const clubDealSubscriptionStatusEnum = mysqlEnum("clubDealSubscriptionStatus", [
  "pending",
  "confirmed",
  "waitlisted",
  "cancelled",
  "completed",
]);

export const clubDealInvestorTypeEnum = mysqlEnum("clubDealInvestorType", [
  "private_professional",
  "institutional",
  "family_office",
  "fund",
  "other",
]);

export const clubDealExperienceEnum = mysqlEnum("clubDealExperience", [
  "under_2_years",
  "2_to_5_years",
  "5_to_10_years",
  "over_10_years",
]);

export const clubDealInvestorStatusEnum = mysqlEnum("clubDealInvestorStatus", [
  "active",
  "suspended",
  "banned",
]);

// ─── Tabelle: club_deal_projects ─────────────────────────────────────────────

export const clubDealProjects = mysqlTable("club_deal_projects", {
  id: int("id").autoincrement().primaryKey(),

  // Anbieter (FK → users.id)
  providerId: int("providerId").notNull(),

  // Projektdaten
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  projectType: clubDealProjectTypeEnum.notNull(),
  investmentType: clubDealInvestmentTypeEnum.notNull(),

  // Volumen (in Cent — min 1.000.000€, max 3.000.000€)
  targetVolume: int("targetVolume").notNull(),
  currentVolume: int("currentVolume").default(0).notNull(),
  minInvestment: int("minInvestment").default(10000000).notNull(), // €100.000

  // Investoren
  maxInvestors: int("maxInvestors").default(18).notNull(),
  currentInvestors: int("currentInvestors").default(0).notNull(),

  // Konditionen
  expectedReturn: decimal("expectedReturn", { precision: 5, scale: 2 }).notNull(),
  duration: int("duration").notNull(), // in Monaten

  // Status
  status: clubDealProjectStatusEnum.default("draft").notNull(),

  // Stripe & Paket
  stripePaymentId: varchar("stripePaymentId", { length: 255 }),
  packagePrice: int("packagePrice").default(1149000).notNull(), // €11.490
  revenueShare: decimal("revenueShare", { precision: 4, scale: 2 }).default("2.00").notNull(),

  // Dokumente (JSON Array: { type: "pitchdeck"|"businessplan"|"due_diligence"|"rating", url: string }[])
  documents: json("documents").$type<
    Array<{ type: "pitchdeck" | "businessplan" | "due_diligence" | "rating"; url: string }>
  >(),

  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClubDealProject = typeof clubDealProjects.$inferSelect;
export type InsertClubDealProject = typeof clubDealProjects.$inferInsert;

// ─── Tabelle: club_deal_subscriptions (Zeichnungen) ──────────────────────────

export const clubDealSubscriptions = mysqlTable("club_deal_subscriptions", {
  id: int("id").autoincrement().primaryKey(),

  // FKs
  projectId: int("projectId").notNull(),  // FK → club_deal_projects.id
  investorId: int("investorId").notNull(), // FK → users.id

  // Zeichnung
  amount: int("amount").notNull(), // in Cent, min €100.000

  // Status & Warteliste
  status: clubDealSubscriptionStatusEnum.default("pending").notNull(),
  position: int("position"), // Wartelisten-Position (nullable)

  notes: text("notes"),

  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  confirmedAt: timestamp("confirmedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClubDealSubscription = typeof clubDealSubscriptions.$inferSelect;
export type InsertClubDealSubscription = typeof clubDealSubscriptions.$inferInsert;

// ─── Tabelle: club_deal_investors (Investor-Profil) ───────────────────────────

export const clubDealInvestors = mysqlTable("club_deal_investors", {
  id: int("id").autoincrement().primaryKey(),

  // FK → users.id
  userId: int("userId").notNull().unique(),

  companyName: varchar("companyName", { length: 255 }),
  investorType: clubDealInvestorTypeEnum.notNull(),
  selfDeclaration: boolean("selfDeclaration").default(false).notNull(),
  investmentExperience: clubDealExperienceEnum.notNull(),

  // Präferenzen
  preferredVolume: int("preferredVolume"), // nullable — bevorzugtes Volumen in Cent
  preferredTypes: json("preferredTypes").$type<string[]>(), // Array von investmentType-Werten

  status: clubDealInvestorStatusEnum.default("active").notNull(),

  onboardedAt: timestamp("onboardedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClubDealInvestor = typeof clubDealInvestors.$inferSelect;
export type InsertClubDealInvestor = typeof clubDealInvestors.$inferInsert;
