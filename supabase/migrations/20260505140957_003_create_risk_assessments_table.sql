/*
  # Create risk_assessments table

  1. New Tables
    - `risk_assessments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `health_record_id` (uuid, references health_records)
      - `cardiac_risk` (text) - low/moderate/high/critical
      - `diabetes_risk` (text) - low/moderate/high/critical
      - `hypertension_risk` (text) - low/moderate/high/critical
      - `overall_risk` (text) - low/moderate/high/critical
      - `cardiac_score` (integer) - 0-100
      - `diabetes_score` (integer) - 0-100
      - `hypertension_score` (integer) - 0-100
      - `overall_score` (integer) - 0-100
      - `recommendations` (text) - JSON array of recommendations
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `risk_assessments` table
    - Users can only access their own risk assessments
*/

CREATE TABLE IF NOT EXISTS risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  health_record_id uuid NOT NULL REFERENCES health_records(id) ON DELETE CASCADE,
  cardiac_risk text DEFAULT 'low',
  diabetes_risk text DEFAULT 'low',
  hypertension_risk text DEFAULT 'low',
  overall_risk text DEFAULT 'low',
  cardiac_score integer DEFAULT 0,
  diabetes_score integer DEFAULT 0,
  hypertension_score integer DEFAULT 0,
  overall_score integer DEFAULT 0,
  recommendations text DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own risk assessments"
  ON risk_assessments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own risk assessments"
  ON risk_assessments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own risk assessments"
  ON risk_assessments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_user_id ON risk_assessments(user_id);
