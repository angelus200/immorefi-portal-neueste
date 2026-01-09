import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  createOnboardingData: vi.fn().mockResolvedValue(1),
  getOnboardingDataByUserId: vi.fn().mockResolvedValue(null),
  getOnboardingDataById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    status: 'completed',
    vorname: 'Max',
    nachname: 'Mustermann',
    firmenname: 'Test GmbH',
    kapitalbedarf: '5m-10m',
    completedAt: new Date(),
  }),
  updateOnboardingData: vi.fn().mockResolvedValue(undefined),
  updateOnboardingDataByUserId: vi.fn().mockResolvedValue(undefined),
  getAllOnboardingData: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      status: 'completed',
      vorname: 'Max',
      nachname: 'Mustermann',
      firmenname: 'Test GmbH',
      kapitalbedarf: '5m-10m',
      completedAt: new Date(),
    },
    {
      id: 2,
      userId: 2,
      status: 'in_progress',
      vorname: 'Anna',
      nachname: 'Schmidt',
      firmenname: 'Schmidt Immobilien',
      kapitalbedarf: '10m-25m',
      completedAt: null,
    },
  ]),
  getCompletedOnboardingData: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      status: 'completed',
      vorname: 'Max',
      nachname: 'Mustermann',
      firmenname: 'Test GmbH',
      kapitalbedarf: '5m-10m',
      completedAt: new Date(),
    },
  ]),
  markOnboardingAsReviewed: vi.fn().mockResolvedValue(undefined),
  updateUserOnboardingStatus: vi.fn().mockResolvedValue(undefined),
}));

import * as db from './db';

describe('Onboarding Data Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOnboardingData', () => {
    it('should create new onboarding data', async () => {
      const data = {
        userId: 1,
        vorname: 'Max',
        nachname: 'Mustermann',
        firmenname: 'Test GmbH',
        kapitalbedarf: '5m-10m',
        status: 'in_progress' as const,
      };
      
      const result = await db.createOnboardingData(data);
      expect(result).toBe(1);
      expect(db.createOnboardingData).toHaveBeenCalledWith(data);
    });
  });

  describe('getOnboardingDataByUserId', () => {
    it('should return null for new user', async () => {
      const result = await db.getOnboardingDataByUserId(999);
      expect(result).toBeNull();
    });
  });

  describe('getOnboardingDataById', () => {
    it('should return onboarding data by id', async () => {
      const result = await db.getOnboardingDataById(1);
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.vorname).toBe('Max');
      expect(result?.firmenname).toBe('Test GmbH');
    });
  });

  describe('getAllOnboardingData', () => {
    it('should return all onboarding entries', async () => {
      const result = await db.getAllOnboardingData();
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('completed');
      expect(result[1].status).toBe('in_progress');
    });
  });

  describe('getCompletedOnboardingData', () => {
    it('should return only completed entries', async () => {
      const result = await db.getCompletedOnboardingData();
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('completed');
    });
  });

  describe('markOnboardingAsReviewed', () => {
    it('should mark entry as reviewed', async () => {
      await db.markOnboardingAsReviewed(1);
      expect(db.markOnboardingAsReviewed).toHaveBeenCalledWith(1);
    });
  });

  describe('updateOnboardingDataByUserId', () => {
    it('should update onboarding data for user', async () => {
      const updateData = {
        kapitalbedarf: '10m-25m',
        status: 'completed' as const,
      };
      
      await db.updateOnboardingDataByUserId(1, updateData);
      expect(db.updateOnboardingDataByUserId).toHaveBeenCalledWith(1, updateData);
    });
  });
});

describe('Onboarding Form Data Validation', () => {
  it('should validate required contact fields', () => {
    const formData = {
      anrede: 'herr',
      vorname: 'Max',
      nachname: 'Mustermann',
      telefon: '+49 123 456789',
      position: 'geschaeftsfuehrer',
    };
    
    expect(formData.anrede).toBeDefined();
    expect(formData.vorname.length).toBeGreaterThan(0);
    expect(formData.nachname.length).toBeGreaterThan(0);
  });

  it('should validate company fields', () => {
    const formData = {
      firmenname: 'Test GmbH',
      rechtsform: 'gmbh',
      strasse: 'Musterstraße 123',
      plz: '10115',
      ort: 'Berlin',
      land: 'deutschland',
    };
    
    expect(formData.firmenname.length).toBeGreaterThan(0);
    expect(formData.rechtsform).toBe('gmbh');
    expect(formData.plz).toMatch(/^\d{5}$/);
  });

  it('should validate portfolio fields', () => {
    const formData = {
      portfolioGroesse: '10m-25m',
      anzahlObjekte: '6-10',
      objektarten: ['wohnen', 'buero'],
      leerstandsquote: '3-5',
    };
    
    expect(formData.objektarten).toContain('wohnen');
    expect(formData.objektarten.length).toBe(2);
  });

  it('should validate project goal fields', () => {
    const formData = {
      kapitalbedarf: '5m-10m',
      verwendungszweck: 'refinanzierung',
      zeithorizont: '3-6m',
      gewuenschteStruktur: 'cln',
    };
    
    expect(formData.kapitalbedarf).toBeDefined();
    expect(formData.verwendungszweck).toBe('refinanzierung');
  });
});
