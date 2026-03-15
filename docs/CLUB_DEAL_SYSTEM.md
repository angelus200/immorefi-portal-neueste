# Club Deal System — Technische Dokumentation

**Stand: März 2026**

---

## Übersicht

Das Club Deal System ermöglicht Projektentwicklern, über die ImmoRefi Plattform Kapital von professionellen Investoren einzuwerben. Es handelt sich um ein Private Placement — kein öffentliches Angebot.

**Eckdaten:**
- Max. 18 Investoren pro Projekt
- Mindestzeichnung: €100.000 pro Investor
- Projektvolumen: €1.000.000 bis €3.000.000
- Nur professionelle/qualifizierte Investoren (Selbstauskunft)
- Abwicklung: peer-to-peer oder über regulierten Treuhänder (+0,5%)
- Kein Prospekt erforderlich, kein öffentliches Angebot
- Anwendbares Recht: Schweizer Recht

---

## Geschäftsregeln

| Parameter | Wert |
|-----------|------|
| Paketpreis | €11.490 zzgl. MwSt. |
| Umsatzbeteiligung | 2% des eingeworbenen Kapitals |
| Mindestzeichnung | €100.000 (10.000.000 Cent intern) |
| Max. Investoren/Projekt | 18 |
| Projektvolumen | €1 Mio. – €3 Mio. |
| Treuhänder-Option | +0,5% Transaktionskosten |

---

## Datenbank-Schema

### Tabellen

**`club_deal_projects`**
Projekte der Anbieter. Durchläuft einen Status-Workflow:
```
draft → pending_review → active → fully_funded → closed
                                              ↘ cancelled
```

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | int | Primary Key |
| providerId | varchar | Clerk User ID des Anbieters |
| title | varchar | Projektname |
| description | text | Beschreibung |
| projectType | enum | apartment / house / commercial / mixed / land / other |
| location | varchar | Standort |
| targetVolume | int | Zielvolumen in Cent |
| currentVolume | int | Aktuell gezeichnetes Volumen (Cent) |
| currentInvestors | int | Anzahl bestätigter/ausstehender Investoren |
| maxInvestors | int | Max. Investoren (Standard: 18) |
| minInvestment | int | Mindestzeichnung (Standard: 10.000.000 Cent) |
| expectedReturn | decimal | Erwartete Rendite (%) |
| durationMonths | int | Laufzeit in Monaten |
| investmentType | enum | nachrangdarlehen / stille_beteiligung / anleihe / genussrecht / other |
| status | enum | draft / pending_review / active / fully_funded / closed / cancelled |
| documents | json | Array von { type: string, url: string } |
| createdAt | timestamp | Erstellungsdatum |

**`club_deal_subscriptions`**
Zeichnungen der Investoren:
```
pending → confirmed → completed
waitlisted → pending (bei Stornierung eines pending)
pending / waitlisted → cancelled
```

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | int | Primary Key |
| projectId | int | FK → club_deal_projects |
| investorId | varchar | Clerk User ID des Investors |
| amount | int | Zeichnungsbetrag in Cent |
| status | enum | pending / confirmed / waitlisted / cancelled / completed |
| position | int | Wartelisten-Position (null wenn pending/confirmed) |
| subscribedAt | timestamp | Zeichnungszeitpunkt |
| confirmedAt | timestamp | Bestätigungszeitpunkt (Admin) |

**`club_deal_investors`**
Investoren-Profile mit Selbstauskunft:

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | int | Primary Key |
| userId | varchar | Clerk User ID (unique) |
| status | enum | pending / active / rejected |
| investorType | enum | private_professional / semi_professional / institutional |
| firstName / lastName | varchar | Name |
| company | varchar | Unternehmen (optional) |
| phone | varchar | Telefon |
| country | varchar | Land |
| experience | enum | 0_2 / 2_5 / 5_10 / 10_plus Jahre |
| netWorth | enum | 500k / 1m / 2m / 5m / 10m_plus |
| investmentBudget | enum | 100k / 250k / 500k / 1m / 2m_plus |
| preferredTypes | json | Array von investmentType Enums |
| selfDeclaration | boolean | Selbstauskunft bestätigt |
| createdAt | timestamp | Registrierungsdatum |

