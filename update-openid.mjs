import mysql from "mysql2/promise";

const TARGET_EMAIL = "grossdigitalpartner@gmail.com";
const NEW_OPENID = "user_389lW4wtlXIOAyhORMQoCZg8scc";

// DATABASE_URL from .env
const DATABASE_URL = "mysql://root:BbcwfkfXkkopXkWeCbsROxQRuHLQcLKQ@metro.proxy.rlwy.net:54686/railway";

async function updateOpenId() {
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

  // 1. Show current user data
  console.log("\n📋 STEP 1: Current User Data");
  console.log("=".repeat(60));

  const [currentUser] = await connection.execute(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [TARGET_EMAIL]
  );

  if (currentUser.length === 0) {
    console.error(`\n❌ User not found: ${TARGET_EMAIL}`);
    await connection.end();
    process.exit(1);
  }

  const user_data = currentUser[0];
  console.log(`\n✅ User found:`);
  console.log(`   ID: ${user_data.id}`);
  console.log(`   Name: ${user_data.name || 'N/A'}`);
  console.log(`   Email: ${user_data.email}`);
  console.log(`   Current OpenID: ${user_data.openId}`);
  console.log(`   Role: ${user_data.role}`);

  // 2. Update openId
  console.log(`\n📋 STEP 2: Updating OpenID`);
  console.log("=".repeat(60));
  console.log(`\nChanging OpenID:`);
  console.log(`  FROM: ${user_data.openId}`);
  console.log(`  TO:   ${NEW_OPENID}`);

  await connection.execute(
    'UPDATE users SET openId = ? WHERE email = ?',
    [NEW_OPENID, TARGET_EMAIL]
  );

  console.log(`\n✅ UPDATE executed successfully!`);

  // 3. Verify the change
  console.log(`\n📋 STEP 3: Verification`);
  console.log("=".repeat(60));

  const [updatedUser] = await connection.execute(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [TARGET_EMAIL]
  );

  console.log(`\n✅ Updated user details:`);
  console.log(`   ID: ${updatedUser[0].id}`);
  console.log(`   Name: ${updatedUser[0].name || 'N/A'}`);
  console.log(`   Email: ${updatedUser[0].email}`);
  console.log(`   NEW OpenID: ${updatedUser[0].openId}`);
  console.log(`   Role: ${updatedUser[0].role}`);

  if (updatedUser[0].openId === NEW_OPENID) {
    console.log(`\n🎉 SUCCESS! OpenID has been updated!`);
  } else {
    console.error(`\n❌ ERROR: OpenID was not updated correctly!`);
  }

  await connection.end();
  console.log(`\n✅ Database connection closed`);
}

// Run the script
updateOpenId().catch((error) => {
  console.error("\n❌ Error:", error.message);
  console.error(error.stack);
  process.exit(1);
});
