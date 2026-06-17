CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS oncalls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID REFERENCES squads(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  phone TEXT,
  hours TEXT,
  role TEXT,
  observation TEXT,
  "orderIndex" INTEGER DEFAULT 99,
  is_lead BOOLEAN DEFAULT FALSE,
  has_phone BOOLEAN DEFAULT TRUE,
  subgroup TEXT,
  is_off BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS cds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cd_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cd_id UUID REFERENCES cds(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  phone TEXT,
  role TEXT,
  observation TEXT,
  "orderIndex" INTEGER DEFAULT 99
);

CREATE TABLE IF NOT EXISTS filiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_number TEXT UNIQUE NOT NULL,
  name TEXT,
  regional TEXT,
  manager_name TEXT,
  phone TEXT,
  address TEXT,
  address_number TEXT,
  neighborhood TEXT,
  cep TEXT,
  city TEXT,
  state TEXT,
  hours TEXT,
  open_sunday TEXT
);

CREATE TABLE IF NOT EXISTS filial_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_number TEXT REFERENCES filiais(store_number) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  phone TEXT,
  role TEXT,
  observation TEXT
);

CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target TEXT,
  details TEXT,
  user_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
