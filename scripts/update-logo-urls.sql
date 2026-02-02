-- ============================================
-- SCRIPT: Update Partner Logo URLs
-- ============================================
--
-- Updates imageUrl fields in partner_logos table to point to
-- correct files in client/public/images/logos/
--
-- VERWENDUNG:
-- Kopiere die SQL-Statements ins Railway MySQL Dashboard
-- und führe sie nacheinander aus (oder alle auf einmal)
--
-- ============================================

-- Schritt 1: Aktuelle Logos anzeigen (zur Überprüfung)
SELECT
  id,
  name,
  category,
  imageUrl,
  isActive
FROM partner_logos
ORDER BY category, sortOrder, name;

-- ============================================

-- Schritt 2: Presse-Logos aktualisieren/erstellen
-- ============================================

-- FOCUS Logo
INSERT INTO partner_logos (name, category, imageUrl, linkUrl, sortOrder, isActive)
VALUES ('FOCUS', 'presse', '/images/logos/presse/focus-logo.png', 'https://www.focus.de', 10, TRUE)
ON DUPLICATE KEY UPDATE
  imageUrl = '/images/logos/presse/focus-logo.png',
  linkUrl = 'https://www.focus.de',
  isActive = TRUE;

-- Forbes Logo
INSERT INTO partner_logos (name, category, imageUrl, linkUrl, sortOrder, isActive)
VALUES ('Forbes', 'presse', '/images/logos/presse/forbes-logo.png', 'https://www.forbes.com', 20, TRUE)
ON DUPLICATE KEY UPDATE
  imageUrl = '/images/logos/presse/forbes-logo.png',
  linkUrl = 'https://www.forbes.com',
  isActive = TRUE;

-- ============================================

-- Schritt 3: Mitgliedschafts-Logos aktualisieren/erstellen
-- ============================================

-- Swiss Startup Association
INSERT INTO partner_logos (name, category, imageUrl, linkUrl, sortOrder, isActive)
VALUES ('Swiss Startup Association', 'mitgliedschaft', '/images/logos/mitgliedschaften/partner-swiss-startup.png', NULL, 10, TRUE)
ON DUPLICATE KEY UPDATE
  imageUrl = '/images/logos/mitgliedschaften/partner-swiss-startup.png',
  isActive = TRUE;

-- BAND Business Angels
INSERT INTO partner_logos (name, category, imageUrl, linkUrl, sortOrder, isActive)
VALUES ('BAND Business Angels', 'mitgliedschaft', '/images/logos/mitgliedschaften/partner-band.png', 'https://www.business-angels.de', 20, TRUE)
ON DUPLICATE KEY UPDATE
  imageUrl = '/images/logos/mitgliedschaften/partner-band.png',
  linkUrl = 'https://www.business-angels.de',
  isActive = TRUE;

-- ============================================

-- Schritt 4: Auszeichnungs-Logos aktualisieren/erstellen
-- ============================================

-- diind - Unternehmen der Zukunft
INSERT INTO partner_logos (name, category, imageUrl, linkUrl, sortOrder, isActive)
VALUES ('diind - Unternehmen der Zukunft', 'auszeichnung', '/images/logos/auszeichnungen/photo_2025-05-29_14-49-55-removebg-preview.jpeg', 'https://www.unternehmen-der-zukunft.de', 10, TRUE)
ON DUPLICATE KEY UPDATE
  imageUrl = '/images/logos/auszeichnungen/photo_2025-05-29_14-49-55-removebg-preview.jpeg',
  linkUrl = 'https://www.unternehmen-der-zukunft.de',
  isActive = TRUE;

-- ============================================

-- Schritt 5: Partner-Logos aktualisieren/erstellen
-- ============================================

-- DUB (Deutsche Unternehmerbörse)
INSERT INTO partner_logos (name, category, imageUrl, linkUrl, sortOrder, isActive)
VALUES ('DUB', 'partner', '/images/logos/partner/Logo_DUBbyAMBER_3000x900.svg', 'https://www.dub.de', 10, TRUE)
ON DUPLICATE KEY UPDATE
  imageUrl = '/images/logos/partner/Logo_DUBbyAMBER_3000x900.svg',
  linkUrl = 'https://www.dub.de',
  isActive = TRUE;

-- ============================================

-- Schritt 6: Verifizierung - Alle aktiven Logos anzeigen
SELECT
  id,
  name,
  category,
  imageUrl,
  linkUrl,
  sortOrder,
  isActive
FROM partner_logos
WHERE isActive = TRUE
ORDER BY category, sortOrder, name;

-- ============================================
-- ✅ FERTIG!
-- ============================================
--
-- Nächste Schritte:
-- 1. Admin-Panel öffnen: /admin/logos
-- 2. Überprüfen ob Bilder korrekt angezeigt werden
-- 3. Homepage überprüfen: Logos sollten sichtbar sein
--
-- Hinweis: Falls ein Logo nicht lädt, prüfe:
-- - Dateiname stimmt exakt überein (Groß-/Kleinschreibung!)
-- - Datei existiert in client/public/images/logos/
-- - Build wurde neu deployed (Railway)
