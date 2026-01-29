-- ============================================
-- SCRIPT: Bestellung auf "bezahlt" setzen
-- ============================================
--
-- Setzt eine ausstehende Bestellung auf "completed" (bezahlt)
-- mit aktuellem Zeitstempel als paidAt.
--
-- VERWENDUNG:
-- 1. Mit Railway CLI: railway run mysql < scripts/mark-order-paid.sql
-- 2. Oder: Kopiere die SQL-Statements ins Railway Dashboard
--
-- ============================================

-- Schritt 1: Aktuelle Bestellungen von Isabel anzeigen
SELECT
  o.id as order_id,
  o.userId,
  u.name as user_name,
  u.email as user_email,
  o.productId,
  o.productName,
  o.status,
  o.paidAt,
  o.createdAt
FROM orders o
JOIN users u ON o.userId = u.id
WHERE u.email LIKE '%isabel%'
   OR u.name LIKE '%Isabel%'
ORDER BY o.createdAt DESC;

-- ============================================

-- Schritt 2: Bestellung #7 auf "completed" setzen
-- WICHTIG: Nur ausführen, wenn Order #7 existiert und Isabel gehört!

UPDATE orders
SET
  status = 'completed',
  paidAt = NOW(),
  updatedAt = NOW()
WHERE id = 7;

-- ============================================

-- Schritt 3: Verifizieren
SELECT
  o.id as order_id,
  u.name as user_name,
  u.email as user_email,
  o.productName,
  o.status,
  o.paidAt,
  o.updatedAt
FROM orders o
JOIN users u ON o.userId = u.id
WHERE o.id = 7;

-- ============================================
-- ✅ ALTERNATIVE: Bestellung #6 statt #7
-- ============================================

-- Falls Order #6 statt #7 bezahlt werden soll:
/*
UPDATE orders
SET
  status = 'completed',
  paidAt = NOW(),
  updatedAt = NOW()
WHERE id = 6;

SELECT
  o.id as order_id,
  u.name as user_name,
  u.email as user_email,
  o.productName,
  o.status,
  o.paidAt
FROM orders o
JOIN users u ON o.userId = u.id
WHERE o.id = 6;
*/

-- ============================================
-- ✅ ALTERNATIVE: ALLE ausstehenden Orders von Isabel
-- ============================================

-- Falls ALLE ausstehenden Orders von Isabel bezahlt werden sollen:
/*
UPDATE orders o
JOIN users u ON o.userId = u.id
SET
  o.status = 'completed',
  o.paidAt = NOW(),
  o.updatedAt = NOW()
WHERE u.email = 'isabel.paustian@gmx.de'
  AND o.status = 'pending';

SELECT
  o.id as order_id,
  u.name as user_name,
  o.productName,
  o.status,
  o.paidAt
FROM orders o
JOIN users u ON o.userId = u.id
WHERE u.email = 'isabel.paustian@gmx.de';
*/
