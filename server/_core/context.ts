import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { clerkClient, verifyToken } from "@clerk/clerk-sdk-node";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { parse as parseCookieHeader } from "cookie";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  console.log("[Auth] ========== NEW REQUEST ==========");
  console.log("[Auth] Method:", opts.req.method, "Path:", opts.req.path);
  console.log("[Auth] Headers cookie:", opts.req.headers.cookie ? "present" : "missing");
  console.log("[Auth] Headers authorization:", opts.req.headers.authorization ? "present" : "missing");

  try {
    // Check if Clerk secret key is configured
    if (!ENV.clerkSecretKey) {
      console.error("[Auth] ❌ CLERK_SECRET_KEY not configured!");
      return { req: opts.req, res: opts.res, user: null };
    }
    console.log("[Auth] ✓ CLERK_SECRET_KEY configured");

    // Get session token from Clerk's __session cookie or Authorization header
    // Use req.cookies if available (cookie-parser middleware), otherwise parse manually
    const cookies = (opts.req as any).cookies ||
      (opts.req.headers.cookie ? parseCookieHeader(opts.req.headers.cookie) : {});

    console.log("[Auth] Parsed cookies:", Object.keys(cookies).join(", ") || "none");
    console.log("[Auth] Raw cookie header:", opts.req.headers.cookie || "missing");
    console.log("[Auth] __session cookie present:", '__session' in cookies);

    const sessionToken =
      cookies['__session'] ||
      opts.req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken) {
      console.log("[Auth] ⚠️  No session token found in __session cookie or Authorization header");
      return { req: opts.req, res: opts.res, user: null };
    }

    console.log("[Auth] ✓ Session token found, length:", sessionToken.length);
    console.log("[Auth] Token preview:", sessionToken.substring(0, 20) + "...");

    // Verify the Clerk JWT token
    console.log("[Auth] Verifying token with Clerk...");
    const verifiedToken = await verifyToken(sessionToken, {
      secretKey: ENV.clerkSecretKey,
    });

    console.log("[Auth] ✓ Token verified successfully");
    console.log("[Auth] Token payload:", JSON.stringify(verifiedToken, null, 2));

    const userId = verifiedToken.sub;
    if (!userId) {
      console.error("[Auth] ❌ No userId (sub) in verified token");
      return { req: opts.req, res: opts.res, user: null };
    }

    console.log("[Auth] ✓ User ID from token:", userId);

    // Get Clerk user details
    console.log("[Auth] Fetching Clerk user details...");
    const clerkUser = await clerkClient.users.getUser(userId);
    console.log("[Auth] ✓ Clerk user fetched:", clerkUser.id, clerkUser.emailAddresses[0]?.emailAddress);

    // Get or create user in our database
    console.log("[Auth] Looking up user in database by openId:", clerkUser.id);
    user = await db.getUserByOpenId(clerkUser.id);

    if (!user) {
      console.log("[Auth] User not found in DB, creating new user...");
      const userData = {
        openId: clerkUser.id,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
        email: clerkUser.emailAddresses[0]?.emailAddress || null,
        phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
        loginMethod: 'clerk',
        lastSignedIn: new Date(),
      };
      console.log("[Auth] Creating user with data:", userData);

      await db.upsertUser(userData);
      user = await db.getUserByOpenId(clerkUser.id);

      console.log("[Auth] ✓ User created in DB:", user?.id);
    } else {
      console.log("[Auth] ✓ User found in DB:", user.id, user.email);

      // Update last signed in
      await db.upsertUser({
        openId: clerkUser.id,
        lastSignedIn: new Date(),
      });
      console.log("[Auth] ✓ Updated lastSignedIn");
    }

    console.log("[Auth] ✅ Authentication successful for user:", user?.id);
  } catch (error: any) {
    // Authentication is optional for public procedures
    console.error("[Auth] ❌ Authentication failed:", error.message);
    console.error("[Auth] Error details:", error);
    user = null;
  }

  console.log("[Auth] Final user:", user ? `${user.id} (${user.email})` : "null");
  console.log("[Auth] ========================================");

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
