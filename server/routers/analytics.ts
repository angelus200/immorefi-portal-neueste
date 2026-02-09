/**
 * Analytics System Router
 * Handles page view tracking and analytics dashboard data
 */

import { router, publicProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq, desc, and, sql, gte, lte, between } from "drizzle-orm";
import { getDb } from "../db";
import { pageViews, type InsertPageView } from "../../drizzle/analyticsSchema";
import { createHash } from "crypto";

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Hash IP address with SHA-256 for privacy
 */
function hashIpAddress(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}

/**
 * Get date range for time period filter
 */
function getDateRange(period: 'today' | '7days' | '30days' | '90days' | 'all'): { start: Date | null; end: Date } {
  const end = new Date();
  let start: Date | null = null;

  switch (period) {
    case 'today':
      start = new Date();
      start.setHours(0, 0, 0, 0);
      break;
    case '7days':
      start = new Date();
      start.setDate(start.getDate() - 7);
      break;
    case '30days':
      start = new Date();
      start.setDate(start.getDate() - 30);
      break;
    case '90days':
      start = new Date();
      start.setDate(start.getDate() - 90);
      break;
    case 'all':
      start = null;
      break;
  }

  return { start, end };
}

// ============================================
// ANALYTICS ROUTER
// ============================================

export const analyticsRouter = router({
  /**
   * Track page view (public endpoint)
   * Called on every page navigation for anonymous tracking
   */
  trackPageView: publicProcedure
    .input(
      z.object({
        page: z.string(),
        visitorId: z.string(), // UUID from cookie
        userAgent: z.string().optional(),
        referrer: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Extract IP address from request (various headers for proxy support)
      const ipAddress =
        (ctx.req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        (ctx.req.headers['x-real-ip'] as string) ||
        ctx.req.socket?.remoteAddress ||
        'unknown';

      // Hash IP address for privacy (GDPR compliant)
      const ipHash = ipAddress !== 'unknown' ? hashIpAddress(ipAddress) : 'unknown';

      const pageViewData: InsertPageView = {
        page: input.page,
        visitorId: input.visitorId,
        ipHash,
        userAgent: input.userAgent || undefined,
        referrer: input.referrer || undefined,
        country: undefined, // Could be derived from IP using a GeoIP service
        createdAt: new Date(),
      };

      await db.insert(pageViews).values(pageViewData);

      return { success: true };
    }),

  /**
   * Get analytics dashboard data (admin only)
   * Returns aggregated statistics for the selected time period
   */
  getDashboard: adminProcedure
    .input(
      z.object({
        period: z.enum(['today', '7days', '30days', '90days', 'all']).default('30days'),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { start, end } = getDateRange(input.period);

      // Build WHERE clause based on date range
      const whereClause = start
        ? and(
            gte(pageViews.createdAt, start),
            lte(pageViews.createdAt, end)
          )
        : undefined;

      // Total page views
      const totalViewsResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(pageViews)
        .where(whereClause);
      const totalViews = Number(totalViewsResult[0]?.count || 0);

      // Unique visitors (COUNT DISTINCT visitorId)
      const uniqueVisitorsResult = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${pageViews.visitorId})` })
        .from(pageViews)
        .where(whereClause);
      const uniqueVisitors = Number(uniqueVisitorsResult[0]?.count || 0);

      // Views today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayViewsResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(pageViews)
        .where(
          and(
            gte(pageViews.createdAt, todayStart),
            lte(pageViews.createdAt, end)
          )
        );
      const viewsToday = Number(todayViewsResult[0]?.count || 0);

      // Views this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const weekViewsResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(pageViews)
        .where(
          and(
            gte(pageViews.createdAt, weekStart),
            lte(pageViews.createdAt, end)
          )
        );
      const viewsThisWeek = Number(weekViewsResult[0]?.count || 0);

      // Views this month
      const monthStart = new Date();
      monthStart.setDate(monthStart.getDate() - 30);
      const monthViewsResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(pageViews)
        .where(
          and(
            gte(pageViews.createdAt, monthStart),
            lte(pageViews.createdAt, end)
          )
        );
      const viewsThisMonth = Number(monthViewsResult[0]?.count || 0);

      // Top pages (GROUP BY page, ORDER BY count DESC)
      const topPagesResult = await db
        .select({
          page: pageViews.page,
          count: sql<number>`COUNT(*)`,
        })
        .from(pageViews)
        .where(whereClause)
        .groupBy(pageViews.page)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10);

      const topPages = topPagesResult.map((row) => ({
        page: row.page,
        views: Number(row.count),
      }));

      // Top referrers (GROUP BY referrer, ORDER BY count DESC)
      // Filter out empty referrers
      const topReferrersResult = await db
        .select({
          referrer: pageViews.referrer,
          count: sql<number>`COUNT(*)`,
        })
        .from(pageViews)
        .where(
          whereClause
            ? and(whereClause, sql`${pageViews.referrer} IS NOT NULL AND ${pageViews.referrer} != ''`)
            : sql`${pageViews.referrer} IS NOT NULL AND ${pageViews.referrer} != ''`
        )
        .groupBy(pageViews.referrer)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10);

      const topReferrers = topReferrersResult.map((row) => ({
        referrer: row.referrer || 'Direct',
        views: Number(row.count),
      }));

      // Time series data for chart (last 30 days, grouped by date)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const timeSeriesResult = await db
        .select({
          date: sql<string>`DATE(${pageViews.createdAt})`,
          views: sql<number>`COUNT(*)`,
          uniqueVisitors: sql<number>`COUNT(DISTINCT ${pageViews.visitorId})`,
        })
        .from(pageViews)
        .where(
          and(
            gte(pageViews.createdAt, thirtyDaysAgo),
            lte(pageViews.createdAt, end)
          )
        )
        .groupBy(sql`DATE(${pageViews.createdAt})`)
        .orderBy(sql`DATE(${pageViews.createdAt})`);

      const timeSeries = timeSeriesResult.map((row) => ({
        date: row.date,
        views: Number(row.views),
        uniqueVisitors: Number(row.uniqueVisitors),
      }));

      return {
        overview: {
          totalViews,
          uniqueVisitors,
          viewsToday,
          viewsThisWeek,
          viewsThisMonth,
        },
        topPages,
        topReferrers,
        timeSeries,
      };
    }),
});
