import 'dotenv/config';

// Test GoHighLevel Integration with real email
async function testRealContact() {
  console.log('🚀 Testing GoHighLevel with Real Contact...\n');
  console.log('='.repeat(60));

  try {
    // Import the service
    const { ghlService } = await import('../server/services/gohighlevel');

    console.log('✓ GoHighLevel service imported successfully\n');

    // Real contact data
    const realEmail = 'grossdigitalpartner@gmail.com';
    const contactData = {
      email: realEmail,
      firstName: 'Gross',
      lastName: 'Digital Partner',
      phone: '',
      company: 'Gross Digital Partner',
    };

    console.log('📧 Test Contact Data:');
    console.log(`   Email: ${realEmail}`);
    console.log(`   Name: ${contactData.firstName} ${contactData.lastName}`);
    console.log(`   Company: ${contactData.company}\n`);

    // Step 1: Create new contact (not just search)
    console.log('👤 Step 1: Creating contact in GoHighLevel...');

    const contact = await ghlService.createContact(contactData);

    if (!contact) {
      console.error('✗ Failed to create contact');
      console.log('\n💡 This might mean the contact already exists.');
      console.log('   Trying to find existing contact...\n');

      // Try to find existing contact
      const existingContact = await ghlService.findContactByEmail(realEmail);

      if (existingContact) {
        console.log(`✓ Found existing contact: ${existingContact.id}`);
        console.log(`   Name: ${existingContact.firstName || 'N/A'} ${existingContact.lastName || 'N/A'}`);
        console.log(`   Email: ${existingContact.email || realEmail}\n`);

        // Use existing contact for further steps
        await runSteps(ghlService, existingContact);
      } else {
        console.error('✗ Could not find or create contact');
        return;
      }
    } else {
      console.log(`✓ Contact created successfully!`);
      console.log(`   Contact ID: ${contact.id}`);
      console.log(`   Name: ${contact.firstName} ${contact.lastName}`);
      console.log(`   Email: ${contact.email}\n`);

      // Run further steps with new contact
      await runSteps(ghlService, contact);
    }

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

async function runSteps(ghlService: any, contact: any) {
  // Step 2: Add "bauträger" tag
  console.log('🏷️  Step 2: Adding "bauträger" tag...');

  const tagSuccess = await ghlService.addContactTag(contact.id, 'bauträger');

  if (tagSuccess) {
    console.log('✓ Tag "bauträger" added successfully\n');
  } else {
    console.error('✗ Failed to add tag\n');
  }

  // Step 3: Add test note
  console.log('📝 Step 3: Adding test note...');

  const noteBody = 'Test vom ImmoRefi Portal - 13.01.2026';
  const noteSuccess = await ghlService.addContactNote(contact.id, noteBody);

  if (noteSuccess) {
    console.log('✓ Test note added successfully\n');
  } else {
    console.error('✗ Failed to add note\n');
  }

  // Summary
  console.log('='.repeat(60));
  console.log('\n✅ Test Complete!\n');
  console.log('📋 Summary:');
  console.log(`   Contact ID: ${contact.id}`);
  console.log(`   Email: ${contact.email || 'grossdigitalpartner@gmail.com'}`);
  console.log(`   Tag: bauträger ✓`);
  console.log(`   Note: Test vom ImmoRefi Portal - 13.01.2026 ✓`);
  console.log('\n👉 Check your GoHighLevel dashboard to verify the contact.');
  console.log('');
}

// Run the test
testRealContact().catch(console.error);
