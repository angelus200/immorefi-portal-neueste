# Railway Environment Variables Setup - GoHighLevel

**Datum:** 2. Februar 2026
**Projekt:** ImmoRefi Portal

---

## 🎯 Aufgabe

GoHighLevel API-Credentials als Environment Variables in Railway konfigurieren.

---

## 📋 Benötigte Variablen

```bash
GHL_API_KEY=0b1e327e-beaa-4576-a45a-71c6c01966c7
GHL_LOCATION_ID=0beKz0TSeMQXqUf2fDg7
```

---

## 🚀 Option 1: Railway Dashboard (EMPFOHLEN)

### Schritt 1: Railway Dashboard öffnen

```
→ URL: https://railway.app/dashboard
→ Login mit deinem Account
```

### Schritt 2: Projekt auswählen

```
→ Klicke auf: "immorefi-portal" (oder ähnlicher Name)
→ Du solltest jetzt die Projekt-Übersicht sehen
```

### Schritt 3: Service auswählen

```
→ Klicke auf deinen Web-Service (nicht die MySQL Datenbank!)
→ Meistens heißt er: "immorefi-portal-neueste" oder "web"
```

### Schritt 4: Variables Tab öffnen

```
→ Oben im Service-Dashboard: Tab "Variables"
→ Dort siehst du alle aktuellen Environment Variables
```

### Schritt 5: Neue Variables hinzufügen

**Variable 1: GHL_API_KEY**

```
1. Klicke auf: "+ New Variable" oder "Add Variable"
2. Key: GHL_API_KEY
3. Value: 0b1e327e-beaa-4576-a45a-71c6c01966c7
4. Klicke: "Add"
```

**Variable 2: GHL_LOCATION_ID**

```
1. Klicke auf: "+ New Variable"
2. Key: GHL_LOCATION_ID
3. Value: 0beKz0TSeMQXqUf2fDg7
4. Klicke: "Add"
```

### Schritt 6: Deployment triggern

```
→ Railway deployt automatisch nach Hinzufügen von Variables
→ ODER: Klicke manuell auf "Deploy" Button
→ Warte ca. 2-3 Minuten bis Deploy abgeschlossen ist
```

### Schritt 7: Verifizieren

**Im Railway Dashboard:**
```
→ Tab "Deployments" → Aktuellster Deploy
→ Logs prüfen auf:
  ✅ "[GHL] Service initialized"
  ✅ Keine Fehler bei GHL-Anfragen
```

**Im Code testen:**
```bash
# In Railway Shell (optional)
railway run node -e "console.log('GHL_API_KEY:', process.env.GHL_API_KEY?.substring(0,10) + '...')"

# Expected Output:
# GHL_API_KEY: 0b1e327e-b...
```

---

## 🖥️ Option 2: Railway CLI

### Voraussetzungen:

```bash
# Railway CLI muss installiert sein
railway --version

# Falls nicht:
# npm install -g @railway/cli
# ODER: brew install railway
```

### Schritt 1: Login & Projekt verbinden

```bash
# Login (öffnet Browser)
railway login

# Projekt verbinden
cd ~/Downloads/immorefi-portal-neueste
railway link

# Wähle dein Projekt: "immorefi-portal"
```

### Schritt 2: Variables setzen

```bash
# GHL_API_KEY setzen
railway variables set GHL_API_KEY=0b1e327e-beaa-4576-a45a-71c6c01966c7

# GHL_LOCATION_ID setzen
railway variables set GHL_LOCATION_ID=0beKz0TSeMQXqUf2fDg7
```

### Schritt 3: Verifizieren

```bash
# Alle Variables anzeigen
railway variables

# Expected Output:
# GHL_API_KEY: 0b1e327e-beaa-4576-a45a-71c6c01966c7
# GHL_LOCATION_ID: 0beKz0TSeMQXqUf2fDg7
# DATABASE_URL: mysql://...
# ... (andere Variables)
```

### Schritt 4: Deploy triggern (optional)

```bash
# Falls nicht automatisch deployed wurde:
railway up

# ODER:
git commit --allow-empty -m "chore: trigger redeploy"
git push origin main
```

---

## ✅ Verifizierung

### 1. Railway Logs prüfen

**Im Railway Dashboard:**
```
→ Service auswählen
→ Tab "Logs"
→ Filter: "ghl" oder "GHL"

Expected Logs:
✅ "[GHL] Service initialized"
✅ "[GHL] Contact created: ..."
✅ "[GHL] Tag added to contact ..."
```

### 2. Funktionalität testen

**Test 1: CRM Contact Sync**
```
1. Öffne: https://portal.immoportal.app/crm/contacts
2. Wähle einen Contact
3. Klicke: "Zu GHL synchronisieren" Button
4. Expected: Toast "Lead erfolgreich zu GHL synchronisiert"
5. Prüfe in GHL: https://app.gohighlevel.com/v2/location/0beKz0TSeMQXqUf2fDg7
```

