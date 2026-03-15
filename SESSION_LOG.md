# ImmoRefi Portal – Session Log

Dieses Dokument protokolliert alle Entwicklungs-Sessions für das ImmoRefi Portal.
Neueste Sessions erscheinen oben.

---

# Session 27. Februar 2026 | Version 1.0.5

## Session-Änderungen (27.02.2026)

| # | Beschreibung | Status | Priorität |
|---|---|---|---|
| 1 | Video-Bereich (Hybrid-Player) | IMPLEMENTIERT | HOCH |
| 2 | Registrieren Button Navigation | IMPLEMENTIERT | MITTEL |
| 3 | Hero-Text Block | IMPLEMENTIERT | HOCH |
| 4 | Ticker-Laufband (Finanzprodukte) | IMPLEMENTIERT | MITTEL |
| 5 | ConsultationBanner (Erstberatung) | IMPLEMENTIERT | HOCH |

---

## Neue Dateien

- `client/src/config/videos.ts` – Zentrale Vidyard Video-Konfiguration (8 Videos)
- `client/src/components/VideoSection.tsx` – Hybrid-Player (1 groß + Thumbnails)
- `client/src/components/TickerBand.tsx` – Laufband mit 12 Finanzprodukten
- `client/src/components/ConsultationBanner.tsx` – Erstberatungs-Banner €850

## Geänderte Dateien

- `client/src/pages/Home.tsx` – VideoSection, Hero-Text, ConsultationBanner eingebunden
- `client/src/App.tsx` – TickerBand global eingebunden

---

## Neue Seitenstruktur Homepage

```
TickerBand (alle Seiten, ganz oben)
    ↓
Navigation – Login | Registrieren | Analyse kaufen
    ↓
Hero: "Die Bank sagt Nein. Wir sagen Ja."
    ↓
ConsultationBanner – €850 Erstberatung
    ↓
VideoSection – 8 Vidyard Videos (Hybrid-Player)
    ↓
... restliche Seite
```

---

## Offene Punkte

| Problem | Priorität | Aufwand |
|---|---|---|
| Vidyard UUIDs: noch 2 Videos fehlen (Ziel war 10) | NIEDRIG | <15min |
| Clerk SDK Migration (@clerk/clerk-sdk-node → @clerk/express) | NIEDRIG | ~2h |
| Railway Ephemeral Storage | MITTEL | Architektur |
| Affiliate End-to-End Test | MITTEL | ~1h |
| Legacy deutsche DB-Spalten (leads) | NIEDRIG | <30min |

---

## Kritische Learnings (kumuliert)

1. **Drizzle Enum-Naming:** JS-Feldname ≠ DB-Spaltenname
   - Vor DB-Änderungen immer: `DESCRIBE tablename;`
   - Bekannte Mappings: status→userStatus, source→userSource, status→leadStatus

2. **ctx.user.id** = numerische DB-ID | **ctx.user.openId** = Clerk-ID

3. **Middleware-Reihenfolge NICHT ändern**
   - Stripe raw body → express.json() → ... → SPA Fallback

4. **Railway: Kein Auto-Migration**
   - Manuell: `DATABASE_URL='...' npx drizzle-kit push`

5. **tRPC:** `useQuery(undefined, options)` – NICHT `useQuery({}, options)`
   - SelectItem: niemals `value=''` → `value='none'`

---

## Technische Konfiguration

**Datenbank:**
```
mysql://root:BbcwfkfXkkopXkWeCbsROxQRuHLQcLKQ@metro.proxy.rlwy.net:54686/railway
```

**GoHighLevel:**
- Location-ID: `0beKz0TSeMQXqUf2fDg7`
- API Key: `0b1e327e-beaa-4576-a45a-71c6c01966c7`

**Resend API Key:**
```
re_htqSa8Xw_J1cHKC7V7v6Ww481aA9b6sGq
```

**Stack:**
- Frontend: React 19 + TypeScript + Vite
- Backend: Express.js + tRPC
- Database: MySQL + Drizzle ORM
- Auth: Clerk
- Payment: Stripe
- UI: Tailwind + Shadcn/UI
- CRM: GoHighLevel
- Voice: ElevenLabs

**Repository:** github.com/angelus200/immorefi-portal-neueste
**Hosting:** Railway (Auto-Deploy)
**URL:** portal.immoportal.app

---

**Ende Session 27.02.2026**

---
