import { supabase } from '../lib/supabase';
import type { HealthRecord, HealthRecordInsert, HealthRecordUpdate } from '../types';

export async function getHealthRecords(userId: string): Promise<HealthRecord[]> {
  const { data, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('user_id', userId)
    .order('record_date', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getHealthRecordById(id: string): Promise<HealthRecord | null> {
  const { data, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function createHealthRecord(record: HealthRecordInsert): Promise<HealthRecord> {
  const { data, error } = await supabase
    .from('health_records')
    .insert(record)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateHealthRecord(record: HealthRecordUpdate): Promise<HealthRecord> {
  const { data, error } = await supabase
    .from('health_records')
    .update({
      blood_pressure_systolic: record.blood_pressure_systolic,
      blood_pressure_diastolic: record.blood_pressure_diastolic,
      heart_rate: record.heart_rate,
      blood_sugar: record.blood_sugar,
      cholesterol: record.cholesterol,
      bmi: record.bmi,
      smoking_status: record.smoking_status,
      alcohol_consumption: record.alcohol_consumption,
      physical_activity: record.physical_activity,
      family_history: record.family_history,
      stress_level: record.stress_level,
      sleep_hours: record.sleep_hours,
      notes: record.notes,
      record_date: record.record_date,
    })
    .eq('id', record.id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteHealthRecord(id: string): Promise<void> {
  const { error } = await supabase
    .from('health_records')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function searchHealthRecords(
  userId: string,
  query: string,
  dateFrom?: string,
  dateTo?: string
): Promise<HealthRecord[]> {
  let q = supabase
    .from('health_records')
    .select('*')
    .eq('user_id', userId);

  if (dateFrom) q = q.gte('record_date', dateFrom);
  if (dateTo) q = q.lte('record_date', dateTo);

  const { data, error } = await q.order('record_date', { ascending: false });
  if (error) throw new Error(error.message);

  if (!query) return data ?? [];

  const lowerQuery = query.toLowerCase();
  return (data ?? []).filter(
    (r) =>
      r.smoking_status.toLowerCase().includes(lowerQuery) ||
      r.physical_activity.toLowerCase().includes(lowerQuery) ||
      r.stress_level.toLowerCase().includes(lowerQuery) ||
      r.notes.toLowerCase().includes(lowerQuery) ||
      r.family_history.toLowerCase().includes(lowerQuery)
  );
}
