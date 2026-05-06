import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getHealthRecords } from '../../services/healthRecordService';
import {
  calculateRisk,
  saveRiskAssessment,
  getRiskAssessments,
  deleteRiskAssessment,
  parseMedicineSuggestions,
  calculateTotalMedicineCost,
} from '../../services/riskAssessmentService';
import type { HealthRecord, RiskAssessment, MedicineSuggestion } from '../../types';
import RiskGauge from '../common/RiskGauge';
import RiskBadge from '../common/RiskBadge';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Zap,
  Pill,
  DollarSign,
  ShoppingCart,
  Info,
  ShieldCheck,
  Package,
} from 'lucide-react';

const categoryLabels: Record<string, string> = {
  cardiac: 'Cardiac',
  diabetes: 'Diabetes',
  hypertension: 'Hypertension',
  general: 'General Wellness',
};

const categoryColors: Record<string, string> = {
  cardiac: 'bg-red-500/10 text-red-400 border-red-500/20',
  diabetes: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  hypertension: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  general: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

function MedicineCard({ med }: { med: MedicineSuggestion }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-teal-500/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <Pill className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">{med.name}</h4>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-1 ${
                categoryColors[med.category]
              }`}
            >
              {categoryLabels[med.category]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {med.is_over_the_counter ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              OTC
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Package className="w-3 h-3" />
              Rx
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 w-14">Dosage:</span>
          <span className="text-slate-300">{med.dosage}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-emerald-400 font-semibold">
            ${med.estimated_cost_min} - ${med.estimated_cost_max}
          </span>
          <span className="text-slate-500">/month</span>
        </div>
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition"
      >
        <Info className="w-3 h-3" />
        {showDetails ? 'Hide details' : 'How it works'}
      </button>

      {showDetails && (
        <div className="mt-2 pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400 leading-relaxed">{med.description}</p>
        </div>
      )}
    </div>
  );
}

function MedicineSummary({ meds }: { meds: MedicineSuggestion[] }) {
  const cost = calculateTotalMedicineCost(meds);
  const rxCount = meds.filter((m) => !m.is_over_the_counter).length;
  const otcCount = meds.filter((m) => m.is_over_the_counter).length;

  return (
    <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5 mb-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-medium text-white">{meds.length} Medicine{meds.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Package className="w-3 h-3 text-orange-400" />
            {rxCount} Prescription
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            {otcCount} Over-the-counter
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <div>
            <p className="text-xs text-emerald-400/70">Estimated Monthly Cost</p>
            <p className="text-lg font-bold text-emerald-400">
              ${cost.min} - ${cost.max}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RiskAssessmentPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<RiskAssessment | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    try {
      const [recs, assess] = await Promise.all([
        getHealthRecords(user.id),
        getRiskAssessments(user.id),
      ]);
      setRecords(recs);
      setAssessments(assess);
    } catch {
      // silently handle
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAssess = async () => {
    if (!user || !selectedRecordId) return;
    setCalculating(true);
    try {
      const record = records.find((r) => r.id === selectedRecordId);
      if (!record) return;

      const riskData = calculateRisk(record);
      const assessment = await saveRiskAssessment(user.id, selectedRecordId, riskData);
      setResult(assessment);
      await loadData();
    } catch {
      // handle error
    }
    setCalculating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assessment?')) return;
    try {
      await deleteRiskAssessment(id);
      await loadData();
      if (result?.id === id) setResult(null);
    } catch {
      // handle error
    }
  };

  const getRecommendations = (recs: string): string[] => {
    try {
      return JSON.parse(recs);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Risk Assessment</h1>
        <p className="text-slate-400 mt-1">Analyze your health data for risk predictions and medicine suggestions</p>
      </div>

      {/* Assessment Form */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Run New Assessment</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedRecordId}
            onChange={(e) => setSelectedRecordId(e.target.value)}
            className="flex-1 bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          >
            <option value="">Select a health record...</option>
            {records.map((r) => (
              <option key={r.id} value={r.id}>
                {new Date(r.record_date).toLocaleDateString()} - BP: {r.blood_pressure_systolic}/{r.blood_pressure_diastolic}, BMI: {r.bmi}
              </option>
            ))}
          </select>
          <button
            onClick={handleAssess}
            disabled={!selectedRecordId || calculating}
            className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/25"
          >
            <Zap className="w-4 h-4" />
            {calculating ? 'Analyzing...' : 'Analyze Risk'}
          </button>
        </div>
        {records.length === 0 && (
          <p className="text-sm text-amber-400 mt-3">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            No health records found. Add a health record first.
          </p>
        )}
      </div>

      {/* Latest Result */}
      {result && (() => {
        const meds = parseMedicineSuggestions(result.medicine_suggestions ?? '[]');
        return (
          <div className="bg-slate-800/50 border border-teal-500/30 rounded-xl p-6 animate-in fade-in">
            <h2 className="text-lg font-semibold text-white mb-6">Assessment Results</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <RiskGauge score={result.overall_score} level={result.overall_risk} label="Overall" size={130} />
              <RiskGauge score={result.cardiac_score} level={result.cardiac_risk} label="Cardiac" size={130} />
              <RiskGauge score={result.diabetes_score} level={result.diabetes_risk} label="Diabetes" size={130} />
              <RiskGauge score={result.hypertension_score} level={result.hypertension_risk} label="Hypertension" size={130} />
            </div>

            {/* Recommendations */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-teal-400 uppercase tracking-wider mb-3">
                Recommendations
              </h3>
              <div className="space-y-2">
                {getRecommendations(result.recommendations).map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                    <span className="text-slate-300">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Medicine Suggestions */}
            {meds.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-teal-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Suggested Medicines
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Based on your risk levels, these medicines may help. Consult your doctor before starting any medication.
                </p>
                <MedicineSummary meds={meds} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {meds.map((med, i) => (
                    <MedicineCard key={i} med={med} />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Assessment History */}
      {assessments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Assessment History</h2>
          <div className="space-y-3">
            {assessments.map((a) => {
              const meds = parseMedicineSuggestions(a.medicine_suggestions ?? '[]');
              const cost = calculateTotalMedicineCost(meds);
              return (
                <div
                  key={a.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-all duration-200"
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {new Date(a.created_at).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <RiskBadge level={a.overall_risk} showScore score={a.overall_score} />
                          {meds.length > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-400">
                              <Pill className="w-3 h-3" />
                              {meds.length} medicine{meds.length !== 1 ? 's' : ''}
                              <span className="text-emerald-400 ml-1">${cost.min}-${cost.max}/mo</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(a.id);
                        }}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expandedId === a.id ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                  {expandedId === a.id && (
                    <div className="px-4 pb-4 border-t border-slate-700/50 pt-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div>
                          <span className="text-xs text-slate-500">Cardiac</span>
                          <div className="mt-1">
                            <RiskBadge level={a.cardiac_risk} showScore score={a.cardiac_score} />
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500">Diabetes</span>
                          <div className="mt-1">
                            <RiskBadge level={a.diabetes_risk} showScore score={a.diabetes_score} />
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500">Hypertension</span>
                          <div className="mt-1">
                            <RiskBadge level={a.hypertension_risk} showScore score={a.hypertension_score} />
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500">Overall</span>
                          <div className="mt-1">
                            <RiskBadge level={a.overall_risk} showScore score={a.overall_score} />
                          </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-2">
                          Recommendations
                        </h4>
                        <div className="space-y-1.5">
                          {getRecommendations(a.recommendations).map((rec, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <CheckCircle2 className="w-3 h-3 text-teal-400 mt-0.5 shrink-0" />
                              <span className="text-slate-300">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {meds.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Pill className="w-3 h-3" />
                            Suggested Medicines
                          </h4>
                          <MedicineSummary meds={meds} />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {meds.map((med, i) => (
                              <MedicineCard key={i} med={med} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
