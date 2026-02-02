import 'dotenv/config';
import axios, { AxiosInstance } from 'axios';
import { ENV } from './_core/env';

// ============================================
// TYPES
// ============================================

export interface GHLContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  companyName?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  website?: string;
  tags?: string[];
  dateAdded?: string;
  dateUpdated?: string;
  customFields?: Record<string, any>;
}

export interface GHLNote {
  id: string;
  body: string;
  dateAdded: string;
  userId?: string;
}

export interface GHLOpportunity {
  id: string;
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  status: string;
  monetaryValue?: number;
  contactId: string;
  assignedTo?: string;
}

export interface CreateGHLContactInput {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  companyName?: string;
  address1?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  website?: string;
  tags?: string[];
}

export interface CreateGHLNoteInput {
  contactId: string;
  body: string;
}

// ============================================
// GHL SERVICE CLASS
// ============================================

export class GoHighLevelService {
  private client: AxiosInstance;
  private locationId: string;

  constructor() {
    // Use ENV with fallback to hardcoded values for backwards compatibility
    const apiKey = ENV.ghlApiKey || '0b1e327e-beaa-4576-a45a-71c6c01966c7';
    const locationId = ENV.ghlLocationId || '0beKz0TSeMQXqUf2fDg7';
    const baseURL = 'https://rest.gohighlevel.com/v1';

    this.locationId = locationId;
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  // ============================================
  // CONTACTS
  // ============================================

  /**
   * Get all contacts with a specific tag
   */
  async getContactsByTag(tag: string): Promise<GHLContact[]> {
    try {
      const response = await this.client.get('/contacts/', {
        params: {
          locationId: this.locationId,
          limit: 100,
        },
      });

      const allContacts = response.data.contacts || [];
      return allContacts.filter((contact: GHLContact) =>
        contact.tags && contact.tags.includes(tag)
      );
    } catch (error: any) {
      console.error('[GHL] Error fetching contacts by tag:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get a specific contact by ID
   */
  async getContactById(contactId: string): Promise<GHLContact | null> {
    try {
      const response = await this.client.get(`/contacts/${contactId}`, {
        params: { locationId: this.locationId },
      });
      return response.data.contact || null;
    } catch (error: any) {
      console.error('[GHL] Error fetching contact:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Create a new contact in GHL
   */
  async createContact(data: CreateGHLContactInput): Promise<GHLContact | null> {
    try {
      const response = await this.client.post('/contacts/', {
        ...data,
        locationId: this.locationId,
      });
      console.log(`[GHL] Contact created: ${data.email}`);
      return response.data.contact || null;
    } catch (error: any) {
      console.error('[GHL] Error creating contact:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update an existing contact in GHL
   */
  async updateContact(contactId: string, data: Partial<CreateGHLContactInput>): Promise<GHLContact | null> {
    try {
      const response = await this.client.put(`/contacts/${contactId}`, {
        ...data,
        locationId: this.locationId,
      });
      console.log(`[GHL] Contact updated: ${contactId}`);
      return response.data.contact || null;
    } catch (error: any) {
      console.error('[GHL] Error updating contact:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Add a tag to a contact
   */
  async addTag(contactId: string, tag: string): Promise<boolean> {
    try {
      await this.client.post(`/contacts/${contactId}/tags`, {
        tags: [tag],
      });
      console.log(`[GHL] Tag added to contact ${contactId}: ${tag}`);
      return true;
    } catch (error: any) {
      console.error('[GHL] Error adding tag:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Remove a tag from a contact
   */
  async removeTag(contactId: string, tag: string): Promise<boolean> {
    try {
      await this.client.delete(`/contacts/${contactId}/tags`, {
        data: { tags: [tag] },
      });
      console.log(`[GHL] Tag removed from contact ${contactId}: ${tag}`);
      return true;
    } catch (error: any) {
      console.error('[GHL] Error removing tag:', error.response?.data || error.message);
      return false;
    }
  }

  // ============================================
  // NOTES
  // ============================================

  /**
   * Get all notes for a contact
   */
  async getContactNotes(contactId: string): Promise<GHLNote[]> {
    try {
      const response = await this.client.get(`/contacts/${contactId}/notes`);
      return response.data.notes || [];
    } catch (error: any) {
      console.error('[GHL] Error fetching notes:', error.message);
      return [];
    }
  }

  /**
   * Create a note for a contact
   */
  async createNote(data: CreateGHLNoteInput): Promise<GHLNote | null> {
    try {
      const response = await this.client.post('/notes/', {
        ...data,
        userId: 'portal', // Identify notes created from portal
      });
      console.log(`[GHL] Note created for contact ${data.contactId}`);
      return response.data.note || null;
    } catch (error: any) {
      console.error('[GHL] Error creating note:', error.response?.data || error.message);
      return null;
    }
  }

  // ============================================
  // OPPORTUNITIES
  // ============================================

  /**
   * Get opportunities for a contact
   */
  async getContactOpportunities(contactId: string): Promise<GHLOpportunity[]> {
    try {
      const response = await this.client.get('/opportunities/', {
        params: {
          location_id: this.locationId,
          contact_id: contactId,
        },
      });
      return response.data.opportunities || [];
    } catch (error: any) {
      console.error('[GHL] Error fetching opportunities:', error.message);
      return [];
    }
  }

  /**
   * Create an opportunity (deal)
   */
  async createOpportunity(data: {
    name: string;
    contactId: string;
    pipelineId: string;
    pipelineStageId: string;
    monetaryValue?: number;
    assignedTo?: string;
  }): Promise<GHLOpportunity | null> {
    try {
      const response = await this.client.post('/opportunities/', {
        ...data,
        location_id: this.locationId,
        status: 'open',
      });
      console.log(`[GHL] Opportunity created: ${data.name}`);
      return response.data.opportunity || null;
    } catch (error: any) {
      console.error('[GHL] Error creating opportunity:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Update an opportunity
   */
  async updateOpportunity(opportunityId: string, data: {
    name?: string;
    pipelineStageId?: string;
    status?: string;
    monetaryValue?: number;
  }): Promise<GHLOpportunity | null> {
    try {
      const response = await this.client.put(`/opportunities/${opportunityId}`, data);
      console.log(`[GHL] Opportunity updated: ${opportunityId}`);
      return response.data.opportunity || null;
    } catch (error: any) {
      console.error('[GHL] Error updating opportunity:', error.response?.data || error.message);
      return null;
    }
  }

  // ============================================
  // PIPELINES
  // ============================================

  /**
   * Get all pipelines
   */
  async getPipelines(): Promise<any[]> {
    try {
      const response = await this.client.get('/pipelines/', {
        params: { locationId: this.locationId },
      });
      return response.data.pipelines || [];
    } catch (error: any) {
      console.error('[GHL] Error fetching pipelines:', error.message);
      return [];
    }
  }

  // ============================================
  // TASKS
  // ============================================

  /**
   * Get tasks for a contact
   */
  async getContactTasks(contactId: string): Promise<any[]> {
    try {
      const response = await this.client.get('/tasks/', {
        params: { contactId },
      });
      return response.data.tasks || [];
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Create a task for a contact
   */
  async createTask(data: {
    contactId: string;
    title: string;
    body?: string;
    dueDate?: Date;
  }): Promise<any | null> {
    try {
      const response = await this.client.post('/tasks/', {
        ...data,
        completed: false,
      });
      console.log(`[GHL] Task created for contact ${data.contactId}`);
      return response.data.task || null;
    } catch (error: any) {
      console.error('[GHL] Error creating task:', error.response?.data || error.message);
      return null;
    }
  }
}

// Singleton instance
let ghlServiceInstance: GoHighLevelService | null = null;

export function getGHLService(): GoHighLevelService {
  if (!ghlServiceInstance) {
    ghlServiceInstance = new GoHighLevelService();
  }
  return ghlServiceInstance;
}
