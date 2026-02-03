import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut, storageGet } from "./storage";
import { nanoid } from "nanoid";
import { notifyOwner } from "./_core/notification";

// ============================================
// TENANT ROUTER
// ============================================

const tenantRouter = router({
  list: adminProcedure.query(async () => {
    return db.getAllTenants();
  }),
  
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return db.getTenantBySlug(input.slug);
    }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getTenantById(input.id);
    }),
  
  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
      logoUrl: z.string().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await db.createTenant(input);
      await db.createAuditLog({
        tenantId: id,
        userId: ctx.user.id,
        action: "create",
        entityType: "tenant",
        entityId: id,
        newValues: input,
      });
      return { id };
    }),
  
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      logoUrl: z.string().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      legalImprint: z.string().optional(),
      legalPrivacy: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const oldTenant = await db.getTenantById(id);
      await db.updateTenant(id, data);
      await db.createAuditLog({
        tenantId: id,
        userId: ctx.user.id,
        action: "update",
        entityType: "tenant",
        entityId: id,
        oldValues: oldTenant,
        newValues: data,
      });
      return { success: true };
    }),
});

// ============================================
// MEMBERSHIP ROUTER
// ============================================

const membershipRouter = router({
  myMemberships: protectedProcedure.query(async ({ ctx }) => {
    return db.getMembershipsByUserId(ctx.user.id);
  }),
  
  byTenant: protectedProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ input }) => {
      return db.getMembershipsByTenantId(input.tenantId);
    }),
  
  create: adminProcedure
    .input(z.object({
      userId: z.number(),
      tenantId: z.number(),
      role: z.enum(["tenant_admin", "staff", "client"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await db.createMembership(input);
      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: "create",
        entityType: "membership",
        entityId: id,
        newValues: input,
      });
      return { id };
    }),
  
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      role: z.enum(["tenant_admin", "staff", "client"]).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      await db.updateMembership(id, data);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: "update",
        entityType: "membership",
        entityId: id,
        newValues: data,
      });
      return { success: true };
    }),
});

// ============================================
// LEAD ROUTER
// ============================================

const leadRouter = router({
  list: adminProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ input }) => {
      return db.getLeadsByTenantId(input.tenantId);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number(), tenantId: z.number() }))
    .query(async ({ input }) => {
      return db.getLeadById(input.id, input.tenantId);
    }),

  create: protectedProcedure
    .input(z.object({
      tenantId: z.number(),
      name: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      capitalNeed: z.string().optional(),
      timeHorizon: z.string().optional(),
      description: z.string().optional(),
      source: z.enum(['website', 'referral', 'ghl', 'manual']).optional(),
      assignedTo: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const leadId = await db.createLead({
        ...input,
        source: input.source || 'manual',
        status: 'new' as const,
      });

      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: 'create',
        entityType: 'lead',
        entityId: leadId,
        newValues: input,
      });

      // FIX 1: Auto-sync to GoHighLevel (Portal → GHL)
      if (input.email && input.source !== 'ghl') {
        try {
          const { getGHLService } = await import('./gohighlevelService');
          const ghl = getGHLService();
          const ghlContact = await ghl.createContact({
            email: input.email,
            name: input.name,
            phone: input.phone,
            companyName: input.company,
            tags: ['lead', 'portal-auto-sync'],
          });

          if (ghlContact) {
            await db.updateLead(leadId, input.tenantId, { ghlContactId: ghlContact.id });
            console.log(`[Lead Create] Synced to GHL: ${ghlContact.id}`);
          }
        } catch (error) {
          console.error('[Lead Create] GHL sync failed:', error);
          // Don't fail lead creation if GHL sync fails
        }
      }

      return { id: leadId };
    }),

  createPublic: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      capitalNeed: z.string().optional(),
      timeHorizon: z.string().optional(),
      description: z.string().optional(),
      source: z.enum(['website', 'referral', 'ghl', 'manual']).default('website'),
      tenantId: z.number().default(1),
    }))
    .mutation(async ({ input }) => {
      const leadId = await db.createLead({
        ...input,
        status: 'new' as const,
      });

      // FIX 1: Auto-sync to GoHighLevel (Portal → GHL)
      if (input.email && input.source !== 'ghl') {
        try {
          const { getGHLService } = await import('./gohighlevelService');
          const ghl = getGHLService();
          const ghlContact = await ghl.createContact({
            email: input.email,
            name: input.name,
            phone: input.phone,
            companyName: input.company,
            tags: ['lead', 'portal-auto-sync', 'public-form'],
          });

          if (ghlContact) {
            await db.updateLead(leadId, input.tenantId, { ghlContactId: ghlContact.id });
            console.log(`[Lead CreatePublic] Synced to GHL: ${ghlContact.id}`);
          }
        } catch (error) {
          console.error('[Lead CreatePublic] GHL sync failed:', error);
          // Don't fail lead creation if GHL sync fails
        }
      }

      // No audit log for public leads (no user context)
      return { id: leadId, success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      tenantId: z.number(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      capitalNeed: z.string().optional(),
      timeHorizon: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).optional(),
      assignedTo: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, tenantId, ...data } = input;
      const oldLead = await db.getLeadById(id, tenantId);
      await db.updateLead(id, tenantId, data);
      await db.createAuditLog({
        tenantId,
        userId: ctx.user.id,
        action: 'update',
        entityType: 'lead',
        entityId: id,
        oldValues: oldLead,
        newValues: data,
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number(), tenantId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const oldLead = await db.getLeadById(input.id, input.tenantId);
      await db.deleteLead(input.id, input.tenantId);
      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: 'delete',
        entityType: 'lead',
        entityId: input.id,
        oldValues: oldLead,
      });
      return { success: true };
    }),

  convertToContact: protectedProcedure
    .input(z.object({ id: z.number(), tenantId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const lead = await db.getLeadById(input.id, input.tenantId);
      if (!lead) throw new Error('Lead not found');

      // Create contact from lead
      const contactId = await db.createContact({
        tenantId: input.tenantId,
        name: lead.name,
        email: lead.email || '',
        phone: lead.phone,
        company: lead.company,
        ghlContactId: lead.ghlContactId,
        type: 'kunde',
        notes: lead.notes,
      });

      // Update lead status and link to contact
      await db.updateLead(input.id, input.tenantId, {
        status: 'converted',
        contactId,
      });

      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: 'update',
        entityType: 'lead',
        entityId: input.id,
        newValues: { status: 'converted', contactId },
      });

      return { success: true, contactId };
    }),

  syncToGHL: protectedProcedure
    .input(z.object({ id: z.number(), tenantId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const lead = await db.getLeadById(input.id, input.tenantId);
      if (!lead) throw new Error('Lead not found');

      const { getGHLService } = await import('./gohighlevelService');
      const ghl = getGHLService();

      if (lead.ghlContactId) {
        // Update existing GHL contact
        await ghl.updateContact(lead.ghlContactId, {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          companyName: lead.company,
        });
        await ghl.addTag(lead.ghlContactId, 'lead');
      } else {
        // Create new GHL contact
        const ghlContact = await ghl.createContact({
          name: lead.name,
          email: lead.email!,
          phone: lead.phone,
          companyName: lead.company,
          tags: ['lead'],
        });

        if (ghlContact) {
          await db.updateLead(input.id, input.tenantId, {
            ghlContactId: ghlContact.id,
            lastSyncedAt: new Date(),
          });
        }
      }

      return { success: true };
    }),

  syncFromGHL: protectedProcedure
    .input(z.object({ ghlContactId: z.string(), tenantId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { getGHLService } = await import('./gohighlevelService');
      const ghl = getGHLService();

      const ghlContact = await ghl.getContactById(input.ghlContactId);
      if (!ghlContact) throw new Error('GHL contact not found');

      // Check if lead already exists
      const existingLead = await db.getLeadByGHLContactId(input.ghlContactId);

      if (existingLead) {
        // Update existing lead
        await db.updateLead(existingLead.id, input.tenantId, {
          name: ghlContact.name || '',
          email: ghlContact.email,
          phone: ghlContact.phone,
          company: ghlContact.companyName,
          lastSyncedAt: new Date(),
        });
        return { success: true, leadId: existingLead.id };
      } else {
        // Create new lead
        const leadId = await db.createLead({
          tenantId: input.tenantId,
          ghlContactId: input.ghlContactId,
          name: ghlContact.name || '',
          email: ghlContact.email,
          phone: ghlContact.phone,
          company: ghlContact.companyName,
          source: 'ghl',
          status: 'new',
          lastSyncedAt: new Date(),
        });
        return { success: true, leadId };
      }
    }),
});

// ============================================
// CONTACT ROUTER
// ============================================

