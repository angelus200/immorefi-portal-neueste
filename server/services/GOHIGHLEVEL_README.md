# GoHighLevel CRM Integration

Diese Integration verbindet das ImmoRefi Portal automatisch mit GoHighLevel CRM.

## Features

### Automatische Kontakt-Synchronisation
- **Bei neuer Bestellung**: Kontakt wird automatisch in GHL erstellt oder aktualisiert
- **Tag "bauträger"**: Wird automatisch hinzugefügt
- **Bestellnotiz**: Detaillierte Notiz mit allen Bestellinformationen
- **Follow-up Task**: Automatische Aufgabe für das Team (Fälligkeitsdatum: +2 Tage)

### Verfügbare Funktionen

#### `findContactByEmail(email: string)`
Sucht einen Kontakt anhand der E-Mail-Adresse.

```typescript
const contact = await ghlService.findContactByEmail('kunde@beispiel.de');
```

#### `createContact(data: CreateContactData)`
Erstellt einen neuen Kontakt in GoHighLevel.

```typescript
const contact = await ghlService.createContact({
  email: 'kunde@beispiel.de',
  firstName: 'Max',
  lastName: 'Mustermann',
  phone: '+49123456789',
  company: 'Beispiel GmbH',
  tags: ['bauträger', 'kunde'],
});
```

#### `findOrCreateContact(data: CreateContactData)`
Sucht einen Kontakt oder erstellt ihn, falls er nicht existiert (Upsert).

```typescript
const contact = await ghlService.findOrCreateContact({
  email: 'kunde@beispiel.de',
  firstName: 'Max',
  lastName: 'Mustermann',
});
```

#### `addContactNote(contactId: string, body: string)`
Fügt eine Notiz zu einem Kontakt hinzu.

```typescript
await ghlService.addContactNote(contact.id, 'Kunde hat Interesse an Finanzierung');
```

#### `addContactTag(contactId: string, tagName: string)`
Fügt ein Tag zu einem Kontakt hinzu.

```typescript
await ghlService.addContactTag(contact.id, 'vip-kunde');
```

#### `createTask(contactId: string, title: string, description?: string, dueDate?: Date)`
Erstellt eine Aufgabe für einen Kontakt.

```typescript
const dueDate = new Date();
dueDate.setDate(dueDate.getDate() + 7);

await ghlService.createTask(
  contact.id,
  'Follow-up Anruf',
  'Kunde bezüglich Finanzierung kontaktieren',
  dueDate
);
```

#### `processNewOrder(orderData: {...})`
Vollständige Verarbeitung einer neuen Bestellung (erstellt Kontakt, fügt Tag hinzu, erstellt Notiz und Task).

```typescript
await ghlService.processNewOrder({
  email: 'kunde@beispiel.de',
  name: 'Max Mustermann',
  productName: 'Bauträger Analyse',
  amount: 997,
  currency: 'EUR',
  orderId: 123,
  orderDate: new Date(),
});
```

## Konfiguration

### Environment Variables

Fügen Sie folgende Variablen zu Ihrer `.env` Datei hinzu:

```env
# GoHighLevel CRM Integration
GHL_API_KEY=your-api-key-here
GHL_LOCATION_ID=your-location-id-here
```

### Produktions-Credentials (Railway)

**API Key:** `0b1e327e-beaa-4576-a45a-71c6c01966c7`
**Location ID:** `0beKz0TSeMQXqUf2fDg7`

Diese Werte sind bereits in der lokalen `.env` Datei hinterlegt und müssen in Railway als Environment Variables gesetzt werden.

## Integration Points

### 1. Stripe Webhook (nach erfolgreicher Zahlung)
**Datei:** `server/_core/index.ts`
**Trigger:** `checkout.session.completed` Event mit `payment_status: 'paid'`

Nach einer erfolgreichen Zahlung wird automatisch:
1. Kontakt in GHL gesucht oder erstellt
2. Tag "bauträger" hinzugefügt
3. Notiz mit Bestelldetails erstellt
4. Follow-up Task für das Team erstellt (Fälligkeit: +2 Tage)

### 2. Onboarding Completion (optional, noch nicht implementiert)
Kann verwendet werden, wenn ein Kunde das Onboarding abschließt:

```typescript
await ghlService.processOnboardingComplete({
  email: 'kunde@beispiel.de',
  name: 'Max Mustermann',
  company: 'Beispiel GmbH',
  phone: '+49123456789',
  kapitalbedarf: '500.000 EUR',
});
```

## Error Handling

Die Integration ist robust und führt nicht zu Fehlern im Hauptprozess:

- **Fehler werden geloggt** aber nicht nach oben weitergegeben
- **Stripe Webhook schlägt nicht fehl**, wenn GHL nicht erreichbar ist
- **Bestellungen werden trotzdem verarbeitet**, auch wenn GHL offline ist

## Logging

Alle GHL-Operationen werden im Server-Log dokumentiert:

```
[GHL] Service initialized with Location ID: 0beKz0TSeMQXqUf2fDg7
[GHL] Processing new order for: kunde@beispiel.de
[GHL] Creating contact: kunde@beispiel.de
[GHL] Contact created successfully: abc123def
[GHL] Adding tag to contact: abc123def bauträger
[GHL] Tag added successfully
[GHL] Adding note to contact: abc123def
[GHL] Note added successfully
[GHL] Creating task for contact: abc123def
[GHL] Task created successfully: task_xyz
[GHL] Order processed successfully for contact: abc123def
```

## API Documentation

**Base URL:** `https://rest.gohighlevel.com/v1`
**Authentication:** Bearer Token (API Key in Header)

Weitere Informationen finden Sie in der [GoHighLevel API Dokumentation](https://highlevel.stoplight.io/docs/integrations/0443d7d1a4bd0-overview).

## Testing

Zum Testen der Integration können Sie einen Testaufruf machen:

```typescript
import { ghlService } from './server/services/gohighlevel';

// Test contact creation
const testContact = await ghlService.findOrCreateContact({
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
});

console.log('Test contact:', testContact);
```

## Railway Deployment

Beim Deployment auf Railway müssen folgende Environment Variables gesetzt werden:

```
GHL_API_KEY=0b1e327e-beaa-4576-a45a-71c6c01966c7
GHL_LOCATION_ID=0beKz0TSeMQXqUf2fDg7
```

**Wichtig:** Diese sollten als Railway Environment Variables konfiguriert werden, nicht hardcoded im Code.
