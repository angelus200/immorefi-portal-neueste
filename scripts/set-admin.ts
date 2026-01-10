#!/usr/bin/env tsx
/**
 * Set user as admin and skip onboarding
 *
 * Usage:
 *   DATABASE_URL="..." tsx scripts/set-admin.ts grossdigitalpartner@gmail.com
 */

import "dotenv/config";
import mysql from "mysql2/promise";

async function setAdmin() {
  const email = process.argv[2] || "grossdigitalpartner@gmail.com";

  console.log(`\n🔧 Setting user as admin: ${email}\n`);

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not set!");
    process.exit(1);
  }

  try {
    const connection = await mysql.createConnection(databaseUrl);
    console.log("✓ Connected to database\n");

    // First, check if user exists
    const [users] = await connection.execute(
      "SELECT id, email, role, onboardingCompleted FROM users WHERE email = ?",
      [email]
    );

    if (Array.isArray(users) && users.length === 0) {
      console.error(`❌ User with email ${email} not found!`);
      console.log("\n💡 Tip: The user must first sign in via Clerk before you can set them as admin.");
      await connection.end();
      process.exit(1);
    }

    const user = (users as any)[0];
    console.log("📋 Current user data:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Onboarding: ${user.onboardingCompleted ? 'Completed' : 'Not completed'}\n`);

    // Update user to superadmin and mark onboarding as completed
    await connection.execute(
      "UPDATE users SET role = 'superadmin', onboardingCompleted = 1 WHERE email = ?",
      [email]
    );

    console.log("✅ User updated successfully!\n");

    // Verify the update
    const [updatedUsers] = await connection.execute(
      "SELECT id, email, role, onboardingCompleted FROM users WHERE email = ?",
      [email]
    );

    const updatedUser = (updatedUsers as any)[0];
    console.log("📋 Updated user data:");
    console.log(`   ID: ${updatedUser.id}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.role} ← Changed!`);
    console.log(`   Onboarding: ${updatedUser.onboardingCompleted ? 'Completed ← Changed!' : 'Not completed'}\n`);

    await connection.end();
    console.log("✓ Done!\n");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

setAdmin();
