# ImmoRefi Portal - TODO

## Phase 1: Database Schema
- [x] Multi-tenant tables (tenants, memberships)
- [x] User roles enum (superadmin, tenant_admin, staff, client)
- [x] CRM tables (leads, contacts, deals)
- [x] Pipeline stages table
- [x] Files table for document management
- [x] Audit log table
- [x] Questionnaire tables for onboarding
- [x] Tasks table

## Phase 2: Backend tRPC Routers
- [x] Tenant router (CRUD, subdomain lookup)
- [x] Lead router (create, list, update status)
- [x] Contact router (CRUD)
- [x] Deal router (CRUD, move between stages)
- [x] Pipeline router (stages CRUD)
- [x] File router (upload URL, download URL)
- [x] Audit router (log actions, list logs)
- [x] User/Membership router

## Phase 3: Landing Page
- [x] Non-Dom Group design (turquoise/cyan theme)
- [x] Hero section with value proposition
- [x] Trust badges section
- [x] Process steps section
- [x] Lead capture form
- [x] FAQ section
- [x] Footer with legal links

## Phase 4: Client Portal
- [x] Dashboard with project overview
- [x] Tasks widget
- [x] Documents widget
- [x] Multi-step onboarding questionnaire
- [x] Project tracking view
- [x] Responsive sidebar navigation

## Phase 5: CRM System
- [x] Lead management with status tracking
- [x] Contact management
- [x] Kanban board for deals
- [x] Drag-and-drop functionality
- [ ] Pipeline stage customization

## Phase 6: Admin Area
- [x] User management (invite, roles)
- [ ] Pipeline configuration
- [x] Branding customization
- [x] Complete audit log view
- [x] Tenant settings

## Phase 7: Testing & Deployment
- [x] Vitest tests for critical routes
- [x] Final testing
- [x] Create checkpoint
- [ ] Deploy to Manus hosting