---

## Backend — tRPC Router

**Datei:** `server/routers/clubDeal.ts`

### Admin-Procedures (adminProcedure)

| Procedure | Beschreibung |
|-----------|--------------|
| `adminCreateProject` | Neues Projekt anlegen |
| `adminUpdateProject` | Projekt bearbeiten (inkl. Dokumente) |
| `adminDeleteProject` | Projekt löschen (nur draft/cancelled) |
| `getAllProjects` | Alle Projekte mit Zeichnungs-Counts |
| `updateProjectStatus` | Status-Workflow steuern |
| `publishProject` | Projekt auf 'active' setzen |

### Anbieter-Procedures (protectedProcedure)

| Procedure | Beschreibung |
|-----------|--------------|
| `createProject` | Neues Projekt einreichen (draft) |
| `getMyProjects` | Eigene Projekte abrufen |
| `getProjectStatus` | Status + Zeichnungsstand abrufen |

### Investor-Procedures (protectedProcedure)

| Procedure | Beschreibung |
|-----------|--------------|
| `checkStatus` | Prüft ob User Investor ist (isInvestor: boolean) |
| `onboard` | Selbstauskunft einreichen → club_deal_investors Eintrag |
| `getActiveProjects` | Alle aktiven Projekte (ohne providerId) |
| `getProject` | Einzelprojekt + eigene Zeichnung |
| `subscribe` | Zeichnung abgeben (7 Validierungen) |
| `getMySubscriptions` | Eigene Zeichnungen mit Projektreferenz |
| `cancelSubscription` | Zeichnung stornieren (nur pending/waitlisted) |

---

## Zeichnungs-Flow (subscribe — 7 Validierungen)

```
1. User hat club_deal_investors Eintrag mit status = 'active'?
   → NEIN: "Sie sind kein aktiver Investor"

2. Projekt existiert und status = 'active'?
   → NEIN: "Projekt nicht gefunden oder nicht aktiv"

3. Betrag >= minInvestment (Standard: 10.000.000 Cent = €100.000)?
   → NEIN: "Mindestzeichnung nicht erreicht"

4. currentVolume + Betrag <= targetVolume?
   → NEIN: "Betrag würde Zielvolumen überschreiten"

5. User hat noch keine Zeichnung für dieses Projekt?
   → NEIN: "Sie haben bereits eine aktive Zeichnung für dieses Projekt"

6. currentInvestors < maxInvestors (18)?
   → JA: status = 'pending', currentVolume += Betrag, currentInvestors += 1
   → NEIN: status = 'waitlisted', position = MAX(position) + 1

7. currentVolume >= targetVolume?
   → JA: Projekt status = 'fully_funded'
```

---

## Stornierung mit Nachrücker-Logik (cancelSubscription)

```
1. Zeichnung auf 'cancelled' setzen

2. War status = 'pending'?
   → currentVolume -= Betrag
   → currentInvestors -= 1

   → Gibt es waitlisted Zeichnungen (ORDER BY position ASC LIMIT 1)?
      → Ersten Kandidaten auf 'pending' setzen (position = null)
      → currentVolume += Kandidaten-Betrag
      → currentInvestors += 1
      → Verbleibende Warteliste neu nummerieren (1, 2, 3, ...)

3. War status = 'waitlisted'?
   → Eigene Position entfernen
   → Verbleibende Warteliste neu nummerieren
```

---

## Investor-Erkennung

Ein User gilt als Investor wenn:
```typescript
const investor = await db.select()
  .from(clubDealInvestors)
  .where(and(
    eq(clubDealInvestors.userId, ctx.userId),
    eq(clubDealInvestors.status, "active")
  ))
  .limit(1);

return { isInvestor: investor.length > 0 };
```

**Wichtig:** Die bestehende `users`-Tabelle und Clerk-Rollen wurden NICHT geändert. Investor-Status wird ausschließlich über `club_deal_investors` ermittelt.

---

## Routen

