# ImmoRefi Portal - Changelog 13. Januar 2026

## Übersicht
Massives Feature-Update mit CRM, Booking, Verträgen, Onboarding und Logo-Management.

---

## 1. GoHighLevel Integration (Erweitert)

### Tags-System
- `bauträger` - Hauptkategorie
- `immorefi-kunde` - Portal-Kunde
- `hat-bezahlt` - Zahlungsstatus
- `produkt-analyse` / `produkt-gutachten` / `produkt-portfolio` / `produkt-beratung` - Dynamisch je Produkt

### Notizen-Formatierung
- Professionelle Templates mit Emojis
- Bestellnotizen: Produkt, Betrag, Bestellnummer, Datum, Kunde, Portal-Link
- Status-Update-Notizen
- Dokument-Upload-Notizen

### Kontakt-Import
- 46 Kontakte mit Tag "bauträger" importiert
- Alle GHL-Notizen übernommen
- Markiert als source: 'ghl'
- Rate-Limiting: 500ms zwischen Kontakten

---

## 2. Volles CRM-System

### Datenbank (drizzle/0012_crm_ghl_sync.sql)
- `leads` Tabelle: Status (neu/kontaktiert/qualifiziert/verloren)
- `contacts` Tabelle: Erweitert mit Typ (kunde/partner/lieferant)
- `deals` Tabelle: Pipeline-Stages, Wert, Wahrscheinlichkeit

### Backend
- `leadRouter`: CRUD + convertToContact + syncToGHL + syncFromGHL
- `contactRouter`: CRUD + GHL-Sync
- `dealRouter`: CRUD + updateStage + Pipeline-Ansicht

### Frontend
- `/crm/leads` - Lead-Verwaltung mit Status-Filter
- `/crm/pipeline` - Kanban-Board mit Drag&Drop
- `/crm/contacts` - Kontakt-Verwaltung mit Typ-Filter

---

## 3. Calendly Booking-System

### Datenbank (drizzle/0013_booking_system.sql)
- `staff_calendars`: Calendly-URLs pro Mitarbeiter
- `bookings`: Termine mit Status, Erinnerungen

### E-Mail Service
- sendBookingConfirmation() - Terminbestätigung
- sendBookingReminder24h() - 24h Erinnerung
- sendBookingReminder1h() - 1h Erinnerung
- sendBookingCancellation() - Absage-Bestätigung

### Calendly Webhook
- POST /api/webhooks/calendly
- invitee.created → Booking erstellen
- invitee.canceled → Status cancelled

### Frontend
- `/booking` - Mitarbeiter-Auswahl + Calendly Embed
- `/admin/my-calendar` - Eigenen Calendly-Link eintragen
- `/admin/bookings` - Alle Buchungen verwalten

---

## 4. Menü-Struktur (Neu)

### Kunden-Menü
- Dashboard
- Termin buchen
- Bestellungen
- Rechnungen
- Dokumente
- Nachrichten

### Admin-Menü (Sektioniert)
**CRM:** Leads, Pipeline, Kontakte
**Termine:** Mein Kalender, Buchungen
**Verwaltung:** Onboarding-Daten, Bestellungen, Rechnungen, Dokumente, Verträge, Nachrichten
**System:** Benutzer, Audit-Log, Einstellungen, Handbuch, Logo-Verwaltung

---

## 5. Onboarding-System

### Datenbank (drizzle/0014_onboarding_system.sql)
- users.hasSeenWelcome
- users.hasCompletedTour
- users.onboardingProgress (JSON)

### Komponenten
- `WelcomeModal.tsx` - Beim ersten Login
- `OnboardingChecklist.tsx` - Dashboard-Widget mit Fortschritt

### Schritte
1. Account erstellt ✓
2. Profil vervollständigen
3. Termin buchen
4. Dokumente hochladen
5. Bestellung aufgeben

---

## 6. Vertragsvorlagen-System

### Datenbank (drizzle/0015_contract_templates.sql)
- `contract_templates`: name, category, content, placeholders

### 2 Musterverträge
1. **Mandats- und Strukturierungsvertrag AIF**
   - Kategorie: fondstrukturierung
   - 19 Paragraphen, Schweizer Recht
   - Platzhalter: AUFTRAGGEBER_NAME, AUFTRAGGEBER_ADRESSE, DATUM, STRUKTURIERUNGSPAUSCHALE, ERFOLGSBETEILIGUNG_PROZENT

2. **Mandats- und Strukturierungsvertrag Anleihe/CLN/AMC**
   - Kategorie: anleihen
   - SPV-Struktur, Partnerkoordination
   - Zusätzlicher Platzhalter: INSTRUMENT_TYP

