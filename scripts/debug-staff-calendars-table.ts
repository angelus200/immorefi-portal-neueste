import mysql from 'mysql2/promise';

const DATABASE_URL = 'mysql://root:BbcwfkfXkkopXkWeCbsROxQRuHLQcLKQ@metro.proxy.rlwy.net:54686/railway';

async function debugTable() {
  console.log('🔄 Connecting to Railway database...');

  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    console.log('✅ Connected successfully!\n');

    // Check if staff_calendars table exists
    console.log('📊 Checking if staff_calendars table exists...');
    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'staff_calendars'
    `);

    if ((tables as any[]).length === 0) {
      console.log('❌ staff_calendars table does NOT exist\n');
      console.log('Solution: Run npm run db:push or create table manually\n');

      // Show the CREATE TABLE statement from schema
      console.log('CREATE TABLE statement needed:');
      console.log(`
CREATE TABLE staff_calendars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  calendlyUrl VARCHAR(500),
  avatarUrl VARCHAR(500),
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
      `);
      return;
    }

    console.log('✅ staff_calendars table EXISTS\n');

    // Describe table structure
    console.log('📊 Table structure:');
    const [columns] = await connection.query(`DESCRIBE staff_calendars`);
    console.table(columns);

    // Check if we have oderId or userId
    const [checkOderId] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'railway'
        AND TABLE_NAME = 'staff_calendars'
        AND COLUMN_NAME = 'oderId'
    `);

    const [checkUserId] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'railway'
        AND TABLE_NAME = 'staff_calendars'
        AND COLUMN_NAME = 'userId'
    `);

    console.log('\n📊 Column name check:');
    if ((checkOderId as any[]).length > 0) {
      console.log('❌ Found oderId column (old/wrong name)');
      console.log('⚠️  Need to rename: oderId → userId');
      console.log('Run: npx tsx scripts/migrate-rename-oderId-to-userId.ts');
    }
    if ((checkUserId as any[]).length > 0) {
      console.log('✅ Found userId column (correct name)');
    }
    if ((checkOderId as any[]).length === 0 && (checkUserId as any[]).length === 0) {
      console.log('❌ Neither oderId nor userId column exists!');
    }

    // Check row count
    const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM staff_calendars`);
    const count = (countResult as any[])[0].count;
    console.log(`\n📊 Row count: ${count} entries`);

    // Show sample data if any exists
    if (count > 0) {
      console.log('\n📊 Sample data (first 3 rows):');
      const [rows] = await connection.query(`SELECT * FROM staff_calendars LIMIT 3`);
      console.table(rows);
    }

    // Check bookings table too
    console.log('\n\n📊 Checking bookings table...');
    const [bookingsTables] = await connection.query(`SHOW TABLES LIKE 'bookings'`);

    if ((bookingsTables as any[]).length === 0) {
      console.log('❌ bookings table does NOT exist');
      console.log('\nCREATE TABLE statement needed:');
      console.log(`
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  staffCalendarId INT NOT NULL,
  calendlyEventId VARCHAR(100),
  calendlyInviteeId VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  startTime TIMESTAMP NOT NULL,
  endTime TIMESTAMP NOT NULL,
  meetingUrl VARCHAR(500),
  status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show') NOT NULL DEFAULT 'pending',
  customerNotes TEXT,
  reminder24hSent BOOLEAN NOT NULL DEFAULT FALSE,
  reminder1hSent BOOLEAN NOT NULL DEFAULT FALSE,
  reminderSmsSent BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
      `);
    } else {
      console.log('✅ bookings table EXISTS');
      const [bookingsColumns] = await connection.query(`DESCRIBE bookings`);
      console.table(bookingsColumns);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await connection.end();
    console.log('\n🔌 Database connection closed');
  }
}

debugTable()
  .then(() => {
    console.log('\n🎉 Debug complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
