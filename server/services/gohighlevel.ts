import axios, { AxiosInstance } from 'axios';

// GoHighLevel API Configuration
const GHL_API_KEY = process.env.GHL_API_KEY || '0b1e327e-beaa-4576-a45a-71c6c01966c7';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || '0beKz0TSeMQXqUf2fDg7';
const GHL_BASE_URL = 'https://rest.gohighlevel.com/v1';

// Types
export interface GHLContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  companyName?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface CreateContactData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  tags?: string[];
}

export interface GHLTask {
  id: string;
  title: string;
  body?: string;
  dueDate?: string;
  contactId: string;
  completed: boolean;
}

class GoHighLevelService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: GHL_BASE_URL,
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Log initialization
    if (!GHL_API_KEY || GHL_API_KEY.includes('your-api-key')) {
      console.warn('[GHL] Warning: GoHighLevel API Key not configured properly');
    } else {
      console.log('[GHL] Service initialized with Location ID:', GHL_LOCATION_ID);
    }
  }

  /**
   * Find a contact by email address
   */
  async findContactByEmail(email: string): Promise<GHLContact | null> {
    try {
      console.log('[GHL] Searching for contact:', email);

      const response = await this.client.get('/contacts/', {
        params: {
          locationId: GHL_LOCATION_ID,
          email: email,
        },
      });

      const contacts = response.data.contacts || [];

      if (contacts.length > 0) {
        console.log('[GHL] Contact found:', contacts[0].id);
        return contacts[0];
      }

      console.log('[GHL] No contact found for email:', email);
      return null;
    } catch (error: any) {
      console.error('[GHL] Error finding contact:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Create a new contact in GoHighLevel
   */
  async createContact(data: CreateContactData): Promise<GHLContact | null> {
    try {
      console.log('[GHL] Creating contact:', data.email);

      const payload = {
        locationId: GHL_LOCATION_ID,
        email: data.email,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        name: data.firstName && data.lastName
          ? `${data.firstName} ${data.lastName}`
          : data.firstName || data.lastName || '',
        phone: data.phone || '',
        companyName: data.company || '',
        tags: data.tags || [],
      };

      const response = await this.client.post('/contacts/', payload);

      console.log('[GHL] Contact created successfully:', response.data.contact?.id);
      return response.data.contact;
    } catch (error: any) {
      console.error('[GHL] Error creating contact:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Find or create a contact (upsert operation)
   */
  async findOrCreateContact(data: CreateContactData): Promise<GHLContact | null> {
    // Try to find existing contact first
    let contact = await this.findContactByEmail(data.email);

    if (!contact) {
      // Create new contact if not found
      contact = await this.createContact(data);
    } else {
      console.log('[GHL] Using existing contact:', contact.id);
    }

    return contact;
  }

  /**
   * Add a note to a contact
   */
  async addContactNote(contactId: string, body: string): Promise<boolean> {
    try {
      console.log('[GHL] Adding note to contact:', contactId);

      await this.client.post(`/contacts/${contactId}/notes`, {
        body: body,
      });

      console.log('[GHL] Note added successfully');
      return true;
    } catch (error: any) {
      console.error('[GHL] Error adding note:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Add a tag to a contact
   */
  async addContactTag(contactId: string, tagName: string): Promise<boolean> {
    try {
      console.log('[GHL] Adding tag to contact:', contactId, tagName);

      await this.client.post(`/contacts/${contactId}/tags`, {
        tags: [tagName],
      });

      console.log('[GHL] Tag added successfully');
      return true;
    } catch (error: any) {
      console.error('[GHL] Error adding tag:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Create a task for a contact
   */
  async createTask(
    contactId: string,
    title: string,
    description?: string,
    dueDate?: Date
  ): Promise<GHLTask | null> {
    try {
      console.log('[GHL] Creating task for contact:', contactId, title);

      const payload: any = {
        contactId: contactId,
        title: title,
        completed: false,
      };

      if (description) {
        payload.body = description;
      }

      if (dueDate) {
        payload.dueDate = dueDate.toISOString();
      }

      const response = await this.client.post('/tasks/', payload);

      console.log('[GHL] Task created successfully:', response.data.id);
      return response.data;
    } catch (error: any) {
      console.error('[GHL] Error creating task:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Determine product tags based on product name
   */
  private determineProductTags(productName: string): string[] {
    const tags: string[] = [];
    const productLower = productName.toLowerCase();

    // Product mapping with keywords
    const productMapping: Record<string, string> = {
      'analyse': 'produkt-analyse',
      'gutachten': 'produkt-gutachten',
      'portfolio': 'produkt-portfolio',
      'beratung': 'produkt-beratung',
      'machbarkeit': 'produkt-analyse',
      'finanzierung': 'produkt-beratung',
    };

    // Check for matching keywords
    for (const [keyword, tag] of Object.entries(productMapping)) {
      if (productLower.includes(keyword)) {
        tags.push(tag);
        break; // Only add first matching tag
      }
    }

    // Fallback for unknown products
    if (tags.length === 0) {
      tags.push('produkt-sonstiges');
    }

    return tags;
  }

  /**
   * Process new order: Create/update contact, add tags, notes, and tasks
   */
  async processNewOrder(orderData: {
    email: string;
    name: string;
    productName: string;
    amount: number;
    currency: string;
    orderId: number;
    orderDate: Date;
  }): Promise<boolean> {
    try {
      console.log('[GHL] Processing new order for:', orderData.email);

      // Split name into first and last name
      const nameParts = orderData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Find or create contact
      const contact = await this.findOrCreateContact({
        email: orderData.email,
        firstName: firstName,
        lastName: lastName,
        company: '', // Could be extracted from onboarding data later
      });

      if (!contact) {
        console.error('[GHL] Failed to find or create contact');
        return false;
      }

      // Collect all tags to add
      const baseTags = [
        'bauträger',
        'immorefi-kunde',
        'hat-bezahlt',
      ];

      // Determine product-specific tags
      const productTags = this.determineProductTags(orderData.productName);

      // Combine all tags
      const allTags = [...baseTags, ...productTags];

      console.log('[GHL] Adding tags:', allTags.join(', '));

      // Add all tags (continue even if individual tags fail)
      for (const tag of allTags) {
        try {
          await this.addContactTag(contact.id, tag);
        } catch (tagError: any) {
          console.warn(`[GHL] Failed to add tag "${tag}":`, tagError.message);
          // Continue with next tag
        }
      }

      // Create detailed note about the order
      const noteBody = `
🛒 NEUE BESTELLUNG
━━━━━━━━━━━━━━━━━━━
Produkt: ${orderData.productName}
Betrag: €${orderData.amount.toFixed(2)}
Bestellnummer: #${orderData.orderId}
Datum: ${orderData.orderDate.toLocaleString('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

📧 Kunde: ${orderData.email}
🔗 Portal: https://portal.immoportal.app

Status: Bezahlt ✅
      `.trim();

      await this.addContactNote(contact.id, noteBody);

      // Create task for team follow-up (optional, due in 2 days)
      // This is wrapped in try-catch because task creation might fail
      // but should not prevent the order from being processed
      try {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 2);

        await this.createTask(
          contact.id,
          `Follow-up: ${orderData.productName} - ${orderData.name}`,
          `Neue Bestellung #${orderData.orderId} nachverfolgen und Kunden kontaktieren.`,
          dueDate
        );
      } catch (taskError: any) {
        console.warn('[GHL] Optional task creation failed (order will still be processed):', taskError.message);
      }

      console.log('[GHL] Order processed successfully for contact:', contact.id);
      return true;
    } catch (error: any) {
      console.error('[GHL] Error processing order:', error.message);
      return false;
    }
  }

  /**
   * Process new onboarding completion
   */
  async processOnboardingComplete(data: {
    email: string;
    name: string;
    company?: string;
    phone?: string;
    kapitalbedarf?: string;
  }): Promise<boolean> {
    try {
      console.log('[GHL] Processing onboarding completion for:', data.email);

      // Split name
      const nameParts = data.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Find or create contact
      const contact = await this.findOrCreateContact({
        email: data.email,
        firstName: firstName,
        lastName: lastName,
        phone: data.phone,
        company: data.company,
      });

      if (!contact) {
        return false;
      }

      // Add tag
      await this.addContactTag(contact.id, 'onboarding-completed');

      // Create note
      const noteBody = `
✅ Onboarding abgeschlossen

${data.company ? `🏢 Firma: ${data.company}` : ''}
${data.phone ? `📞 Telefon: ${data.phone}` : ''}
${data.kapitalbedarf ? `💰 Kapitalbedarf: ${data.kapitalbedarf}` : ''}

Automatisch erfasst über ImmoRefi Portal.
      `.trim();

      await this.addContactNote(contact.id, noteBody);

      console.log('[GHL] Onboarding processed successfully');
      return true;
    } catch (error: any) {
      console.error('[GHL] Error processing onboarding:', error.message);
      return false;
    }
  }

  /**
   * Process status update for an order
   */
  async processStatusUpdate(data: {
    email: string;
    orderId: number;
    newStatus: string;
    changedBy: string;
  }): Promise<boolean> {
    try {
      console.log('[GHL] Processing status update for:', data.email);

      // Find contact
      const contact = await this.findContactByEmail(data.email);

      if (!contact) {
        console.warn('[GHL] Contact not found for status update');
        return false;
      }

      // Create status update note
      const noteBody = `
📋 STATUS UPDATE
━━━━━━━━━━━━━━━━━━━
Bestellung #${data.orderId}
Neuer Status: ${data.newStatus}
Geändert von: ${data.changedBy}
Datum: ${new Date().toLocaleString('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
      `.trim();

      await this.addContactNote(contact.id, noteBody);

      console.log('[GHL] Status update processed successfully');
      return true;
    } catch (error: any) {
      console.error('[GHL] Error processing status update:', error.message);
      return false;
    }
  }

  /**
   * Process document upload notification
   */
  async processDocumentUpload(data: {
    email: string;
    filename: string;
    orderId?: number;
  }): Promise<boolean> {
    try {
      console.log('[GHL] Processing document upload for:', data.email);

      // Find contact
      const contact = await this.findContactByEmail(data.email);

      if (!contact) {
        console.warn('[GHL] Contact not found for document upload');
        return false;
      }

      // Create document upload note
      const noteBody = `
📄 DOKUMENT HOCHGELADEN
━━━━━━━━━━━━━━━━━━━
Datei: ${data.filename}
${data.orderId ? `Bestellung: #${data.orderId}` : ''}
Datum: ${new Date().toLocaleString('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
      `.trim();

      await this.addContactNote(contact.id, noteBody);

      console.log('[GHL] Document upload processed successfully');
      return true;
    } catch (error: any) {
      console.error('[GHL] Error processing document upload:', error.message);
      return false;
    }
  }
}

// Export singleton instance
export const ghlService = new GoHighLevelService();
