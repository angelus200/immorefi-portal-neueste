/**
 * Club Deal System Router
 * Phase 1+2: Anbieter- und Admin-Procedures
 * Phase 5+6 (Investoren): getActiveProjects, subscribe, getMySubscriptions — noch nicht implementiert
 */

import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq, desc, and, sql, sum } from "drizzle-orm";
import { getDb } from "../db";
import {
  clubDealProjects,
  clubDealSubscriptions,
  type InsertClubDealProject,
  type InsertClubDealSubscription,
} from "../../drizzle/clubDealSchema";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const projectTypeSchema = z.enum([
  "residential", "commercial", "mixed", "renovation", "development",
]);

const investmentTypeSchema = z.enum([
  "nachrangdarlehen", "stille_beteiligung", "anleihe", "genussrecht",
]);

const projectStatusSchema = z.enum([
  "draft", "pending_review", "active", "fully_funded", "closed", "cancelled",
]);

const subscriptionStatusSchema = z.enum([
  "pending", "confirmed", "waitlisted", "cancelled", "completed",
]);

// ─── Router ──────────────────────────────────────────────────────────────────

export const clubDealRouter = router({

  // ═══════════════════════════════════════════════════════
  // ANBIETER-PROCEDURES
  // ═══════════════════════════════════════════════════════

  /**
   * Neues Projekt anlegen (nach Stripe-Zahlung durch den Anbieter)
   * Status beginnt immer als "draft"
   */
  createProject: protectedProcedure
    .input(z.object({
      title: z.string().min(3).max(255),
      description: z.string().optional(),
      location: z.string().optional(),
      projectType: projectTypeSchema,
      investmentType: investmentTypeSchema,
      targetVolume: z.number().int().min(100000000).max(300000000), // €1M–€3M in Cent
      minInvestment: z.number().int().min(10000000).default(10000000), // min €100.000
      maxInvestors: z.number().int().min(1).max(18).default(18),
      expectedReturn: z.number().min(0).max(50),
      duration: z.number().int().min(1).max(120), // in Monaten
      stripePaymentId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Datenbankverbindung nicht verfügbar");

      const newProject: InsertClubDealProject = {
        providerId: ctx.user.id,
        title: input.title,
        description: input.description,
        location: input.location,
        projectType: input.projectType,
        investmentType: input.investmentType,
        targetVolume: input.targetVolume,
        currentVolume: 0,
        minInvestment: input.minInvestment,
        maxInvestors: input.maxInvestors,
        currentInvestors: 0,
        expectedReturn: String(input.expectedReturn),
        duration: input.duration,
        status: "draft",
        stripePaymentId: input.stripePaymentId,
        packagePrice: 1149000,
        revenueShare: "2.00",
      };

      const result = await db.insert(clubDealProjects).values(newProject);
      const insertId = (result as any)[0]?.insertId ?? (result as any).insertId;

      const [project] = await db
        .select()
        .from(clubDealProjects)
        .where(eq(clubDealProjects.id, insertId))
        .limit(1);

      return project;
    }),

  /**
   * Alle Projekte des eingeloggten Anbieters
   */
  getMyProjects: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Datenbankverbindung nicht verfügbar");

      return db
        .select()
        .from(clubDealProjects)
        .where(eq(clubDealProjects.providerId, ctx.user.id))
        .orderBy(desc(clubDealProjects.createdAt));
    }),

  /**
   * Detail-Status eines Projekts (nur für den eigenen Anbieter)
   * Gibt Projektdaten + Investoren-Anzahl + Volumen zurück
   */
  getProjectStatus: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Datenbankverbindung nicht verfügbar");

      const [project] = await db
        .select()
        .from(clubDealProjects)
        .where(
          and(
            eq(clubDealProjects.id, input.projectId),
            eq(clubDealProjects.providerId, ctx.user.id),
          )
        )
        .limit(1);

      if (!project) throw new Error("Projekt nicht gefunden oder kein Zugriff");

      // Bestätigte Zeichnungen für den Fortschrittsbalken
      const confirmedSubs = await db
        .select()
        .from(clubDealSubscriptions)
        .where(
          and(
            eq(clubDealSubscriptions.projectId, input.projectId),
            eq(clubDealSubscriptions.status, "confirmed"),
          )
        );

      const confirmedVolume = confirmedSubs.reduce((sum, s) => sum + s.amount, 0);
      const confirmedCount = confirmedSubs.length;

      return {
        ...project,
        confirmedVolume,
        confirmedCount,
        progressPercent: project.targetVolume > 0
          ? Math.min(100, Math.round((confirmedVolume / project.targetVolume) * 100))
          : 0,
      };
    }),

  // ═══════════════════════════════════════════════════════
  // ADMIN-PROCEDURES
  // ═══════════════════════════════════════════════════════

  /**
   * Alle Club Deal Projekte (Admin)
   */
  getAllProjects: adminProcedure
    .input(z.object({
      status: projectStatusSchema.optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Datenbankverbindung nicht verfügbar");

      const conditions = input.status
        ? [eq(clubDealProjects.status, input.status)]
        : [];

      return db
        .select()
        .from(clubDealProjects)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(clubDealProjects.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  /**
   * Projekt-Status ändern (draft → pending_review → active → fully_funded → closed)
   */
  updateProjectStatus: adminProcedure
    .input(z.object({
      projectId: z.number(),
      status: projectStatusSchema,
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Datenbankverbindung nicht verfügbar");

      await db
        .update(clubDealProjects)
        .set({ status: input.status })
        .where(eq(clubDealProjects.id, input.projectId));

      return { success: true };
    }),

  /**
   * Projekt für Investoren freischalten (Status → active, publishedAt setzen)
   */
  publishProject: adminProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Datenbankverbindung nicht verfügbar");

      await db
        .update(clubDealProjects)
        .set({ status: "active", publishedAt: new Date() })
        .where(eq(clubDealProjects.id, input.projectId));

      return { success: true };
    }),

  /**
   * Alle Zeichnungen für ein Projekt (Admin)
   */
  getProjectSubscriptions: adminProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Datenbankverbindung nicht verfügbar");

      return db
        .select()
        .from(clubDealSubscriptions)
        .where(eq(clubDealSubscriptions.projectId, input.projectId))
        .orderBy(
          desc(clubDealSubscriptions.status), // confirmed zuerst
          desc(clubDealSubscriptions.subscribedAt),
        );
    }),

  /**
   * Zeichnung bestätigen / auf Warteliste setzen / ablehnen (Admin)
   */
  updateSubscriptionStatus: adminProcedure
    .input(z.object({
      subscriptionId: z.number(),
      status: subscriptionStatusSchema,
      position: z.number().optional(), // Wartelisten-Position
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Datenbankverbindung nicht verfügbar");

      const updateData: Partial<InsertClubDealSubscription> = {
        status: input.status,
        notes: input.notes,
      };
      if (input.status === "confirmed") {
        updateData.confirmedAt = new Date();
      }
      if (input.position !== undefined) {
        updateData.position = input.position;
      }

      await db
        .update(clubDealSubscriptions)
        .set(updateData)
        .where(eq(clubDealSubscriptions.id, input.subscriptionId));

      // Investoren-Zähler im Projekt aktualisieren
      const [sub] = await db
        .select()
        .from(clubDealSubscriptions)
        .where(eq(clubDealSubscriptions.id, input.subscriptionId))
        .limit(1);

      if (sub) {
        const confirmed = await db
          .select()
          .from(clubDealSubscriptions)
          .where(
            and(
              eq(clubDealSubscriptions.projectId, sub.projectId),
              eq(clubDealSubscriptions.status, "confirmed"),
            )
          );

        const newVolume = confirmed.reduce((s, c) => s + c.amount, 0);
        await db
          .update(clubDealProjects)
          .set({
            currentInvestors: confirmed.length,
            currentVolume: newVolume,
          })
          .where(eq(clubDealProjects.id, sub.projectId));
      }

      return { success: true };
    }),

  /**
   * Admin Dashboard Stats
   */
  getDashboardStats: adminProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Datenbankverbindung nicht verfügbar");

      const allProjects = await db.select().from(clubDealProjects);
      const activeProjects = allProjects.filter(p => p.status === "active");

      const totalTargetVolume = activeProjects.reduce((s, p) => s + p.targetVolume, 0);
      const totalCurrentVolume = activeProjects.reduce((s, p) => s + p.currentVolume, 0);
      const totalInvestors = activeProjects.reduce((s, p) => s + p.currentInvestors, 0);

      return {
        activeProjectsCount: activeProjects.length,
        totalProjectsCount: allProjects.length,
        totalTargetVolume,        // in Cent
        totalCurrentVolume,       // in Cent
        totalInvestors,
        statusBreakdown: {
          draft: allProjects.filter(p => p.status === "draft").length,
          pending_review: allProjects.filter(p => p.status === "pending_review").length,
          active: activeProjects.length,
          fully_funded: allProjects.filter(p => p.status === "fully_funded").length,
          closed: allProjects.filter(p => p.status === "closed").length,
          cancelled: allProjects.filter(p => p.status === "cancelled").length,
        },
      };
    }),
});
