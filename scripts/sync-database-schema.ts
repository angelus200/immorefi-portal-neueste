#!/usr/bin/env tsx
/**
 * Database Schema Sync Script
 *
 * This script syncs the current Drizzle schema to the database.
 * It uses drizzle-kit push to intelligently compare and apply changes.
 *
 * ⚠️  IMPORTANT: This will modify your database structure!
 *
 * Usage:
 *   npm run db:sync
 *   or
 *   tsx scripts/sync-database-schema.ts
 */

import "dotenv/config";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function syncSchema() {
  console.log("\n🔄 Starting Database Schema Sync...\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Check DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ ERROR: DATABASE_URL not set!");
    console.error("Please set DATABASE_URL in your .env file\n");
    process.exit(1);
  }

  console.log("✓ DATABASE_URL configured");
  console.log(`  Connection: ${databaseUrl.replace(/:[^:@]*@/, ':****@')}\n`);

  console.log("📋 This will synchronize your database with the current schema:");
  console.log("   - Add missing tables");
  console.log("   - Add missing columns");
  console.log("   - Modify column types if needed");
  console.log("   - Add missing indexes");
  console.log("   - Add missing enums\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("⚠️  WARNING: This will modify your database!");
  console.log("⚠️  Make sure you have a backup if needed!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    console.log("🚀 Running drizzle-kit push...\n");

    const { stdout, stderr } = await execAsync("npx drizzle-kit push", {
      env: { ...process.env },
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    if (stdout) {
      console.log(stdout);
    }
    if (stderr && !stderr.includes("npm warn")) {
      console.error(stderr);
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Database schema sync completed!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📝 Next steps:");
    console.log("  1. Restart your server");
    console.log("  2. Test the admin functions:");
    console.log("     - Create Lead");
    console.log("     - Create Contact");
    console.log("     - Toggle Calendar");
    console.log("  3. Check for any errors\n");

  } catch (error: any) {
    console.error("\n❌ Error during schema sync:");
    console.error(error.message);
    if (error.stdout) {
      console.log("\nOutput:", error.stdout);
    }
    if (error.stderr) {
      console.error("\nError output:", error.stderr);
    }
    console.error("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ Schema sync failed!");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    process.exit(1);
  }
}

// Run the sync
console.log("\n🔧 Database Schema Synchronization Tool");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

syncSchema().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
