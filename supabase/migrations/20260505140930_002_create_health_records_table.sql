/*
  # Create health_records table

  1. New Tables
    - `health_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `blood_pressure_systolic` (integer) - systolic BP in mmHg
      - `blood_pressure_diastolic` (integer) - diastolic BP in mmHg
      - `heart_rate` (integer) - beats per minute
      - `blood_sugar` (numeric) - fasting blood sugar mg/dL
      - `cholesterol` (numeric) - total cholesterol mg/dL
      - `bmi` (numeric) - body mass index
      - `smoking_status` (text) - never/former/current
      - `alcohol_consumption` (text) - none/moderate/heavy
      - `physical_activity` (text) - sedentary/moderate/active
      - `family_history` (text) - diabetes/heart_disease/hypertension/none
      - `stress_level` (text) - low/moderate/high
      - `sleep_hours` (numeric) - average sleep per night
      - `notes` (text) - additional notes
      - `record_date` (date) - date of the health record
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `health_records` table
    - Users can only CRUD their own health records
*/

CREATE TABLE IF NOT EXISTS health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blood_pressure_systolic integer DEFAULT 0,
  blood_pressure_diastolic integer DEFAULT 0,
  heart_rate integer DEFAULT 0,
  blood_sugar numeric DEFAULT 0,
  cholesterol numeric DEFAULT 0,
  bmi numeric DEFAULT 0,
  smoking_status text DEFAULT 'never',
  alcohol_consumption text DEFAULT 'none',
  physical_activity text DEFAULT 'moderate',
  family_history text DEFAULT 'none',
  stress_level text DEFAULT 'low',
  sleep_hours numeric DEFAULT 7,
  notes text DEFAULT '',
  record_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own health records"
  ON health_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health records"
  ON health_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health records"
  ON health_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own health records"
  ON health_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON health_records(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_record_date ON health_records(record_date);
