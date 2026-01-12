import mysql from "mysql2/promise";

// DATABASE_URL from .env
const DATABASE_URL = "mysql://root:BbcwfkfXkkopXkWeCbsROxQRuHLQcLKQ@metro.proxy.rlwy.net:54686/railway";

async function cleanupAndUpdate() {
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

  console.log("✅ Connected to database\n");

  try {
    // STEP 1: Delete duplicates (User 19 and 85)
    console.log("📋 STEP 1: Deleting Duplicates (User 19 and 85)");
    console.log("=".repeat(60));

    const [deleteResult] = await connection.execute(
      'DELETE FROM users WHERE id IN (19, 85)'
    );

    console.log(`✅ Deleted ${deleteResult.affectedRows} duplicate user(s)`);
    console.log(`   - User ID 19 (Thomas  Gross / grossdigitalpartner@gmail.com)`);
    console.log(`   - User ID 85 (Thomas Gross / grossdigitalpartner@gmail.com)`);

    // STEP 2: Update User 34 with temporary openId
    console.log("\n📋 STEP 2: Update User 34 with Temporary OpenID");
    console.log("=".repeat(60));

    const [updateUser34] = await connection.execute(
      "UPDATE users SET openId = 'temp_user_34' WHERE id = 34"
    );

    console.log(`✅ Updated User 34 (office@angelus.group)`);
    console.log(`   Old OpenID: user_389lW4wtlXIOAyhORMQoCZg8scc`);
    console.log(`   New OpenID: temp_user_34`);

    // STEP 3: Update User 1 with new Clerk openId
    console.log("\n📋 STEP 3: Update User 1 with New Clerk OpenID");
    console.log("=".repeat(60));

    const [updateUser1] = await connection.execute(
      "UPDATE users SET openId = 'user_389lW4wtlXIOAyhORMQoCZg8scc' WHERE id = 1"
    );

    console.log(`✅ Updated User 1 (grossdigitalpartner@gmail.com)`);
    console.log(`   Old OpenID: user_383vdWeOANgSTHyc7aDA7DdY8hn`);
    console.log(`   New OpenID: user_389lW4wtlXIOAyhORMQoCZg8scc`);

    // STEP 4: Show all users for confirmation
    console.log("\n📋 STEP 4: All Users (Confirmation)");
    console.log("=".repeat(60));

    const [allUsers] = await connection.execute(
      'SELECT id, email, role, openId FROM users ORDER BY id'
    );

    console.log("\n");
    console.table(allUsers.map(u => ({
      ID: u.id,
      Email: u.email || 'NULL',
      Role: u.role,
      OpenID: u.openId
    })));

    console.log("\n🎉 SUCCESS! All operations completed successfully!");
    console.log("\nSummary:");
    console.log(`  ✅ Deleted 2 duplicate users (IDs: 19, 85)`);
    console.log(`  ✅ Updated User 34 openId to: temp_user_34`);
    console.log(`  ✅ Updated User 1 openId to: user_389lW4wtlXIOAyhORMQoCZg8scc`);
    console.log(`  ✅ Total users in database: ${allUsers.length}`);

  } catch (error) {
    console.error("\n❌ Error during operation:", error.message);
    throw error;
  } finally {
    await connection.end();
    console.log(`\n✅ Database connection closed`);
  }
}

// Run the script
cleanupAndUpdate().catch((error) => {
  console.error("\n❌ Fatal Error:", error.message);
  console.error(error.stack);
  process.exit(1);
});
