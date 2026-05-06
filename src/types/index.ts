export interface Profile {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface HealthRecord {
  id: string;
  user_id: string;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  heart_rate: number;
  blood_sugar: number;
  cholesterol: number;
  bmi: number;
  smoking_status: 'never' | 'former' | 'current';
  alcohol_consumption: 'none' | 'moderate' | 'heavy';
  physical_activity: 'sedentary' | 'moderate' | 'active';
  family_history: 'none' | 'diabetes' | 'heart_disease' | 'hypertension';
  stress_level: 'low' | 'moderate' | 'high';
  sleep_hours: number;
  notes: string;
  record_date: string;
  created_at: string;
}

export type HealthRecordInsert = Omit<HealthRecord, 'id' | 'created_at'>;
export type HealthRecordUpdate = Partial<HealthRecordInsert> & Pick<HealthRecord, 'id'>;

export interface MedicineSuggestion {
  name: string;
  description: string;
  dosage: string;
  category: 'cardiac' | 'diabetes' | 'hypertension' | 'general';
  estimated_cost_min: number;
  estimated_cost_max: number;
  currency: string;
  is_over_the_counter: boolean;
}

export interface RiskAssessment {
  id: string;
  user_id: string;
  health_record_id: string;
  cardiac_risk: 'low' | 'moderate' | 'high' | 'critical';
  diabetes_risk: 'low' | 'moderate' | 'high' | 'critical';
  hypertension_risk: 'low' | 'moderate' | 'high' | 'critical';
  overall_risk: 'low' | 'moderate' | 'high' | 'critical';
  cardiac_score: number;
  diabetes_score: number;
  hypertension_score: number;
  overall_score: number;
  recommendations: string;
  medicine_suggestions: string;
  created_at: string;
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface AuthState {
  user: null | { id: string; email: string };
  profile: Profile | null;
  loading: boolean;
}
