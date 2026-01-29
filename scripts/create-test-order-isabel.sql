-- ============================================
-- SCRIPT: Testbestellung für Isabel anlegen
-- ============================================
--
-- Legt eine abgeschlossene "Analyse & Strukturierungsdiagnose"
-- Bestellung für isabel.paustian@gmx.de an.
--
-- VERWENDUNG:
-- 1. Mit Railway CLI: railway run mysql < scripts/create-test-order-isabel.sql
-- 2. Oder: Kopiere die SQL-Statements und führe sie im Railway Dashboard aus
--
-- ============================================

-- Schritt 1: Prüfe ob User existiert
SELECT
  id,
  name,
  email,
  tenantId
FROM users
WHERE email = 'isabel.paustian@gmx.de';

-- Ergebnis notieren: userId = ?

-- ============================================

-- Schritt 2: Prüfe bestehende Bestellungen
SELECT
  id,
  productId,
  productName,
  status,
  paidAt,
  createdAt
FROM orders
WHERE userId = (SELECT id FROM users WHERE email = 'isabel.paustian@gmx.de');

-- ============================================

-- Schritt 3: Bestellung anlegen
-- WICHTIG: Nur ausführen, wenn User existiert!

INSERT INTO orders (
  userId,
  tenantId,
  productId,
  productName,
  status,
  paidAt,
  createdAt,
  updatedAt
)
SELECT
  u.id,
  COALESCE(u.tenantId, 1) as tenantId,
  'analysis' as productId,
  'Analyse & Strukturierungsdiagnose' as productName,
  'completed' as status,
  NOW() as paidAt,
  NOW() as createdAt,
  NOW() as updatedAt
FROM users u
WHERE u.email = 'isabel.paustian@gmx.de';

-- ============================================

-- Schritt 4: Verifizieren
SELECT
  o.id as order_id,
  u.name as user_name,
  u.email as user_email,
  o.productName,
  o.status,
  o.paidAt,
  o.createdAt
FROM orders o
JOIN users u ON o.userId = u.id
WHERE u.email = 'isabel.paustian@gmx.de'
ORDER BY o.createdAt DESC
LIMIT 1;

-- ============================================
-- ✅ FERTIG!
-- Isabel sollte jetzt die Analyse in ihrem Portal sehen können.
-- ============================================
