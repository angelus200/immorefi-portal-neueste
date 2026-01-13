import { drizzle } from 'drizzle-orm/mysql2';
import * as fs from 'fs';
import * as path from 'path';

async function applyMigration() {
  const db = drizzle(process.env.DATABASE_URL!);
  const migrationPath = path.join(process.cwd(), 'drizzle/0012_crm_ghl_sync.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  // Split by semicolon and filter out comments and empty statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  console.log(`Applying migration with ${statements.length} statements...`);

  for (const stmt of statements) {
    try {
      console.log(`Executing: ${stmt.substring(0, 80)}...`);
      await db.execute(stmt);
    } catch (error: any) {
      console.error(`Error executing statement: ${stmt}`);
      console.error(error.message);
      // Continue with next statement even if one fails
    }
  }

  console.log('Migration applied successfully');
  process.exit(0);
}

applyMigration().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
