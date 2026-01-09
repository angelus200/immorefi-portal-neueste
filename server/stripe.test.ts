import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PRODUCTS, STRIPE_CONFIG } from './stripe';

describe('Stripe Configuration', () => {
  it('should have ANALYSIS product defined', () => {
    expect(PRODUCTS.ANALYSIS).toBeDefined();
    expect(PRODUCTS.ANALYSIS.id).toBe('analysis');
    expect(PRODUCTS.ANALYSIS.name).toBe('Analyse & Strukturierungsdiagnose');
    expect(PRODUCTS.ANALYSIS.price).toBe(299000); // €2.990,00 in cents
    expect(PRODUCTS.ANALYSIS.currency).toBe('eur');
  });

  it('should have correct product description', () => {
    expect(PRODUCTS.ANALYSIS.description).toContain('Analyse');
    expect(PRODUCTS.ANALYSIS.description).toContain('Kapitalmarktzugang');
  });

  it('should have Stripe config structure', () => {
    expect(STRIPE_CONFIG).toHaveProperty('secretKey');
    expect(STRIPE_CONFIG).toHaveProperty('publishableKey');
    expect(STRIPE_CONFIG).toHaveProperty('webhookSecret');
  });
});

describe('Product Pricing', () => {
  it('should have price in cents (€2.990 = 299000 cents)', () => {
    const priceInEuros = PRODUCTS.ANALYSIS.price / 100;
    expect(priceInEuros).toBe(2990);
  });

  it('should use EUR currency', () => {
    expect(PRODUCTS.ANALYSIS.currency).toBe('eur');
  });
});
