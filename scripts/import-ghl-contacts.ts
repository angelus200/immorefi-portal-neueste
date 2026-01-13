import 'dotenv/config';

// Import GHL Contacts Script
// Usage:
//   npx tsx scripts/import-ghl-contacts.ts --analyze    # Show all contacts with tag "bauträger"
//   npx tsx scripts/import-ghl-contacts.ts --import     # Import contacts to database

interface GHLContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  companyName?: string;
  tags?: string[];
  dateAdded?: string;
  customFields?: Record<string, any>;
}

interface GHLNote {
  id: string;
  body: string;
  dateAdded: string;
}

interface GHLTask {
  id: string;
  title: string;
  body?: string;
  dueDate?: string;
  completed: boolean;
}

async function fetchAllContactsWithTag(tag: string = 'bauträger'): Promise<GHLContact[]> {
  const { default: axios } = await import('axios');

  const GHL_API_KEY = process.env.GHL_API_KEY || '0b1e327e-beaa-4576-a45a-71c6c01966c7';
  const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || '0beKz0TSeMQXqUf2fDg7';
  const GHL_BASE_URL = 'https://rest.gohighlevel.com/v1';

  const client = axios.create({
    baseURL: GHL_BASE_URL,
    headers: {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });

  console.log(`[GHL] Fetching contacts with tag "${tag}"...`);

  try {
    const response = await client.get('/contacts/', {
      params: {
        locationId: GHL_LOCATION_ID,
        limit: 100, // Max per request
      },
    });

    const allContacts = response.data.contacts || [];

    // Filter contacts by tag
    const contactsWithTag = allContacts.filter((contact: GHLContact) => {
      return contact.tags && contact.tags.includes(tag);
    });

    console.log(`[GHL] Found ${contactsWithTag.length} contacts with tag "${tag}"\n`);

    return contactsWithTag;
  } catch (error: any) {
    console.error('[GHL] Error fetching contacts:', error.response?.data || error.message);
    return [];
  }
}

async function fetchContactNotes(contactId: string): Promise<GHLNote[]> {
  const { default: axios } = await import('axios');

  const GHL_API_KEY = process.env.GHL_API_KEY || '0b1e327e-beaa-4576-a45a-71c6c01966c7';
  const GHL_BASE_URL = 'https://rest.gohighlevel.com/v1';

  const client = axios.create({
    baseURL: GHL_BASE_URL,
    headers: {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  try {
    const response = await client.get(`/contacts/${contactId}/notes`);
    return response.data.notes || [];
  } catch (error: any) {
    console.error(`[GHL] Error fetching notes for ${contactId}:`, error.message);
    return [];
  }
}

async function fetchContactTasks(contactId: string): Promise<GHLTask[]> {
  const { default: axios } = await import('axios');

  const GHL_API_KEY = process.env.GHL_API_KEY || '0b1e327e-beaa-4576-a45a-71c6c01966c7';
  const GHL_BASE_URL = 'https://rest.gohighlevel.com/v1';

  const client = axios.create({
    baseURL: GHL_BASE_URL,
    headers: {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  try {
    const response = await client.get('/tasks/', {
      params: {
        contactId: contactId,
      },
    });
    return response.data.tasks || [];
  } catch (error: any) {
    // Tasks API might not be available
    return [];
  }
}

async function analyzeContacts() {
  console.log('🔍 ANALYSE-MODUS: GoHighLevel Kontakte\n');
  console.log('='.repeat(80));
  console.log('\n');

  const contacts = await fetchAllContactsWithTag('bauträger');

  if (contacts.length === 0) {
    console.log('❌ Keine Kontakte mit Tag "bauträger" gefunden.\n');
    return;
  }

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];

    console.log(`📧 Kontakt ${i + 1}/${contacts.length}`);
    console.log('─'.repeat(80));
    console.log(`   ID: ${contact.id}`);
    console.log(`   Name: ${contact.name || contact.firstName + ' ' + contact.lastName || 'N/A'}`);
    console.log(`   Email: ${contact.email}`);
    console.log(`   Phone: ${contact.phone || 'N/A'}`);
    console.log(`   Company: ${contact.companyName || 'N/A'}`);
    console.log(`   Tags: ${contact.tags?.join(', ') || 'Keine'}`);
    console.log(`   Hinzugefügt: ${contact.dateAdded || 'N/A'}`);

    // Fetch notes
    console.log('\n   📝 Notizen:');
    const notes = await fetchContactNotes(contact.id);

    if (notes.length === 0) {
      console.log('      Keine Notizen vorhanden');
    } else {
      for (const note of notes.slice(0, 3)) { // Show max 3 notes
        console.log(`      • ${note.dateAdded || 'N/A'}`);
        const preview = note.body.substring(0, 100).replace(/\n/g, ' ');
        console.log(`        ${preview}${note.body.length > 100 ? '...' : ''}`);
      }
      if (notes.length > 3) {
        console.log(`      ... und ${notes.length - 3} weitere Notizen`);
      }
    }

    // Fetch tasks
    console.log('\n   📋 Aufgaben:');
    const tasks = await fetchContactTasks(contact.id);

    if (tasks.length === 0) {
      console.log('      Keine Aufgaben vorhanden');
    } else {
      for (const task of tasks.slice(0, 3)) { // Show max 3 tasks
        const status = task.completed ? '✅' : '⏳';
        console.log(`      ${status} ${task.title}`);
        if (task.dueDate) {
          console.log(`         Fällig: ${new Date(task.dueDate).toLocaleDateString('de-DE')}`);
        }
      }
      if (tasks.length > 3) {
        console.log(`      ... und ${tasks.length - 3} weitere Aufgaben`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n');

    // Rate limiting: wait 500ms between contacts
    if (i < contacts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`\n✅ Analyse abgeschlossen: ${contacts.length} Kontakte analysiert\n`);
}

async function importContacts() {
  console.log('📥 IMPORT-MODUS: Importiere GoHighLevel Kontakte in Datenbank\n');
  console.log('='.repeat(80));
  console.log('\n');

  const contacts = await fetchAllContactsWithTag('bauträger');

  if (contacts.length === 0) {
    console.log('❌ Keine Kontakte zum Importieren gefunden.\n');
    return;
  }

  // Import database functions
  const { getDb, upsertUser, createCustomerNote } = await import('../server/db');
  const { users } = await import('../drizzle/schema');
  const { eq } = await import('drizzle-orm');

  let imported = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  let notesImported = 0;

  for (const contact of contacts) {
    try {
      if (!contact.email) {
        console.log(`⚠️  Überspringe Kontakt ${contact.name || contact.id} (keine E-Mail)`);
        skipped++;
        continue;
      }

      // Parse name
      const nameParts = (contact.name || contact.firstName || '').split(' ');
      const firstName = contact.firstName || nameParts[0] || '';
      const lastName = contact.lastName || nameParts.slice(1).join(' ') || '';

      // Check if user already exists
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      const existingUsers = await db.select().from(users).where(eq(users.email, contact.email)).limit(1);
      const isUpdate = existingUsers.length > 0;

      // Create/update user in database
      await upsertUser({
        openId: `ghl_${contact.id}`, // GHL prefix to identify imported users
        email: contact.email,
        name: contact.name || `${firstName} ${lastName}`.trim(),
        phone: contact.phone || '',
        company: contact.companyName || '',
        role: 'client', // Default role
        source: 'ghl', // Mark as GHL import
        ghlContactId: contact.id,
        lastSignedIn: new Date(),
      });

      // Get user ID for notes
      const userResult = await db.select().from(users).where(eq(users.email, contact.email)).limit(1);
      const userId = userResult[0]?.id;

      let notesCount = 0;

      if (userId) {
        // Import notes from GHL
        const notes = await fetchContactNotes(contact.id);
        notesCount = notes.length;

        for (const note of notes) {
          try {
            await createCustomerNote({
              customerId: userId,
              content: note.body,
              source: 'ghl-import',
              createdAt: note.dateAdded ? new Date(note.dateAdded) : new Date(),
            });
            notesImported++;
          } catch (noteError: any) {
            console.warn(`  ⚠️  Fehler beim Importieren einer Notiz: ${noteError.message}`);
          }
        }
      }

      if (isUpdate) {
        console.log(`✓ Aktualisiert: ${contact.email} (${contact.name || 'N/A'}) - ${notesCount} Notizen`);
        updated++;
      } else {
        console.log(`✓ Importiert: ${contact.email} (${contact.name || 'N/A'}) - ${notesCount} Notizen`);
        imported++;
      }

    } catch (error: any) {
      console.error(`✗ Fehler bei ${contact.email}:`, error.message);
      errors++;
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n✅ Import abgeschlossen:`);
  console.log(`   • ${imported} Kontakte neu importiert`);
  console.log(`   • ${updated} Kontakte aktualisiert`);
  console.log(`   • ${notesImported} Notizen importiert`);
  console.log(`   • ${skipped} übersprungen`);
  console.log(`   • ${errors} Fehler\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0];

  if (!mode || (!mode.includes('analyze') && !mode.includes('import'))) {
    console.log('Usage:');
    console.log('  npx tsx scripts/import-ghl-contacts.ts --analyze    # Analyze GHL contacts');
    console.log('  npx tsx scripts/import-ghl-contacts.ts --import     # Import to database');
    process.exit(1);
  }

  try {
    if (mode.includes('analyze')) {
      await analyzeContacts();
    } else if (mode.includes('import')) {
      await importContacts();
    }
  } catch (error: any) {
    console.error('\n❌ Fehler:', error.message);
    if (error.response?.data) {
      console.error('API Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

main().catch(console.error);
