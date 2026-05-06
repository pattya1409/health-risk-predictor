import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getHealthRecords,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  searchHealthRecords,
} from '../../services/healthRecordService';
import type { HealthRecord } from '../../types';
import { Plus, Search, CreditCard as Edit2, Trash2, X, ChevronDown, ChevronUp, AlertCircle, FileText } from 'lucide-react';

const emptyRecord = {
  user_id: '',
  blood_pressure_systolic: 120,
  blood_pressure_diastolic: 80,
  heart_rate: 72,
  blood_sugar: 90,
  cholesterol: 180,
  bmi: 22,
  smoking_status: 'never' as const,
  alcohol_consumption: 'none' as const,
  physical_activity: 'moderate' as const,
  family_history: 'none' as const,
  stress_level: 'low' as const,
  sleep_hours: 7,
  notes: '',
  record_date: new Date().toISOString().split('T')[0],
};

export default function HealthRecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyRecord);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadRecords = async () => {
    if (!user) return;
    try {
      const data = await getHealthRecords(user.id);
      setRecords(data);
    } catch {
      setError('Failed to load records');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSearch = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await searchHealthRecords(user.id, searchQuery, dateFrom, dateTo);
      setRecords(data);
    } catch {
      setError('Search failed');
    }
    setLoading(false);
  };

  const resetSearch = async () => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setLoading(true);
    await loadRecords();
  };

  const openCreateForm = () => {
    setForm({ ...emptyRecord, user_id: user!.id, record_date: new Date().toISOString().split('T')[0] });
    setEditingId(null);
    setShowForm(true);
    setError('');
  };

  const openEditForm = (record: HealthRecord) => {
    setForm({
      user_id: record.user_id,
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
    });
    setEditingId(record.id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingId) {
        await updateHealthRecord({ id: editingId, ...form });
      } else {
        await createHealthRecord(form);
      }
      setShowForm(false);
      setEditingId(null);
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save record');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await deleteHealthRecord(id);
      await loadRecords();
    } catch {
      setError('Failed to delete record');
    }
  };

  const selectField = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    options: { value: string; label: string }[]
  ) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  const numberField = (
    label: string,
    value: number,
    onChange: (v: number) => void,
    step = 1,
    unit = ''
  ) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label} {unit && <span className="text-slate-500">({unit})</span>}
      </label>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Health Records</h1>
          <p className="text-slate-400 mt-1">Manage your health data entries</p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-medium px-4 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/25"
        >
          <Plus className="w-4 h-4" />
          Add Record
        </button>
      </div>

      {/* Search/Filter Bar */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-400 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by status, activity, notes..."
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Filter
          </button>
          {(searchQuery || dateFrom || dateTo) && (
            <button
              onClick={resetSearch}
              className="text-slate-400 hover:text-white px-2 py-2 text-sm transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">
                {editingId ? 'Edit Health Record' : 'New Health Record'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Vital Signs */}
              <div>
                <h3 className="text-sm font-semibold text-teal-400 uppercase tracking-wider mb-3">
                  Vital Signs
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {numberField('Systolic BP', form.blood_pressure_systolic, (v) => setForm({ ...form, blood_pressure_systolic: v }), 1, 'mmHg')}
                  {numberField('Diastolic BP', form.blood_pressure_diastolic, (v) => setForm({ ...form, blood_pressure_diastolic: v }), 1, 'mmHg')}
                  {numberField('Heart Rate', form.heart_rate, (v) => setForm({ ...form, heart_rate: v }), 1, 'bpm')}
                  {numberField('Blood Sugar', form.blood_sugar, (v) => setForm({ ...form, blood_sugar: v }), 1, 'mg/dL')}
                  {numberField('Cholesterol', form.cholesterol, (v) => setForm({ ...form, cholesterol: v }), 1, 'mg/dL')}
                  {numberField('BMI', form.bmi, (v) => setForm({ ...form, bmi: v }), 0.1, 'kg/m2')}
                </div>
              </div>

              {/* Lifestyle */}
              <div>
                <h3 className="text-sm font-semibold text-teal-400 uppercase tracking-wider mb-3">
                  Lifestyle Factors
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectField('Smoking', form.smoking_status, (v) => setForm({ ...form, smoking_status: v as HealthRecord['smoking_status'] }), [
                    { value: 'never', label: 'Never' },
                    { value: 'former', label: 'Former' },
                    { value: 'current', label: 'Current' },
                  ])}
                  {selectField('Alcohol', form.alcohol_consumption, (v) => setForm({ ...form, alcohol_consumption: v as HealthRecord['alcohol_consumption'] }), [
                    { value: 'none', label: 'None' },
                    { value: 'moderate', label: 'Moderate' },
                    { value: 'heavy', label: 'Heavy' },
                  ])}
                  {selectField('Activity', form.physical_activity, (v) => setForm({ ...form, physical_activity: v as HealthRecord['physical_activity'] }), [
                    { value: 'sedentary', label: 'Sedentary' },
                    { value: 'moderate', label: 'Moderate' },
                    { value: 'active', label: 'Active' },
                  ])}
                  {selectField('Family History', form.family_history, (v) => setForm({ ...form, family_history: v as HealthRecord['family_history'] }), [
                    { value: 'none', label: 'None' },
                    { value: 'diabetes', label: 'Diabetes' },
                    { value: 'heart_disease', label: 'Heart Disease' },
                    { value: 'hypertension', label: 'Hypertension' },
                  ])}
                  {selectField('Stress Level', form.stress_level, (v) => setForm({ ...form, stress_level: v as HealthRecord['stress_level'] }), [
                    { value: 'low', label: 'Low' },
                    { value: 'moderate', label: 'Moderate' },
                    { value: 'high', label: 'High' },
                  ])}
                  {numberField('Sleep Hours', form.sleep_hours, (v) => setForm({ ...form, sleep_hours: v }), 0.5, 'hrs/night')}
                </div>
              </div>

              {/* Notes & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none"
                    placeholder="Additional notes..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Record Date</label>
                  <input
                    type="date"
                    value={form.record_date}
                    onChange={(e) => setForm({ ...form, record_date: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all duration-200"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Record' : 'Create Record'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Records List */}
      {records.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white mb-1">No Records Found</h3>
          <p className="text-slate-400 text-sm">Add your first health record to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-all duration-200"
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {new Date(record.record_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      BP: {record.blood_pressure_systolic}/{record.blood_pressure_diastolic} | BMI: {record.bmi} | Sugar: {record.blood_sugar}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditForm(record);
                    }}
                    className="p-2 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(record.id);
                    }}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {expandedId === record.id ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>
              {expandedId === record.id && (
                <div className="px-4 pb-4 border-t border-slate-700/50 pt-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500">Heart Rate</span>
                      <p className="text-white font-medium">{record.heart_rate} bpm</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Cholesterol</span>
                      <p className="text-white font-medium">{record.cholesterol} mg/dL</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Smoking</span>
                      <p className="text-white font-medium capitalize">{record.smoking_status}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Alcohol</span>
                      <p className="text-white font-medium capitalize">{record.alcohol_consumption}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Activity</span>
                      <p className="text-white font-medium capitalize">{record.physical_activity}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Family History</span>
                      <p className="text-white font-medium capitalize">{record.family_history.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Stress</span>
                      <p className="text-white font-medium capitalize">{record.stress_level}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Sleep</span>
                      <p className="text-white font-medium">{record.sleep_hours} hrs</p>
                    </div>
                  </div>
                  {record.notes && (
                    <div className="mt-3 text-sm">
                      <span className="text-slate-500">Notes: </span>
                      <span className="text-slate-300">{record.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