### Backend
- contractTemplate Router: list, get, create, update, delete, preview

---

## 7. Landingpage Updates

### Hero-Chart
- Recharts AreaChart
- Private Debt Markt Entwicklung 2020-2024
- Türkis Gradient (#06b6d4)

### Social Media (Footer)
- Facebook: https://www.facebook.com/nondomgroup
- LinkedIn: https://www.linkedin.com/company/non-dom-group/

### Presse-Logos (Klickbar)
- FOCUS → https://unternehmen.focus.de/amazon-markenaufbau.html
- Forbes → https://www.forbes.at/artikel/internationale-firmengruendung-optimiert

### Auszeichnungen & Mitgliedschaften (Neue Section)
- diind "Unternehmen der Zukunft" → Urkunde PDF
- Swiss Startup Association → https://swissstartupassociation.ch
- BAND Business Angels → https://www.business-angels.de

---

## 8. Logo-Management-System

### Datenbank (drizzle/0016_partner_logos.sql)
- `partner_logos`: name, category, imageUrl, linkUrl, sortOrder, isActive
- Kategorien: presse, mitgliedschaft, auszeichnung, partner

### Backend
- partnerLogo Router: list, listAll, get, create, update, delete, reorder

### Frontend
- `/admin/logos` - Tab-basierte Verwaltung
- Landingpage lädt Logos dynamisch aus DB
- Fallback auf Inline-SVG wenn DB leer

---

## 9. Handbuch v2.0

### Anwenderhandbuch (9 Kapitel)
1. Erste Schritte
2. Dashboard
3. Terminbuchung
4. Bestellungen & Produkte
5. Dokumente
6. Verträge
7. Rechnungen
8. Nachrichten/Chat
9. Einstellungen

### Administratorhandbuch (6 Kapitel)
1. CRM-System
2. Termine & Kalender
3. Verwaltung
4. Benutzerverwaltung
5. Logo-Verwaltung
6. Systemeinstellungen

### Features
- 1.600+ Zeilen Dokumentation
- Suchfunktion
- Print-Button
- Responsive Design

---

## 10. User Management (Erweitert)

### Datenbank
- users.source (portal/ghl/manual)
- users.ghlContactId
- users.company, street, zip, city, country, website
- users.status (active/inactive/blocked)
- `customer_notes` Tabelle

### Admin UI (/admin/users)
- 4-Tab Dialog: Stammdaten, Adresse, Notizen, Historie
- Source-Filter: Alle/Portal/GHL/Manuell
- "In GHL öffnen" Button
- Status-Verwaltung

---

## Commits (13.01.2026)

1. `68ed4a6` - Complete CRM, booking, onboarding systems
2. `1beac0e` - Add onboarding system with WelcomeModal and OnboardingChecklist
3. `94c5c8e` - Add contract templates system with 2 seed templates
4. `e8f5391` - Update landing page: add chart, social links, press logos, trust badges
5. `8da4a72` - Fix logos with inline SVG/CSS
6. `9c64021` - Add complete logo management system
7. `b87593a` - Complete handbook update with all features documentation v2.0

---

## Offene Punkte

### Noch zu erledigen
- [ ] Calendly Webhook registrieren: https://portal.immoportal.app/api/webhooks/calendly
- [ ] WhatsApp Business API Setup (Meta/Twilio)
- [ ] immogeorgien.app Login White Page Problem
- [ ] Push Notifications
- [ ] SMS-Integration (Felder vorbereitet)
- [ ] Geführte Tour (driver.js statt react-joyride)
- [ ] Echte Logo-URLs in Admin eintragen

### Nächste Features (optional)
- PDF-Export für Verträge
- Digitale Signatur
- Stripe Integration für Zahlungen
- Automatische Rechnungserstellung

---

## Technische Details

### Stack
- Frontend: React 19, TypeScript, Tailwind CSS, Shadcn/UI
- Backend: Express, tRPC, Drizzle ORM
- Datenbank: MySQL (Railway)
- Auth: Clerk (Production)
- Hosting: Vercel (Frontend) + Railway (Backend)
- E-Mail: Resend

### URLs
- Portal: https://portal.immoportal.app
- Landingpage: https://portal.immoportal.app (nicht eingeloggt)
- Backend: Railway auto-deploy

### GitHub
- Repo: angelus200/immorefi-portal-neueste
- Lokal: ~/Downloads/immorefi-portal

---

*Erstellt: 13. Januar 2026, 21:30 Uhr*
