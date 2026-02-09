/**
 * Script to create the page_views table for analytics
 * Run with: DATABASE_URL="..." tsx scripts/create-analytics-table.ts
 */

import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

async function createAnalyticsTable() {
  console.log('🔌 Connecting to database...');

  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    console.log('📋 Creating page_views table...');

    const sql = `
      CREATE TABLE IF NOT EXISTS page_views (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page VARCHAR(255) NOT NULL,
        visitorId VARCHAR(255) NOT NULL,
        ipHash VARCHAR(64) NOT NULL,
        userAgent VARCHAR(500),
        referrer VARCHAR(500),
        country VARCHAR(10),
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_visitorId (visitorId),
        INDEX idx_createdAt (createdAt),
        INDEX idx_page (page)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(sql);

    console.log('✅ page_views table created successfully!');

    // Check if table exists
    const [rows] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = 'page_views'
    `);

    if ((rows as any)[0].count > 0) {
      console.log('✅ Table verified in database');
    }

  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  } finally {
    await connection.end();
    console.log('👋 Connection closed');
  }
}

createAnalyticsTable();