const contactRouter = router({
  list: protectedProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ input }) => {
      return db.getContactsByTenantId(input.tenantId);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number(), tenantId: z.number() }))
    .query(async ({ input }) => {
      return db.getContactById(input.id, input.tenantId);
    }),

  create: protectedProcedure
    .input(z.object({
      tenantId: z.number(),
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      company: z.string().optional(),
      type: z.enum(['kunde', 'partner', 'lieferant']).optional(),
      street: z.string().optional(),
      zip: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      website: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await db.createContact({
        ...input,
        type: input.type || 'kunde',
      });
      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: 'create',
        entityType: 'contact',
        entityId: id,
        newValues: input,
      });

      // FIX 1: Auto-sync to GoHighLevel (Portal → GHL)
      try {
        const { getGHLService } = await import('./gohighlevelService');
        const ghl = getGHLService();
        const ghlContact = await ghl.createContact({
          email: input.email,
          name: input.name,
          phone: input.phone,
          companyName: input.company,
          address1: input.street,
          city: input.city,
          postalCode: input.zip,
          country: input.country,
          website: input.website,
          tags: ['kunde', 'portal-auto-sync'],
        });

        if (ghlContact) {
          await db.updateContact(id, input.tenantId, { ghlContactId: ghlContact.id });
          console.log(`[Contact Create] Synced to GHL: ${ghlContact.id}`);
        }
      } catch (error) {
        console.error('[Contact Create] GHL sync failed:', error);
        // Don't fail contact creation if GHL sync fails
      }

      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      tenantId: z.number(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      type: z.enum(['kunde', 'partner', 'lieferant']).optional(),
      street: z.string().optional(),
      zip: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      website: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, tenantId, ...data } = input;
      const oldContact = await db.getContactById(id, tenantId);
      await db.updateContact(id, tenantId, data);
      await db.createAuditLog({
        tenantId,
        userId: ctx.user.id,
        action: 'update',
        entityType: 'contact',
        entityId: id,
        oldValues: oldContact,
        newValues: data,
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number(), tenantId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const oldContact = await db.getContactById(input.id, input.tenantId);
      await db.deleteContact(input.id, input.tenantId);
      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: 'delete',
        entityType: 'contact',
        entityId: input.id,
        oldValues: oldContact,
      });
      return { success: true };
    }),

  syncToGHL: protectedProcedure
    .input(z.object({ id: z.number(), tenantId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const contact = await db.getContactById(input.id, input.tenantId);
      if (!contact) throw new Error('Contact not found');

      const { getGHLService } = await import('./gohighlevelService');
      const ghl = getGHLService();

      if (contact.ghlContactId) {
        // Update existing GHL contact
        await ghl.updateContact(contact.ghlContactId, {
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          companyName: contact.company,
          address1: contact.street,
          city: contact.city,
          postalCode: contact.zip,
          country: contact.country,
          website: contact.website,
        });
        await ghl.addTag(contact.ghlContactId, 'kunde');
      } else {
        // Create new GHL contact
        const ghlContact = await ghl.createContact({
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          companyName: contact.company,
          address1: contact.street,
          city: contact.city,
          postalCode: contact.zip,
          country: contact.country,
          website: contact.website,
          tags: ['kunde'],
        });

        if (ghlContact) {
          await db.updateContact(input.id, input.tenantId, {
            ghlContactId: ghlContact.id,
            lastSyncedAt: new Date(),
          });
        }
      }

      return { success: true };
    }),

  syncFromGHL: protectedProcedure
    .input(z.object({ ghlContactId: z.string(), tenantId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { getGHLService } = await import('./gohighlevelService');
      const ghl = getGHLService();

      const ghlContact = await ghl.getContactById(input.ghlContactId);
      if (!ghlContact) throw new Error('GHL contact not found');

      // Check if contact already exists
      const existingContact = await db.getContactByGHLContactId(input.ghlContactId);

      if (existingContact) {
        // Update existing contact
        await db.updateContact(existingContact.id, input.tenantId, {
          name: ghlContact.name || '',
          email: ghlContact.email,
          phone: ghlContact.phone,
          company: ghlContact.companyName,
          street: ghlContact.address1,
          city: ghlContact.city,
          zip: ghlContact.postalCode,
          country: ghlContact.country,
          website: ghlContact.website,
          lastSyncedAt: new Date(),
        });
        return { success: true, contactId: existingContact.id };
      } else {
        // Create new contact
        const contactId = await db.createContact({
          tenantId: input.tenantId,
          ghlContactId: input.ghlContactId,
          name: ghlContact.name || '',
          email: ghlContact.email,
          phone: ghlContact.phone,
          company: ghlContact.companyName,
          street: ghlContact.address1,
          city: ghlContact.city,
          zip: ghlContact.postalCode,
          country: ghlContact.country,
          website: ghlContact.website,
          type: 'kunde',
          lastSyncedAt: new Date(),
        });
        return { success: true, contactId };
      }
    }),
});

// ============================================
// PIPELINE ROUTER
// ============================================

const pipelineRouter = router({
  stages: protectedProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ input }) => {
      return db.getPipelineStagesByTenantId(input.tenantId);
    }),
  
  createStage: adminProcedure
    .input(z.object({
      tenantId: z.number(),
      name: z.string().min(1),
      order: z.number(),
      color: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await db.createPipelineStage(input);
      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: "create",
        entityType: "pipeline_stage",
        entityId: id,
        newValues: input,
      });
      return { id };
    }),
  
  updateStage: adminProcedure
    .input(z.object({
      id: z.number(),
      tenantId: z.number(),
      name: z.string().optional(),
      order: z.number().optional(),
      color: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, tenantId, ...data } = input;
      await db.updatePipelineStage(id, tenantId, data);
      await db.createAuditLog({
        tenantId,
        userId: ctx.user.id,
        action: "update",
        entityType: "pipeline_stage",
        entityId: id,
        newValues: data,
      });
      return { success: true };
    }),
  
  deleteStage: adminProcedure
    .input(z.object({ id: z.number(), tenantId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db.deletePipelineStage(input.id, input.tenantId);
      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: "delete",
        entityType: "pipeline_stage",
        entityId: input.id,
      });
      return { success: true };
    }),
  
  initializeDefault: adminProcedure
    .input(z.object({ tenantId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const defaultStages = [
        { name: "Neu", order: 1, color: "#6B7280" },
        { name: "Qualifiziert", order: 2, color: "#3B82F6" },
        { name: "Angebot", order: 3, color: "#F59E0B" },
        { name: "Verhandlung", order: 4, color: "#8B5CF6" },
        { name: "Gewonnen", order: 5, color: "#10B981" },
        { name: "Verloren", order: 6, color: "#EF4444" },
      ];
      
      for (const stage of defaultStages) {
        await db.createPipelineStage({
          tenantId: input.tenantId,
          ...stage,
          isDefault: true,
        });
      }
      
      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: "create",
        entityType: "pipeline_stages",
        newValues: { initialized: true },
      });
      
      return { success: true };
    }),
});

// ============================================
// DEAL ROUTER
// ============================================

const dealRouter = router({
  list: adminProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ input }) => {
      return db.getDealsByTenantId(input.tenantId);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number(), tenantId: z.number() }))
    .query(async ({ input }) => {
      return db.getDealById(input.id, input.tenantId);
    }),

  byStage: protectedProcedure
    .input(z.object({ stageId: z.number(), tenantId: z.number() }))
    .query(async ({ input }) => {
      return db.getDealsByStageId(input.stageId, input.tenantId);
    }),

  byContact: protectedProcedure
    .input(z.object({ contactId: z.number(), tenantId: z.number() }))
    .query(async ({ input }) => {
      return db.getDealsByContactId(input.contactId, input.tenantId);
    }),

  create: protectedProcedure
    .input(z.object({
      tenantId: z.number(),
      contactId: z.number().optional(),
      leadId: z.number().optional(),
      stageId: z.number(),
      name: z.string().min(1),
      value: z.number().optional(),
      currency: z.string().optional(),
      stage: z.enum(['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost']).optional(),
      probability: z.number().min(0).max(100).optional(),
      expectedCloseDate: z.date().optional(),
      assignedTo: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await db.createDeal({
        ...input,
        stage: input.stage || 'new',
        assignedTo: input.assignedTo || ctx.user.id,
      });
      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: 'create',
        entityType: 'deal',
        entityId: id,
        newValues: input,
      });
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      tenantId: z.number(),
      name: z.string().optional(),
      value: z.number().optional(),
      stageId: z.number().optional(),
      stage: z.enum(['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost']).optional(),
      probability: z.number().min(0).max(100).optional(),
      expectedCloseDate: z.date().optional(),
      assignedTo: z.number().optional(),
      notes: z.string().optional(),
      closedAt: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, tenantId, ...data } = input;
      const oldDeal = await db.getDealById(id, tenantId);
      await db.updateDeal(id, tenantId, data);
      await db.createAuditLog({
        tenantId,
        userId: ctx.user.id,
        action: 'update',
        entityType: 'deal',
        entityId: id,
        oldValues: oldDeal,
        newValues: data,
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number(), tenantId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const oldDeal = await db.getDealById(input.id, input.tenantId);
      await db.deleteDeal(input.id, input.tenantId);
      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: 'delete',
        entityType: 'deal',
        entityId: input.id,
        oldValues: oldDeal,
      });
      return { success: true };
    }),

  updateStage: protectedProcedure
    .input(z.object({
      id: z.number(),
      tenantId: z.number(),
      stageId: z.number(),
      stage: z.enum(['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost']).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const oldDeal = await db.getDealById(input.id, input.tenantId);
      await db.updateDeal(input.id, input.tenantId, {
        stageId: input.stageId,
        stage: input.stage,
      });
      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: 'move',
        entityType: 'deal',
        entityId: input.id,
        oldValues: { stageId: oldDeal?.stageId, stage: oldDeal?.stage },
        newValues: { stageId: input.stageId, stage: input.stage },
      });
      return { success: true };
    }),

  syncToGHL: protectedProcedure
    .input(z.object({ id: z.number(), tenantId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const deal = await db.getDealById(input.id, input.tenantId);
      if (!deal) throw new Error('Deal not found');

      const contact = await db.getContactById(deal.contactId, input.tenantId);
      if (!contact?.ghlContactId) {
        throw new Error('Contact must be synced to GHL first');
      }

      const { getGHLService } = await import('./gohighlevelService');
      const ghl = getGHLService();

      if (deal.ghlOpportunityId) {
        // Update existing GHL opportunity
        await ghl.updateOpportunity(deal.ghlOpportunityId, {
          name: deal.name,
          monetaryValue: deal.value,
          // Note: stage mapping would need pipeline configuration
        });
      } else {
        // Create new GHL opportunity
        // Note: This requires pipeline configuration in GHL
        const pipelines = await ghl.getPipelines();
        if (pipelines.length === 0) {
          throw new Error('No pipelines configured in GHL');
        }

        const defaultPipeline = pipelines[0];
        const firstStage = defaultPipeline.stages?.[0];

        if (!firstStage) {
          throw new Error('No stages in GHL pipeline');
        }

        const ghlOpportunity = await ghl.createOpportunity({
          name: deal.name,
          contactId: contact.ghlContactId,
          pipelineId: defaultPipeline.id,
          pipelineStageId: firstStage.id,
          monetaryValue: deal.value,
          assignedTo: deal.assignedTo?.toString(),
        });

        if (ghlOpportunity) {
          await db.updateDeal(input.id, input.tenantId, {
            ghlOpportunityId: ghlOpportunity.id,
            lastSyncedAt: new Date(),
          });
        }
      }

      return { success: true };
    }),
});

