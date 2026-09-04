/*
# Create CrewBook Tables (Single-tenant, no auth)

1. Overview
CrewBook is a studio management app for film/photography crews.
This migration creates three tables: bookings, team, and freelancing.
The app has no real authentication (mock OTP role selection), so it is
single-tenant with anon+authenticated CRUD access on all tables.

2. New Tables
- `bookings`: Studio event bookings (weddings, shoots, etc.)
  - id (uuid PK)
  - client_name (text, not null) — e.g. "Rahul & Priya"
  - event_type (text) — e.g. "Wedding", "Pre-Wedding"
  - event_date (date) — the event date
  - event_time (text) — e.g. "10:00 AM"
  - location (text) — venue address
  - budget (numeric, default 0) — total agreed budget
  - received (numeric, default 0) — total amount received so far
  - notes (text) — special instructions
  - assigned_team (text[], default '{}') — team member names assigned
  - status (text, default 'Confirmed')
  - installments (jsonb, default '[]') — array of {date, amount} objects
  - created_at (timestamptz)

- `team`: Team members
  - id (uuid PK)
  - name (text, not null)
  - whatsapp (text) — WhatsApp number
  - role (text) — e.g. "Cinematographer", "Photographer"
  - payment_status (text, default 'Pending') — 'Paid' or 'Pending'
  - created_at (timestamptz)

- `freelancing`: Freelance work assignments
  - id (uuid PK)
  - date (date) — assignment date
  - name (text, not null) — studio/client name
  - equipment (text) — camera/equipment used
  - paid (numeric, default 0)
  - unpaid (numeric, default 0)
  - assigned_team (text) — assigned team member name
  - created_at (timestamptz)

3. Security
- RLS enabled on all three tables.
- All tables allow anon+authenticated full CRUD (single-tenant, no auth app).
- USING (true) is acceptable here because the data is intentionally shared
  across all users of this single-tenant app with no sign-in screen.

4. Seed Data
- Inserts one sample booking, one team member, and one freelance entry
  matching the original app's initial data.
*/

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  event_type text DEFAULT '',
  event_date date,
  event_time text DEFAULT '',
  location text DEFAULT '',
  budget numeric NOT NULL DEFAULT 0,
  received numeric NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  assigned_team text[] DEFAULT '{}',
  status text DEFAULT 'Confirmed',
  installments jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_bookings" ON bookings;
CREATE POLICY "anon_select_bookings" ON bookings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bookings" ON bookings;
CREATE POLICY "anon_update_bookings" ON bookings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bookings" ON bookings;
CREATE POLICY "anon_delete_bookings" ON bookings FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS team (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  whatsapp text DEFAULT '',
  role text DEFAULT '',
  payment_status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE team ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_team" ON team;
CREATE POLICY "anon_select_team" ON team FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_team" ON team;
CREATE POLICY "anon_insert_team" ON team FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_team" ON team;
CREATE POLICY "anon_update_team" ON team FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_team" ON team;
CREATE POLICY "anon_delete_team" ON team FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS freelancing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date,
  name text NOT NULL,
  equipment text DEFAULT '',
  paid numeric NOT NULL DEFAULT 0,
  unpaid numeric NOT NULL DEFAULT 0,
  assigned_team text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE freelancing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_freelancing" ON freelancing;
CREATE POLICY "anon_select_freelancing" ON freelancing FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_freelancing" ON freelancing;
CREATE POLICY "anon_insert_freelancing" ON freelancing FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_freelancing" ON freelancing;
CREATE POLICY "anon_update_freelancing" ON freelancing FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_freelancing" ON freelancing;
CREATE POLICY "anon_delete_freelancing" ON freelancing FOR DELETE
  TO anon, authenticated USING (true);

-- Seed data (only if tables are empty)
INSERT INTO bookings (client_name, event_type, event_date, event_time, location, budget, received, notes, assigned_team, status, installments)
SELECT 'Rahul & Priya', 'Wedding', '2026-09-10', '10:00 AM', 'Jaipur Palace', 150000, 50000, 'Drone shot mandatory', ARRAY['Amit Sharma'], 'Confirmed', '[{"date":"2026-09-01","amount":50000}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM bookings);

INSERT INTO team (name, whatsapp, role, payment_status)
SELECT 'Amit Sharma', '+919876543210', 'Cinematographer', 'Paid'
WHERE NOT EXISTS (SELECT 1 FROM team);

INSERT INTO freelancing (date, name, equipment, paid, unpaid, assigned_team)
SELECT '2027-05-20', 'Debashish', 'Sony FX3', 0, 0, 'Amit Sharma'
WHERE NOT EXISTS (SELECT 1 FROM freelancing);
