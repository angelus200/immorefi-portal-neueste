#!/usr/bin/env tsx
import "dotenv/config";
import mysql from "mysql2/promise";

async function runMigration() {
  console.log("\n🔧 Applying onboarding system migration...\n");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not set!");
    process.exit(1);
  }

  try {
    const connection = await mysql.createConnection(databaseUrl);
    console.log("✓ Connected to database\n");

    console.log("[Migration] Adding onboarding fields to users table...");

    // Add hasSeenWelcome column
    try {
      await connection.execute(`
        ALTER TABLE users
        ADD COLUMN hasSeenWelcome BOOLEAN NOT NULL DEFAULT FALSE AFTER onboardingCompleted
      `);
      console.log("✓ Added hasSeenWelcome column");
    } catch (error: any) {
      if (error.message?.includes("Duplicate column name")) {
        console.log("✓ hasSeenWelcome column already exists");
      } else {
        throw error;
      }
    }

    // Add hasCompletedTour column
    try {
      await connection.execute(`
        ALTER TABLE users
        ADD COLUMN hasCompletedTour BOOLEAN NOT NULL DEFAULT FALSE AFTER hasSeenWelcome
      `);
      console.log("✓ Added hasCompletedTour column");
    } catch (error: any) {
      if (error.message?.includes("Duplicate column name")) {
        console.log("✓ hasCompletedTour column already exists");
      } else {
        throw error;
      }
    }

    // Add onboardingProgress column
    try {
      await connection.execute(`
        ALTER TABLE users
        ADD COLUMN onboardingProgress JSON AFTER hasCompletedTour
      `);
      console.log("✓ Added onboardingProgress column");
    } catch (error: any) {
      if (error.message?.includes("Duplicate column name")) {
        console.log("✓ onboardingProgress column already exists");
      } else {
        throw error;
      }
    }

    await connection.end();
    console.log("\n✅ Onboarding system migration completed successfully!\n");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

runMigration();