// ============================================
// TASK ROUTER
// ============================================

const taskRouter = router({
  list: protectedProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ input }) => {
      return db.getTasksByTenantId(input.tenantId);
    }),
  
  byDeal: protectedProcedure
    .input(z.object({ dealId: z.number(), tenantId: z.number() }))
    .query(async ({ input }) => {
      return db.getTasksByDealId(input.dealId, input.tenantId);
    }),
  
  create: protectedProcedure
    .input(z.object({
      tenantId: z.number(),
      dealId: z.number().optional(),
      title: z.string().min(1),
      description: z.string().optional(),
      assigneeId: z.number().optional(),
      dueAt: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await db.createTask(input);
      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: "create",
        entityType: "task",
        entityId: id,
        newValues: input,
      });
      return { id };
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      tenantId: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["todo", "in_progress", "done", "cancelled"]).optional(),
      assigneeId: z.number().optional(),
      dueAt: z.date().optional(),
      completedAt: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, tenantId, ...data } = input;
      await db.updateTask(id, tenantId, data);
      await db.createAuditLog({
        tenantId,
        userId: ctx.user.id,
        action: "update",
        entityType: "task",
        entityId: id,
        newValues: data,
      });
      return { success: true };
    }),
});

// ============================================
// FILE ROUTER
// ============================================

const fileRouter = router({
  list: protectedProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ input, ctx }) => {
      console.log('[file.list] User:', ctx.user.id, 'Role:', ctx.user.role, 'TenantId:', input.tenantId);

      const isAdmin = ctx.user.role === 'superadmin' || ctx.user.role === 'tenant_admin' || ctx.user.role === 'staff';

      if (isAdmin) {
        console.log('[file.list] Admin user - fetching all tenant files');
        // Admins see all files for the tenant
        return db.getFilesByTenantId(input.tenantId);
      } else {
        console.log('[file.list] Client user - fetching user-specific files for userId:', ctx.user.id);
        // Clients see only their own files
        const files = await db.getFilesByUserId(ctx.user.id, input.tenantId);
        console.log('[file.list] Found', files.length, 'files for user');
        return files;
      }
    }),
  
  byDeal: protectedProcedure
    .input(z.object({ dealId: z.number(), tenantId: z.number() }))
    .query(async ({ input }) => {
      return db.getFilesByDealId(input.dealId, input.tenantId);
    }),
  
  // Create file record after upload (for use with /api/upload endpoint)
  createFileRecord: protectedProcedure
    .input(z.object({
      tenantId: z.number(),
      fileName: z.string(),
      fileKey: z.string(),
      fileUrl: z.string(),
      mimeType: z.string(),
      size: z.number(),
      userId: z.number().optional(),
      dealId: z.number().optional(),
      category: z.enum(["document", "contract", "financial", "identification", "other"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const fileId = await db.createFile({
        tenantId: input.tenantId,
        userId: input.userId,
        dealId: input.dealId,
        fileName: input.fileName,
        fileKey: input.fileKey,
        mimeType: input.mimeType,
        category: input.category || "document",
        uploadedBy: ctx.user.id,
        size: input.size,
      });

      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: "upload",
        entityType: "file",
        entityId: fileId,
        newValues: { fileName: input.fileName },
      });

      // Mark firstDocument as completed in onboarding progress
      const currentStatus = await db.getUserOnboardingStatus(ctx.user.id);
      const currentProgress = currentStatus?.onboardingProgress || {};
      if (!currentProgress.firstDocument) {
        await db.updateUserOnboarding(ctx.user.id, {
          onboardingProgress: {
            ...currentProgress,
            firstDocument: true,
          },
        });
      }

      return { fileId };
    }),

  getUploadUrl: protectedProcedure
    .input(z.object({
      tenantId: z.number(),
      fileName: z.string(),
      mimeType: z.string(),
      userId: z.number().optional(), // Customer to assign file to
      dealId: z.number().optional(),
      category: z.enum(["document", "contract", "financial", "identification", "other"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Validate allowed MIME types
      const allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword', // .doc
      ];

      if (!allowedMimeTypes.includes(input.mimeType)) {
        throw new Error('Ungültiger Dateityp. Nur PDF, JPG, PNG und DOCX sind erlaubt.');
      }
      const fileKey = `tenants/${input.tenantId}/files/${nanoid()}-${input.fileName}`;
      const { url } = await storagePut(fileKey, Buffer.from(""), input.mimeType);

      const fileId = await db.createFile({
        tenantId: input.tenantId,
        userId: input.userId,
        dealId: input.dealId,
        fileName: input.fileName,
        fileKey,
        mimeType: input.mimeType,
        category: input.category || "document",
        uploadedBy: ctx.user.id,
      });

      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: "upload",
        entityType: "file",
        entityId: fileId,
        newValues: { fileName: input.fileName },
      });

      // Mark firstDocument as completed in onboarding progress
      const currentStatus = await db.getUserOnboardingStatus(ctx.user.id);
      const currentProgress = currentStatus?.onboardingProgress || {};
      if (!currentProgress.firstDocument) {
        await db.updateUserOnboarding(ctx.user.id, {
          onboardingProgress: {
            ...currentProgress,
            firstDocument: true,
          },
        });
      }

      return { fileId, uploadUrl: url, fileKey };
    }),
  
  getDownloadUrl: protectedProcedure
    .input(z.object({ id: z.number(), tenantId: z.number() }))
    .query(async ({ input, ctx }) => {
      const file = await db.getFileById(input.id, input.tenantId);
      if (!file) throw new Error("File not found");
      
      const { url } = await storageGet(file.fileKey);
      
      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: "download",
        entityType: "file",
        entityId: input.id,
      });
      
      return { url, fileName: file.fileName };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number(), tenantId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const file = await db.getFileById(input.id, input.tenantId);
      if (!file) throw new Error("File not found");

      await db.deleteFile(input.id, input.tenantId);

      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: "delete",
        entityType: "file",
        entityId: input.id,
        oldValues: { fileName: file.fileName },
      });

      return { success: true };
    }),
});

// ============================================
// AUDIT ROUTER
// ============================================

const auditRouter = router({
  list: adminProcedure
    .input(z.object({ tenantId: z.number().optional(), limit: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.role === "superadmin" && !input.tenantId) {
        return db.getAllAuditLogs(input.limit || 100);
      }
      if (input.tenantId) {
        return db.getAuditLogsByTenantId(input.tenantId, input.limit || 100);
      }
      return [];
    }),
});

// ============================================
// USER ROUTER
// ============================================

