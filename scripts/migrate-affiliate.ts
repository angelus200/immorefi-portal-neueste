/**
 * Manual migration script for Affiliate System
 * Run: DATABASE_URL="..." npx tsx scripts/migrate-affiliate.ts
 */

import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  console.log('🔄 Connecting to database...');
  const connection = await createConnection(connectionString);

  try {
    console.log('📖 Reading migration file...');
    const sql = readFileSync(
      join(process.cwd(), 'drizzle/migrations/0018_affiliate_system.sql'),
      'utf-8'
    );

    // Remove comments and split by semicolons
    const cleanedSql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n');

    const statements = cleanedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`✨ Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 60).replace(/\s+/g, ' ');
      console.log(`   [${i + 1}/${statements.length}] ${preview}...`);
      await connection.execute(statement);
    }

    console.log('✅ Migration completed successfully!');
    console.log('\n📊 Created tables:');
    console.log('   - affiliate_profiles');
    console.log('   - affiliate_referrals');
    console.log('   - affiliate_commissions');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
    console.log('🔌 Database connection closed');
  }
}

runMigration().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
