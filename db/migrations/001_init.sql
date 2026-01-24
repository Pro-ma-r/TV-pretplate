-- CLIENTS
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  oib text UNIQUE,
  email text,
  phone text,
  address text,
  note text,
  created_at timestamptz DEFAULT now()
);


-- BRANDS
CREATE TABLE brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id),
  name text NOT NULL,
  activity text,
  email text,
  contact_person text,
  visible_on_web boolean DEFAULT true,
  note text,
  created_at timestamptz DEFAULT now()
);


-- PACKAGES
CREATE TABLE packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  duration_days integer NOT NULL,
  created_at timestamptz DEFAULT now()
);


-- SUBSCRIPTIONS
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id),
  package_id uuid NOT NULL REFERENCES packages(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  payment_date date,
  manually_disabled boolean DEFAULT false,
  disabled_note text,
  note text,
  created_at timestamptz DEFAULT now()
);
