import 'dotenv/config';
import mysql from 'mysql2/promise';

async function setIsabelAsAdmin() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);

  try {
    console.log('Updating user role for Isabel Anders...');
    const [updateResult] = await connection.execute(
      "UPDATE users SET role = 'tenant_admin' WHERE openId = ?",
      ['user_38CD5yclkFZZ1CT2Kmk0YJZ83AU']
    ) as any;

    console.log(`✓ Updated ${updateResult.affectedRows} row(s)`);

    console.log('\nVerifying update...');
    const [rows] = await connection.execute(
      'SELECT id, openId, name, email, role, createdAt FROM users WHERE openId = ?',
      ['user_38CD5yclkFZZ1CT2Kmk0YJZ83AU']
    );

    console.log('\n✓ User details:');
    console.table(rows);
  } finally {
    await connection.end();
  }
}

setIsabelAsAdmin().catch(console.error);
