import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

// ============================================
// ANALYTICS SYSTEM
// ============================================

// Page Views - Tracking von Seitenaufrufen für Landing Page Analytics
export const pageViews = mysqlTable("page_views", {
  id: int("id").autoincrement().primaryKey(),
  page: varchar("page", { length: 255 }).notNull(), // z.B. '/', '/shop', '/about'
  visitorId: varchar("visitorId", { length: 255 }).notNull(), // Anonyme UUID aus Cookie
  ipHash: varchar("ipHash", { length: 64 }).notNull(), // SHA-256 gehashte IP (Datenschutz)
  userAgent: varchar("userAgent", { length: 500 }), // Browser-Info
  referrer: varchar("referrer", { length: 500 }), // Woher kam der Besucher
  country: varchar("country", { length: 10 }), // Optional, aus IP ableitbar
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;
