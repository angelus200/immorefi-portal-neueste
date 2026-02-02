# GoHighLevel Integration - Status Report

**Datum:** 2. Februar 2026
**Projekt:** ImmoRefi Portal
**DB:** mysql://root:BbcwfkfXkkopXkWeCbsROxQRuHLQcLKQ@metro.proxy.rlwy.net:54686/railway

---

## 📊 Übersicht

GoHighLevel (GHL) ist **teilweise integriert** mit 138 Referenzen im Code, aber **wichtige Konfiguration fehlt**.

### ✅ Was funktioniert:
- GHL Service-Klasse implementiert (server/gohighlevelService.ts)
- Quiz-Widget eingebunden (link.non-dom.group)
- CRM Sync-Funktionen vorhanden
- Stripe → GHL Integration (nach Zahlung)
- DB-Felder für ghlContactId

### ⚠️ Was fehlt/problematisch ist:
- **KEINE Environment Variables** auf Railway
- **Hardcoded API Keys** im Code
- **KEIN dedizierter GHL Webhook**
- Tenants-Tabelle leer (Multi-Tenancy nicht aktiv)

---

## 🔑 API-Konfiguration

### Aktuell verwendete Credentials:

**API Key:** `0b1e327e-beaa-4576-a45a-71c6c01966c7`
**Location ID:** `0beKz0TSeMQXqUf2fDg7`
**API Base URL:** `https://rest.gohighlevel.com/v1`

**Status:** ⚠️ **Hardcoded als Fallback-Werte** (server/gohighlevelService.ts:75-76)

```typescript
const apiKey = process.env.GHL_API_KEY || '0b1e327e-beaa-4576-a45a-71c6c01966c7';
const locationId = process.env.GHL_LOCATION_ID || '0beKz0TSeMQXqUf2fDg7';
```

### Fehlende Environment Variables:

```bash
# Diese Variablen existieren NICHT in Railway:
GHL_API_KEY=0b1e327e-beaa-4576-a45a-71c6c01966c7
GHL_LOCATION_ID=0beKz0TSeMQXqUf2fDg7
```

**Problem:** Diese Variablen sind **nicht in server/_core/env.ts definiert** und werden daher nicht von Railway geladen.

---

## 🔗 Integrierte Funktionen

### 1. Quiz-Widget (Landing Page)

**Einbindung:** client/src/pages/Home.tsx:591-597

```tsx
<iframe
  src="https://link.non-dom.group/widget/quiz/6zCsuLxQjK3cqE7TQr4L"
  style={{ width: '100%', height: '700px', border: 'none' }}
  title="Refinanzierungs-Selbsttest"
  allow="clipboard-write"
/>
```

**Status:** ✅ **Funktioniert** - Quiz ist auf Landing Page eingebunden

**URL:** https://portal.immoportal.app (Scroll zu "Refinanzierungs-Selbsttest")

---

### 2. CRM Contact Sync

**Frontend:**
- client/src/pages/crm/Contacts.tsx (Zeile 114-198)
- "Zu GHL synchronisieren" Button
- "In GHL öffnen" Link

**Backend:**
- server/routers.ts:463-509 (syncToGHL Mutation)

**Features:**
- ✅ Kontakte zu GHL pushen
- ✅ Kontakte von GHL fetchen
- ✅ Tags hinzufügen/entfernen
- ✅ Notizen erstellen
- ✅ Opportunities erstellen

**Deep Link:**
```typescript
https://app.gohighlevel.com/v2/location/0beKz0TSeMQXqUf2fDg7/contacts/detail/${ghlContactId}
```

---

### 3. CRM Lead Sync

**Frontend:**
- client/src/pages/crm/Leads.tsx (Zeile 126-208)

**Backend:**
- server/routers.ts:288-359

**Features:**
- ✅ Leads zu GHL synchronisieren
- ✅ Leads von GHL importieren
- ✅ Status-Updates

---

### 4. Stripe → GHL Integration

