import mysql from "mysql2/promise";

// DATABASE_URL from .env
const DATABASE_URL = "mysql://root:BbcwfkfXkkopXkWeCbsROxQRuHLQcLKQ@metro.proxy.rlwy.net:54686/railway";

async function finalUserCleanup() {
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
    // STEP 1: Show all users
    console.log("📋 STEP 1: All Users (Before Cleanup)");
    console.log("=".repeat(80));

    const [allUsersBefore] = await connection.execute(
      'SELECT id, email, role, openId FROM users ORDER BY id'
    );

    console.table(allUsersBefore.map(u => ({
      ID: u.id,
      Email: u.email || 'NULL',
      Role: u.role,
      OpenID: u.openId
    })));

    // STEP 2: Delete all users with email 'grossdigitalpartner@gmail.com' except ID 1
    console.log("\n📋 STEP 2: Delete Duplicates (Keep Only ID 1)");
    console.log("=".repeat(80));

    const [deleteResult] = await connection.execute(
      "DELETE FROM users WHERE email = 'grossdigitalpartner@gmail.com' AND id != 1"
    );

    console.log(`✅ Deleted ${deleteResult.affectedRows} duplicate user(s) with email 'grossdigitalpartner@gmail.com'`);

    // STEP 3: Update User ID 1 with new Clerk openId
    console.log("\n📋 STEP 3: Update User ID 1 with New Clerk OpenID");
    console.log("=".repeat(80));

    const [updateOpenId] = await connection.execute(
      "UPDATE users SET openId = 'user_38APbuaH3S7VYg2GcpRJmPWZFZT' WHERE id = 1"
    );

    console.log(`✅ Updated User ID 1`);
    console.log(`   New OpenID: user_38APbuaH3S7VYg2GcpRJmPWZFZT`);

    // STEP 4: Ensure User ID 1 is superadmin
    console.log("\n📋 STEP 4: Ensure User ID 1 is Superadmin");
    console.log("=".repeat(80));

    const [updateRole] = await connection.execute(
      "UPDATE users SET role = 'superadmin' WHERE id = 1"
    );

    console.log(`✅ Updated User ID 1 role to: superadmin`);

    // STEP 5: Show result for user with email 'grossdigitalpartner@gmail.com'
    console.log("\n📋 STEP 5: Final Result (grossdigitalpartner@gmail.com)");
    console.log("=".repeat(80));

    const [finalResult] = await connection.execute(
      "SELECT id, email, role, openId FROM users WHERE email = 'grossdigitalpartner@gmail.com'"
    );

    if (finalResult.length === 0) {
      console.log("❌ No user found with email 'grossdigitalpartner@gmail.com'");
    } else {
      console.table(finalResult.map(u => ({
        ID: u.id,
        Email: u.email,
        Role: u.role,
        OpenID: u.openId
      })));
    }

    // Show all users after cleanup
    console.log("\n📋 All Users (After Cleanup)");
    console.log("=".repeat(80));

    const [allUsersAfter] = await connection.execute(
      'SELECT id, email, role, openId FROM users ORDER BY id'
    );

    console.table(allUsersAfter.map(u => ({
      ID: u.id,
      Email: u.email || 'NULL',
      Role: u.role,
      OpenID: u.openId
    })));

    console.log("\n🎉 SUCCESS! All operations completed successfully!");
    console.log("\nSummary:");
    console.log(`  ✅ Deleted ${deleteResult.affectedRows} duplicate user(s)`);
    console.log(`  ✅ Updated User ID 1 openId to: user_38APbuaH3S7VYg2GcpRJmPWZFZT`);
    console.log(`  ✅ Confirmed User ID 1 role: superadmin`);
    console.log(`  ✅ Total users in database: ${allUsersAfter.length}`);

  } catch (error) {
    console.error("\n❌ Error during operation:", error.message);
    throw error;
  } finally {
    await connection.end();
    console.log(`\n✅ Database connection closed`);
  }
}

// Run the script
finalUserCleanup().catch((error) => {
  console.error("\n❌ Fatal Error:", error.message);
  console.error(error.stack);
  process.exit(1);
});
