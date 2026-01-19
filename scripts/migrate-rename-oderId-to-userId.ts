import mysql from 'mysql2/promise';

const DATABASE_URL = 'mysql://root:BbcwfkfXkkopXkWeCbsROxQRuHLQcLKQ@metro.proxy.rlwy.net:54686/railway';

async function runMigration() {
  console.log('🔄 Connecting to Railway database...');

  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    console.log('✅ Connected successfully!');
    console.log('🔄 Running migration: Rename oderId to userId in staff_calendars and bookings tables...');

    // Check if staff_calendars.oderId exists
    const [staffCalColumns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'railway'
        AND TABLE_NAME = 'staff_calendars'
        AND COLUMN_NAME = 'oderId'
    `);

    if ((staffCalColumns as any[]).length > 0) {
      console.log('📝 Renaming staff_calendars.oderId → userId...');
      await connection.query(`
        ALTER TABLE staff_calendars
        CHANGE COLUMN oderId userId INT NOT NULL
      `);
      console.log('✅ staff_calendars.oderId renamed to userId');
    } else {
      console.log('⚠️  staff_calendars.oderId already renamed or does not exist');
    }

    // Check if bookings.oderId exists
    const [bookingsColumns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'railway'
        AND TABLE_NAME = 'bookings'
        AND COLUMN_NAME = 'oderId'
    `);

    if ((bookingsColumns as any[]).length > 0) {
      console.log('📝 Renaming bookings.oderId → userId...');
      await connection.query(`
        ALTER TABLE bookings
        CHANGE COLUMN oderId userId INT NOT NULL
      `);
      console.log('✅ bookings.oderId renamed to userId');
    } else {
      console.log('⚠️  bookings.oderId already renamed or does not exist');
    }

    console.log('✅ Migration completed successfully!');
    console.log('📊 Columns renamed: oderId → userId in both tables');

    // Verify columns were renamed
    const [verifyStaff] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'railway'
        AND TABLE_NAME = 'staff_calendars'
        AND COLUMN_NAME = 'userId'
    `);

    const [verifyBookings] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'railway'
        AND TABLE_NAME = 'bookings'
        AND COLUMN_NAME = 'userId'
    `);

    console.log('\n✅ Verification - staff_calendars:');
    console.table(verifyStaff);

    console.log('\n✅ Verification - bookings:');
    console.table(verifyBookings);

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
