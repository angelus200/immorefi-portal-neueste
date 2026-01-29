-- ============================================
-- Quick Delete: Isabel's Test Contract Assignments
-- ============================================
-- Copy and paste these queries into Railway MySQL Dashboard
-- Execute them ONE BY ONE in order

-- 1. SHOW Isabel's current assignments (SAFE - just shows data)
SELECT
  ca.id as assignment_id,
  c.name as contract_name,
  ca.createdAt as assigned_date
FROM contract_assignments ca
JOIN contracts c ON ca.contractId = c.id
JOIN users u ON ca.userId = u.id
WHERE u.email = 'isabel.paustian@gmx.de'
ORDER BY ca.createdAt DESC;

-- 2. DELETE test assignments (⚠️ This actually deletes!)
DELETE ca FROM contract_assignments ca
JOIN contracts c ON ca.contractId = c.id
JOIN users u ON ca.userId = u.id
WHERE u.email = 'isabel.paustian@gmx.de'
  AND (
    c.name LIKE '%test%' OR
    c.name LIKE '%dtzjdtzj%'
  );

-- 3. VERIFY - show remaining assignments (should be empty or only real contracts)
SELECT
  ca.id as assignment_id,
  c.name as contract_name,
  ca.createdAt as assigned_date
FROM contract_assignments ca
JOIN contracts c ON ca.contractId = c.id
JOIN users u ON ca.userId = u.id
WHERE u.email = 'isabel.paustian@gmx.de'
ORDER BY ca.createdAt DESC;
