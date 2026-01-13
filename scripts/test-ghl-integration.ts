import 'dotenv/config';

// Test GoHighLevel Integration
async function testGoHighLevelIntegration() {
  console.log('🚀 Testing GoHighLevel Integration...\n');
  console.log('='.repeat(60));

  try {
    // Import the service
    const { ghlService } = await import('../server/services/gohighlevel');

    console.log('✓ GoHighLevel service imported successfully\n');

    // Test data
    const testEmail = 'test@example.com';
    const testContact = {
      email: testEmail,
      firstName: 'Test',
      lastName: 'User',
      phone: '+49123456789',
      company: 'Test Company GmbH',
    };

    // Step 1: Search for existing contact
    console.log('📧 Step 1: Searching for existing contact...');
    console.log(`   Email: ${testEmail}`);

    let contact = await ghlService.findContactByEmail(testEmail);

    if (contact) {
      console.log(`✓ Contact found: ${contact.id}`);
      console.log(`   Name: ${contact.firstName} ${contact.lastName}`);
      console.log(`   Email: ${contact.email}\n`);
    } else {
      console.log('   No existing contact found\n');

      // Step 2: Create new contact
      console.log('👤 Step 2: Creating new test contact...');
      console.log(`   Email: ${testContact.email}`);
      console.log(`   Name: ${testContact.firstName} ${testContact.lastName}`);
      console.log(`   Company: ${testContact.company}`);

      contact = await ghlService.createContact(testContact);

      if (contact) {
        console.log(`✓ Contact created successfully: ${contact.id}\n`);
      } else {
        console.error('✗ Failed to create contact\n');
        return;
      }
    }

    if (!contact) {
      console.error('✗ No contact available for testing\n');
      return;
    }

    // Step 3: Add note
    console.log('📝 Step 3: Adding test note to contact...');
    const noteBody = `
🧪 Test Note - ${new Date().toLocaleString('de-DE')}

This is a test note created by the ImmoRefi Portal test script.

Test Details:
- Contact ID: ${contact.id}
- Test Email: ${testEmail}
- Script Run: ${new Date().toISOString()}

This note was automatically created to verify the GoHighLevel API integration.
    `.trim();

    const noteSuccess = await ghlService.addContactNote(contact.id, noteBody);

    if (noteSuccess) {
      console.log('✓ Test note added successfully\n');
    } else {
      console.error('✗ Failed to add note\n');
    }

    // Step 4: Add "bauträger" tag
    console.log('🏷️  Step 4: Adding "bauträger" tag...');

    const tagSuccess = await ghlService.addContactTag(contact.id, 'bauträger');

    if (tagSuccess) {
      console.log('✓ Tag "bauträger" added successfully\n');
    } else {
      console.error('✗ Failed to add tag\n');
    }

    // Step 5: Create a test task
    console.log('📋 Step 5: Creating test task...');

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2); // Due in 2 days

    const task = await ghlService.createTask(
      contact.id,
      'Test Task - Follow Up',
      'This is a test task created by the ImmoRefi Portal integration test.\n\nPlease verify that tasks are being created correctly.',
      dueDate
    );

    if (task) {
      console.log(`✓ Task created successfully: ${task.id}`);
      console.log(`   Title: ${task.title}`);
      console.log(`   Due Date: ${dueDate.toLocaleDateString('de-DE')}\n`);
    } else {
      console.error('✗ Failed to create task\n');
    }

    // Step 6: Test processNewOrder function
    console.log('🛒 Step 6: Testing processNewOrder function...');

    const orderSuccess = await ghlService.processNewOrder({
      email: testEmail,
      name: 'Test User',
      productName: 'Test Product - Bauträger Analyse',
      amount: 997,
      currency: 'EUR',
      orderId: 99999,
      orderDate: new Date(),
    });

    if (orderSuccess) {
      console.log('✓ processNewOrder completed successfully\n');
    } else {
      console.error('✗ processNewOrder failed\n');
    }

    // Summary
    console.log('='.repeat(60));
    console.log('\n✅ GoHighLevel Integration Test Complete!\n');
    console.log('Summary:');
    console.log(`   Contact ID: ${contact.id}`);
    console.log(`   Contact Email: ${contact.email}`);
    console.log(`   All operations completed successfully`);
    console.log('\n👉 Check your GoHighLevel dashboard to verify:');
    console.log('   1. Contact exists with correct information');
    console.log('   2. Tag "bauträger" is applied');
    console.log('   3. Test notes are visible');
    console.log('   4. Task is created with correct due date');
    console.log('\n');

  } catch (error: any) {
    console.error('\n❌ Test failed with error:');
    console.error(error.message);
    if (error.response?.data) {
      console.error('\nAPI Response:');
      console.error(JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run the test
testGoHighLevelIntegration().catch(console.error);
