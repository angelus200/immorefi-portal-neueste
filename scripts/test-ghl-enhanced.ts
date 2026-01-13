import 'dotenv/config';

// Test enhanced GoHighLevel Integration with tags and notes
async function testEnhancedGHL() {
  console.log('🚀 Testing Enhanced GoHighLevel Integration...\n');
  console.log('='.repeat(60));

  try {
    const { ghlService } = await import('../server/services/gohighlevel');

    console.log('✓ Service imported successfully\n');

    // Test with a real order scenario
    const testEmail = 'grossdigitalpartner@gmail.com';

    console.log('📦 Test Scenario: New Order');
    console.log('   Product: Bauträger Analyse Premium');
    console.log('   Amount: €997.00');
    console.log('   Email:', testEmail, '\n');

    // Test processNewOrder with enhanced tags and notes
    const orderResult = await ghlService.processNewOrder({
      email: testEmail,
      name: 'Gross Digital Partner',
      productName: 'Bauträger Analyse Premium',
      amount: 997,
      currency: 'EUR',
      orderId: 12345,
      orderDate: new Date(),
    });

    if (orderResult) {
      console.log('\n✅ Order processed successfully!');
      console.log('\n📋 Expected Tags:');
      console.log('   ✓ bauträger (Basis-Tag)');
      console.log('   ✓ immorefi-kunde (Portal-Kunde)');
      console.log('   ✓ hat-bezahlt (Zahlungsstatus)');
      console.log('   ✓ produkt-analyse (Produkt-spezifisch)');

      console.log('\n📝 Expected Note Format:');
      console.log('   🛒 NEUE BESTELLUNG');
      console.log('   ━━━━━━━━━━━━━━━━━━━');
      console.log('   Produkt: Bauträger Analyse Premium');
      console.log('   Betrag: €997.00');
      console.log('   Bestellnummer: #12345');
      console.log('   ...');
    } else {
      console.error('\n✗ Order processing failed');
    }

    // Test other product types
    console.log('\n' + '='.repeat(60));
    console.log('\n📦 Testing Different Product Types...\n');

    const productTests = [
      { name: 'Immobilien Gutachten', expectedTag: 'produkt-gutachten' },
      { name: 'Portfolio Management', expectedTag: 'produkt-portfolio' },
      { name: 'Finanzierungsberatung', expectedTag: 'produkt-beratung' },
    ];

    for (const test of productTests) {
      console.log(`Testing: ${test.name}`);
      console.log(`   Expected tag: ${test.expectedTag}`);

      // Just log what would happen (don't create actual contacts)
      const tags: string[] = ['bauträger', 'immorefi-kunde', 'hat-bezahlt'];

      // Simulate product tag detection
      const productLower = test.name.toLowerCase();
      if (productLower.includes('gutachten')) {
        tags.push('produkt-gutachten');
      } else if (productLower.includes('portfolio')) {
        tags.push('produkt-portfolio');
      } else if (productLower.includes('beratung') || productLower.includes('finanzierung')) {
        tags.push('produkt-beratung');
      }

      console.log(`   ✓ Tags: ${tags.join(', ')}\n`);
    }

    console.log('='.repeat(60));
    console.log('\n✅ Enhanced GHL Integration Test Complete!\n');
    console.log('👉 Check GoHighLevel dashboard to verify:');
    console.log('   1. Contact has all 4 tags (bauträger, immorefi-kunde, hat-bezahlt, produkt-analyse)');
    console.log('   2. Note is formatted with proper sections and emojis');
    console.log('   3. Portal URL is included in note');
    console.log('   4. Status shows "Bezahlt ✅"');
    console.log('');

  } catch (error: any) {
    console.error('\n❌ Test failed:');
    console.error(error.message);
    if (error.response?.data) {
      console.error('\nAPI Response:');
      console.error(JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testEnhancedGHL().catch(console.error);
