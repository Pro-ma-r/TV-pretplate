-- Trigger funkcija: zabrana izmjene core polja pretplate
CREATE OR REPLACE FUNCTION prevent_subscription_core_update()
RETURNS trigger AS $$
BEGIN
  IF
    NEW.brand_id   <> OLD.brand_id OR
    NEW.package_id <> OLD.package_id OR
    NEW.start_date <> OLD.start_date OR
    NEW.end_date   <> OLD.end_date
  THEN
    RAISE EXCEPTION
      'Nije dozvoljeno mijenjati brand, paket ili datume postojeće pretplate';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Trigger
CREATE TRIGGER trg_prevent_subscription_core_update
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION prevent_subscription_core_update();