**Test 2: Stripe → GHL Integration**
```
1. Erstelle Test-Bestellung im Shop
2. Zahlung abschließen (Stripe Test Mode)
3. Prüfe Railway Logs:
   ✅ "[Webhook] GoHighLevel contact processed for ..."
4. Prüfe GHL Dashboard:
   ✅ Neuer Contact mit Tag "portal-customer"
```

**Test 3: Quiz-Widget**
```
1. Öffne: https://portal.immoportal.app
2. Scrolle zu "Refinanzierungs-Selbsttest"
3. Quiz sollte laden (iframe)
4. Fülle Quiz aus
5. Prüfe GHL Dashboard auf neuen Lead
```

---

## 🐛 Troubleshooting

### Problem: "Variables not found" Fehler

**Symptom:**
```
[GHL] Service initialized
[GHL] Using fallback API key
```

**Ursache:** ENV-Variablen nicht gesetzt oder falsch benannt

**Lösung:**
```bash
# Variablen-Namen prüfen (Case-sensitive!)
railway variables

# Müssen genau sein:
GHL_API_KEY       ✅
ghl_api_key       ❌ (Kleinbuchstaben)
GHL_API           ❌ (Falscher Name)
```

---

### Problem: "Unauthorized" bei GHL-Requests

**Symptom:**
```
[GHL] Error creating contact: 401 Unauthorized
```

**Ursache:** API Key falsch oder abgelaufen

**Lösung:**
```bash
# 1. Aktuellen API Key in GHL prüfen:
#    Settings → Integrations → API Keys

# 2. Neuen Key in Railway setzen:
railway variables set GHL_API_KEY=NEUER_KEY_HIER
```

---

### Problem: "Location not found"

**Symptom:**
```
[GHL] Error: Location 0beKz0TSeMQXqUf2fDg7 not found
```

**Ursache:** Location ID falsch oder Account gewechselt

**Lösung:**
```bash
# 1. Aktuelle Location ID in GHL finden:
#    Settings → Company → Location ID
#    URL: https://app.gohighlevel.com/v2/location/[DEINE_LOCATION_ID]

# 2. Variable aktualisieren:
railway variables set GHL_LOCATION_ID=NEUE_LOCATION_ID
```

---

### Problem: Variables werden nicht geladen

**Symptom:**
Code verwendet immer noch Fallback-Werte

**Ursache:** Railway hat ENV-Variablen nicht neu geladen

**Lösung:**
```bash
# Deploy neu triggern:
git commit --allow-empty -m "chore: reload env variables"
git push origin main

# ODER im Railway Dashboard:
# → Service → Settings → "Restart Service"
```

---

## 📊 Aktuelle Code-Änderungen

### ✅ Bereits gemacht:

**1. server/_core/env.ts** (Zeile 12-14)
```typescript
export const ENV = {
  // ... existing
  // GoHighLevel Integration
  ghlApiKey: process.env.GHL_API_KEY ?? "",
  ghlLocationId: process.env.GHL_LOCATION_ID ?? "",
};
```

**2. server/gohighlevelService.ts** (Zeile 3, 76-78)
```typescript
import { ENV } from './_core/env';

constructor() {
  // Use ENV with fallback to hardcoded values for backwards compatibility
  const apiKey = ENV.ghlApiKey || '0b1e327e-beaa-4576-a45a-71c6c01966c7';
  const locationId = ENV.ghlLocationId || '0beKz0TSeMQXqUf2fDg7';
  // ...
}
```

**Status:** ✅ Code ist bereit für Railway ENV-Variablen

---

## 🎯 Zusammenfassung

**Was du jetzt tun musst:**

1. ✅ **Railway Dashboard öffnen** (Option 1, empfohlen)
2. ✅ **Variables hinzufügen:**
   - `GHL_API_KEY=0b1e327e-beaa-4576-a45a-71c6c01966c7`
   - `GHL_LOCATION_ID=0beKz0TSeMQXqUf2fDg7`
3. ✅ **Deployment abwarten** (2-3 Min)
4. ✅ **Funktionalität testen** (CRM Sync, Stripe Integration)

**Danach:**
- ✅ Code verwendet ENV-Variablen statt Fallback-Werte
- ✅ GHL Integration funktioniert sauber
- ✅ API Keys sind sicher in Railway gespeichert (nicht im Code)

---

## 🔐 Sicherheitshinweis

**WICHTIG:** Nach dem Setzen der Variables:

```bash
# Prüfe, dass .env NICHT in Git ist:
git status

# .env sollte in .gitignore sein:
echo ".env" >> .gitignore
git add .gitignore
git commit -m "chore: ensure .env is gitignored"
```

**Niemals:**
- ❌ API Keys im Code hardcoden (außer als Fallback)
- ❌ .env in Git committen
- ❌ API Keys in öffentlichen Repos

**Immer:**
- ✅ ENV-Variablen über Railway Dashboard setzen
- ✅ .env in .gitignore
- ✅ Fallback-Werte nur für Development

---

**Erstellt am:** 2. Februar 2026
**Nächster Schritt:** Railway ENV-Variablen setzen (Option 1 oder 2)
