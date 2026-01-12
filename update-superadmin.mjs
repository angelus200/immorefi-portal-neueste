import mysql from "mysql2/promise";

const TARGET_EMAIL = "grossdigitalpartner@gmail.com";
const NEW_ROLE = "superadmin";

// DATABASE_URL from .env
const DATABASE_URL = "mysql://root:BbcwfkfXkkopXkWeCbsROxQRuHLQcLKQ@metro.proxy.rlwy.net:54686/railway";

async function updateToSuperAdmin() {
  console.log("🔄 Connecting to Railway MySQL database...");

  // Parse connection details from URL
  const match = DATABASE_URL.match(/mysql:\/\/([^:]+):([^@]+)@([^:\/]+)(?::(\d+))?\/(.+)/);

  if (!match) {
    console.error("❌ Invalid DATABASE_URL format");
    process.exit(1);
  }

  const [, user, password, host, port, database] = match;

  const connection = await mysql.createConnection({
    host: host,
    port: port ? parseInt(port) : 3306,
    user: user,
    password: password,
    database: database,
  });

  console.log("✅ Connected to database");

  // 1. Show table structure
  console.log("\n📋 STEP 1: Table Structure");
  console.log("=".repeat(60));

  const [columns] = await connection.execute(
    "DESCRIBE users"
  );

  console.log("\nUsers table structure:");
  columns.forEach(col => {
    console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
  });

  // 2. Show current user data
  console.log("\n📋 STEP 2: Current User Data");
  console.log("=".repeat(60));

  const [currentUser] = await connection.execute(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [TARGET_EMAIL]
  );

  if (currentUser.length === 0) {
    console.error(`\n❌ User not found: ${TARGET_EMAIL}`);
    console.log("\n📋 Available users:");

    const [allUsers] = await connection.execute('SELECT id, email, role, name FROM users LIMIT 10');
    allUsers.forEach(u => {
      console.log(`  - ID: ${u.id}, Email: ${u.email || 'NULL'}, Role: ${u.role}, Name: ${u.name || 'N/A'}`);
    });

    await connection.end();
    process.exit(1);
  }

  const user_data = currentUser[0];
  console.log(`\n✅ User found:`);
  console.log(`   ID: ${user_data.id}`);
  console.log(`   Name: ${user_data.name || 'N/A'}`);
  console.log(`   Email: ${user_data.email}`);
  console.log(`   Current Role: ${user_data.role}`);
  console.log(`   OpenID (Clerk): ${user_data.openId}`);
  console.log(`   Onboarding Completed: ${user_data.onboardingCompleted}`);
  console.log(`   Created At: ${user_data.createdAt}`);
  console.log(`   Last Signed In: ${user_data.lastSignedIn}`);

  if (user_data.role === NEW_ROLE) {
    console.log(`\n✅ User already has role "${NEW_ROLE}"! No changes needed.`);
    await connection.end();
    process.exit(0);
  }

  // 3. Update role
  console.log(`\n📋 STEP 3: Updating Role`);
  console.log("=".repeat(60));
  console.log(`\nChanging role from "${user_data.role}" to "${NEW_ROLE}"...`);

  await connection.execute(
    'UPDATE users SET role = ? WHERE email = ?',
    [NEW_ROLE, TARGET_EMAIL]
  );

  console.log(`✅ UPDATE executed successfully!`);

  // 4. Verify the change
  console.log(`\n📋 STEP 4: Verification`);
  console.log("=".repeat(60));

  const [updatedUser] = await connection.execute(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [TARGET_EMAIL]
  );

  console.log(`\n✅ Updated user details:`);
  console.log(`   ID: ${updatedUser[0].id}`);
  console.log(`   Name: ${updatedUser[0].name || 'N/A'}`);
  console.log(`   Email: ${updatedUser[0].email}`);
  console.log(`   NEW Role: ${updatedUser[0].role}`);

  if (updatedUser[0].role === NEW_ROLE) {
    console.log(`\n🎉 SUCCESS! User is now a ${NEW_ROLE}!`);
  } else {
    console.error(`\n❌ ERROR: Role was not updated correctly!`);
  }

  await connection.end();
  console.log(`\n✅ Database connection closed`);
}

// Run the script
updateToSuperAdmin().catch((error) => {
  console.error("\n❌ Error:", error.message);
  console.error(error.stack);
  process.exit(1);
});
