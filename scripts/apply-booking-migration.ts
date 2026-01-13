import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function applyMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const connection = await mysql.createConnection(databaseUrl);

  console.log('📦 Applying booking system migration...');

  const sqlPath = path.join(__dirname, '..', 'drizzle', '0013_booking_system.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  for (const stmt of statements) {
    try {
      const preview = stmt.length > 100 ? stmt.substring(0, 100) + '...' : stmt;
      console.log('▶️  Executing:', preview);
      await connection.execute(stmt);
      console.log('✅ Success');
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_CODE') {
        console.log('⚠️  Table already exists, skipping');
        continue;
      }
      console.error('❌ Error:', error.message);
      throw error;
    }
  }

  await connection.end();
  console.log('✅ Migration completed successfully!');
}

applyMigration().catch(console.error);
