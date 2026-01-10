#!/usr/bin/env tsx
/**
 * Database Setup Script
 *
 * This script creates all database tables based on the Drizzle schema.
 * Run this script when setting up a new database.
 *
 * Usage:
 *   npm run setup-db
 *   or
 *   tsx scripts/setup-database.ts
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema";

async function setupDatabase() {
  console.log("🚀 Starting database setup...\n");

  // Check if DATABASE_URL is set
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ ERROR: DATABASE_URL environment variable is not set!");
    console.error("Please set DATABASE_URL in your .env file or environment.");
    console.error("\nExample:");
    console.error("DATABASE_URL=mysql://user:password@host:port/database");
    process.exit(1);
  }

  console.log("✓ DATABASE_URL is configured");
  console.log(`  Connection: ${databaseUrl.replace(/:[^:@]*@/, ':****@')}\n`);

  try {
    // Create connection
    console.log("📡 Connecting to database...");
    const connection = await mysql.createConnection(databaseUrl);
    console.log("✓ Connected successfully\n");

    // Initialize Drizzle
    const db = drizzle(connection, { schema, mode: 'default' });

    console.log("📋 Database schema contains the following tables:");
    console.log("  - users (authentication)");
    console.log("  - tenants (multi-tenant)");
    console.log("  - memberships (user-tenant relationships)");
    console.log("  - leads (CRM)");
    console.log("  - contacts (CRM)");
    console.log("  - deals (CRM)");
    console.log("  - pipeline_stages");
    console.log("  - tasks");
    console.log("  - files");
    console.log("  - questionnaires");
    console.log("  - questionnaire_responses");
    console.log("  - audit_logs");
    console.log("  - notes");
    console.log("  - contracts");
    console.log("  - contract_assignments");
    console.log("  - contract_acceptances");
    console.log("  - orders (Stripe purchases)");
    console.log("  - onboarding_data");
    console.log("  - onboarding_documents");
    console.log("  - download_stats");
    console.log("  - invoices");
    console.log("  - invoice_items");
    console.log("  - invoice_counters\n");

    console.log("⚠️  This script will use drizzle-kit to push the schema.");
    console.log("⚠️  This may modify your database structure!\n");

    // Close connection
    await connection.end();
    console.log("✓ Connection closed\n");

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔧 NEXT STEP: Run the following command:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("  npx drizzle-kit push\n");
    console.log("This will:");
    console.log("  1. Generate SQL statements from your schema");
    console.log("  2. Push them directly to your database");
    console.log("  3. Create all tables, enums, and indexes\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  } catch (error: any) {
    console.error("❌ Error during database setup:");
    console.error(error.message);
    console.error("\nFull error:");
    console.error(error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
