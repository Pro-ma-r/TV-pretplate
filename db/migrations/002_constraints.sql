-- Omogućuje EXCLUSION constraint s datumskim rasponima
CREATE EXTENSION IF NOT EXISTS btree_gist;


-- Zabrana vremenskog preklapanja istog paketa za isti brend
ALTER TABLE subscriptions
ADD CONSTRAINT no_overlapping_active_subscriptions
EXCLUDE USING gist (
  brand_id WITH =,
  package_id WITH =,
  daterange(start_date, end_date, '[]') WITH &&
);
