import { getDb } from "../server/db";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function applyMigration() {
  try {
    console.log("[Migration] Reading migration file...");

    const db = await getDb();

    const migrationPath = path.join(__dirname, "../drizzle/0014_onboarding_system.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    // Split by semicolons to execute multiple statements
    const statements = migrationSQL
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"));

    console.log(`[Migration] Found ${statements.length} SQL statements to execute`);

    for (const statement of statements) {
      if (statement) {
        console.log(`[Migration] Executing: ${statement.substring(0, 80)}...`);
        await db.execute(sql.raw(statement));
      }
    }

    console.log("[Migration] ✅ Onboarding system migration applied successfully!");
    process.exit(0);
  } catch (error) {
    console.error("[Migration] ❌ Error applying migration:", error);
    process.exit(1);
  }
}

applyMigration();