const userRouter = router({
  list: adminProcedure.query(async () => {
    return db.getAllUsers();
  }),

  // Get staff/admins for message recipients (available to all authenticated users)
  listStaff: protectedProcedure.query(async () => {
    const allUsers = await db.getAllUsers();
    return allUsers.filter(u =>
      u.role === 'superadmin' ||
      u.role === 'tenant_admin' ||
      u.role === 'staff'
    );
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getUserById(input.id);
    }),

  updatePreferences: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      emailNotifications: z.boolean().optional(),
      marketingEmails: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Update name if provided
      if (input.name !== undefined) {
        await db.updateUser(ctx.user.id, { name: input.name });
      }

      // Update preferences
      const { name, ...preferences } = input;
      await db.updateUserPreferences(ctx.user.id, preferences);

      // Mark profile as completed in onboarding progress
      const currentStatus = await db.getUserOnboardingStatus(ctx.user.id);
      const currentProgress = currentStatus?.onboardingProgress || {};
      await db.updateUserOnboarding(ctx.user.id, {
        onboardingProgress: {
          ...currentProgress,
          profileCompleted: true,
        },
      });

      return { success: true };
    }),

  completeOnboarding: protectedProcedure
    .input(z.object({
      // Step 1: Kontaktdaten
      anrede: z.string().optional(),
      titel: z.string().optional(),
      vorname: z.string().optional(),
      nachname: z.string().optional(),
      telefon: z.string().optional(),
      position: z.string().optional(),
      // Step 2: Unternehmen
      firmenname: z.string().optional(),
      rechtsform: z.string().optional(),
      gruendungsjahr: z.string().optional(),
      handelsregister: z.string().optional(),
      umsatzsteuerID: z.string().optional(),
      strasse: z.string().optional(),
      plz: z.string().optional(),
      ort: z.string().optional(),
      land: z.string().optional(),
      website: z.string().optional(),
      // Step 3: Immobilienportfolio
      portfolioGroesse: z.string().optional(),
      anzahlObjekte: z.string().optional(),
      objektarten: z.array(z.string()).optional(),
      standorte: z.string().optional(),
      gesamtmietflaeche: z.string().optional(),
      leerstandsquote: z.string().optional(),
      durchschnittlicheMietrendite: z.string().optional(),
      // Step 4: Finanzierung
      aktuelleFinanzierungen: z.string().optional(),
      durchschnittlicherZinssatz: z.string().optional(),
      restlaufzeiten: z.string().optional(),
      tilgungsstruktur: z.string().optional(),
      sicherheiten: z.string().optional(),
      bankbeziehungen: z.string().optional(),
      // Step 5: Projektziele
      kapitalbedarf: z.string().optional(),
      verwendungszweck: z.string().optional(),
      zeithorizont: z.string().optional(),
      gewuenschteStruktur: z.string().optional(),
      investorentyp: z.string().optional(),
      projektbeschreibung: z.string().optional(),
      besondereAnforderungen: z.string().optional(),
      // Step 6: Zustimmungen
      agbAkzeptiert: z.boolean(),
      datenschutzAkzeptiert: z.boolean(),
    }).optional())
    .mutation(async ({ ctx, input }) => {
      // Validate required fields
      if (!input) {
        throw new Error('Onboarding-Daten sind erforderlich');
      }

      // Validate mandatory consents
      if (!input.agbAkzeptiert || !input.datenschutzAkzeptiert) {
        throw new Error('AGB und Datenschutzerklärung müssen akzeptiert werden');
      }

      // Speichere Onboarding-Daten
      const existingData = await db.getOnboardingDataByUserId(ctx.user.id);
      if (existingData) {
        await db.updateOnboardingDataByUserId(ctx.user.id, {
          ...input,
          status: 'completed',
          completedAt: new Date(),
        });
      } else {
        await db.createOnboardingData({
          userId: ctx.user.id,
          ...input,
          status: 'completed',
          completedAt: new Date(),
        });
      }

      // Markiere User als onboarding completed
      await db.updateUserOnboardingStatus(ctx.user.id, true);
      
      // Benachrichtige Admin über neues Onboarding
      try {
        const { notifyOwner } = await import("./_core/notification");
        await notifyOwner({
          title: `Neues Onboarding abgeschlossen: ${input?.firmenname || ctx.user.name || 'Unbekannt'}`,
          content: `Ein neuer Kunde hat das Onboarding abgeschlossen.\n\n` +
            `Firma: ${input?.firmenname || 'Nicht angegeben'}\n` +
            `Kontakt: ${input?.vorname || ''} ${input?.nachname || ''}\n` +
            `E-Mail: ${ctx.user.email || 'Nicht angegeben'}\n` +
            `Telefon: ${input?.telefon || 'Nicht angegeben'}\n` +
            `Kapitalbedarf: ${input?.kapitalbedarf || 'Nicht angegeben'}\n\n` +
            `Bitte prüfen Sie die Onboarding-Daten im Admin-Bereich.`
        });
      } catch (e) {
        console.warn('[Onboarding] Failed to send notification:', e);
      }
      
      return { success: true };
    }),
  
  // Onboarding-Daten des aktuellen Users abrufen
  getOnboardingData: protectedProcedure
    .query(async ({ ctx }) => {
      return db.getOnboardingDataByUserId(ctx.user.id);
    }),
  
  // Onboarding-Daten speichern (Zwischenspeicherung)
  saveOnboardingData: protectedProcedure
    .input(z.object({
      anrede: z.string().optional(),
      titel: z.string().optional(),
      vorname: z.string().optional(),
      nachname: z.string().optional(),
      telefon: z.string().optional(),
      position: z.string().optional(),
      firmenname: z.string().optional(),
      rechtsform: z.string().optional(),
      gruendungsjahr: z.string().optional(),
      handelsregister: z.string().optional(),
      umsatzsteuerID: z.string().optional(),
      strasse: z.string().optional(),
      plz: z.string().optional(),
      ort: z.string().optional(),
      land: z.string().optional(),
      website: z.string().optional(),
      portfolioGroesse: z.string().optional(),
      anzahlObjekte: z.string().optional(),
      objektarten: z.array(z.string()).optional(),
      standorte: z.string().optional(),
      gesamtmietflaeche: z.string().optional(),
      leerstandsquote: z.string().optional(),
      durchschnittlicheMietrendite: z.string().optional(),
      aktuelleFinanzierungen: z.string().optional(),
      durchschnittlicherZinssatz: z.string().optional(),
      restlaufzeiten: z.string().optional(),
      tilgungsstruktur: z.string().optional(),
      sicherheiten: z.string().optional(),
      bankbeziehungen: z.string().optional(),
      kapitalbedarf: z.string().optional(),
      verwendungszweck: z.string().optional(),
      zeithorizont: z.string().optional(),
      gewuenschteStruktur: z.string().optional(),
      investorentyp: z.string().optional(),
      projektbeschreibung: z.string().optional(),
      besondereAnforderungen: z.string().optional(),
      agbAkzeptiert: z.boolean().optional(),
      datenschutzAkzeptiert: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existingData = await db.getOnboardingDataByUserId(ctx.user.id);
      if (existingData) {
        await db.updateOnboardingDataByUserId(ctx.user.id, input);
      } else {
        await db.createOnboardingData({
          userId: ctx.user.id,
          status: 'in_progress',
          ...input,
        });
      }
      return { success: true };
    }),
  
  // Dokumente für Onboarding hochladen
  uploadOnboardingDocument: protectedProcedure
    .input(z.object({
      category: z.enum([
        "jahresabschluss",
        "bwa",
        "objektliste",
        "mieterliste",
        "finanzierungen",
        "wertgutachten",
        "gesellschaftsvertrag",
        "sonstige"
      ]),
      fileName: z.string(),
      fileKey: z.string(),
      fileUrl: z.string(),
      mimeType: z.string().optional(),
      size: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Hole oder erstelle Onboarding-Daten
      let onboardingData = await db.getOnboardingDataByUserId(ctx.user.id);
      let onboardingId: number;

      if (!onboardingData) {
        onboardingId = await db.createOnboardingData({
          userId: ctx.user.id,
          status: 'in_progress',
        });
      } else {
        onboardingId = onboardingData.id;
      }

      // Save in onboarding_documents table
      const docId = await db.createOnboardingDocument({
        onboardingId,
        userId: ctx.user.id,
        category: input.category,
        fileName: input.fileName,
        fileKey: input.fileKey,
        fileUrl: input.fileUrl,
        mimeType: input.mimeType,
        size: input.size,
      });

      // ALSO save in files table so it appears in /documents
      await db.createFile({
        tenantId: ctx.user.tenantId || 1,
        userId: ctx.user.id,
        fileName: input.fileName,
        fileKey: input.fileKey,
        mimeType: input.mimeType || "application/octet-stream",
        category: "document",
        uploadedBy: ctx.user.id,
        size: input.size,
      });

      return { id: docId, success: true };
    }),
  
  // Eigene Onboarding-Dokumente abrufen
  getOnboardingDocuments: protectedProcedure
    .query(async ({ ctx }) => {
      return db.getOnboardingDocumentsByUserId(ctx.user.id);
    }),
  
  // Eigenes Onboarding-Dokument löschen
  deleteOnboardingDocument: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const doc = await db.getOnboardingDocumentById(input.id);
      if (!doc || doc.userId !== ctx.user.id) {
        throw new Error("Dokument nicht gefunden oder keine Berechtigung");
      }

      // Delete from onboarding_documents table
      await db.deleteOnboardingDocument(input.id);

      // ALSO delete from files table (match by fileKey)
      await db.deleteFileByKey(doc.fileKey, ctx.user.id);

      return { success: true };
    }),

  // Admin: Benutzer einladen
  inviteUser: adminProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string(),
      role: z.enum(['client', 'staff', 'tenant_admin']),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check if user with this email already exists
      const existingUser = await db.getUserByEmail(input.email);
      if (existingUser) {
        throw new Error('Ein Benutzer mit dieser E-Mail-Adresse existiert bereits');
      }

      // Generate a temporary openId (will be replaced when user signs up via Clerk/OAuth)
      const tempOpenId = `invited_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Create user in database
      await db.upsertUser({
        openId: tempOpenId,
        name: input.name,
        email: input.email,
        role: input.role as any,
        lastSignedIn: new Date(),
      });

      const newUser = await db.getUserByEmail(input.email);

      if (!newUser) {
        throw new Error('Fehler beim Erstellen des Benutzers');
      }

      // Send welcome email with login instructions
      try {
        const { sendWelcomeEmail } = await import('./emailService');
        await sendWelcomeEmail({
          customerEmail: input.email,
          customerName: input.name,
        });
      } catch (error) {
        console.error('[InviteUser] Failed to send welcome email:', error);
        // Don't throw - user was created successfully
      }

      // Create audit log
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create',
        entityType: 'user',
        entityId: newUser.id,
        newValues: {
          email: input.email,
          name: input.name,
          role: input.role,
        },
      });

      return {
        success: true,
        user: newUser,
      };
    }),

  // Admin: Benutzer aktualisieren
  updateUser: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      street: z.string().optional(),
      zip: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      website: z.string().optional(),
      status: z.enum(['active', 'inactive', 'blocked']).optional(),
      role: z.enum(['client', 'staff', 'tenant_admin', 'superadmin']).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updates } = input;

      // Check if user exists
      const existingUser = await db.getUserById(id);
      if (!existingUser) {
        throw new Error('Benutzer nicht gefunden');
      }

      // Update user
      await db.updateUser(id, updates as any);

      // Create audit log
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entityType: 'user',
        entityId: id,
        oldValues: existingUser,
        newValues: updates,
      });

      return { success: true };
    }),

  // Admin: Benutzer löschen
  deleteUser: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Check if user exists
      const existingUser = await db.getUserById(input.id);
      if (!existingUser) {
        throw new Error('Benutzer nicht gefunden');
      }

      // Prevent deleting yourself
      if (existingUser.id === ctx.user.id) {
        throw new Error('Sie können sich nicht selbst löschen');
      }

      // Delete user and related data
      await db.deleteUser(input.id);

      // Create audit log
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'delete',
        entityType: 'user',
        entityId: input.id,
        oldValues: existingUser,
      });

      return { success: true };
    }),

  // Kundennotizen abrufen
  getNotes: adminProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      return db.getCustomerNotes(input.customerId);
    }),

  // Kundennotiz hinzufügen
  addNote: adminProcedure
    .input(z.object({
      customerId: z.number(),
      content: z.string(),
      orderId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.createCustomerNote({
        customerId: input.customerId,
        content: input.content,
        orderId: input.orderId,
        source: 'admin',
        createdBy: ctx.user.id,
      });

      return { success: true };
    }),

  // Kundennotiz löschen
  deleteNote: adminProcedure
    .input(z.object({ noteId: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteCustomerNote(input.noteId);
      return { success: true };
    }),
});

// ============================================
// ADMIN ROUTER
// ============================================

const adminRouter = router({
  listUsers: adminProcedure.query(async () => {
    return db.getAllUsers();
  }),
  
  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["superadmin", "tenant_admin", "staff", "client"]),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.updateUserRole(input.userId, input.role);
      await db.createAuditLog({
        tenantId: null,
        userId: ctx.user.id,
        action: "update",
        entityType: "user",
        entityId: input.userId,
        newValues: { role: input.role },
      });
      return { success: true };
    }),
  
  getAuditLog: adminProcedure.query(async () => {
    const logs = await db.getAllAuditLogs();
    return logs.map(log => ({
      id: log.id,
      userId: log.userId,
      userName: log.userName || null,
      userEmail: log.userEmail || null,
      action: log.action,
      description: `${log.action} ${log.entityType}${log.entityId ? ` #${log.entityId}` : ''}`,
      ipAddress: log.ipAddress || null,
      createdAt: log.createdAt,
    }));
  }),
});

// ============================================
// CONTRACT ROUTER
// ============================================

const contractRouter = router({
  // Admin: Liste aller Verträge
  list: adminProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ input }) => {
      return db.getContractsByTenantId(input.tenantId);
    }),
  
  // Admin: Vertrag erstellen
  create: adminProcedure
    .input(z.object({
      tenantId: z.number(),
      name: z.string().min(1),
      type: z.enum(["analysis", "fund_structuring", "cln_amc", "mandate", "nda", "other"]),
      description: z.string().optional(),
      fileKey: z.string(),
      fileName: z.string(),
      version: z.string().optional(),
      governingLaw: z.string().optional(),
      arbitrationClause: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await db.createContract({
        ...input,
        status: "draft",
        createdBy: ctx.user.id,
      });
      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: "create",
        entityType: "contract",
        entityId: id,
        newValues: input,
      });
      return { id };
    }),
  
  // Admin: Vertrag aktualisieren
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      tenantId: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      version: z.string().optional(),
      status: z.enum(["draft", "active", "archived"]).optional(),
      governingLaw: z.string().optional(),
      arbitrationClause: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, tenantId, ...data } = input;
      const oldContract = await db.getContractById(id, tenantId);
      await db.updateContract(id, tenantId, data);
      await db.createAuditLog({
        tenantId,
        userId: ctx.user.id,
        action: "update",
        entityType: "contract",
        entityId: id,
        oldValues: oldContract,
        newValues: data,
      });
      return { success: true };
    }),
  
  // Admin: Vertrag einem Kunden zuweisen
  assign: adminProcedure
    .input(z.object({
      contractId: z.number(),
      userId: z.number(),
      tenantId: z.number(),
      note: z.string().optional(),
      dueDate: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await db.createContractAssignment({
        ...input,
        assignedBy: ctx.user.id,
      });
      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: "assign",
        entityType: "contract_assignment",
        entityId: id,
        newValues: { contractId: input.contractId, userId: input.userId },
      });
      return { id };
    }),
  
  // Admin: Zuweisungen für einen Vertrag abrufen
  getAssignments: adminProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ input }) => {
      return db.getContractAssignmentsByContractId(input.contractId);
    }),
  
  // Admin: Alle Anerkennungen abrufen
  getAcceptances: adminProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ input }) => {
      return db.getAllContractAcceptancesByTenantId(input.tenantId);
    }),
  
  // Client: Meine zugewiesenen Verträge abrufen
  myAssignments: protectedProcedure.query(async ({ ctx }) => {
    const assignments = await db.getContractAssignmentsByUserId(ctx.user.id);
    const acceptances = await db.getContractAcceptancesByUserId(ctx.user.id);
    const acceptedAssignmentIds = new Set(acceptances.map(a => a.assignmentId));
    
    // Hole die Vertragsdetails für jede Zuweisung
    const assignmentsWithContracts = await Promise.all(
      assignments.map(async (assignment) => {
        const contract = await db.getContractById(assignment.contractId, assignment.tenantId);
        const acceptance = acceptances.find(a => a.assignmentId === assignment.id);
        return {
          ...assignment,
          contract,
          isAccepted: acceptedAssignmentIds.has(assignment.id),
          acceptance,
        };
      })
    );
    
    return assignmentsWithContracts;
  }),
  
  // Client: Vertrag anerkennen (Checkbox-Bestätigung)
  accept: protectedProcedure
    .input(z.object({
      assignmentId: z.number(),
      confirmationText: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      // Hole die Zuweisung
      const assignment = await db.getContractAssignmentById(input.assignmentId);
      if (!assignment) throw new Error("Zuweisung nicht gefunden");
      if (assignment.userId !== ctx.user.id) throw new Error("Nicht autorisiert");
      
      // Prüfe ob bereits anerkannt
      const existingAcceptance = await db.getContractAcceptanceByAssignmentId(input.assignmentId);
      if (existingAcceptance) throw new Error("Vertrag wurde bereits anerkannt");
      
      // Hole den Vertrag für die Version
      const contract = await db.getContractById(assignment.contractId, assignment.tenantId);
      if (!contract) throw new Error("Vertrag nicht gefunden");
      
      // Erstelle die Anerkennung
      const id = await db.createContractAcceptance({
        assignmentId: input.assignmentId,
        contractId: assignment.contractId,
        userId: ctx.user.id,
        tenantId: assignment.tenantId,
        acceptedAt: new Date(),
        confirmationText: input.confirmationText,
        contractVersion: contract.version,
        // IP und UserAgent werden vom Context geholt (falls verfügbar)
      });
      
      await db.createAuditLog({
        tenantId: assignment.tenantId,
        userId: ctx.user.id,
        action: "create",
        entityType: "contract_acceptance",
        entityId: id,
        newValues: {
          contractId: assignment.contractId,
          contractName: contract.name,
          confirmationText: input.confirmationText,
        },
      });
      
      return { id, success: true };
    }),
  
  // Client: Download-URL für einen zugewiesenen Vertrag
  getDownloadUrl: protectedProcedure
    .input(z.object({ assignmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const assignment = await db.getContractAssignmentById(input.assignmentId);
      if (!assignment) throw new Error("Zuweisung nicht gefunden");
      if (assignment.userId !== ctx.user.id && ctx.user.role !== "superadmin" && ctx.user.role !== "tenant_admin") {
        throw new Error("Nicht autorisiert");
      }
      
      const contract = await db.getContractById(assignment.contractId, assignment.tenantId);
      if (!contract) throw new Error("Vertrag nicht gefunden");
      
      const { url } = await storageGet(contract.fileKey);
      
      await db.createAuditLog({
        tenantId: assignment.tenantId,
        userId: ctx.user.id,
        action: "download",
        entityType: "contract",
        entityId: contract.id,
      });
      
      return { url, fileName: contract.fileName };
    }),

  // Admin: Einzelnen Vertrag abrufen (BUG-031)
  getById: adminProcedure
    .input(z.object({ id: z.number(), tenantId: z.number() }))
    .query(async ({ input }) => {
      return db.getContractById(input.id, input.tenantId);
    }),

  // Admin: Vertrag aus Vorlage erstellen (BUG-030)
  createFromTemplate: adminProcedure
    .input(z.object({
      templateId: z.number(),
      tenantId: z.number(),
      userId: z.number().optional(),
      customName: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Template laden
      const template = await db.getContractTemplateById(input.templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Contract-Name generieren
      const contractName = input.customName || `${template.name} - ${new Date().toLocaleDateString('de-DE')}`;

      // Virtueller fileKey für template-basierte Contracts
      const fileKey = `template-${input.templateId}-${Date.now()}`;
      const fileName = `${contractName.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;

      // Contract erstellen
      const contractId = await db.createContract({
        tenantId: input.tenantId,
        name: contractName,
        type: 'other', // Default type
        description: `Erstellt aus Vorlage: ${template.name}`,
        fileKey,
        fileName,
        version: '1.0',
        status: 'draft',
        createdBy: ctx.user.id,
      });

      // Optional: Contract einem User zuweisen
      if (input.userId) {
        await db.createContractAssignment({
          contractId,
          userId: input.userId,
          tenantId: input.tenantId,
          assignedBy: ctx.user.id,
        });
      }

      // Audit-Log
      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: 'create',
        entityType: 'contract',
        entityId: contractId,
        newValues: { templateId: input.templateId, name: contractName },
      });

      return { id: contractId, name: contractName };
    }),

  // Admin: Delete contract assignment
  deleteAssignment: adminProcedure
    .input(z.object({
      assignmentId: z.number(),
      tenantId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get assignment before deleting for audit log
      const assignment = await db.getContractAssignmentById(input.assignmentId);
      if (!assignment) {
        throw new Error('Contract assignment not found');
      }

      // Verify tenant matches
      if (assignment.tenantId !== input.tenantId) {
        throw new Error('Not authorized to delete this assignment');
      }

      // Delete the assignment
      await db.deleteContractAssignment(input.assignmentId);

      // Create audit log
      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: 'delete',
        entityType: 'contract_assignment',
        entityId: input.assignmentId,
        oldValues: assignment,
      });

      return { success: true };
    }),
});

