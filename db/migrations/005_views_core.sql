-- View: subscriptions_with_status
CREATE OR REPLACE VIEW subscriptions_with_status AS
SELECT
  s.id,
  s.brand_id,
  s.package_id,
  s.start_date,
  s.end_date,
  s.payment_date,
  s.manually_disabled,
  s.disabled_note,
  s.note,
  CASE
    WHEN s.manually_disabled = true THEN 'ISKLJUCENA'
    WHEN CURRENT_DATE BETWEEN s.start_date AND s.end_date THEN 'AKTIVNA'
    ELSE 'NEAKTIVNA'
  END AS status
FROM subscriptions s;
