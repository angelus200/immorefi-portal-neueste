import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

// ============================================
// AFFILIATE SYSTEM
// ============================================

// Affiliate Status Enum
export const affiliateStatusEnum = mysqlEnum("affiliateStatus", ["active", "paused", "banned"]);

// Payout Method Enum
export const affiliatePayoutMethodEnum = mysqlEnum("affiliatePayoutMethod", ["bank_transfer", "paypal"]);

// Affiliate Profiles - Jeder registrierte User kann Affiliate werden
export const affiliateProfiles = mysqlTable("affiliate_profiles", {
  id: int("id").autoincrement().primaryKey(),
  clerkUserId: varchar("clerkUserId", { length: 255 }).notNull().unique(), // Verknüpfung zum Clerk User
  affiliateCode: varchar("affiliateCode", { length: 20 }).notNull().unique(), // z.B. "AF-x7k9m2"
  status: affiliateStatusEnum.default("active").notNull(),
  payoutMethod: affiliatePayoutMethodEnum.default("bank_transfer").notNull(),
  payoutDetails: text("payoutDetails"), // IBAN oder PayPal-Email (verschlüsselt)
  totalEarned: decimal("totalEarned", { precision: 10, scale: 2 }).default("0.00").notNull(),
  totalPaid: decimal("totalPaid", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AffiliateProfile = typeof affiliateProfiles.$inferSelect;
export type InsertAffiliateProfile = typeof affiliateProfiles.$inferInsert;

// Referral Status Enum
export const referralStatusEnum = mysqlEnum("referralStatus", ["clicked", "registered", "converted", "expired"]);

// Affiliate Referrals - Tracking von Klicks und Conversions
export const affiliateReferrals = mysqlTable("affiliate_referrals", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(), // FK → affiliate_profiles.id
  referredUserId: varchar("referredUserId", { length: 255 }), // Clerk User ID des geworbenen Users (null bis Registrierung)
  cookieToken: varchar("cookieToken", { length: 255 }), // Tracking-Token (falls User sich erst später registriert)
  landedAt: timestamp("landedAt").defaultNow().notNull(), // Wann der Klick kam
  convertedAt: timestamp("convertedAt"), // Wann der Kauf stattfand (NULL = noch nicht)
  status: referralStatusEnum.default("clicked").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AffiliateReferral = typeof affiliateReferrals.$inferSelect;
export type InsertAffiliateReferral = typeof affiliateReferrals.$inferInsert;

// Product Type Enum
export const affiliateProductTypeEnum = mysqlEnum("affiliateProductType", ["analyse", "erstberatung"]);

// Commission Status Enum
export const commissionStatusEnum = mysqlEnum("commissionStatus", ["pending", "approved", "paid", "cancelled"]);

// Affiliate Commissions - Provisionen
export const affiliateCommissions = mysqlTable("affiliate_commissions", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(), // FK → affiliate_profiles.id
  referralId: int("referralId").notNull(), // FK → affiliate_referrals.id
  stripeSessionId: varchar("stripeSessionId", { length: 255 }).notNull(), // Stripe Checkout Session
  productType: affiliateProductTypeEnum.notNull(), // 'analyse' oder 'erstberatung'
  orderAmount: decimal("orderAmount", { precision: 10, scale: 2 }).notNull(), // z.B. 2990.00
  commissionRate: decimal("commissionRate", { precision: 4, scale: 2 }).default("5.00").notNull(), // 5%
  commissionAmount: decimal("commissionAmount", { precision: 10, scale: 2 }).notNull(), // z.B. 149.50
  status: commissionStatusEnum.default("pending").notNull(),
  paidAt: timestamp("paidAt"), // Wann wurde die Provision ausgezahlt?
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AffiliateCommission = typeof affiliateCommissions.$inferSelect;
export type InsertAffiliateCommission = typeof affiliateCommissions.$inferInsert;
