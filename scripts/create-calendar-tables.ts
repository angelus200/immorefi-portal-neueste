import mysql from 'mysql2/promise';

const DATABASE_URL = 'mysql://root:BbcwfkfXkkopXkWeCbsROxQRuHLQcLKQ@metro.proxy.rlwy.net:54686/railway';

async function createTables() {
  console.log('🔄 Connecting to Railway database...');

  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    console.log('✅ Connected successfully!\n');

    // Check and create staff_calendars table
    console.log('📋 Creating staff_calendars table...');
    const [staffCalTables] = await connection.query(`SHOW TABLES LIKE 'staff_calendars'`);

    if ((staffCalTables as any[]).length > 0) {
      console.log('⚠️  staff_calendars table already exists, skipping');
    } else {
      await connection.query(`
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
        )
      `);
      console.log('✅ staff_calendars table created successfully!');
    }

    // Verify staff_calendars
    const [staffCalColumns] = await connection.query(`DESCRIBE staff_calendars`);
    console.log('\n📊 staff_calendars structure:');
    console.table(staffCalColumns);

    // Check and create bookings table
    console.log('\n📋 Creating bookings table...');
    const [bookingsTables] = await connection.query(`SHOW TABLES LIKE 'bookings'`);

    if ((bookingsTables as any[]).length > 0) {
      console.log('⚠️  bookings table already exists, skipping');
    } else {
      await connection.query(`
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
        )
      `);
      console.log('✅ bookings table created successfully!');
    }

    // Verify bookings
    const [bookingsColumns] = await connection.query(`DESCRIBE bookings`);
    console.log('\n📊 bookings structure:');
    console.table(bookingsColumns);

    console.log('\n✅ All tables created and verified!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
    console.log('\n🔌 Database connection closed');
  }
}

createTables()
  .then(() => {
    console.log('\n🎉 Tables created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
