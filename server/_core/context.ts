import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { clerkClient } from "@clerk/clerk-sdk-node";
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

  try {
    // Initialize Clerk client
    if (!ENV.clerkSecretKey) {
      console.warn("[Auth] CLERK_SECRET_KEY not configured");
      return { req: opts.req, res: opts.res, user: null };
    }

    // Get session token from Clerk's __session cookie or Authorization header
    const cookies = opts.req.headers.cookie
      ? parseCookieHeader(opts.req.headers.cookie)
      : {};

    const sessionToken =
      cookies['__session'] ||
      opts.req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken) {
      return { req: opts.req, res: opts.res, user: null };
    }

    // Verify Clerk session using the session token as session ID
    const clerkSession = await clerkClient.sessions.verifySession(sessionToken, sessionToken);

    if (!clerkSession || !clerkSession.userId) {
      console.warn("[Auth] Invalid Clerk session");
      return { req: opts.req, res: opts.res, user: null };
    }

    // Get Clerk user details
    const clerkUser = await clerkClient.users.getUser(clerkSession.userId);

    // Get or create user in our database
    user = await db.getUserByOpenId(clerkUser.id);

    if (!user) {
      // Create new user
      await db.upsertUser({
        openId: clerkUser.id,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
        email: clerkUser.emailAddresses[0]?.emailAddress || null,
        phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
        loginMethod: 'clerk',
        lastSignedIn: new Date(),
      });

      user = await db.getUserByOpenId(clerkUser.id);
    } else {
      // Update last signed in
      await db.upsertUser({
        openId: clerkUser.id,
        lastSignedIn: new Date(),
      });
    }
  } catch (error) {
    // Authentication is optional for public procedures
    console.warn("[Auth] Authentication failed:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
