/**
 * Page Tracking Hook
 *
 * Tracks page views for analytics dashboard
 * Stores anonymous visitor ID in cookie (365 days)
 * Does NOT track admin users (privacy)
 * Sends tracking event to backend on every route change
 */

import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

const VISITOR_COOKIE_NAME = 'visitor_id';
const VISITOR_COOKIE_DAYS = 365;

/**
 * Cookie Helper Functions
 */

function setCookie(name: string, value: string, days: number) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

/**
 * Generate UUID v4 (simple implementation)
 */
function generateUUID(): string {
  // Use crypto.randomUUID() if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: simple UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create visitor ID (persists for 365 days)
 */
function getOrCreateVisitorId(): string {
  let visitorId = getCookie(VISITOR_COOKIE_NAME);
  if (!visitorId) {
    visitorId = generateUUID();
    setCookie(VISITOR_COOKIE_NAME, visitorId, VISITOR_COOKIE_DAYS);
  }
  return visitorId;
}

/**
 * Hook to track page views for analytics
 * Runs on every route change
 * Does NOT track admin users
 */
export function usePageTracking() {
  const [location] = useLocation();
  const { user } = useAuth();
  const trackPageViewMutation = trpc.analytics.trackPageView.useMutation();

  useEffect(() => {
    // Don't track admin users (privacy + avoid polluting analytics)
    if (user && (user.role === 'superadmin' || user.role === 'tenant_admin' || user.role === 'staff')) {
      return;
    }

    // Get or create visitor ID
    const visitorId = getOrCreateVisitorId();

    // Get current page path
    const page = window.location.pathname;

    // Get user agent
    const userAgent = navigator.userAgent;

    // Get referrer (empty string if direct visit)
    const referrer = document.referrer || undefined;

    // Track page view
    trackPageViewMutation.mutate({
      page,
      visitorId,
      userAgent,
      referrer,
    });

    console.log(`[Analytics] Tracked page view: ${page}`);
  }, [location]); // Re-run on location change

  return null; // This hook doesn't return anything
}
