-- Osnovne dashboard statistike
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM brands)                AS total_brands,
  (SELECT COUNT(*) FROM active_brands_for_web) AS active_brands,
  (SELECT COUNT(*) FROM former_brands_for_web) AS former_brands,

  (SELECT COUNT(*) FROM subscriptions) AS total_subscriptions,

  (SELECT COUNT(*) FROM subscriptions_with_status
    WHERE status = 'AKTIVNA')     AS active_subscriptions,

  (SELECT COUNT(*) FROM subscriptions_with_status
    WHERE status = 'NEAKTIVNA')   AS inactive_subscriptions,

  (SELECT COUNT(*) FROM subscriptions_with_status
    WHERE status = 'ISKLJUCENA')  AS disabled_subscriptions;


-- Aktivne pretplate po paketima
CREATE OR REPLACE VIEW dashboard_packages AS
SELECT
  p.id    AS package_id,
  p.name  AS package_name,
  COUNT(s.id) AS active_subscriptions
FROM packages p
LEFT JOIN subscriptions_with_status s
  ON s.package_id = p.id
  AND s.status = 'AKTIVNA'
GROUP BY p.id, p.name
ORDER BY active_subscriptions DESC;


-- Dashboard po klijentima
CREATE OR REPLACE VIEW dashboard_clients AS
SELECT
  c.id   AS client_id,
  c.name AS client_name,

  COUNT(DISTINCT b.id) AS total_brands,

  COUNT(DISTINCT s.id) FILTER (
    WHERE s.status = 'AKTIVNA'
  ) AS active_subscriptions

FROM clients c
LEFT JOIN brands b
  ON b.client_id = c.id
LEFT JOIN subscriptions_with_status s
  ON s.brand_id = b.id

GROUP BY c.id, c.name
ORDER BY active_subscriptions DESC, total_brands DESC;


-- Dashboard po djelatnostima
CREATE OR REPLACE VIEW dashboard_activities AS
SELECT
  b.activity,

  COUNT(DISTINCT b.id) AS total_brands,

  COUNT(DISTINCT s.id) FILTER (
    WHERE s.status = 'AKTIVNA'
  ) AS active_subscriptions

FROM brands b
LEFT JOIN subscriptions_with_status s
  ON s.brand_id = b.id

GROUP BY b.activity
ORDER BY active_subscriptions DESC, total_brands DESC;