### Öffentlich (kein Login erforderlich)

| Route | Datei | Beschreibung |
|-------|-------|--------------|
| `/investor` | `InvestorLanding.tsx` | Marketing-Landing Page |
| `/risikohinweise` | `Risikohinweise.tsx` | Vollständige Risikohinweise |
| `/investor/onboarding` | `InvestorOnboarding.tsx` | Selbstauskunft (Login-Prompt wenn nicht eingeloggt) |

### Investoren (eingeloggt + Investor-Profil)

| Route | Datei | Beschreibung |
|-------|-------|--------------|
| `/investor/dashboard` | `InvestorDashboard.tsx` | Aktive Projekte (Karten-Grid) |
| `/investor/project/:id` | `InvestorProject.tsx` | Projektdetail + Zeichnungs-Flow |
| `/investor/subscriptions` | `InvestorSubscriptions.tsx` | Meine Zeichnungen mit Status |

### Anbieter (eingeloggt + Club Deal Projekt)

| Route | Datei | Beschreibung |
|-------|-------|--------------|
| `/dashboard/club-deal` | `ClubDealStatus.tsx` | Projekt-Status + Zeichnungsstand |

### Admin

| Route | Datei | Beschreibung |
|-------|-------|--------------|
| `/admin/club-deals` | `admin/ClubDeals.tsx` | Projekte verwalten, Zeichnungen bestätigen |

---

## Dateien-Übersicht

### Backend
```
server/routers/clubDeal.ts       — Alle tRPC Procedures (adminCreateProject, checkStatus, subscribe, ...)
drizzle/clubDealSchema.ts        — Drizzle ORM Schema (3 Tabellen, 7 Enums)
```

### Frontend
```
client/src/pages/investor/
  InvestorLanding.tsx            — Öffentliche Landing Page
  InvestorOnboarding.tsx         — 2-Schritte Selbstauskunft-Flow
  InvestorDashboard.tsx          — Projektkarten-Grid
  InvestorProject.tsx            — Detailseite + Zeichnungs-Flow
  InvestorSubscriptions.tsx      — Zeichnungs-Übersicht

client/src/pages/admin/
  ClubDeals.tsx                  — Admin-Verwaltung (CRUD + Zeichnungen)

client/src/pages/customer/
  ClubDealStatus.tsx             — Anbieter-Statusseite

client/src/pages/
  Risikohinweise.tsx             — Öffentliche Risikohinweise-Seite

client/src/components/
  ClubDealSection.tsx            — Marketing-Abschnitt auf der Home-Seite
```

---

## Navigation-Änderungen

| Bereich | Änderung |
|---------|----------|
| Home-Navbar | "Investoren" Link → `/investor` (vor "Affiliate") |
| Admin-Sidebar | "Club Deals" Menüpunkt → `/admin/club-deals` |
| Client-Sidebar | "Club Deal" Menüpunkt → `/dashboard/club-deal` (wenn Projekt vorhanden) |
| Investoren-Sidebar | Abschnitt "INVESTMENTS": "Projekte" + "Meine Zeichnungen" (wenn isInvestor) |
| Landing Page | `ClubDealSection` Komponente vor FAQ-Abschnitt eingefügt |

---

## DashboardLayout — Investor-Menü

`DashboardLayout.tsx` ruft `clubDeal.checkStatus` ab (nur wenn `user && !isAdmin`) und blendet den Investoren-Bereich im Menü ein wenn `isInvestor === true`.

---

## Dokument-Upload

Dokumente werden über `POST /api/upload` hochgeladen:
```typescript
// Request
{ fileName: string, mimeType: string, data: string }  // data = base64

// Response
{ url: string, key: string }
```

In `club_deal_projects.documents` als JSON-Array gespeichert:
```json
[
  { "type": "pitchdeck", "url": "https://..." },
  { "type": "due_diligence", "url": "https://..." }
]
```

Erlaubte Dokumenttypen: `pitchdeck`, `businessplan`, `due_diligence`, `rating`, `term_sheet`, `other`

---

*Dieses Dokument beschreibt den Stand nach Session vom 15. März 2026.*
