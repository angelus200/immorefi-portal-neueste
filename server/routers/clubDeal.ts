/**
 * Club Deal System Router
 * Phase 1+2: Anbieter- und Admin-Procedures
 * Phase 5+6 (Investoren): getActiveProjects, subscribe, getMySubscriptions — noch nicht implementiert
 */

import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { getDb } from "../db";
import {
  clubDealProjects,
  clubDealSubscriptions,
  clubDealInvestors,
  type InsertClubDealProject,
  type InsertClubDealSubscription,
  type InsertClubDealInvestor,
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
   * Projekt manuell anlegen (Admin — unabhängig von Stripe)
   */
  adminCreateProject: adminProcedure
    .input(z.object({
      providerId: z.number().int().min(0).default(0), // 0 = kein Anbieter zugewiesen
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      location: z.string().optional(),
      projectType: projectTypeSchema,
      investmentType: investmentTypeSchema,
      targetVolume: z.number().int().min(0),
      minInvestment: z.number().int().min(0).default(10000000),
      maxInvestors: z.number().int().min(1).max(100).default(18),
      expectedReturn: z.number().min(0).max(100),
      duration: z.number().int().min(1).max(240),
      status: projectStatusSchema.default("draft"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Datenbankverbindung nicht verfügbar");

      const newProject: InsertClubDealProject = {
        providerId: input.providerId,
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
        status: input.status,
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
   * Projekt bearbeiten — alle Felder inkl. Dokumente (Admin)
   */
  adminUpdateProject: adminProcedure
    .input(z.object({
      projectId: z.number(),
      title: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      location: z.string().optional(),
      projectType: projectTypeSchema.optional(),
      investmentType: investmentTypeSchema.optional(),
      targetVolume: z.number().int().min(0).optional(),
      minInvestment: z.number().int().min(0).optional(),
      maxInvestors: z.number().int().min(1).max(100).optional(),
      expectedReturn: z.number().min(0).max(100).optional(),
      duration: z.number().int().min(1).max(240).optional(),
      status: projectStatusSchema.optional(),
      providerId: z.number().int().optional(),
      documents: z.array(z.object({
        type: z.enum(["pitchdeck", "businessplan", "due_diligence", "rating"]),
        url: z.string(),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Datenbankverbindung nicht verfügbar");

      const { projectId, expectedReturn, ...rest } = input;

      const updateData: Partial<InsertClubDealProject> = { ...rest };
      if (expectedReturn !== undefined) {
        updateData.expectedReturn = String(expectedReturn);
      }
      if (input.status === "active" && !updateData.publishedAt) {
        // publishedAt nur setzen wenn noch nicht gesetzt
        const [existing] = await db
          .select()
          .from(clubDealProjects)
          .where(eq(clubDealProjects.id, projectId))
          .limit(1);
        if (existing && !existing.publishedAt) {
          updateData.publishedAt = new Date();
        }
      }

      await db
        .update(clubDealProjects)
        .set(updateData)
        .where(eq(clubDealProjects.id, projectId));

      const [updated] = await db
        .select()
        .from(clubDealProjects)
        .where(eq(clubDealProjects.id, projectId))
        .limit(1);

      return updated;
    }),

  /**
   * Projekt löschen (Admin)
   */
  adminDeleteProject: adminProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Datenbankverbindung nicht verfügbar");

      // Zeichnungen zuerst löschen (FK-Constraint)
      await db
        .delete(clubDealSubscriptions)
        .where(eq(clubDealSubscriptions.projectId, input.projectId));

      await db
        .delete(clubDealProjects)
        .where(eq(clubDealProjects.id, input.projectId));

      return { success: true };
    }),

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

  // ═══════════════════════════════════════════════════════
  // INVESTOREN-PROCEDURES (Phase 5+6)
  // ═══════════════════════════════════════════════════════

  /**
   * Prüft ob der eingeloggte User ein Investor-Profil hat
   * Wird auch vom DashboardLayout aufgerufen um das Investor-Menü anzuzeigen
   */
  checkStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { isInvestor: false, investor: null };

      const [investor] = await db
        .select()
        .from(clubDealInvestors)
        .where(eq(clubDealInvestors.userId, ctx.user.id))
        .limit(1);

      return {
        isInvestor: !!investor && investor.status === "active",
        investor: investor ?? null,
      };
    }),

  /**
   * Investor-Onboarding — Erstellt Investor-Profil
   * selfDeclaration MUSS true sein (Pflicht-Check)
   */
  onboard: protectedProcedure
    .input(z.object({
      companyName: z.string().optional(),
      investorType: z.enum(["private_professional", "institutional", "family_office", "fund", "other"]),
      investmentExperience: z.enum(["under_2_years", "2_to_5_years", "5_to_10_years", "over_10_years"]),
      selfDeclaration: z.literal(true),
      preferredVolume: z.number().int().min(0).optional(),
      preferredTypes: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Datenbankverbindung nicht verfügbar");

      // Doppeltes Onboarding verhindern
      const [existing] = await db
        .select()
        .from(clubDealInvestors)
        .where(eq(clubDealInvestors.userId, ctx.user.id))
        .limit(1);

      if (existing) {
        return { success: true, investor: existing };
      }

      const newInvestor: InsertClubDealInvestor = {
        userId: ctx.user.id,
        companyName: input.companyName,
        investorType: input.investorType,
        investmentExperience: input.investmentExperience,
        selfDeclaration: true,
        preferredVolume: input.preferredVolume,
        preferredTypes: input.preferredTypes,
        status: "active",
      };

      const result = await db.insert(clubDealInvestors).values(newInvestor);
      const insertId = (result as any)[0]?.insertId ?? (result as any).insertId;

      const [investor] = await db
        .select()
        .from(clubDealInvestors)
        .where(eq(clubDealInvestors.id, insertId))
        .limit(1);

      return { success: true, investor };
    }),

  /**
   * Alle aktiven Projekte für Investoren
   * Sensible Anbieter-Daten (providerId) werden NICHT zurückgegeben
   */
  getActiveProjects: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Datenbankverbindung nicht verfügbar");

      // Investor-Check
      const [investor] = await db
        .select()
        .from(clubDealInvestors)
        .where(eq(clubDealInvestors.userId, ctx.user.id))
        .limit(1);
      if (!investor || investor.status !== "active") {
        throw new Error("Kein aktives Investor-Profil");
      }

      const projects = await db
        .select()
        .from(clubDealProjects)
        .where(eq(clubDealProjects.status, "active"))
        .orderBy(desc(clubDealProjects.publishedAt));

      // providerId aus den zurückgegebenen Daten entfernen
      return projects.map(({ providerId, stripePaymentId, ...safe }) => safe);
    }),

  /**
   * Einzelnes Projekt für Investor (inkl. Dokumente + eigene Zeichnung)
   */
  getProject: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Datenbankverbindung nicht verfügbar");

      // Investor-Check
      const [investor] = await db
        .select()
        .from(clubDealInvestors)
        .where(eq(clubDealInvestors.userId, ctx.user.id))
        .limit(1);
      if (!investor || investor.status !== "active") {
        throw new Error("Kein aktives Investor-Profil");
      }

      const [project] = await db
        .select()
        .from(clubDealProjects)
        .where(eq(clubDealProjects.id, input.projectId))
        .limit(1);

      if (!project) throw new Error("Projekt nicht gefunden");
      if (project.status !== "active" && project.status !== "fully_funded") {
        throw new Error("Dieses Projekt ist nicht verfügbar");
      }

      // Eigene Zeichnung für dieses Projekt
      const [mySubscription] = await db
        .select()
        .from(clubDealSubscriptions)
        .where(
          and(
            eq(clubDealSubscriptions.projectId, input.projectId),
            eq(clubDealSubscriptions.investorId, ctx.user.id),
          )
        )
        .limit(1);

      const { providerId, stripePaymentId, ...safeProject } = project;
      return { project: safeProject, mySubscription: mySubscription ?? null };
    }),

  /**
   * Zeichnung abgeben — alle Validierungen serverseitig
   */
  subscribe: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      amount: z.number().int().min(10000000, "Mindestzeichnung €100.000"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Datenbankverbindung nicht verfügbar");

      // 1. Investor-Check
      const [investor] = await db
        .select()
        .from(clubDealInvestors)
        .where(eq(clubDealInvestors.userId, ctx.user.id))
        .limit(1);
      if (!investor || investor.status !== "active") {
        throw new Error("Kein aktives Investor-Profil");
      }

      // 2. Projekt-Check
      const [project] = await db
        .select()
        .from(clubDealProjects)
        .where(eq(clubDealProjects.id, input.projectId))
        .limit(1);
      if (!project) throw new Error("Projekt nicht gefunden");
      if (project.status !== "active") throw new Error("Projekt ist nicht mehr aktiv");

      // 3. Mindestbetrag bereits via Zod validiert

      // 4. Volumen-Check
      if (project.currentVolume + input.amount > project.targetVolume) {
        throw new Error("Zeichnungsbetrag überschreitet das verbleibende Zielvolumen");
      }

      // 5. Doppelzeichnung verhindern
      const [existingSub] = await db
        .select()
        .from(clubDealSubscriptions)
        .where(
          and(
            eq(clubDealSubscriptions.projectId, input.projectId),
            eq(clubDealSubscriptions.investorId, ctx.user.id),
          )
        )
        .limit(1);
      if (existingSub) throw new Error("Sie haben für dieses Projekt bereits gezeichnet");

      // 6. Kapazitätsprüfung → pending oder waitlisted
      const isFull = project.currentInvestors >= project.maxInvestors;
      let subStatus: "pending" | "waitlisted" = isFull ? "waitlisted" : "pending";

      // Wartelisten-Position berechnen
      let position: number | undefined;
      if (isFull) {
        const waitlistEntries = await db
          .select()
          .from(clubDealSubscriptions)
          .where(
            and(
              eq(clubDealSubscriptions.projectId, input.projectId),
              eq(clubDealSubscriptions.status, "waitlisted"),
            )
          );
        position = waitlistEntries.length + 1;
      }

      const result = await db.insert(clubDealSubscriptions).values({
        projectId: input.projectId,
        investorId: ctx.user.id,
        amount: input.amount,
        status: subStatus,
        position: position ?? null,
      });
      const insertId = (result as any)[0]?.insertId ?? (result as any).insertId;

      // Projekt-Zähler aktualisieren (nur bei pending)
      if (!isFull) {
        const newVolume = project.currentVolume + input.amount;
        const newInvestors = project.currentInvestors + 1;

        // 7. Vollfinanzierung prüfen
        const newStatus = newVolume >= project.targetVolume ? "fully_funded" : "active";

        await db
          .update(clubDealProjects)
          .set({ currentVolume: newVolume, currentInvestors: newInvestors, status: newStatus })
          .where(eq(clubDealProjects.id, input.projectId));
      }

      const [subscription] = await db
        .select()
        .from(clubDealSubscriptions)
        .where(eq(clubDealSubscriptions.id, insertId))
        .limit(1);

      return { success: true, subscription, waitlisted: isFull };
    }),

  /**
   * Alle eigenen Zeichnungen (mit Projekt-Info)
   */
  getMySubscriptions: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Datenbankverbindung nicht verfügbar");

      const subs = await db
        .select()
        .from(clubDealSubscriptions)
        .where(eq(clubDealSubscriptions.investorId, ctx.user.id))
        .orderBy(desc(clubDealSubscriptions.subscribedAt));

      if (subs.length === 0) return [];

      // Projekt-Infos dazu laden
      const projectIds = Array.from(new Set(subs.map(s => s.projectId)));
      const projects = await db
        .select()
        .from(clubDealProjects)
        .where(
          projectIds.length === 1
            ? eq(clubDealProjects.id, projectIds[0])
            : and(...projectIds.map(id => eq(clubDealProjects.id, id)))
        );

      const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));

      return subs.map(sub => ({
        ...sub,
        project: projectMap[sub.projectId]
          ? {
              title: projectMap[sub.projectId].title,
              status: projectMap[sub.projectId].status,
              projectType: projectMap[sub.projectId].projectType,
            }
          : null,
      }));
    }),

  /**
   * Zeichnung stornieren — nur eigene, nur pending/waitlisted
   */
  cancelSubscription: protectedProcedure
    .input(z.object({ subscriptionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Datenbankverbindung nicht verfügbar");

      const [sub] = await db
        .select()
        .from(clubDealSubscriptions)
        .where(
          and(
            eq(clubDealSubscriptions.id, input.subscriptionId),
            eq(clubDealSubscriptions.investorId, ctx.user.id),
          )
        )
        .limit(1);

      if (!sub) throw new Error("Zeichnung nicht gefunden");
      if (sub.status !== "pending" && sub.status !== "waitlisted") {
        throw new Error("Bestätigte oder abgeschlossene Zeichnungen können nicht storniert werden");
      }

      await db
        .update(clubDealSubscriptions)
        .set({ status: "cancelled" })
        .where(eq(clubDealSubscriptions.id, input.subscriptionId));

      // Bei pending: Projekt-Zähler zurücksetzen
      if (sub.status === "pending") {
        const [project] = await db
          .select()
          .from(clubDealProjects)
          .where(eq(clubDealProjects.id, sub.projectId))
          .limit(1);

        if (project) {
          const newVolume = Math.max(0, project.currentVolume - sub.amount);
          const newInvestors = Math.max(0, project.currentInvestors - 1);

          // Prüfen ob ein Wartelisten-Nachrücker aufrücken soll
          const [nextWaitlisted] = await db
            .select()
            .from(clubDealSubscriptions)
            .where(
              and(
                eq(clubDealSubscriptions.projectId, sub.projectId),
                eq(clubDealSubscriptions.status, "waitlisted"),
              )
            )
            .orderBy(clubDealSubscriptions.position)
            .limit(1);

          if (nextWaitlisted) {
            // Nachrücker auf pending setzen
            await db
              .update(clubDealSubscriptions)
              .set({ status: "pending", position: null })
              .where(eq(clubDealSubscriptions.id, nextWaitlisted.id));

            // Wartelisten-Positionen neu nummerieren
            const remainingWaitlist = await db
              .select()
              .from(clubDealSubscriptions)
              .where(
                and(
                  eq(clubDealSubscriptions.projectId, sub.projectId),
                  eq(clubDealSubscriptions.status, "waitlisted"),
                )
              )
              .orderBy(clubDealSubscriptions.position);

            for (let i = 0; i < remainingWaitlist.length; i++) {
              await db
                .update(clubDealSubscriptions)
                .set({ position: i + 1 })
                .where(eq(clubDealSubscriptions.id, remainingWaitlist[i].id));
            }

            // Investoren-Zähler bleibt gleich (Nachrücker übernimmt den Slot)
            await db
              .update(clubDealProjects)
              .set({ currentVolume: newVolume + nextWaitlisted.amount })
              .where(eq(clubDealProjects.id, sub.projectId));
          } else {
            await db
              .update(clubDealProjects)
              .set({ currentVolume: newVolume, currentInvestors: newInvestors })
              .where(eq(clubDealProjects.id, sub.projectId));
          }
        }
      }

      return { success: true };
    }),
});

// ─── Webhook-Hilfsfunktion ────────────────────────────────────────────────────
// Wird vom Stripe-Webhook in _core/index.ts aufgerufen nach CLUB_DEAL_PAKET-Zahlung

export async function createDraftProjectAfterPayment(
  userId: number,
  stripePaymentId: string,
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(clubDealProjects).values({
    providerId: userId,
    title: "Neues Club Deal Projekt",
    projectType: "residential",      // Platzhalter — Anbieter füllt im Dashboard aus
    investmentType: "nachrangdarlehen",
    targetVolume: 100000000,         // €1M Platzhalter
    currentVolume: 0,
    minInvestment: 10000000,
    maxInvestors: 18,
    currentInvestors: 0,
    expectedReturn: "0.00",
    duration: 24,
    status: "draft",
    stripePaymentId,
    packagePrice: 1149000,
    revenueShare: "2.00",
  });
}