## Bugfixes & Anpassungen
- [x] Farbschema an exaktes Non-Dom Group Türkis anpassen (#00B8D4 / heller Cyan)
- [x] Farbschema korrigieren - weniger Grünstich, mehr reines Cyan/Blau (#00A0C6)
- [x] Landing Page: "Kostenlose Analyse" → "Analyse anfordern" (kostenpflichtig)
- [x] Texte korrigieren: "Finanzierungslösungen" → "Kapitalmarktzugang"
- [x] Produkte beschreiben: CLN, Anleihen, Zertifikate, Fonds, SPVs, Club Deals
- [x] Hero-Text und Value Proposition anpassen
- [x] Services-Sektion mit korrekten Dienstleistungen
- [x] Automatische Weiterleitung zum Onboarding nach Login (falls nicht ausgefüllt)
- [x] RoleGuard-Komponente für geschützte Routen erstellen
- [x] Onboarding-Status (onboardingCompleted) in User-Tabelle hinzufügen
- [x] Documents-Seite implementieren
- [x] Tasks-Seite implementieren
- [x] Automatische Weiterleitung zum Onboarding nach Login
- [x] Non-Dom Group Logo als SVG erstellen und einbinden
- [x] Text ändern: "Immobilieninvestoren" → "Immobilienunternehmen"
- [x] Originales Non-Dom Group Logo (PNG) einbinden
- [x] Impressum-Seite mit Rechtstexten erstellen
- [x] Datenschutz-Seite mit DSGVO-konformen Texten erstellen
- [x] Footer-Links zu Impressum und Datenschutz hinzufügen
- [x] Landing Page: Analyse-Paket mit €2.990 Preis und Leistungsbeschreibung
- [x] Stufenmodell darstellen: Stufe 1 Analyse, Stufe 2 Strukturierung, Stufe 3 Umsetzung
- [x] Produkt-/Shop-Seite für Analyse & Strukturierungsdiagnose erstellen
- [ ] Vertragsvorlagen (Fonds, CLN/AMC) im Client Portal verfügbar machen

## Geschützter Kundenbereich mit Vertragsanerkennung
- [x] DB: contracts Tabelle (Name, Typ, Datei-URL, Version, Status)
- [x] DB: contractAssignments Tabelle (Vertrag-Kunde Zuweisung)
- [x] DB: contractAcceptances Tabelle (Anerkennung mit Zeitstempel, IP)
- [x] Backend: Contract Router (CRUD, Zuweisung, Anerkennung)
- [x] Admin: Vertragsverwaltung (Upload, Liste, Zuweisung an Kunden)
- [x] Admin: Übersicht welche Kunden welche Verträge anerkannt haben
- [x] Client: /contracts Seite mit zugewiesenen Verträgen
- [x] Client: PDF-Ansicht und Checkbox-Anerkennung
- [x] Rechtliche Texte: Schweizer Recht, B2B, Schiedsgerichtsklausel
- [x] Tests für Contract-Funktionalität

## Stripe Shop Integration
- [x] Stripe Feature mit webdev_add_feature hinzufügen
- [x] Produkt-/Shop-Seite für Analyse (€2.990) erstellen
- [x] Checkout-Flow implementieren
- [x] Webhook für erfolgreiche Zahlungen einrichten
- [x] Bestellübersicht im Client Portal
- [x] Admin-Übersicht für Bestellungen
- [x] Tests für Stripe-Integration (21 Tests bestanden)

## Onboarding-Daten Speicherung
- [x] Datenbank-Schema für Onboarding-Daten erstellen (45 Felder)
- [x] tRPC-Mutation zum Speichern der Daten (completeOnboarding, saveOnboardingData)
- [x] Admin-Seite zur Anzeige der Onboarding-Daten (/admin/onboarding)
- [x] Detailansicht für einzelne Onboarding-Einträge mit Dialog
- [x] "Als geprüft markieren"-Funktion für Admins
- [x] Tests für Onboarding-Funktionen (32 Tests bestanden)


## Dokument-Upload im Onboarding
- [x] Datenbank-Schema für Onboarding-Dokumente
- [x] tRPC-Endpoint für Datei-Upload (S3 Storage)
- [x] Upload-Komponente im Onboarding-Fragebogen
- [x] Fortschrittsanzeige beim Upload
- [x] Dokumenten-Kategorien (Jahresabschlüsse, BWA, Objektliste, etc.)
- [x] Checkliste für empfohlene Dokumente
- [x] Dokumente in Admin-Detailansicht anzeigen
- [x] Download-Links für Admins
- [x] 32 Tests bestanden


## Bugfixes Navigation
- [x] /settings Route zeigt 404 - Route hinzugefügt
- [x] Verträge-Seite zeigt falsches Menü - DashboardLayout korrigiert
- [x] Einheitliches Sidebar-Menü auf allen Dashboard-Seiten

## Admin-Menü Erweiterung
- [x] DashboardLayout mit Admin-Menüpunkten erweitern
- [x] Rollenbasierte Menüanzeige (Admin vs. Client)
- [x] Onboarding-Daten im Admin-Menü verlinken
- [x] Admin-Bereich mit: Onboarding-Daten, Bestellungen, Verträge, Benutzer, Audit-Log, Einstellungen

## Admin-Funktionen Erweiterung
- [x] Admin-Rolle für Owner-Benutzer in Datenbank setzen (alle auf superadmin)
- [x] Admin-Seite: Benutzerverwaltung erstellen (/admin/users)
- [x] Admin-Seite: Audit-Log erstellen (/admin/audit)
- [x] Admin-Seite: Admin-Einstellungen erstellen (/admin/settings)
- [x] E-Mail-Benachrichtigung bei neuem Onboarding-Eintrag (notifyOwner)
- [ ] E-Mail-Benachrichtigung bei neuer Bestellung
- [x] Admin-Router mit listUsers, updateUserRole, getAuditLog
- [x] 53 Tests bestanden

## Rollensystem Korrektur
- [x] Nur Owner als Superadmin setzen
- [x] Alle anderen Benutzer auf Client zurückgesetzt
- [x] Rollenzuweisung bei Registrierung korrigiert (neue User = Client, Owner = Superadmin)

## Handbuch Immobilienprojektentwickler Shop
- [x] PDF-Handbuch in public-Ordner kopiert
- [x] Shop-Seite mit Handbuch-Produkt (€29,90) erweitert
- [x] Kostenloser Download für angemeldete Benutzer
- [x] Stripe Checkout für Handbuch-Direktkauf
- [x] Download-Link nach Anmeldung
- [x] Bestseller-Badge für Handbuch
- [x] 53 Tests bestanden

## Handbuch Marketing & Tracking
- [x] Prominenter Handbuch-Bereich auf Landing Page
- [x] Download-Statistiken in Datenbank speichern
- [x] Download-Tracking-Router mit Admin-Statistiken
- [x] Follow-up E-Mail-Benachrichtigung nach Handbuch-Download
- [x] 53 Tests bestanden

## Onboarding Vereinfachung
- [x] Dokumenten-Upload optional machen (nicht blockierend)
- [x] "Überspringen & Abschließen"-Button für Dokumenten-Schritt hinzugefügt
- [x] Hinweistext "Optional" hinzugefügt
- [x] Fokus auf Kontaktdaten für Kommunikation
- [x] Einfacher Einstieg ohne Pflicht-Uploads

## YouTube-Video auf Landing Page
- [x] Video prominent einbinden (https://youtu.be/CQ08OZ5mn4w)
- [x] Video-Sektion nach Hero-Bereich mit Titel und Beschreibung

## Handbuch Direktkauf
- [x] Direktkauf-Button (€29,90) ohne Anmeldung hinzufügen
- [x] Stripe Checkout für Gast-Käufer (guestCheckout Mutation)
- [x] "oder" Trenner zwischen kostenlos und Direktkauf


## Bugfix: Handbuch Direktkauf auf Landing Page
- [x] Direktkauf-Button startet Stripe Checkout direkt (nicht Weiterleitung zur Shop-Seite)
- [x] guestCheckout Mutation direkt auf Landing Page aufrufen


## Tracking Integration
- [x] Meta (Facebook) Pixel einbauen (ID: 1031860691746550)
- [x] Google Tag Manager einbauen (GTM-M4NPSD44)


## Selbsttest Quiz Widget
- [x] Quiz-Widget von link.non-dom.group einbauen (6zCsuLxQjK3cqE7TQr4L)
- [x] Passenden Platz auf Landing Page finden (nach Handbuch-Bereich)


## Google Analytics & Cookie Banner
- [x] Google Analytics einbauen (G-VHCM7BKJ05)
- [x] Cookie-Banner mit Tracking-Hinweisen implementieren
- [x] Hinweise auf Meta Pixel, GTM, Google Analytics im Banner


## Finanzrechner-Bereich
- [x] Kapitalstruktur- & Finanzierungsrechner (Kapitallücken, Banken-Abhängigkeit, Zinsrisiko)
- [x] Projekt- & Renditerechner (IRR Reality-Check, Cashflow-Simulator)
- [x] Kapitalmarktfähigkeits-Score (12 Fragen, Score 0-100)
- [x] Verzögerungs- & Strukturkosten-Rechner
- [x] Alle Rechner auf Landing Page einbinden


## Über uns & Team Seiten
- [x] Über uns Seite erstellt mit Mission, Vision, Werten, Key Facts
- [x] Team Seite erstellt mit 6 Teammitgliedern und Beirat
- [x] Footer-Links auf Startseite aktualisiert


## Über uns & Team Aktualisierung mit echten Daten
- [x] Informationen von non-dom.group sammeln
- [x] Informationen von angelus.group sammeln
- [x] Informationen über Thomas Gross sammeln (Capinside, DUB, Forbes, Scoredex)
- [x] Über uns Seite mit echten NON DOM Group Daten aktualisieren
- [x] Team Seite mit Thomas Gross als Gründer aktualisieren
- [x] Angelus Group als Muttergesellschaft erwähnen


## Thomas Gross Foto
- [x] Foto in public Ordner kopieren
- [x] Foto auf Team Seite einbinden
- [x] Foto auf Über uns Seite einbinden


## Presse-Bereich
- [x] Forbes Artikel einbinden (Internationale Firmengründung optimiert)
- [x] Focus Artikel einbinden (Amazon Markenaufbau)
- [x] Urkunde "Unternehmen der Zukunft" einbinden
- [x] Presse-Seite erstellt (/press)


## Medien-Logos auf Presse-Seite
- [x] Forbes Logo einbauen
- [x] Focus Logo einbauen
- [x] DUB Logo einbauen


## Richtige Medien-Logos
- [x] Forbes Logo (schwarz) einbauen
- [x] Focus Online Logo (rot) einbauen
- [x] Urkunde "Unternehmen der Zukunft" Bild einbauen


## Social Media Links
- [x] Facebook Link einbauen (https://www.facebook.com/nondomgroup)
- [x] LinkedIn Link einbauen (https://www.linkedin.com/company/non-dom-group/)
- [x] Links im Footer hinzugefügt


## Echte Firmenadresse & Karte
- [x] Platzhalter-Adresse durch Marketplace24-7 GmbH, Kantonsstrasse 1, 8807 Freienbach SZ ersetzen
- [x] Handelsregister-Nummer hinzugefügt (CH-130.4.033.363-2)
- [x] Interaktive Google Maps Karte eingebaut


## Vertriebspartner-Bereich
- [x] Vertriebspartner-Bereich auf Landing Page hinzugefügt
- [x] Link zu vertrieb.non-dom.group eingebaut


## Rechnungssystem
- [x] Datenbank-Schema für Rechnungen (invoices, invoice_items, invoice_counters)
- [x] PDF-Rechnungsgenerierung mit Firmenangaben (HTML-basiert)
- [x] Automatische Rechnung bei Analyse-Kauf (€2.990) via Stripe Webhook
- [x] Automatische Rechnung bei Shop-Käufen (Handbuch €29,90) via Stripe Webhook
- [x] Admin-Bereich für manuelle Abschlagrechnungen (/admin/invoices)
- [x] Rechnungs-Download für Kunden (PDF via Print-Dialog)
- [ ] E-Mail-Versand der Rechnungen (TODO)


## Rechnungssystem Erweiterung
- [x] E-Mail-Versand der Rechnungen nach Kauf (Benachrichtigung an Owner)
- [x] Vitest-Tests für Invoice-Router schreiben (invoice.test.ts)
- [x] Kunden-Rechnungsübersicht im Client-Portal (/invoices)


## Resend E-Mail & Bankdaten
- [x] Resend E-Mail-Service für direkten Rechnungsversand an Kunden einrichten
- [x] Bankdaten (IBAN CHF/EUR/GBP) in Rechnungen vervollständigt (RELIO AG, Zürich)
- [x] USt-IdNr. in Rechnungen ergänzt (CHE-351.662.058 MWST)


## Dashboard-Tools für Kunden
### Phase 1: Finanzrechner
- [x] Zins- & Tilgungsrechner (Annuitäten, Tilgungsplan)
- [x] Refinanzierungs-Vergleichsrechner (Alt vs. Neu)
- [x] Eigenkapitalrendite-Rechner (ROE, Leverage)
- [ ] Break-Even-Rechner (Wann lohnt sich Refinanzierung)
- [ ] Währungsrisiko-Kalkulator (CHF/EUR Szenarien)

### Phase 2: Wissensdatenbank
- [ ] Glossar (Fachbegriffe A-Z mit Suche)
- [ ] Checklisten (Interaktiv zum Abhaken)
- [ ] Case Studies (Anonymisierte Erfolgsgeschichten)

### Phase 3: Marktdaten
- [ ] EZB-Daten Integration (Leitzins, EURIBOR)
- [ ] Admin-Bereich für Marktkommentare
- [ ] Zinsentwicklung-Charts

### Phase 4: Integration
- [ ] Dashboard-Menü erweitern
- [ ] Teaser auf Landing Page


## Finanzrechner Navigation
- [x] Dropdown-Menü für Navigation zwischen Rechnern implementieren
- [x] Dropdown in alle Rechner-Seiten einbauen (InterestCalculator, RefinanceCalculator, ROECalculator)


## Glossar / Wissensdatenbank
- [x] Durchsuchbares A-Z-Glossar mit Finanzbegriffen erstellen
- [x] Alphabetische Navigation (A-Z Buchstaben-Filter)
- [x] Suchfunktion für Begriffe
- [x] Route und Navigation im Dashboard einrichten
