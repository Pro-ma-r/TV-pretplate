-- Aktivni brendovi za web
CREATE OR REPLACE VIEW active_brands_for_web AS
SELECT DISTINCT
  b.id   AS brand_id,
  b.name AS brand_name,
  b.activity,
  b.email,
  b.contact_person
FROM brands b
JOIN subscriptions_with_status s
  ON s.brand_id = b.id
WHERE s.status = 'AKTIVNA';


-- Neaktivni (bivši) brendovi za web
CREATE OR REPLACE VIEW former_brands_for_web AS
SELECT
  b.id   AS brand_id,
  b.name AS brand_name,
  b.activity,
  b.email,
  b.contact_person
FROM brands b
WHERE NOT EXISTS (
  SELECT 1
  FROM subscriptions_with_status s
  WHERE
    s.brand_id = b.id
    AND s.status = 'AKTIVNA'
);
