-- 📝 Finaler Supabase Table Setup
-- Führe dieses SQL im Supabase SQL Editor aus.

-- 1. Clients Table (Erweitert)
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  bot_name text NOT NULL,
  website_url text,
  kb text,
  openai_key text,
  theme_color text DEFAULT '#6366f1',
  bot_avatar_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Falls Tabelle schon existiert, Felder hinzufügen:
-- ALTER TABLE clients ADD COLUMN IF NOT EXISTS website_url text;
-- ALTER TABLE clients ADD COLUMN IF NOT EXISTS theme_color text DEFAULT '#6366f1';
-- ALTER TABLE clients ADD COLUMN IF NOT EXISTS bot_avatar_url text;

-- 2. Team Table
CREATE TABLE IF NOT EXISTS team (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text,
  email text UNIQUE,
  role text,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Initial Owner (Optional)
INSERT INTO team (name, email, role) 
VALUES ('Admin', 'admin@agency.com', 'Owner')
ON CONFLICT (email) DO NOTHING;