**Location:** server/_core/index.ts:173-188

**Flow:**
```
Stripe Payment Success
  → checkout.session.completed
  → Extract customer email
  → Create/Update GHL Contact
  → Add tag: "portal-customer"
```

**Status:** ✅ **Funktioniert** - Nach erfolgreicher Zahlung wird GHL Kontakt erstellt

**Code:**
```typescript
const { ghlService } = await import('../services/gohighlevel');
await ghlService.createOrUpdateContact({
  email: invoice.customerEmail,
  firstName: invoice.customerName?.split(' ')[0],
  lastName: invoice.customerName?.split(' ').slice(1).join(' '),
  tags: ['portal-customer', `order-${order.id}`],
});
```

---

### 5. Admin User Management

**Location:** client/src/pages/admin/Users.tsx

**Features:**
- ✅ "GHL Import" Tab
- ✅ "In GHL öffnen" Button
- ✅ GHL Contact ID Anzeige

**Tab:** Admin → Users → Tab "GHL Import" (Zeile 380)

---

## 📦 Datenbank-Schema

### contacts Tabelle:

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `ghlContactId` | varchar(64) | GHL Contact ID |

**Beispiel-Query:**
```sql
SELECT id, email, name, ghlContactId
FROM contacts
WHERE ghlContactId IS NOT NULL;
```

### leads Tabelle:

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `ghlContactId` | varchar(64) | GHL Contact ID |

**Beispiel-Query:**
```sql
SELECT id, email, companyName, ghlContactId, status
FROM leads
WHERE ghlContactId IS NOT NULL;
```

---

## 🔔 Webhooks

### Vorhandene Webhooks:

**1. Stripe Webhook**
- ✅ Endpoint: `/api/stripe/webhook`
- ✅ Events: `checkout.session.completed`, `invoice.payment_succeeded`
- ✅ Erstellt GHL Kontakte nach Zahlung

**2. Calendly Webhook**
- ✅ Endpoint: `/api/webhooks/calendly`
- ✅ Events: `invitee.created`, `invitee.canceled`

### Fehlende Webhooks:

**❌ GoHighLevel Webhook**
- **Sollte existieren:** `/api/webhooks/gohighlevel`
- **Fehlt komplett!**

**Laut Dokumentation (AdminHandbuch.tsx:1530):**
```
Webhook-URL: https://portal.immorefi.app/api/webhooks/gohighlevel
```

**Problem:** Dieser Endpoint **existiert nicht** in server/_core/index.ts!

**Use Case:**
- GHL → Portal Sync (wenn in GHL etwas geändert wird)
- Opportunity Status Updates
- Tag-Änderungen
- Contact Updates

---

## 🛠️ GHL Service API

**Datei:** server/gohighlevelService.ts (366 Zeilen)

### Implementierte Funktionen:

| Kategorie | Funktion | Status |
|-----------|----------|--------|
| **Contacts** | getContactsByTag | ✅ |
| | getContactById | ✅ |
| | createContact | ✅ |
| | updateContact | ✅ |
| | addTag | ✅ |
| | removeTag | ✅ |
| **Notes** | getContactNotes | ✅ |
| | createNote | ✅ |
| **Opportunities** | getContactOpportunities | ✅ |
| | createOpportunity | ✅ |
| | updateOpportunity | ✅ |
| **Pipelines** | getPipelines | ✅ |
| **Tasks** | getContactTasks | ✅ |
| | createTask | ✅ |

**Beispiel-Usage:**
```typescript
import { getGHLService } from './gohighlevelService';

const ghl = getGHLService();
const contact = await ghl.createContact({
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  tags: ['portal-lead'],
});
```

---

## ⚠️ Kritische Probleme

### 1. Fehlende Environment Variables

**Problem:** `GHL_API_KEY` und `GHL_LOCATION_ID` sind nicht in `server/_core/env.ts` definiert.

**Aktuell (env.ts:1-12):**
```typescript
export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  // ... KEINE GHL Variablen!
};
```

