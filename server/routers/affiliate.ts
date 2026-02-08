/**
 * Affiliate System Router
 * Handles affiliate program functionality: activation, tracking, commissions, payouts
 */

import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq, desc, and, sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  affiliateProfiles,
  affiliateReferrals,
  affiliateCommissions,
  type InsertAffiliateProfile,
  type InsertAffiliateReferral,
  type InsertAffiliateCommission,
} from "../../drizzle/affiliateSchema";

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate unique affiliate code (format: AF-xxxxx)
 */
function generateAffiliateCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = 'AF-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Check if affiliate code already exists
 */
async function isCodeUnique(code: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const existing = await db
    .select()
    .from(affiliateProfiles)
    .where(eq(affiliateProfiles.affiliateCode, code))
    .limit(1);
  return existing.length === 0;
}

/**
 * Generate unique affiliate code (with collision check)
 */
async function generateUniqueAffiliateCode(): Promise<string> {
  let code = generateAffiliateCode();
  let attempts = 0;
  while (!(await isCodeUnique(code)) && attempts < 10) {
    code = generateAffiliateCode();
    attempts++;
  }
  if (attempts >= 10) throw new Error('Failed to generate unique affiliate code');
  return code;
}

// ============================================
// AFFILIATE ROUTER
// ============================================

