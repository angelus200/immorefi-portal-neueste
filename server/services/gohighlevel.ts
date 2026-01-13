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

      // Add "bauträger" tag
      await this.addContactTag(contact.id, 'bauträger');

      // Create detailed note about the order
      const noteBody = `
🛒 Neue Bestellung #${orderData.orderId}

📦 Produkt: ${orderData.productName}
💰 Betrag: ${orderData.amount} ${orderData.currency.toUpperCase()}
📅 Datum: ${orderData.orderDate.toLocaleString('de-DE')}

Automatisch erfasst über ImmoRefi Portal.
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
}

// Export singleton instance
export const ghlService = new GoHighLevelService();
