import { getDb } from "../server/db";
import { partnerLogos } from "../drizzle/schema";
import { like, or } from "drizzle-orm";

async function cleanupPartnerLogos() {
  console.log("Starting partner logos cleanup...\n");

  const db = await getDb();
  if (!db) {
    console.error("❌ Failed to connect to database");
    process.exit(1);
  }

  try {
    // 1. Delete Handelsblatt entries
    console.log("1. Deleting Handelsblatt entries...");
    const handelsblattResult = await db
      .delete(partnerLogos)
      .where(like(partnerLogos.name, "%Handelsblatt%"));
    console.log(`   ✓ Deleted ${handelsblattResult.rowsAffected || 0} Handelsblatt entries\n`);

    // 2. Delete Manager Magazin entries
    console.log("2. Deleting Manager Magazin entries...");
    const managerResult = await db
      .delete(partnerLogos)
      .where(
        or(
          like(partnerLogos.name, "%Manager Magazin%"),
          like(partnerLogos.name, "%Manager%Magazin%")
        )
      );
    console.log(`   ✓ Deleted ${managerResult.rowsAffected || 0} Manager Magazin entries\n`);

    // 3. Update KFW logo path
    console.log("3. Updating KFW logo path...");
    const kfwResult = await db
      .update(partnerLogos)
      .set({ imageUrl: "/images/logos/presse/kfw-logo.webp" })
      .where(
        or(
          like(partnerLogos.name, "%KFW%"),
          like(partnerLogos.name, "%kfw%")
        )
      );
    console.log(`   ✓ Updated ${kfwResult.rowsAffected || 0} KFW entries\n`);

    // 4. Show all remaining logos
    console.log("4. Current partner logos:");
    const allLogos = await db
      .select({
        id: partnerLogos.id,
        name: partnerLogos.name,
        category: partnerLogos.category,
        imageUrl: partnerLogos.imageUrl,
        isActive: partnerLogos.isActive,
      })
      .from(partnerLogos);

    console.table(allLogos);

    console.log("\n✅ Cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  }
}

cleanupPartnerLogos();
