import mysql from "mysql2/promise";

const TARGET_EMAIL = "grossdigitalpartner@gmail.com";
const TARGET_OPENID = "user_389lW4wtlXIOAyhORMQoCZg8scc";

// DATABASE_URL from .env
const DATABASE_URL = "mysql://root:BbcwfkfXkkopXkWeCbsROxQRuHLQcLKQ@metro.proxy.rlwy.net:54686/railway";

async function checkOpenId() {
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

  // 1. Check current user with target email
  console.log("\n📋 User with email: " + TARGET_EMAIL);
  console.log("=".repeat(60));

  const [emailUser] = await connection.execute(
    'SELECT id, email, name, openId, role FROM users WHERE email = ?',
    [TARGET_EMAIL]
  );

  if (emailUser.length > 0) {
    const u = emailUser[0];
    console.log(`   ID: ${u.id}`);
    console.log(`   Name: ${u.name || 'N/A'}`);
    console.log(`   Email: ${u.email}`);
    console.log(`   OpenID: ${u.openId}`);
    console.log(`   Role: ${u.role}`);
  } else {
    console.log("   ❌ Not found");
  }

  // 2. Check if target OpenID is already used
  console.log("\n📋 User with OpenID: " + TARGET_OPENID);
  console.log("=".repeat(60));

  const [openIdUser] = await connection.execute(
    'SELECT id, email, name, openId, role FROM users WHERE openId = ?',
    [TARGET_OPENID]
  );

  if (openIdUser.length > 0) {
    const u = openIdUser[0];
    console.log(`   ⚠️  This OpenID is ALREADY IN USE by another user:`);
    console.log(`   ID: ${u.id}`);
    console.log(`   Name: ${u.name || 'N/A'}`);
    console.log(`   Email: ${u.email || 'NULL'}`);
    console.log(`   OpenID: ${u.openId}`);
    console.log(`   Role: ${u.role}`);
  } else {
    console.log("   ✅ This OpenID is available (not in use)");
  }

  // 3. Show all users
  console.log("\n📋 All Users in Database:");
  console.log("=".repeat(60));

  const [allUsers] = await connection.execute(
    'SELECT id, email, name, openId, role FROM users ORDER BY id'
  );

  allUsers.forEach(u => {
    console.log(`\nID: ${u.id}`);
    console.log(`  Name: ${u.name || 'N/A'}`);
    console.log(`  Email: ${u.email || 'NULL'}`);
    console.log(`  OpenID: ${u.openId}`);
    console.log(`  Role: ${u.role}`);
  });

  await connection.end();
  console.log(`\n✅ Database connection closed`);
}

// Run the script
checkOpenId().catch((error) => {
  console.error("\n❌ Error:", error.message);
  console.error(error.stack);
  process.exit(1);
});
