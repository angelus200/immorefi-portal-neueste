#!/usr/bin/env tsx
import "dotenv/config";
import mysql from "mysql2/promise";

async function runMigration() {
  console.log("\n🔧 Applying partner_logos migration...\n");

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
      console.log("Creating partner_logos table...");
      await connection.execute(`
        CREATE TABLE partner_logos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category ENUM('presse', 'mitgliedschaft', 'auszeichnung', 'partner') NOT NULL,
          imageUrl VARCHAR(500) NOT NULL,
          linkUrl VARCHAR(500),
          sortOrder INT NOT NULL DEFAULT 0,
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
        CREATE INDEX idx_partner_logos_category ON partner_logos (category)
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
        CREATE INDEX idx_partner_logos_active ON partner_logos (isActive)
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
      console.log("Creating index on sortOrder...");
      await connection.execute(`
        CREATE INDEX idx_partner_logos_sort ON partner_logos (sortOrder)
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
    console.log("✅ Partner logos migration completed successfully!\n");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

runMigration();