// ============================================
// NOTE ROUTER
// ============================================

const noteRouter = router({
  byDeal: protectedProcedure
    .input(z.object({ dealId: z.number(), tenantId: z.number() }))
    .query(async ({ input }) => {
      return db.getNotesByDealId(input.dealId, input.tenantId);
    }),
  
  create: protectedProcedure
    .input(z.object({
      tenantId: z.number(),
      dealId: z.number(),
      body: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await db.createNote({
        ...input,
        authorId: ctx.user.id,
      });
      await db.createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: "create",
        entityType: "note",
        entityId: id,
        newValues: { dealId: input.dealId },
      });
      return { id };
    }),
});

// ============================================
// ORDER ROUTER (Stripe)
// ============================================

const orderRouter = router({
  // Get current user's orders
  myOrders: protectedProcedure.query(async ({ ctx }) => {
    return db.getOrdersByUserId(ctx.user.id);
  }),
  
  // Check if user has purchased a product
  hasPurchased: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input, ctx }) => {
      return db.hasUserPurchasedProduct(ctx.user.id, input.productId);
    }),
  
  // Admin: Get all orders
  list: adminProcedure.query(async () => {
    return db.getAllOrders();
  }),

  // Admin: Get orders for a specific user
  getUserOrders: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return db.getOrdersByUserId(input.userId);
    }),

  // Admin: Mark order as paid
  markAsPaid: adminProcedure
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Get order first to verify it exists
      const order = await db.getOrderById(input.orderId);
      if (!order) {
        throw new Error('Bestellung nicht gefunden');
      }

      // Update order status to completed
      await db.updateOrder(input.orderId, {
        status: 'completed',
        paidAt: new Date(),
      });

      // Create audit log
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entityType: 'order',
        entityId: input.orderId,
        oldValues: { status: order.status, paidAt: order.paidAt },
        newValues: { status: 'completed', paidAt: new Date() },
      });

      // Mark firstOrder as completed in onboarding progress for the customer
      const currentStatus = await db.getUserOnboardingStatus(order.userId);
      const currentProgress = currentStatus?.onboardingProgress || {};
      if (!currentProgress.firstOrder) {
        await db.updateUserOnboarding(order.userId, {
          onboardingProgress: {
            ...currentProgress,
            firstOrder: true,
          },
        });
      }

      // Return updated order
      return db.getOrderById(input.orderId);
    }),

  // Create checkout session (requires login)
  createCheckout: protectedProcedure
    .input(z.object({
      productId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { stripe, PRODUCTS } = await import('./stripe');
      
      const product = PRODUCTS[input.productId as keyof typeof PRODUCTS];
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Check if already purchased
      const alreadyPurchased = await db.hasUserPurchasedProduct(ctx.user.id, input.productId);
      if (alreadyPurchased) {
        throw new Error('Sie haben dieses Produkt bereits gekauft');
      }
      
      const origin = ctx.req.headers.origin || 'http://localhost:3000';

      // Use custom success URL if defined in product, otherwise default
      const successUrl = 'successUrl' in product && product.successUrl
        ? product.successUrl
        : `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`;

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: product.currency,
              product_data: {
                name: product.name,
                description: product.description,
              },
              unit_amount: product.price,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: `${origin}/shop`,
        client_reference_id: ctx.user.id.toString(),
        customer_email: ctx.user.email || undefined,
        allow_promotion_codes: true,
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email || '',
          customer_name: ctx.user.name || '',
          product_id: input.productId,
        },
      });
      
      // Create pending order in database
      await db.createOrder({
        userId: ctx.user.id,
        stripeSessionId: session.id,
        productId: input.productId,
        productName: product.name,
        status: 'pending',
      });
      
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create',
        entityType: 'order',
        newValues: { productId: input.productId, sessionId: session.id },
      });
      
      return { url: session.url };
    }),
  
  // Guest checkout for Handbuch (no login required)
  guestCheckout: publicProcedure
    .input(z.object({
      productId: z.string(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { stripe, PRODUCTS } = await import('./stripe');
      
      // Only allow guest checkout for HANDBUCH
      if (input.productId !== 'HANDBUCH') {
        throw new Error('Gast-Checkout ist nur für das Handbuch verfügbar');
      }
      
      const product = PRODUCTS[input.productId as keyof typeof PRODUCTS];
      if (!product) {
        throw new Error('Product not found');
      }
      
      const origin = ctx.req.headers.origin || 'http://localhost:3000';
      
      // Create Stripe checkout session for guest
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: product.currency,
              product_data: {
                name: product.name,
                description: product.description,
              },
              unit_amount: product.price,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}&guest=true`,
        cancel_url: `${origin}/shop`,
        customer_email: input.email || undefined,
        allow_promotion_codes: true,
        metadata: {
          guest: 'true',
          product_id: input.productId,
        },
      });
      
      return { url: session.url };
    }),
  
  // Verify checkout success
  verifyCheckout: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { stripe } = await import('./stripe');
      
      try {
        const session = await stripe.checkout.sessions.retrieve(input.sessionId);
        
        if (session.payment_status === 'paid') {
          // Update order status
          await db.updateOrderByStripeSessionId(input.sessionId, {
            status: 'completed',
            stripePaymentIntentId: session.payment_intent as string,
            stripeCustomerId: session.customer as string,
            paidAt: new Date(),
          });

          // Mark firstOrder as completed in onboarding progress
          const currentStatus = await db.getUserOnboardingStatus(ctx.user.id);
          const currentProgress = currentStatus?.onboardingProgress || {};
          if (!currentProgress.firstOrder) {
            await db.updateUserOnboarding(ctx.user.id, {
              onboardingProgress: {
                ...currentProgress,
                firstOrder: true,
              },
            });
          }

          return { success: true, status: 'paid' };
        }
        
        return { success: false, status: session.payment_status };
      } catch (error) {
        console.error('Error verifying checkout:', error);
        return { success: false, status: 'error' };
      }
    }),
});

// ============================================
// ONBOARDING ROUTER (Admin)
// ============================================

const onboardingRouter = router({
  // Admin: Alle Onboarding-Daten abrufen
  list: adminProcedure.query(async () => {
    return db.getAllOnboardingData();
  }),
  
  // Admin: Abgeschlossene Onboarding-Daten
  listCompleted: adminProcedure.query(async () => {
    return db.getCompletedOnboardingData();
  }),
  
  // Admin: Einzelne Onboarding-Daten abrufen
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getOnboardingDataById(input.id);
    }),
  
  // Admin: Als geprüft markieren
  markAsReviewed: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.markOnboardingAsReviewed(input.id);
      return { success: true };
    }),
  
  // Admin: Dokumente eines Onboarding-Eintrags abrufen
  getDocuments: adminProcedure
    .input(z.object({ onboardingId: z.number() }))
    .query(async ({ input }) => {
      return db.getOnboardingDocumentsByOnboardingId(input.onboardingId);
    }),

  // User: Get my onboarding status
  getMyStatus: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserOnboardingStatus(ctx.user.id);
  }),

  // User: Update my onboarding status
  updateMyStatus: protectedProcedure
    .input(z.object({
      hasSeenWelcome: z.boolean().optional(),
      hasCompletedTour: z.boolean().optional(),
      onboardingProgress: z.object({
        profileCompleted: z.boolean().optional(),
        firstBooking: z.boolean().optional(),
        firstDocument: z.boolean().optional(),
        firstOrder: z.boolean().optional(),
      }).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.updateUserOnboarding(ctx.user.id, input);
      return { success: true };
    }),
});

// ============================================
// DOWNLOAD STATISTICS ROUTER
// ============================================

const downloadRouter = router({
  // Track a download
  track: publicProcedure
    .input(z.object({
      productType: z.string(),
      productName: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user?.id || null;
      const ipAddress = ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString() || null;
      const userAgent = ctx.req.headers['user-agent'] || null;
      const referrer = ctx.req.headers['referer'] || null;
      
      await db.createDownloadStat({
        userId,
        productType: input.productType,
        productName: input.productName,
        ipAddress,
        userAgent,
        referrer,
      });
      
      // Send notification to owner for handbuch downloads
      if (input.productType === 'handbuch') {
        const userName = ctx.user?.name || 'Anonymer Benutzer';
        const userEmail = ctx.user?.email || 'Keine E-Mail';
        
        notifyOwner({
          title: `Neuer Handbuch-Download`,
          content: `Das Handbuch für Immobilienprojektentwickler wurde heruntergeladen.\n\nBenutzer: ${userName}\nE-Mail: ${userEmail}\nProdukt: ${input.productName}\nZeit: ${new Date().toLocaleString('de-DE')}`,
        }).catch(err => console.warn('[Download] Failed to notify owner:', err));
      }
      
      return { success: true };
    }),
  
  // Admin: Get all download stats
  list: adminProcedure.query(async () => {
    return db.getDownloadStats();
  }),
  
  // Admin: Get download stats count
  getStats: adminProcedure.query(async () => {
    return db.getDownloadStatsCount();
  }),
  
  // Admin: Get stats by product type
  byProduct: adminProcedure
    .input(z.object({ productType: z.string() }))
    .query(async ({ input }) => {
      return db.getDownloadStatsByProduct(input.productType);
    }),
});

// ============================================
// INVOICE ROUTER (Rechnungen)
// ============================================

import * as invoiceService from './invoiceService';

const invoiceRouter = router({
  // Meine Rechnungen (für Kunden)
  myInvoices: protectedProcedure.query(async ({ ctx }) => {
    return invoiceService.getInvoicesByUserId(ctx.user.id);
  }),
  
  // Rechnung mit Positionen abrufen
  getWithItems: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ input, ctx }) => {
      const result = await invoiceService.getInvoiceWithItems(input.invoiceId);
      if (!result) return null;

      // Prüfe ob der Benutzer berechtigt ist
      const isAdmin = ctx.user.role === 'superadmin' || ctx.user.role === 'tenant_admin' || ctx.user.role === 'staff';
      const isOwner = result.invoice.userId === ctx.user.id;
      if (!isOwner && !isAdmin) {
        throw new Error('Keine Berechtigung');
      }

      return result;
    }),
  
  // Rechnung als HTML abrufen (für PDF-Generierung)
  getHtml: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ input, ctx }) => {
      const result = await invoiceService.getInvoiceWithItems(input.invoiceId);
      if (!result) throw new Error('Rechnung nicht gefunden');
      
      // Prüfe ob der Benutzer berechtigt ist
      const isAdmin = ctx.user.role === 'superadmin' || ctx.user.role === 'tenant_admin' || ctx.user.role === 'staff';
      const isOwner = result.invoice.userId === ctx.user.id;
      if (!isOwner && !isAdmin) {
        throw new Error('Keine Berechtigung');
      }

      return invoiceService.generateInvoiceHtml(result.invoice, result.items);
    }),
  
  // Admin: Alle Rechnungen
  list: adminProcedure.query(async () => {
    return invoiceService.getAllInvoices();
  }),
  
  // Admin: Manuelle Abschlagrechnung erstellen
  createInstallment: adminProcedure
    .input(z.object({
      userId: z.number().optional(),
      contractId: z.number(),
      customerName: z.string(),
      customerEmail: z.string().optional(),
      customerCompany: z.string().optional(),
      customerAddress: z.string().optional(),
      customerVatId: z.string().optional(),
      description: z.string(),
      items: z.array(z.object({
        description: z.string(),
        quantity: z.number(),
        unit: z.string().optional(),
        unitPrice: z.number(),
      })),
      installmentNumber: z.number(),
      totalInstallments: z.number(),
      vatRate: z.number().optional(),
      currency: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const invoice = await invoiceService.createInstallmentInvoice({
        ...input,
        createdBy: ctx.user.id,
      });
      
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create',
        entityType: 'invoice',
        entityId: invoice.id,
        newValues: { invoiceNumber: invoice.invoiceNumber, type: 'installment' },
      });
      
      return invoice;
    }),
  
  // Admin: Rechnungsstatus aktualisieren
  updateStatus: adminProcedure
    .input(z.object({
      invoiceId: z.number(),
      status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
      paidAt: z.date().optional(),
      paymentMethod: z.string().optional(),
      paymentReference: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await invoiceService.updateInvoiceStatus(
        input.invoiceId,
        input.status,
        {
          paidAt: input.paidAt,
          paymentMethod: input.paymentMethod,
          paymentReference: input.paymentReference,
        }
      );
      
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entityType: 'invoice',
        entityId: input.invoiceId,
        newValues: { status: input.status },
      });
      
      return { success: true };
    }),
});

// ============================================
// CHAT ROUTER
// ============================================

const chatRouter = router({
  // Get all conversations (admin sees all, customer sees their own)
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role === 'superadmin' || ctx.user.role === 'tenant_admin') {
      return db.getAllConversations('open');
    }
    return db.getConversationsByCustomer(ctx.user.id);
  }),

  // Get a specific conversation with messages
  getConversation: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input, ctx }) => {
      const conversation = await db.getConversationById(input.conversationId);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Check access: admins can see all, customers only their own
      if (
        ctx.user.role !== 'superadmin' &&
        ctx.user.role !== 'tenant_admin' &&
        conversation.customerId !== ctx.user.id
      ) {
        throw new Error('Access denied');
      }

      const messages = await db.getMessagesByConversation(input.conversationId);

      // Mark messages as read for the current user's role
      const readByRole = (ctx.user.role === 'superadmin' || ctx.user.role === 'tenant_admin') ? 'admin' : 'customer';
      await db.markConversationMessagesAsRead(input.conversationId, readByRole);

      return {
        conversation,
        messages,
      };
    }),

  // Start a new conversation or get existing one
  startConversation: protectedProcedure
    .input(z.object({ orderId: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      // Check if conversation already exists for this customer
      const existingConversations = await db.getConversationsByCustomer(ctx.user.id);

      if (input.orderId) {
        // Find conversation for specific order
        const orderConversation = existingConversations.find(c => c.orderId === input.orderId);
        if (orderConversation) {
          return orderConversation;
        }
      } else {
        // Find any open general conversation
        const generalConversation = existingConversations.find(c => !c.orderId && c.conversationStatus === 'open');
        if (generalConversation) {
          return generalConversation;
        }
      }

      // Create new conversation
      const conversation = await db.createConversation({
        customerId: ctx.user.id,
        orderId: input.orderId ?? null,
        conversationStatus: 'open',
      });

      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create',
        entityType: 'conversation',
        entityId: conversation.id,
      });

      return conversation;
    }),

  // Send a message
  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      content: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const conversation = await db.getConversationById(input.conversationId);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Check access
      if (
        ctx.user.role !== 'superadmin' &&
        ctx.user.role !== 'tenant_admin' &&
        conversation.customerId !== ctx.user.id
      ) {
        throw new Error('Access denied');
      }

      // Determine sender role
      const senderRole = (ctx.user.role === 'superadmin' || ctx.user.role === 'tenant_admin') ? 'admin' : 'customer';

      // IMPORTANT: DB column name is 'messageSenderRole' (from enum name), not 'senderRole'
      // createMessage returns just the ID (number), not the full object!
      const messageId = await db.createMessage({
        conversationId: input.conversationId,
        senderId: ctx.user.id,
        messageSenderRole: senderRole, // ✅ Matches DB column name
        content: input.content,
      });

      // Update conversation last message timestamp
      await db.updateConversationLastMessage(input.conversationId);

      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create',
        entityType: 'message',
        entityId: messageId, // ✅ Using the ID directly
      });

      return { id: messageId, conversationId: input.conversationId };
    }),

  // Get unread message count
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const forRole = (ctx.user.role === 'superadmin' || ctx.user.role === 'tenant_admin') ? 'admin' : 'customer';
    return db.getTotalUnreadMessageCount(forRole);
  }),

  // Admin: Start a conversation with a customer
  startConversationAsAdmin: adminProcedure
    .input(z.object({
      customerId: z.number(),
      message: z.string().min(1),
      orderId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check if conversation already exists for this customer
      const existingConversations = await db.getConversationsByCustomer(input.customerId);

      let conversation;
      if (input.orderId) {
        // Find conversation for specific order
        const orderConversation = existingConversations.find(c => c.orderId === input.orderId && c.conversationStatus === 'open');
        conversation = orderConversation;
      } else {
        // Find any open general conversation
        const generalConversation = existingConversations.find(c => !c.orderId && c.conversationStatus === 'open');
        conversation = generalConversation;
      }

      // Create conversation if it doesn't exist
      let conversationId: number;
      if (!conversation) {
        // createConversation returns just the ID (number), not the full object!
        conversationId = await db.createConversation({
          customerId: input.customerId,
          orderId: input.orderId ?? null,
          conversationStatus: 'open',
        });

        await db.createAuditLog({
          userId: ctx.user.id,
          action: 'create',
          entityType: 'conversation',
          entityId: conversationId,
        });

        // Fetch the full conversation object for return
        conversation = await db.getConversationById(conversationId);
      } else {
        conversationId = conversation.id;
      }

      // Send the first message
      // IMPORTANT: DB column name is 'messageSenderRole' (from enum name)
      // createMessage returns just the ID (number), not the full object!
      const messageId = await db.createMessage({
        conversationId, // ✅ Now using the actual ID
        senderId: ctx.user.id,
        messageSenderRole: 'admin',
        content: input.message,
      });

      // Update conversation last message timestamp
      await db.updateConversationLastMessage(conversationId);

      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create',
        entityType: 'message',
        entityId: messageId, // ✅ Using the ID directly
      });

      return {
        conversation,
        messageId, // Return the ID instead of trying to return non-existent object
      };
    }),

  // Admin: Close a conversation
  closeConversation: adminProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db.updateConversationStatus(input.conversationId, 'closed');

      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entityType: 'conversation',
        entityId: input.conversationId,
        newValues: { status: 'closed' },
      });

      return { success: true };
    }),
});

// ============================================
// STAFF CALENDAR ROUTER
// ============================================

const staffCalendarRouter = router({
  // List all active staff calendars (public - for booking page)
  list: publicProcedure.query(async () => {
    return db.getAllActiveStaffCalendars();
  }),

  // Get own calendar (staff only)
  getMyCalendar: protectedProcedure.query(async ({ ctx }) => {
    const calendars = await db.getStaffCalendarsByUserId(ctx.user.id);
    return calendars.length > 0 ? calendars[0] : null;
  }),

  // Upsert own calendar (staff only)
  upsert: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      calendlyUrl: z.string().url().optional(),
      avatarUrl: z.string().url().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const existing = await db.getStaffCalendarsByUserId(ctx.user.id);

      if (existing.length > 0) {
        await db.updateStaffCalendar(existing[0].id, input);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: 'update',
          entityType: 'staff_calendar',
          entityId: existing[0].id,
          newValues: input,
        });
        return { success: true, id: existing[0].id };
      } else {
        const id = await db.createStaffCalendar({
          userId: ctx.user.id,
          ...input,
        });
        await db.createAuditLog({
          userId: ctx.user.id,
          action: 'create',
          entityType: 'staff_calendar',
          entityId: id,
          newValues: input,
        });
        return { success: true, id };
      }
    }),

  // Toggle active status (staff only)
  toggle: protectedProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await db.updateStaffCalendar(input.id, { isActive: input.isActive });
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entityType: 'staff_calendar',
        entityId: input.id,
        newValues: { isActive: input.isActive },
      });
      return { success: true };
    }),
});

// ============================================
// BOOKING ROUTER
// ============================================

const bookingRouter = router({
  // List all bookings (admin)
  list: adminProcedure.query(async () => {
    return db.getAllBookings();
  }),

  // List user's bookings
  myBookings: protectedProcedure.query(async ({ ctx }) => {
    return db.getBookingsByUserId(ctx.user.id);
  }),

  // Get upcoming bookings
  upcoming: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const bookings = await db.getUpcomingBookings(ctx.user.id);
      return input?.limit ? bookings.slice(0, input.limit) : bookings;
    }),

  // Get booking by ID
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const booking = await db.getBookingById(input.id);
      if (!booking) throw new Error('Booking not found');

      // Check if user owns this booking or is admin
      const isAdmin = ctx.user.role === 'superadmin' || ctx.user.role === 'tenant_admin' || ctx.user.role === 'staff';
      if (!isAdmin && booking.userId !== ctx.user.id) {
        throw new Error('Unauthorized');
      }

      return booking;
    }),

  // Create booking
  create: protectedProcedure
    .input(z.object({
      staffCalendarId: z.number(),
      calendlyEventId: z.string().optional(),
      calendlyInviteeId: z.string().optional(),
      title: z.string().min(1),
      description: z.string().optional(),
      startTime: z.date(),
      endTime: z.date(),
      meetingUrl: z.string().url().optional(),
      customerNotes: z.string().optional(),
      status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await db.createBooking({
        userId: ctx.user.id,
        ...input,
        status: input.status || 'pending',
      });

      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create',
        entityType: 'booking',
        entityId: id,
        newValues: input,
      });

      return { success: true, id };
    }),

  // Cancel booking
  cancel: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const booking = await db.getBookingById(input.id);
      if (!booking) throw new Error('Booking not found');

      // Check if user owns this booking or is admin
      const isAdmin = ctx.user.role === 'superadmin' || ctx.user.role === 'tenant_admin' || ctx.user.role === 'staff';
      if (!isAdmin && booking.userId !== ctx.user.id) {
        throw new Error('Unauthorized');
      }

      await db.updateBooking(input.id, { status: 'cancelled' });

      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entityType: 'booking',
        entityId: input.id,
        oldValues: { status: booking.status },
        newValues: { status: 'cancelled' },
      });

      return { success: true };
    }),

  // Complete booking (admin only)
  complete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const booking = await db.getBookingById(input.id);
      if (!booking) throw new Error('Booking not found');

      await db.updateBooking(input.id, { status: 'completed' });

      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entityType: 'booking',
        entityId: input.id,
        oldValues: { status: booking.status },
        newValues: { status: 'completed' },
      });

      return { success: true };
    }),

  // Update booking status (admin only)
  updateStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']),
    }))
    .mutation(async ({ input, ctx }) => {
      const booking = await db.getBookingById(input.id);
      if (!booking) throw new Error('Booking not found');

      await db.updateBooking(input.id, { status: input.status });

      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entityType: 'booking',
        entityId: input.id,
        oldValues: { status: booking.status },
        newValues: { status: input.status },
      });

      return { success: true };
    }),
});

// ============================================
// CONTRACT TEMPLATE ROUTER
// ============================================

const contractTemplateRouter = router({
  // List all active templates
  list: publicProcedure.query(async () => {
    return db.getContractTemplates();
  }),

  // Get single template by ID
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getContractTemplateById(input.id);
    }),

  // Create new template (admin only)
  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      category: z.string().min(1),
      content: z.string().min(1),
      placeholders: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const templateId = await db.createContractTemplate(input);

      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create',
        entityType: 'contract_template',
        entityId: templateId,
        newValues: { name: input.name, category: input.category },
      });

      return { id: templateId, success: true };
    }),

  // Update template (admin only)
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      content: z.string().optional(),
      placeholders: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const template = await db.getContractTemplateById(id);
      if (!template) throw new Error('Template not found');

      await db.updateContractTemplate(id, data);

      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entityType: 'contract_template',
        entityId: id,
        oldValues: { name: template.name, category: template.category },
        newValues: data,
      });

      return { success: true };
    }),

  // Delete template (soft delete - admin only)
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const template = await db.getContractTemplateById(input.id);
      if (!template) throw new Error('Template not found');

      await db.deleteContractTemplate(input.id);

      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'delete',
        entityType: 'contract_template',
        entityId: input.id,
        oldValues: { name: template.name, isActive: true },
        newValues: { isActive: false },
      });

      return { success: true };
    }),

  // Preview template with placeholders filled
  preview: publicProcedure
    .input(z.object({
      id: z.number(),
      values: z.record(z.string(), z.string()), // key-value pairs for placeholders
    }))
    .query(async ({ input }) => {
      const template = await db.getContractTemplateById(input.id);
      if (!template) throw new Error('Template not found');

      let filledContent = template.content;

      // Replace all placeholders with provided values
      Object.entries(input.values).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        filledContent = filledContent.split(placeholder).join(value);
      });

      return {
        ...template,
        content: filledContent,
        originalContent: template.content,
      };
    }),
});

// ============================================
// VIDEO ROUTER
// ============================================

const videoRouter = router({
  // List all active videos (sorted by sortOrder)
  list: publicProcedure.query(async () => {
    return db.getVideos();
  }),

  // List all videos (admin only - includes inactive)
  listAll: adminProcedure.query(async () => {
    return db.getAllVideos();
  }),

  // Get single video by ID
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getVideoById(input.id);
    }),

  // Create new video (admin only)
  create: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      youtubeUrl: z.string().url(),
      thumbnailUrl: z.string().url().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const videoId = await db.createVideo({
        ...input,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
      });
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create',
        entityType: 'video',
        entityId: videoId,
        newValues: { title: input.title, youtubeUrl: input.youtubeUrl },
      });
      return { id: videoId, success: true };
    }),

  // Update video (admin only)
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      youtubeUrl: z.string().url().optional(),
      thumbnailUrl: z.string().url().optional().nullable(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const video = await db.getVideoById(id);
      if (!video) throw new Error('Video not found');
      await db.updateVideo(id, data);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entityType: 'video',
        entityId: id,
        oldValues: { title: video.title, youtubeUrl: video.youtubeUrl },
        newValues: data,
      });
      return { success: true };
    }),

  // Delete video (hard delete - admin only)
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const video = await db.getVideoById(input.id);
      if (!video) throw new Error('Video not found');
      await db.deleteVideo(input.id);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'delete',
        entityType: 'video',
        entityId: input.id,
        oldValues: { title: video.title, youtubeUrl: video.youtubeUrl },
        newValues: null,
      });
      return { success: true };
    }),

  // Reorder videos (admin only)
  reorder: adminProcedure
    .input(z.object({
      updates: z.array(z.object({
        id: z.number(),
        sortOrder: z.number(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.reorderVideos(input.updates);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entityType: 'video',
        entityId: 0,
        newValues: { reordered: input.updates.length },
      });
      return { success: true };
    }),
});

// ============================================
// PARTNER LOGO ROUTER
// ============================================

const partnerLogoRouter = router({
  // List all active logos (optionally filtered by category)
  list: publicProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return db.getPartnerLogos(input?.category);
    }),

  // List all logos (admin only - includes inactive)
  listAll: adminProcedure.query(async () => {
    return db.getAllPartnerLogos();
  }),

  // Get single logo by ID
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getPartnerLogoById(input.id);
    }),

  // Create new logo (admin only)
  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      category: z.enum(["presse", "mitgliedschaft", "auszeichnung", "partner"]),
      imageUrl: z.string().url(),
      linkUrl: z.string().url().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const logoId = await db.createPartnerLogo({
        ...input,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
      });
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create',
        entityType: 'partner_logo',
        entityId: logoId,
        newValues: { name: input.name, category: input.category },
      });
      return { id: logoId, success: true };
    }),

  // Update logo (admin only)
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      category: z.enum(["presse", "mitgliedschaft", "auszeichnung", "partner"]).optional(),
      imageUrl: z.string().url().optional(),
      linkUrl: z.string().url().optional().nullable(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const logo = await db.getPartnerLogoById(id);
      if (!logo) throw new Error('Logo not found');
      await db.updatePartnerLogo(id, data);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entityType: 'partner_logo',
        entityId: id,
        oldValues: { name: logo.name, category: logo.category },
        newValues: data,
      });
      return { success: true };
    }),

  // Delete logo (soft delete - admin only)
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const logo = await db.getPartnerLogoById(input.id);
      if (!logo) throw new Error('Logo not found');
      await db.deletePartnerLogo(input.id);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'delete',
        entityType: 'partner_logo',
        entityId: input.id,
        oldValues: { name: logo.name, isActive: true },
        newValues: { isActive: false },
      });
      return { success: true };
    }),

  // Reorder logos (admin only)
  reorder: adminProcedure
    .input(z.object({
      updates: z.array(z.object({
        id: z.number(),
        sortOrder: z.number(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.reorderPartnerLogos(input.updates);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entityType: 'partner_logo',
        entityId: 0,
        newValues: { reordered: input.updates.length },
      });
      return { success: true };
    }),
});

// ============================================
// RSS NEWS FEED ROUTER
// ============================================

const newsRouter = router({
  getNewsFeed: publicProcedure.query(async () => {
    try {
      const xml2js = (await import('xml2js')).default;
      const response = await fetch('https://www.baugeldzentrum.de/rss.php');

      if (!response.ok) {
        throw new Error('Failed to fetch RSS feed');
      }

      const xml = await response.text();
      const parser = new xml2js.Parser({ explicitArray: false });

      const result = await parser.parseStringPromise(xml);
      const items = result.rss?.channel?.item || [];

      // Normalize items to array if single item
      const newsItems = Array.isArray(items) ? items : [items];

      // Return last 10 news items with cleaned data
      return newsItems.slice(0, 10).map((item: any) => ({
        title: item.title || '',
        description: item.description || '',
        link: item.link || '',
        pubDate: item.pubDate || '',
        guid: item.guid?._text || item.guid || item.link || '',
      }));
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      return [];
    }
  }),
});

// ============================================
// MAIN ROUTER
// ============================================

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      // Clear Clerk session cookie
      // Note: Clerk logout is primarily handled in the frontend via signOut()
      ctx.res.clearCookie('__session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      return { success: true } as const;
    }),
  }),
  tenant: tenantRouter,
  membership: membershipRouter,
  lead: leadRouter,
  contact: contactRouter,
  pipeline: pipelineRouter,
  deal: dealRouter,
  task: taskRouter,
  file: fileRouter,
  audit: auditRouter,
  user: userRouter,
  note: noteRouter,
  contract: contractRouter,
  order: orderRouter,
  onboarding: onboardingRouter,
  admin: adminRouter,
  download: downloadRouter,
  invoice: invoiceRouter,
  chat: chatRouter,
  staffCalendar: staffCalendarRouter,
  booking: bookingRouter,
  contractTemplate: contractTemplateRouter,
  partnerLogo: partnerLogoRouter,
  video: videoRouter,
  news: newsRouter,
});

export type AppRouter = typeof appRouter;
