import mysql from 'mysql2/promise';

const DATABASE_URL = 'mysql://root:BbcwfkfXkkopXkWeCbsROxQRuHLQcLKQ@metro.proxy.rlwy.net:54686/railway';

async function runMigration() {
  console.log('🔄 Connecting to Railway database...');

  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    console.log('✅ Connected successfully!');
    console.log('🔄 Running migration: Add userId column to files table...');

    // Check if column already exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'railway'
        AND TABLE_NAME = 'files'
        AND COLUMN_NAME = 'userId'
    `);

    if ((columns as any[]).length > 0) {
      console.log('⚠️  Column already exists, skipping migration');
      return;
    }

    // Run migration - add userId column after tenantId
    await connection.query(`
      ALTER TABLE files
      ADD COLUMN userId INT AFTER tenantId
    `);

    console.log('✅ Migration completed successfully!');
    console.log('📊 Column added: userId (INT, nullable)');

    // Verify column was added
    const [verify] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'railway'
        AND TABLE_NAME = 'files'
        AND COLUMN_NAME = 'userId'
    `);

    console.log('✅ Verification:');
    console.table(verify);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
    console.log('🔌 Database connection closed');
  }
}

runMigration()
  .then(() => {
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
