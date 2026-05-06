/*
  # Add medicine_suggestions column to risk_assessments

  1. Modified Tables
    - `risk_assessments`
      - Add `medicine_suggestions` (text) - JSON array of medicine objects with name, description, dosage, estimated_cost, category

  2. Security
    - No new policies needed; column inherits existing RLS policies on risk_assessments
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'risk_assessments' AND column_name = 'medicine_suggestions'
  ) THEN
    ALTER TABLE risk_assessments ADD COLUMN medicine_suggestions text DEFAULT '[]';
  END IF;
END $$;
