import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getHealthRecords } from '../../services/healthRecordService';
import { getRiskAssessments, parseMedicineSuggestions, calculateTotalMedicineCost } from '../../services/riskAssessmentService';
import type { HealthRecord, RiskAssessment } from '../../types';
import RiskGauge from '../common/RiskGauge';
import RiskBadge from '../common/RiskBadge';
import {
  Activity,
  FileText,
  TrendingUp,
  AlertTriangle,
  Heart,
  Droplets,
  Wind,
  Pill,
  DollarSign,
  ShoppingCart,
  Plus,
  Zap,
  ArrowRight,
} from 'lucide-react';

type Page = 'dashboard' | 'records' | 'assessment' | 'profile';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
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
    load();
  }, [user]);

  const latestAssessment = assessments[0] ?? null;
  const latestRecord = records[0] ?? null;
  const latestMeds = latestAssessment
    ? parseMedicineSuggestions(latestAssessment.medicine_suggestions ?? '[]')
    : [];
  const latestCost = calculateTotalMedicineCost(latestMeds);

  const stats = [
    {
      label: 'Health Records',
      value: records.length,
      icon: FileText,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
    },
    {
      label: 'Risk Assessments',
      value: assessments.length,
      icon: TrendingUp,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Critical Alerts',
      value: assessments.filter(
        (a) => a.overall_risk === 'critical' || a.overall_risk === 'high'
      ).length,
      icon: AlertTriangle,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Suggested Medicines',
      value: latestMeds.length,
      icon: Pill,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ];

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
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of your health risk profile</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('records')}
          className="group bg-slate-800/50 border border-slate-700 hover:border-teal-500/50 rounded-xl p-5 text-left transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center group-hover:bg-teal-500/20 transition">
              <Plus className="w-6 h-6 text-teal-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">Upload Health Record</h3>
              <p className="text-xs text-slate-400 mt-0.5">Add your vitals, lifestyle data, and health metrics</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition" />
          </div>
        </button>
        <button
          onClick={() => onNavigate('assessment')}
          className="group bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 rounded-xl p-5 text-left transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">Run Risk Assessment</h3>
              <p className="text-xs text-slate-400 mt-0.5">Analyze your health data and get medicine suggestions</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
          </div>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="text-3xl font-bold text-white mt-1">{value}</p>
              </div>
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Gauges */}
      {latestAssessment ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Latest Risk Assessment</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <RiskGauge
              score={latestAssessment.overall_score}
              level={latestAssessment.overall_risk}
              label="Overall"
              size={130}
            />
            <RiskGauge
              score={latestAssessment.cardiac_score}
              level={latestAssessment.cardiac_risk}
              label="Cardiac"
              size={130}
            />
            <RiskGauge
              score={latestAssessment.diabetes_score}
              level={latestAssessment.diabetes_risk}
              label="Diabetes"
              size={130}
            />
            <RiskGauge
              score={latestAssessment.hypertension_score}
              level={latestAssessment.hypertension_risk}
              label="Hypertension"
              size={130}
            />
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
          <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white mb-1">No Risk Assessment Yet</h3>
          <p className="text-slate-400 text-sm mb-4">
            Upload a health record first, then run a risk assessment to see your risk profile and medicine suggestions
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('records')}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-medium px-4 py-2 rounded-xl transition-all duration-200 text-sm"
            >
              <Plus className="w-4 h-4" />
              Upload Health Record
            </button>
          </div>
        </div>
      )}

      {/* Medicine Cost Summary */}
      {latestMeds.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            Medicine Cost Estimate
          </h2>
          <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 mb-4">
            <DollarSign className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="text-xs text-emerald-400/70">Estimated Monthly Cost</p>
              <p className="text-2xl font-bold text-emerald-400">
                ${latestCost.min} - ${latestCost.max}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-slate-400">{latestMeds.length} medicine{latestMeds.length !== 1 ? 's' : ''} suggested</p>
              <p className="text-xs text-slate-500">
                {latestMeds.filter((m) => m.is_over_the_counter).length} OTC | {latestMeds.filter((m) => !m.is_over_the_counter).length} Prescription
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {latestMeds.map((med, i) => (
              <div key={i} className="bg-slate-900/50 rounded-lg p-3 flex items-start gap-3">
                <div className="w-8 h-8 bg-teal-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <Pill className="w-4 h-4 text-teal-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{med.name}</p>
                  <p className="text-xs text-slate-400">{med.dosage}</p>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                    ${med.estimated_cost_min}-${med.estimated_cost_max}/mo
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Latest Health Record Summary */}
      {latestRecord && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Latest Health Record</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-xs text-slate-400">Blood Pressure</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {latestRecord.blood_pressure_systolic}/{latestRecord.blood_pressure_diastolic}
              </p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-400">Blood Sugar</span>
              </div>
              <p className="text-lg font-semibold text-white">{latestRecord.blood_sugar} mg/dL</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-4 h-4 text-teal-400" />
                <span className="text-xs text-slate-400">Cholesterol</span>
              </div>
              <p className="text-lg font-semibold text-white">{latestRecord.cholesterol} mg/dL</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-400">BMI</span>
              </div>
              <p className="text-lg font-semibold text-white">{latestRecord.bmi}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Assessments Table */}
      {assessments.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Assessments</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Cardiac</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Diabetes</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Hypertension</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Overall</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Med Cost</th>
                </tr>
              </thead>
              <tbody>
                {assessments.slice(0, 5).map((a) => {
                  const meds = parseMedicineSuggestions(a.medicine_suggestions ?? '[]');
                  const cost = calculateTotalMedicineCost(meds);
                  return (
                    <tr key={a.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                      <td className="py-3 px-4 text-slate-300">
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge level={a.cardiac_risk} showScore score={a.cardiac_score} />
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge level={a.diabetes_risk} showScore score={a.diabetes_score} />
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge level={a.hypertension_risk} showScore score={a.hypertension_score} />
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge level={a.overall_risk} showScore score={a.overall_score} />
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-medium text-xs">
                        {meds.length > 0 ? `$${cost.min}-$${cost.max}` : '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