export const affiliateRouter = router({
  /**
   * User activates affiliate status
   * Creates affiliate profile with unique code
   */
  activate: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Check if user already has affiliate profile
    const existing = await db
      .select()
      .from(affiliateProfiles)
      .where(eq(affiliateProfiles.clerkUserId, ctx.user.id))
      .limit(1);

    if (existing.length > 0) {
      return { success: true, affiliateCode: existing[0].affiliateCode, alreadyActive: true };
    }

    // Generate unique code
    const affiliateCode = await generateUniqueAffiliateCode();

    // Create profile
    const result = await db.insert(affiliateProfiles).values({
      clerkUserId: ctx.user.id,
      affiliateCode,
      status: 'active',
      payoutMethod: 'bank_transfer',
      totalEarned: '0.00',
      totalPaid: '0.00',
    });

    return { success: true, affiliateCode, alreadyActive: false };
  }),

  /**
   * Get affiliate dashboard stats
   * Returns: clicks, conversions, earnings, commissions
   */
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get affiliate profile
    const profile = await db
      .select()
      .from(affiliateProfiles)
      .where(eq(affiliateProfiles.clerkUserId, ctx.user.id))
      .limit(1);

    if (profile.length === 0) {
      return { isAffiliate: false };
    }

    const affiliateId = profile[0].id;

    // Get stats
    const [clicksResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(affiliateReferrals)
      .where(eq(affiliateReferrals.affiliateId, affiliateId));

    const [conversionsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(affiliateReferrals)
      .where(
        and(
          eq(affiliateReferrals.affiliateId, affiliateId),
          eq(affiliateReferrals.status, 'converted')
        )
      );

    // Get recent commissions
    const commissions = await db
      .select()
      .from(affiliateCommissions)
      .where(eq(affiliateCommissions.affiliateId, affiliateId))
      .orderBy(desc(affiliateCommissions.createdAt))
      .limit(10);

    return {
      isAffiliate: true,
      affiliateCode: profile[0].affiliateCode,
      status: profile[0].status,
      totalClicks: clicksResult?.count || 0,
      totalConversions: conversionsResult?.count || 0,
      totalEarned: parseFloat(profile[0].totalEarned),
      totalPaid: parseFloat(profile[0].totalPaid),
      pendingBalance: parseFloat(profile[0].totalEarned) - parseFloat(profile[0].totalPaid),
      payoutMethod: profile[0].payoutMethod,
      payoutDetails: profile[0].payoutDetails,
      recentCommissions: commissions,
    };
  }),

  /**
   * Get all commissions for current affiliate
   */
  getCommissions: protectedProcedure
    .input(
      z.object({
        status: z.enum(['pending', 'approved', 'paid', 'cancelled']).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get affiliate profile
      const profile = await db
        .select()
        .from(affiliateProfiles)
        .where(eq(affiliateProfiles.clerkUserId, ctx.user.id))
        .limit(1);

      if (profile.length === 0) {
        throw new Error('Not an affiliate');
      }

      const affiliateId = profile[0].id;

      // Build query
      let query = db
        .select()
        .from(affiliateCommissions)
        .where(eq(affiliateCommissions.affiliateId, affiliateId))
        .orderBy(desc(affiliateCommissions.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Filter by status if provided
      if (input.status) {
        query = db
          .select()
          .from(affiliateCommissions)
          .where(
            and(
              eq(affiliateCommissions.affiliateId, affiliateId),
              eq(affiliateCommissions.status, input.status)
            )
          )
          .orderBy(desc(affiliateCommissions.createdAt))
          .limit(input.limit)
          .offset(input.offset);
      }

      const commissions = await query;

      return { commissions };
    }),

  /**
   * Update payout method and details
   */
  updatePayout: protectedProcedure
    .input(
      z.object({
        payoutMethod: z.enum(['bank_transfer', 'paypal']),
        payoutDetails: z.string().min(1), // IBAN or PayPal email
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get affiliate profile
      const profile = await db
        .select()
        .from(affiliateProfiles)
        .where(eq(affiliateProfiles.clerkUserId, ctx.user.id))
        .limit(1);

      if (profile.length === 0) {
        throw new Error('Not an affiliate');
      }

      // TODO: Encrypt payoutDetails before storing (for production!)
      await db
        .update(affiliateProfiles)
        .set({
          payoutMethod: input.payoutMethod,
          payoutDetails: input.payoutDetails, // Should be encrypted!
        })
        .where(eq(affiliateProfiles.clerkUserId, ctx.user.id));

      return { success: true };
    }),

  /**
   * Request payout (minimum €50)
   */
  requestPayout: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get affiliate profile
    const profile = await db
      .select()
      .from(affiliateProfiles)
      .where(eq(affiliateProfiles.clerkUserId, ctx.user.id))
      .limit(1);

    if (profile.length === 0) {
      throw new Error('Not an affiliate');
    }

    const pendingBalance =
      parseFloat(profile[0].totalEarned) - parseFloat(profile[0].totalPaid);

    if (pendingBalance < 50) {
      throw new Error('Minimum payout amount is €50');
    }

    if (!profile[0].payoutDetails) {
      throw new Error('Please set up your payout method first');
    }

    // TODO: Create payout request in a separate table
    // For now, this is just a placeholder
    // In production, you'd create a payout_requests table

    return {
      success: true,
      message: 'Payout request submitted. Admin will process it soon.',
      amount: pendingBalance,
    };
  }),

  /**
   * Track referral click (PUBLIC - no auth required!)
   * Called when user lands on page with ?ref=AF-xxxxx
   */
  trackClick: publicProcedure
    .input(
      z.object({
        affiliateCode: z.string(),
        cookieToken: z.string().optional(), // Generated by frontend
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Find affiliate profile
      const profile = await db
        .select()
        .from(affiliateProfiles)
        .where(eq(affiliateProfiles.affiliateCode, input.affiliateCode))
        .limit(1);

      if (profile.length === 0) {
        throw new Error('Invalid affiliate code');
      }

      const affiliateId = profile[0].id;

      // Check if click already tracked (by cookieToken if provided)
      if (input.cookieToken) {
        const existing = await db
          .select()
          .from(affiliateReferrals)
          .where(
            and(
              eq(affiliateReferrals.affiliateId, affiliateId),
              eq(affiliateReferrals.cookieToken, input.cookieToken)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          // Click already tracked
          return { success: true, alreadyTracked: true };
        }
      }

      // Create referral tracking entry
      await db.insert(affiliateReferrals).values({
        affiliateId,
        cookieToken: input.cookieToken || null,
        status: 'clicked',
      });

      return { success: true, alreadyTracked: false };
    }),

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  /**
   * Admin: List all affiliates
   */
  adminList: adminProcedure
    .input(
      z.object({
        status: z.enum(['active', 'paused', 'banned']).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select().from(affiliateProfiles).orderBy(desc(affiliateProfiles.createdAt)).limit(input.limit).offset(input.offset);

      if (input.status) {
        query = db
          .select()
          .from(affiliateProfiles)
          .where(eq(affiliateProfiles.status, input.status))
          .orderBy(desc(affiliateProfiles.createdAt))
          .limit(input.limit)
          .offset(input.offset);
      }

      const affiliates = await query;

      // Get stats for each affiliate
      const affiliatesWithStats = await Promise.all(
        affiliates.map(async (affiliate) => {
          const [clicksResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(affiliateReferrals)
            .where(eq(affiliateReferrals.affiliateId, affiliate.id));

          const [conversionsResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(affiliateReferrals)
            .where(
              and(
                eq(affiliateReferrals.affiliateId, affiliate.id),
                eq(affiliateReferrals.status, 'converted')
              )
            );

          return {
            ...affiliate,
            totalClicks: clicksResult?.count || 0,
            totalConversions: conversionsResult?.count || 0,
          };
        })
      );

      return { affiliates: affiliatesWithStats };
    }),

  /**
   * Admin: Approve payout
   */
  adminApprovePayout: adminProcedure
    .input(
      z.object({
        affiliateId: z.number(),
        amount: z.number().positive(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get affiliate profile
      const profile = await db
        .select()
        .from(affiliateProfiles)
        .where(eq(affiliateProfiles.id, input.affiliateId))
        .limit(1);

      if (profile.length === 0) {
        throw new Error('Affiliate not found');
      }

      const currentTotalPaid = parseFloat(profile[0].totalPaid);
      const newTotalPaid = currentTotalPaid + input.amount;

      // Update totalPaid
      await db
        .update(affiliateProfiles)
        .set({
          totalPaid: newTotalPaid.toFixed(2),
        })
        .where(eq(affiliateProfiles.id, input.affiliateId));

      // Mark related commissions as paid
      // TODO: Improve this logic - you might want a payout_requests table
      await db
        .update(affiliateCommissions)
        .set({
          status: 'paid',
          paidAt: new Date(),
        })
        .where(
          and(
            eq(affiliateCommissions.affiliateId, input.affiliateId),
            eq(affiliateCommissions.status, 'approved')
          )
        );

      return { success: true };
    }),

  /**
   * Admin: Update affiliate status (activate/pause/ban)
   */
  adminUpdateStatus: adminProcedure
    .input(
      z.object({
        affiliateId: z.number(),
        status: z.enum(['active', 'paused', 'banned']),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(affiliateProfiles)
        .set({ status: input.status })
        .where(eq(affiliateProfiles.id, input.affiliateId));

      return { success: true };
    }),
});