**Sollte sein:**
```typescript
export const ENV = {
  // ... existing vars
  ghlApiKey: process.env.GHL_API_KEY ?? "",
  ghlLocationId: process.env.GHL_LOCATION_ID ?? "",
};
```

**Fix:**
1. env.ts ergänzen
2. gohighlevelService.ts anpassen: `import { ENV } from './_core/env';`
3. Railway ENV-Variablen setzen

---

### 2. Fehlender GHL Webhook-Endpoint

**Problem:** Dokumentation erwähnt `/api/webhooks/gohighlevel`, aber Endpoint existiert nicht.

**Sollte implementiert werden:**
```typescript
app.post('/api/webhooks/gohighlevel', express.json(), async (req, res) => {
  try {
    const { event, contact, opportunity } = req.body;

    // Handle different event types
    switch (event) {
      case 'contact.updated':
        // Update local contact
        break;
      case 'opportunity.status_changed':
        // Update deal status
        break;
      case 'tag.added':
      case 'tag.removed':
        // Sync tags
        break;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[GHL Webhook] Error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});
```

**GHL Webhook konfigurieren in GoHighLevel:**
```
URL: https://portal.immoportal.app/api/webhooks/gohighlevel
Events:
  - Contact Created
  - Contact Updated
  - Opportunity Status Changed
  - Tag Added
  - Tag Removed
```

---

### 3. Hardcoded Location ID im Frontend

**Problem:** Location ID ist an 2 Stellen hardcoded:

**client/src/pages/crm/Contacts.tsx:202**
```typescript
const ghlUrl = `https://app.gohighlevel.com/v2/location/0beKz0TSeMQXqUf2fDg7/contacts/detail/${ghlContactId}`;
```

**client/src/pages/admin/Users.tsx:300**
```typescript
const ghlUrl = `https://app.gohighlevel.com/v2/location/0beKz0TSeMQXqUf2fDg7/contacts/detail/${ghlContactId}`;
```

**Fix:** Location ID als ENV-Variable oder von Backend API fetchen

---

### 4. Keine Tenant-Konfiguration

**Problem:** `tenants` Tabelle ist leer.

**Implikationen:**
- Multi-Tenancy nicht aktiv
- GHL Config kann nicht pro Tenant konfiguriert werden
- Alle Nutzer teilen sich dieselbe GHL Location

**Sollte existieren:**
```sql
CREATE TABLE tenants (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  ghlApiKey VARCHAR(255),
  ghlLocationId VARCHAR(64),
  ...
);
```

---

## 📋 Empfohlene Fixes

### Fix 1: Environment Variables hinzufügen

**Schritt 1:** `server/_core/env.ts` ergänzen

```typescript
export const ENV = {
  // ... existing
  ghlApiKey: process.env.GHL_API_KEY ?? "",
  ghlLocationId: process.env.GHL_LOCATION_ID ?? "",
};
```

**Schritt 2:** `server/gohighlevelService.ts` anpassen

```typescript
import { ENV } from './_core/env';

