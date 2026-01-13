import 'dotenv/config';
import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

async function applyMigration() {
  console.log('[Migration] Connecting to database...');

  const connection = await mysql.createConnection(process.env.DATABASE_URL!);

  try {
    const migrationPath = path.join(process.cwd(), 'drizzle/0012_crm_ghl_sync.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    // Split by semicolon and filter out comments and empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    console.log(`[Migration] Applying ${statements.length} SQL statements...\n`);

    for (const stmt of statements) {
      try {
        const preview = stmt.substring(0, 80).replace(/\s+/g, ' ');
        console.log(`  ✓ ${preview}...`);
        await connection.execute(stmt);
      } catch (error: any) {
        // Check if column already exists
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`    ⚠️  Column already exists, skipping`);
          continue;
        }
        console.error(`  ✗ Error: ${error.message}`);
        console.error(`    Statement: ${stmt.substring(0, 100)}`);
        throw error;
      }
    }

    console.log('\n[Migration] ✅ Successfully applied CRM migration!');

  } catch (error: any) {
    console.error('[Migration] ❌ Failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

applyMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
