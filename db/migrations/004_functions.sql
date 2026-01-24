-- RPC: kreiranje pretplate
CREATE OR REPLACE FUNCTION create_subscription(
  p_brand_id uuid,
  p_package_id uuid,
  p_start_date date,
  p_end_date date,
  p_payment_date date DEFAULT NULL,
  p_note text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO subscriptions (
    brand_id,
    package_id,
    start_date,
    end_date,
    payment_date,
    note,
    manually_disabled
  )
  VALUES (
    p_brand_id,
    p_package_id,
    p_start_date,
    p_end_date,
    p_payment_date,
    p_note,
    false
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;


-- RPC: poslovno isključivanje pretplate
CREATE OR REPLACE FUNCTION disable_subscription(
  p_subscription_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE subscriptions
  SET
    manually_disabled = true,
    disabled_note = p_reason
  WHERE id = p_subscription_id;
END;
$$;