constructor() {
  const apiKey = ENV.ghlApiKey || '0b1e327e-beaa-4576-a45a-71c6c01966c7';
  const locationId = ENV.ghlLocationId || '0beKz0TSeMQXqUf2fDg7';
  // ...
}
```

**Schritt 3:** Railway ENV-Variablen setzen

```bash
railway variables set GHL_API_KEY=0b1e327e-beaa-4576-a45a-71c6c01966c7
railway variables set GHL_LOCATION_ID=0beKz0TSeMQXqUf2fDg7
```

---

### Fix 2: GHL Webhook-Endpoint implementieren

**Datei:** `server/_core/index.ts` (nach Zeile 332)

```typescript
// GoHighLevel webhook for contact/opportunity updates
app.post('/api/webhooks/gohighlevel', express.json(), async (req, res) => {
  try {
    console.log('[GHL Webhook] Received event:', req.body);

    const { type, contact, opportunity, tags } = req.body;

    switch (type) {
      case 'ContactCreate':
      case 'ContactUpdate':
        if (contact) {
          // Update local contact
          const existingContact = await db.getContactByGHLId(contact.id);
          if (existingContact) {
            await db.updateContact(existingContact.id, {
              email: contact.email,
              firstName: contact.firstName,
              lastName: contact.lastName,
              phone: contact.phone,
            });
          }
        }
        break;

      case 'OpportunityStatusChange':
        if (opportunity) {
          // Update deal status
          const deal = await db.getDealByGHLOpportunityId(opportunity.id);
          if (deal) {
            await db.updateDeal(deal.id, {
              status: opportunity.status,
              value: opportunity.monetaryValue,
            });
          }
        }
        break;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[GHL Webhook] Error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});
```

**In GHL konfigurieren:**
```
Settings → Integrations → Webhooks → Add Webhook
URL: https://portal.immoportal.app/api/webhooks/gohighlevel
Events: Contact Created, Contact Updated, Opportunity Status Changed
```

---

### Fix 3: Location ID dynamisch laden

**Schritt 1:** Backend API-Endpoint

```typescript
// server/routers.ts
getGHLConfig: protectedProcedure
  .query(async () => {
    return {
      locationId: ENV.ghlLocationId,
    };
  }),
```

**Schritt 2:** Frontend Hook

```typescript
// client/src/hooks/useGHLConfig.ts
export function useGHLConfig() {
  const { data } = trpc.getGHLConfig.useQuery();

  return {
    locationId: data?.locationId || '0beKz0TSeMQXqUf2fDg7',
    getContactUrl: (contactId: string) =>
      `https://app.gohighlevel.com/v2/location/${data?.locationId}/contacts/detail/${contactId}`,
  };
}
```

**Schritt 3:** In Components verwenden

```typescript
// client/src/pages/crm/Contacts.tsx
const { getContactUrl } = useGHLConfig();
const openGHLContact = (ghlContactId: string) => {
  window.open(getContactUrl(ghlContactId), '_blank');
};
```

---

## ✅ Zusammenfassung

### Status Quo:

| Feature | Status | Details |
|---------|--------|---------|
| **GHL Service** | ✅ Implementiert | 366 Zeilen, 14 Funktionen |
| **Quiz Widget** | ✅ Funktioniert | link.non-dom.group |
| **CRM Sync** | ✅ Funktioniert | Contacts & Leads |
| **Stripe Integration** | ✅ Funktioniert | Nach Zahlung → GHL |
| **Environment Variables** | ❌ **Fehlt** | Nicht in env.ts |
| **GHL Webhook** | ❌ **Fehlt** | Endpoint nicht implementiert |
| **Multi-Tenancy** | ❌ **Inaktiv** | Tenants-Tabelle leer |
| **Dynamic Location ID** | ❌ **Hardcoded** | An 3 Stellen im Code |

### Nächste Schritte:

1. ⚠️ **Kritisch:** ENV-Variablen zu env.ts hinzufügen (Fix 1)
2. ⚠️ **Kritisch:** Railway ENV-Variablen setzen
3. 🔧 **Wichtig:** GHL Webhook-Endpoint implementieren (Fix 2)
4. 🔧 **Optional:** Location ID dynamisch laden (Fix 3)
5. 📚 **Optional:** Multi-Tenancy aktivieren

### Testing-URLs:

- **Quiz:** https://portal.immoportal.app (Scroll zu "Refinanzierungs-Selbsttest")
- **CRM Contacts:** https://portal.immoportal.app/crm/contacts
- **CRM Leads:** https://portal.immoportal.app/crm/leads
- **Admin Users:** https://portal.immoportal.app/admin/users (Tab "GHL Import")
- **GHL Dashboard:** https://app.gohighlevel.com/v2/location/0beKz0TSeMQXqUf2fDg7

---

**Erstellt am:** 2. Februar 2026
**Version:** 1.0
