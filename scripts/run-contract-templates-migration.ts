#!/usr/bin/env tsx
import "dotenv/config";
import mysql from "mysql2/promise";

async function runMigration() {
  console.log("\n🔧 Applying contract_templates migration...\n");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not set!");
    process.exit(1);
  }

  try {
    const connection = await mysql.createConnection(databaseUrl);
    console.log("✓ Connected to database\n");

    // Create table
    try {
      console.log("Creating contract_templates table...");
      await connection.execute(`
        CREATE TABLE contract_templates (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100) NOT NULL,
          content LONGTEXT NOT NULL,
          placeholders JSON,
          isActive BOOLEAN NOT NULL DEFAULT TRUE,
          createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log("✓ Table created\n");
    } catch (error: any) {
      if (error.message?.includes("already exists")) {
        console.log("✓ Table already exists\n");
      } else {
        throw error;
      }
    }

    // Create indexes
    try {
      console.log("Creating index on category...");
      await connection.execute(`
        CREATE INDEX idx_contract_templates_category ON contract_templates (category)
      `);
      console.log("✓ Index created\n");
    } catch (error: any) {
      if (error.message?.includes("Duplicate key name")) {
        console.log("✓ Index already exists\n");
      } else {
        throw error;
      }
    }

    try {
      console.log("Creating index on isActive...");
      await connection.execute(`
        CREATE INDEX idx_contract_templates_active ON contract_templates (isActive)
      `);
      console.log("✓ Index created\n");
    } catch (error: any) {
      if (error.message?.includes("Duplicate key name")) {
        console.log("✓ Index already exists\n");
      } else {
        throw error;
      }
    }

    await connection.end();
    console.log("✅ Contract templates migration completed successfully!\n");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

runMigration();
