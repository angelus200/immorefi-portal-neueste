import mysql from 'mysql2/promise';

const DATABASE_URL = 'mysql://root:BbcwfkfXkkopXkWeCbsROxQRuHLQcLKQ@metro.proxy.rlwy.net:54686/railway';

async function runMigration() {
  console.log('🔄 Connecting to Railway database...');

  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    console.log('✅ Connected successfully!');
    console.log('🔄 Running migration: Add email preference columns...');

    // Check if columns already exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'railway'
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME IN ('emailNotifications', 'marketingEmails')
    `);

    if ((columns as any[]).length > 0) {
      console.log('⚠️  Columns already exist, skipping migration');
      return;
    }

    // Run migration
    await connection.query(`
      ALTER TABLE users
      ADD COLUMN emailNotifications BOOLEAN NOT NULL DEFAULT TRUE,
      ADD COLUMN marketingEmails BOOLEAN NOT NULL DEFAULT FALSE
    `);

    console.log('✅ Migration completed successfully!');
    console.log('📊 Columns added: emailNotifications, marketingEmails');

    // Verify columns were added
    const [verify] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'railway'
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME IN ('emailNotifications', 'marketingEmails')
      ORDER BY ORDINAL_POSITION
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
