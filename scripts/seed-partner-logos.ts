#!/usr/bin/env tsx
import "dotenv/config";
import mysql from "mysql2/promise";

const logos = [
  // Presse
  {
    name: "FOCUS",
    category: "presse",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Focus_Logo.svg/200px-Focus_Logo.svg.png",
    linkUrl: "https://unternehmen.focus.de/amazon-markenaufbau.html",
    sortOrder: 1,
  },
  {
    name: "Forbes",
    category: "presse",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Forbes_logo.svg/200px-Forbes_logo.svg.png",
    linkUrl: "https://www.forbes.at/artikel/internationale-firmengruendung-optimiert",
    sortOrder: 2,
  },
  // Mitgliedschaften
  {
    name: "Swiss Startup Association",
    category: "mitgliedschaft",
    imageUrl: "https://swissstartupassociation.ch/wp-content/uploads/2021/09/SSA-Logo-1.png",
    linkUrl: "https://swissstartupassociation.ch",
    sortOrder: 1,
  },
  {
    name: "BAND Business Angels",
    category: "mitgliedschaft",
    imageUrl: "https://www.business-angels.de/wp-content/uploads/2020/06/BAND-Logo-RGB.png",
    linkUrl: "https://www.business-angels.de",
    sortOrder: 2,
  },
  // Auszeichnungen
  {
    name: "diind - Unternehmen der Zukunft",
    category: "auszeichnung",
    imageUrl: "https://placehold.co/200x200/fbbf24/713f12?text=diind+Siegel",
    linkUrl: "https://kg.angelus.group/wp-content/uploads/2025/06/URKUNDE_Unternehmen_der_Zukunft_Angelus_Managment_Beratung_und_Service.pdf",
    sortOrder: 1,
  },
];

async function seed() {
  console.log("\n🌱 Seeding partner logos...\n");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not set!");
    process.exit(1);
  }

  try {
    const connection = await mysql.createConnection(databaseUrl);
    console.log("✓ Connected to database\n");

    for (const logo of logos) {
      try {
        const [result] = await connection.execute(
          `INSERT INTO partner_logos (name, category, imageUrl, linkUrl, sortOrder, isActive)
           VALUES (?, ?, ?, ?, ?, TRUE)
           ON DUPLICATE KEY UPDATE
           imageUrl = VALUES(imageUrl),
           linkUrl = VALUES(linkUrl),
           sortOrder = VALUES(sortOrder)`,
          [logo.name, logo.category, logo.imageUrl, logo.linkUrl, logo.sortOrder]
        );
        console.log(`✓ Seeded: ${logo.name} (${logo.category})`);
      } catch (error: any) {
        console.log(`  Already exists: ${logo.name}`);
      }
    }

    await connection.end();
    console.log(`\n✅ Successfully seeded ${logos.length} partner logos!\n`);
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

seed();
