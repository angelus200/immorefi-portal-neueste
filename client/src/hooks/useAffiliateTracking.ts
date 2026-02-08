/**
 * Affiliate Tracking Hook
 *
 * Tracks affiliate referrals via URL parameter (?ref=AF-xxxxx)
 * Stores affiliate code in cookie for 30 days
 * Sends tracking event to backend
 */

import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

const AFFILIATE_COOKIE_NAME = 'affiliate_ref';
const AFFILIATE_COOKIE_DAYS = 30;
const COOKIE_TOKEN_NAME = 'affiliate_token';

/**
 * Native Cookie Helper Functions (no external dependencies)
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
 * Generate unique tracking token for this visitor
 */
function generateTrackingToken(): string {
  return `tk_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get or create tracking token (persists across sessions)
 */
function getOrCreateTrackingToken(): string {
  let token = getCookie(COOKIE_TOKEN_NAME);
  if (!token) {
    token = generateTrackingToken();
    setCookie(COOKIE_TOKEN_NAME, token, AFFILIATE_COOKIE_DAYS);
  }
  return token;
}

export function useAffiliateTracking() {
  const [location] = useLocation();
  const trackClickMutation = trpc.affiliate.trackClick.useMutation();

  useEffect(() => {
    // Parse URL search params
    const searchParams = new URLSearchParams(window.location.search);
    const refParam = searchParams.get('ref');

    if (refParam && refParam.startsWith('AF-')) {
      // Valid affiliate code found in URL
      const existingRef = getCookie(AFFILIATE_COOKIE_NAME);

      // Only track if it's a new referral (not already tracked)
      if (existingRef !== refParam) {
        // Store affiliate code in cookie (30 days)
        setCookie(AFFILIATE_COOKIE_NAME, refParam, AFFILIATE_COOKIE_DAYS);

        // Get or create tracking token
        const cookieToken = getOrCreateTrackingToken();

        // Track the click in backend
        trackClickMutation.mutate({
          affiliateCode: refParam,
          cookieToken,
        });

        console.log(`[Affiliate] Tracked referral: ${refParam}`);
      }
    }
  }, [location]); // Re-run if location changes (SPA navigation)

  return null; // This hook doesn't return anything, it just runs side effects
}
