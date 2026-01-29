-- ============================================
-- SCRIPT: Isabels Test-Verträge löschen
-- ============================================
--
-- Löscht die Test-Contract-Assignments von Isabel Paustian:
-- 1. "Vertrag aus Vorlage erstellen test" - Zugewiesen 29.1.2026
-- 2. "dtzjdtzj" - Zugewiesen 22.1.2026
--
-- VERWENDUNG:
-- Mit Railway CLI: railway run mysql < scripts/delete-isabel-test-contracts.sql
-- Oder: Kopiere die SQL-Statements ins Railway Dashboard
--
-- ============================================

-- Schritt 1: Isabel's User-ID finden
SELECT
  id,
  email,
  name
FROM users
WHERE email = 'isabel.paustian@gmx.de';

-- ============================================

-- Schritt 2: Isabels Contract-Assignments anzeigen
SELECT
  ca.id as assignment_id,
  ca.contractId,
  c.name as contract_name,
  c.description,
  ca.createdAt as assigned_at,
  ca.note
FROM contract_assignments ca
JOIN contracts c ON ca.contractId = c.id
JOIN users u ON ca.userId = u.id
WHERE u.email = 'isabel.paustian@gmx.de'
ORDER BY ca.createdAt DESC;

-- ============================================

-- Schritt 3: Test-Assignments löschen
-- WICHTIG: Nur ausführen nachdem Schritt 2 die richtigen Assignments zeigt!

-- Löscht Assignments mit Namen die "test" oder "dtzjdtzj" enthalten
DELETE ca FROM contract_assignments ca
JOIN contracts c ON ca.contractId = c.id
JOIN users u ON ca.userId = u.id
WHERE u.email = 'isabel.paustian@gmx.de'
  AND (
    c.name LIKE '%test%'
    OR c.name LIKE '%dtzjdtzj%'
    OR c.name = 'Vertrag aus Vorlage erstellen test'
  );

-- ============================================

-- Schritt 4: Verifizieren - Isabel sollte nun keine Test-Assignments mehr haben
SELECT
  ca.id as assignment_id,
  c.name as contract_name,
  ca.createdAt as assigned_at
FROM contract_assignments ca
JOIN contracts c ON ca.contractId = c.id
JOIN users u ON ca.userId = u.id
WHERE u.email = 'isabel.paustian@gmx.de'
ORDER BY ca.createdAt DESC;

-- ============================================
-- ✅ ALTERNATIVE: Manuelle Löschung per Assignment-ID
-- ============================================

-- Falls du die genauen Assignment-IDs kennst, verwende:
/*
DELETE FROM contract_assignments WHERE id IN (123, 456);

-- Dann verifizieren:
SELECT * FROM contract_assignments WHERE userId = (
  SELECT id FROM users WHERE email = 'isabel.paustian@gmx.de'
);
*/
