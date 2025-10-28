/*
  # Create Machines Table

  1. New Tables
    - `machines`
      - `id` (uuid, primary key) - Unique identifier for each machine
      - `name` (text) - Machine name/identifier
      - `status` (text) - Current operational status (active, idle, maintenance)
      - `location` (text) - Physical location of the machine
      - `created_at` (timestamptz) - Timestamp of record creation
      - `updated_at` (timestamptz) - Timestamp of last update
  
  2. Security
    - Enable RLS on `machines` table
    - Add policy for public read access (for demo purposes)
*/

CREATE TABLE IF NOT EXISTS machines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text DEFAULT 'active',
  location text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE machines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to machines"
  ON machines
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users to read machines"
  ON machines
  FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO machines (name, status, location) VALUES
  ('Machine Alpha-01', 'active', 'Production Floor A'),
  ('Machine Beta-02', 'active', 'Production Floor A'),
  ('Machine Gamma-03', 'active', 'Production Floor B'),
  ('Machine Delta-04', 'idle', 'Production Floor B'),
  ('Machine Epsilon-05', 'active', 'Production Floor C'),
  ('Machine Zeta-06', 'active', 'Production Floor C');
