import 'dotenv/config';
import mysql from 'mysql2/promise';

async function addGHLFields() {
  console.log('[Migration] Adding GHL ID fields...');
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);

  try {
    const statements = [
      "ALTER TABLE `leads` ADD COLUMN `ghlContactId` varchar(64)",
      "ALTER TABLE `contacts` ADD COLUMN `ghlContactId` varchar(64)",
      "ALTER TABLE `deals` ADD COLUMN `ghlOpportunityId` varchar(64)",
    ];

    for (const stmt of statements) {
      try {
        console.log(`  ✓ ${stmt.substring(0, 80)}...`);
        await connection.execute(stmt);
      } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`    ⚠️  Column already exists, skipping`);
        } else {
          throw error;
        }
      }
    }

    console.log('[Migration] ✅ GHL ID fields added successfully!');
  } finally {
    await connection.end();
  }
}

addGHLFields()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
