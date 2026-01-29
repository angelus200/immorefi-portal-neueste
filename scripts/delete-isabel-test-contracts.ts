/**
 * Script: Delete Isabel's Test Contract Assignments
 *
 * Deletes the test contract assignments for Isabel Paustian:
 * 1. "Vertrag aus Vorlage erstellen test" - Assigned 29.1.2026
 * 2. "dtzjdtzj" - Assigned 22.1.2026
 *
 * Usage:
 *   npx tsx scripts/delete-isabel-test-contracts.ts
 */

import { getDb } from '../server/db';
import { contractAssignments, contracts, users } from '../drizzle/schema';
import { eq, and, like, or } from 'drizzle-orm';

async function deleteIsabelTestContracts() {
  console.log('🔍 Connecting to database...\n');

  const db = await getDb();
  if (!db) {
    console.error('❌ Database connection failed');
    process.exit(1);
  }

  try {
    // Step 1: Find Isabel's user ID
    console.log('📋 Step 1: Finding Isabel\'s user ID...');
    const isabelUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, 'isabel.paustian@gmx.de'));

    if (isabelUsers.length === 0) {
      console.error('❌ User isabel.paustian@gmx.de not found');
      process.exit(1);
    }

    const isabel = isabelUsers[0];
    console.log(`✅ Found user: ${isabel.name} (ID: ${isabel.id})\n`);

    // Step 2: Find Isabel's contract assignments
    console.log('📋 Step 2: Finding Isabel\'s contract assignments...');
    const assignments = await db
      .select({
        assignmentId: contractAssignments.id,
        contractId: contractAssignments.contractId,
        contractName: contracts.name,
        description: contracts.description,
        createdAt: contractAssignments.createdAt,
      })
      .from(contractAssignments)
      .innerJoin(contracts, eq(contractAssignments.contractId, contracts.id))
      .where(eq(contractAssignments.userId, isabel.id));

    console.log(`Found ${assignments.length} contract assignment(s):\n`);
    assignments.forEach((a, i) => {
      console.log(`  ${i + 1}. Assignment ID: ${a.assignmentId}`);
      console.log(`     Contract: "${a.contractName}"`);
      console.log(`     Assigned: ${a.createdAt}\n`);
    });

    // Step 3: Find test assignments to delete
    const testAssignments = assignments.filter(a =>
      a.contractName.toLowerCase().includes('test') ||
      a.contractName.toLowerCase().includes('dtzjdtzj') ||
      a.contractName === 'Vertrag aus Vorlage erstellen test'
    );

    if (testAssignments.length === 0) {
      console.log('✅ No test assignments found. Nothing to delete.');
      process.exit(0);
    }

    console.log(`🗑️  Step 3: Found ${testAssignments.length} test assignment(s) to delete:\n`);
    testAssignments.forEach((a, i) => {
      console.log(`  ${i + 1}. "${a.contractName}" (Assignment ID: ${a.assignmentId})`);
    });

    // Step 4: Delete the test assignments
    console.log('\n⚠️  Deleting test assignments...');

    for (const assignment of testAssignments) {
      await db
        .delete(contractAssignments)
        .where(eq(contractAssignments.id, assignment.assignmentId));

      console.log(`  ✓ Deleted assignment ${assignment.assignmentId}: "${assignment.contractName}"`);
    }

    // Step 5: Verify deletion
    console.log('\n📋 Step 5: Verifying deletion...');
    const remainingAssignments = await db
      .select({
        assignmentId: contractAssignments.id,
        contractName: contracts.name,
      })
      .from(contractAssignments)
      .innerJoin(contracts, eq(contractAssignments.contractId, contracts.id))
      .where(eq(contractAssignments.userId, isabel.id));

    console.log(`\n✅ Success! Isabel now has ${remainingAssignments.length} contract assignment(s):`);
    if (remainingAssignments.length > 0) {
      remainingAssignments.forEach((a, i) => {
        console.log(`  ${i + 1}. "${a.contractName}" (Assignment ID: ${a.assignmentId})`);
      });
    } else {
      console.log('  (No assignments)');
    }

    console.log('\n🎉 Done!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
deleteIsabelTestContracts();
