-- MASTER TABLICE: READ-ONLY ZA authenticated

REVOKE INSERT, UPDATE, DELETE
ON clients
FROM authenticated;

REVOKE INSERT, UPDATE, DELETE
ON brands
FROM authenticated;

REVOKE INSERT, UPDATE, DELETE
ON packages
FROM authenticated;


-- SUBSCRIPTIONS: ZAŠTITE

REVOKE INSERT, DELETE
ON subscriptions
FROM authenticated;


-- RPC FUNKCIJE: JEDINI DOZVOLJENI ULAZ

GRANT EXECUTE
ON FUNCTION create_subscription(uuid, uuid, date, date, date, text)
TO authenticated;

GRANT EXECUTE
ON FUNCTION disable_subscription(uuid, text)
TO authenticated;
