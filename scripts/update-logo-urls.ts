/**
 * Script: Update Partner Logo URLs
 *
 * Updates imageUrl fields in partner_logos table to point to the correct files
 * in client/public/images/logos/
 *
 * Usage:
 *   npx tsx scripts/update-logo-urls.ts
 */

import { getDb } from '../server/db';
import { partnerLogos } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

// Logo mappings: name → imageUrl
const logoMappings: Record<string, { name: string; category: string; imageUrl: string }> = {
  // Presse
  'FOCUS': {
    name: 'FOCUS',
    category: 'presse',
    imageUrl: '/images/logos/presse/focus-logo.png',
  },
  'Forbes': {
    name: 'Forbes',
    category: 'presse',
    imageUrl: '/images/logos/presse/forbes-logo.png',
  },

  // Mitgliedschaften
  'Swiss Startup Association': {
    name: 'Swiss Startup Association',
    category: 'mitgliedschaft',
    imageUrl: '/images/logos/mitgliedschaften/partner-swiss-startup.png',
  },
  'BAND Business Angels': {
    name: 'BAND Business Angels',
    category: 'mitgliedschaft',
    imageUrl: '/images/logos/mitgliedschaften/partner-band.png',
  },

  // Auszeichnungen
  'diind - Unternehmen der Zukunft': {
    name: 'diind - Unternehmen der Zukunft',
    category: 'auszeichnung',
    imageUrl: '/images/logos/auszeichnungen/photo_2025-05-29_14-49-55-removebg-preview.jpeg',
  },

  // Partner
  'DUB': {
    name: 'DUB',
    category: 'partner',
    imageUrl: '/images/logos/partner/Logo_DUBbyAMBER_3000x900.svg',
  },
};

async function updateLogoUrls() {
  console.log('🔍 Connecting to database...\n');

  const db = await getDb();
  if (!db) {
    console.error('❌ Database connection failed');
    process.exit(1);
  }

  try {
    // Step 1: Show current state
    console.log('📋 Current partner_logos entries:');
    const currentLogos = await db.select().from(partnerLogos);

    if (currentLogos.length === 0) {
      console.log('  No logos found in database.\n');
    } else {
      currentLogos.forEach((logo) => {
        console.log(`  - ${logo.name} (${logo.category})`);
        console.log(`    Current imageUrl: ${logo.imageUrl}`);
        console.log(`    isActive: ${logo.isActive}\n`);
      });
    }

    // Step 2: Update existing logos
    console.log('📝 Updating logo URLs...\n');

    let updatedCount = 0;
    let createdCount = 0;

    for (const [logoName, logoData] of Object.entries(logoMappings)) {
      // Check if logo exists
      const existingLogo = currentLogos.find(
        (l) => l.name === logoData.name
      );

      if (existingLogo) {
        // Update existing logo
        await db
          .update(partnerLogos)
          .set({
            imageUrl: logoData.imageUrl,
            category: logoData.category as any,
            isActive: true,
          })
          .where(eq(partnerLogos.id, existingLogo.id));

        console.log(`  ✓ Updated: ${logoData.name}`);
        console.log(`    → ${logoData.imageUrl}`);
        updatedCount++;
      } else {
        // Create new logo
        await db.insert(partnerLogos).values({
          name: logoData.name,
          category: logoData.category as any,
          imageUrl: logoData.imageUrl,
          linkUrl: null,
          sortOrder: 0,
          isActive: true,
        });

        console.log(`  ✓ Created: ${logoData.name}`);
        console.log(`    → ${logoData.imageUrl}`);
        createdCount++;
      }
    }

    // Step 3: Show final state
    console.log(`\n📊 Summary:`);
    console.log(`  Updated: ${updatedCount}`);
    console.log(`  Created: ${createdCount}`);
    console.log(`  Total: ${updatedCount + createdCount}`);

    // Step 4: Verify
    console.log('\n✅ Verification - All logos with URLs:');
    const finalLogos = await db
      .select()
      .from(partnerLogos)
      .where(eq(partnerLogos.isActive, true));

    finalLogos.forEach((logo) => {
      console.log(`  - ${logo.name} (${logo.category})`);
      console.log(`    ${logo.imageUrl}\n`);
    });

    console.log('🎉 Logo URLs updated successfully!');
    console.log('\n💡 Next steps:');
    console.log('  1. Check admin panel: /admin/logos');
    console.log('  2. Verify images load correctly');
    console.log('  3. Check homepage for logo display\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
updateLogoUrls();
