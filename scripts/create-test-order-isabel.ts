/**
 * Script: Testbestellung für Isabel anlegen
 *
 * Legt eine abgeschlossene "Analyse & Strukturierungsdiagnose" Bestellung
 * für isabel.paustian@gmx.de an.
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';

async function createTestOrder() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);

  try {
    console.log('🔍 Suche User: isabel.paustian@gmx.de ...');

    // 1. User finden
    const [userRows] = await connection.execute<any[]>(
      'SELECT id, name, email, tenantId FROM users WHERE email = ?',
      ['isabel.paustian@gmx.de']
    );

    if (!userRows || userRows.length === 0) {
      console.error('❌ User nicht gefunden!');
      console.log('\n💡 Tipp: User muss zuerst registriert sein.');
      process.exit(1);
    }

    const user = userRows[0];
    console.log(`✅ User gefunden: ${user.name} (ID: ${user.id})`);

    // 2. Prüfen ob bereits eine Analyse-Order existiert
    const [orderRows] = await connection.execute<any[]>(
      'SELECT id, productId, productName, status FROM orders WHERE userId = ?',
      [user.id]
    );

    const hasAnalysisOrder = orderRows.some((o: any) => o.productId === 'analysis');

    if (hasAnalysisOrder) {
      console.log('⚠️  User hat bereits eine Analyse-Bestellung!');
      console.log('\n📦 Bestehende Bestellungen:');
      orderRows.forEach((o: any) => {
        console.log(`   - ${o.productName} (Status: ${o.status}, ID: ${o.id})`);
      });
      console.log('\n❓ Trotzdem fortfahren? (Strg+C zum Abbrechen)');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // 3. Order anlegen
    console.log('\n📝 Erstelle Bestellung...');

    const now = new Date();
    const [insertResult] = await connection.execute<any>(
      `INSERT INTO orders
       (userId, tenantId, productId, productName, status, paidAt, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.tenantId || 1,
        'analysis',
        'Analyse & Strukturierungsdiagnose',
        'completed',
        now,
        now,
        now
      ]
    );

    const orderId = insertResult.insertId;
    console.log(`✅ Bestellung erstellt! Order ID: ${orderId}`);

    // 4. Verifizieren
    const [verifyRows] = await connection.execute<any[]>(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );

    const order = verifyRows[0];
    console.log('\n📦 Bestellung Details:');
    console.log(`   User: ${user.name} (${user.email})`);
    console.log(`   Produkt: ${order.productName}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Bezahlt am: ${new Date(order.paidAt).toLocaleString('de-DE')}`);
    console.log(`   Order ID: ${order.id}`);

    console.log('\n✨ Fertig! Isabel kann jetzt die Analyse sehen.');

  } finally {
    await connection.end();
  }
}

// Script ausführen
createTestOrder()
  .then(() => {
    console.log('\n✅ Script erfolgreich beendet');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fehler:', error);
    process.exit(1);
  });
