import mysql from 'mysql2/promise';

const DATABASE_URL = 'mysql://root:BbcwfkfXkkopXkWeCbsROxQRuHLQcLKQ@metro.proxy.rlwy.net:54686/railway';

async function checkTables() {
  console.log('🔄 Connecting to Railway database...');

  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    console.log('✅ Connected successfully!');

    // Check if staff_calendars table exists
    const [tables] = await connection.query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = 'railway'
        AND TABLE_NAME IN ('staff_calendars', 'bookings')
    `);

    console.log('\n📊 Tables found:');
    console.table(tables);

    // Check staff_calendars columns
    const [staffCalColumns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'railway'
        AND TABLE_NAME = 'staff_calendars'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\n📊 staff_calendars columns:');
    console.table(staffCalColumns);

    // Check bookings columns
    const [bookingsColumns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'railway'
        AND TABLE_NAME = 'bookings'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\n📊 bookings columns:');
    console.table(bookingsColumns);

  } catch (error) {
    console.error('❌ Check failed:', error);
    throw error;
  } finally {
    await connection.end();
    console.log('\n🔌 Database connection closed');
  }
}

checkTables()
  .then(() => {
    console.log('🎉 Check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
