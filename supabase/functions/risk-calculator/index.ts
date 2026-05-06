import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface HealthData {
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  heart_rate: number;
  blood_sugar: number;
  cholesterol: number;
  bmi: number;
  smoking_status: string;
  alcohol_consumption: string;
  physical_activity: string;
  family_history: string;
  stress_level: string;
  sleep_hours: number;
}

type RiskLevel = "low" | "moderate" | "high" | "critical";

interface MedicineSuggestion {
  name: string;
  description: string;
  dosage: string;
  category: "cardiac" | "diabetes" | "hypertension" | "general";
  estimated_cost_min: number;
  estimated_cost_max: number;
  currency: string;
  is_over_the_counter: boolean;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function classifyRisk(score: number): RiskLevel {
  if (score >= 70) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "moderate";
  return "low";
}

function calculateCardiacRisk(data: HealthData): { score: number; level: RiskLevel } {
  let score = 0;
  if (data.blood_pressure_systolic >= 160 || data.blood_pressure_diastolic >= 100) score += 30;
  else if (data.blood_pressure_systolic >= 140 || data.blood_pressure_diastolic >= 90) score += 20;
  else if (data.blood_pressure_systolic >= 130 || data.blood_pressure_diastolic >= 85) score += 10;

  if (data.cholesterol >= 280) score += 25;
  else if (data.cholesterol >= 240) score += 18;
  else if (data.cholesterol >= 200) score += 10;

  if (data.smoking_status === "current") score += 25;
  else if (data.smoking_status === "former") score += 10;

  if (data.bmi >= 30) score += 15;
  else if (data.bmi >= 25) score += 8;

  if (data.physical_activity === "sedentary") score += 10;
  if (data.family_history === "heart_disease") score += 15;
  if (data.stress_level === "high") score += 10;
  else if (data.stress_level === "moderate") score += 5;

  score = Math.min(score, 100);
  return { score, level: classifyRisk(score) };
}

function calculateDiabetesRisk(data: HealthData): { score: number; level: RiskLevel } {
  let score = 0;
  if (data.blood_sugar >= 200) score += 35;
  else if (data.blood_sugar >= 140) score += 25;
  else if (data.blood_sugar >= 100) score += 15;

  if (data.bmi >= 30) score += 20;
  else if (data.bmi >= 25) score += 12;

  if (data.family_history === "diabetes") score += 20;
  if (data.physical_activity === "sedentary") score += 15;
  if (data.stress_level === "high") score += 8;
  if (data.sleep_hours < 6) score += 10;

  score = Math.min(score, 100);
  return { score, level: classifyRisk(score) };
}

function calculateHypertensionRisk(data: HealthData): { score: number; level: RiskLevel } {
  let score = 0;
  if (data.blood_pressure_systolic >= 160 || data.blood_pressure_diastolic >= 100) score += 35;
  else if (data.blood_pressure_systolic >= 140 || data.blood_pressure_diastolic >= 90) score += 25;
  else if (data.blood_pressure_systolic >= 130 || data.blood_pressure_diastolic >= 85) score += 15;

  if (data.bmi >= 30) score += 15;
  else if (data.bmi >= 25) score += 8;

  if (data.alcohol_consumption === "heavy") score += 15;
  else if (data.alcohol_consumption === "moderate") score += 5;

  if (data.family_history === "hypertension") score += 15;
  if (data.stress_level === "high") score += 12;
  else if (data.stress_level === "moderate") score += 6;
  if (data.physical_activity === "sedentary") score += 10;

  score = Math.min(score, 100);
  return { score, level: classifyRisk(score) };
}

function generateRecommendations(
  data: HealthData,
  cardiac: { score: number; level: RiskLevel },
  diabetes: { score: number; level: RiskLevel },
  hypertension: { score: number; level: RiskLevel }
): string[] {
  const recs: string[] = [];

  if (cardiac.level === "high" || cardiac.level === "critical") {
    recs.push("Consult a cardiologist for a comprehensive cardiac evaluation");
    recs.push("Monitor blood pressure daily and maintain a log");
  }
  if (data.cholesterol >= 200) recs.push("Reduce saturated fat intake and increase fiber-rich foods");
  if (data.smoking_status === "current") recs.push("Enroll in a smoking cessation program immediately");

  if (diabetes.level === "high" || diabetes.level === "critical") {
    recs.push("Get HbA1c tested and consult an endocrinologist");
    recs.push("Monitor blood sugar levels regularly");
  }
  if (data.blood_sugar >= 100) recs.push("Reduce refined sugar and simple carbohydrate intake");

  if (hypertension.level === "high" || hypertension.level === "critical") {
    recs.push("Reduce sodium intake to less than 1500mg per day");
    recs.push("Consider medication review with your physician");
  }
  if (data.alcohol_consumption === "heavy") recs.push("Reduce alcohol consumption to moderate levels or below");

  if (data.bmi >= 25) recs.push("Aim for gradual weight loss of 1-2 lbs per week through diet and exercise");
  if (data.physical_activity === "sedentary") recs.push("Start with 30 minutes of moderate exercise 5 days a week");
  if (data.stress_level === "high") recs.push("Practice stress management: meditation, deep breathing, or yoga");
  if (data.sleep_hours < 7) recs.push("Aim for 7-9 hours of quality sleep per night");

  if (recs.length === 0) recs.push("Your health metrics look good! Continue maintaining healthy habits");
  return recs;
}

function generateMedicineSuggestions(
  data: HealthData,
  cardiac: { score: number; level: RiskLevel },
  diabetes: { score: number; level: RiskLevel },
  hypertension: { score: number; level: RiskLevel }
): MedicineSuggestion[] {
  const meds: MedicineSuggestion[] = [];

  if (cardiac.level === "high" || cardiac.level === "critical") {
    meds.push({
      name: "Atorvastatin",
      description: "Statin medication that lowers cholesterol by blocking HMG-CoA reductase in the liver. Reduces risk of heart attack and stroke.",
      dosage: "10-20mg once daily",
      category: "cardiac",
      estimated_cost_min: 5,
      estimated_cost_max: 25,
      currency: "USD",
      is_over_the_counter: false,
    });
    meds.push({
      name: "Aspirin (Low-dose)",
      description: "Antiplatelet medication that prevents blood clots by inhibiting platelet aggregation. Reduces heart attack risk in high-risk patients.",
      dosage: "75-81mg once daily",
      category: "cardiac",
      estimated_cost_min: 2,
      estimated_cost_max: 8,
      currency: "USD",
      is_over_the_counter: true,
    });
  }
  if (cardiac.level === "moderate") {
    meds.push({
      name: "Omega-3 Fish Oil",
      description: "Supplement rich in EPA and DHA that helps lower triglycerides and supports cardiovascular health naturally.",
      dosage: "1000mg twice daily",
      category: "cardiac",
      estimated_cost_min: 8,
      estimated_cost_max: 20,
      currency: "USD",
      is_over_the_counter: true,
    });
  }
  if (data.cholesterol >= 240) {
    meds.push({
      name: "Rosuvastatin",
      description: "Potent statin for managing high cholesterol levels. More effective than atorvastatin at lower doses for LDL reduction.",
      dosage: "5-10mg once daily",
      category: "cardiac",
      estimated_cost_min: 10,
      estimated_cost_max: 40,
      currency: "USD",
      is_over_the_counter: false,
    });
  }

  if (diabetes.level === "high" || diabetes.level === "critical") {
    meds.push({
      name: "Metformin",
      description: "First-line medication for type 2 diabetes. Reduces glucose production in the liver and improves insulin sensitivity in body tissues.",
      dosage: "500-850mg twice daily with meals",
      category: "diabetes",
      estimated_cost_min: 4,
      estimated_cost_max: 15,
      currency: "USD",
      is_over_the_counter: false,
    });
    meds.push({
      name: "Glimepiride",
      description: "Sulfonylurea that stimulates insulin release from pancreatic beta cells. Helps lower blood sugar after meals.",
      dosage: "1-2mg once daily with breakfast",
      category: "diabetes",
      estimated_cost_min: 5,
      estimated_cost_max: 20,
      currency: "USD",
      is_over_the_counter: false,
    });
  }
  if (diabetes.level === "moderate" || data.blood_sugar >= 100) {
    meds.push({
      name: "Chromium Picolinate",
      description: "Mineral supplement that enhances insulin action and helps regulate blood sugar levels. Supports glucose metabolism naturally.",
      dosage: "200-400mcg once daily",
      category: "diabetes",
      estimated_cost_min: 5,
      estimated_cost_max: 12,
      currency: "USD",
      is_over_the_counter: true,
    });
  }

  if (hypertension.level === "high" || hypertension.level === "critical") {
    meds.push({
      name: "Amlodipine",
      description: "Calcium channel blocker that relaxes blood vessel walls, reducing blood pressure and improving blood flow. Long-acting with once-daily dosing.",
      dosage: "5-10mg once daily",
      category: "hypertension",
      estimated_cost_min: 4,
      estimated_cost_max: 15,
      currency: "USD",
      is_over_the_counter: false,
    });
    meds.push({
      name: "Losartan",
      description: "Angiotensin II receptor blocker (ARB) that blocks chemicals that narrow blood vessels. Protects kidneys and lowers blood pressure effectively.",
      dosage: "50-100mg once daily",
      category: "hypertension",
      estimated_cost_min: 5,
      estimated_cost_max: 25,
      currency: "USD",
      is_over_the_counter: false,
    });
  }
  if (hypertension.level === "moderate") {
    meds.push({
      name: "CoQ10 (Coenzyme Q10)",
      description: "Natural antioxidant supplement that supports heart health and may help lower blood pressure. Also boosts energy production in cells.",
      dosage: "100-200mg once daily",
      category: "hypertension",
      estimated_cost_min: 10,
      estimated_cost_max: 25,
      currency: "USD",
      is_over_the_counter: true,
    });
  }

  if (data.bmi >= 25) {
    meds.push({
      name: "Orlistat",
      description: "Lipase inhibitor that prevents dietary fat absorption in the intestine. Aids weight loss when combined with a reduced-calorie diet.",
      dosage: "120mg three times daily with meals",
      category: "general",
      estimated_cost_min: 20,
      estimated_cost_max: 50,
      currency: "USD",
      is_over_the_counter: true,
    });
  }
  if (data.stress_level === "high" || data.sleep_hours < 6) {
    meds.push({
      name: "Melatonin",
      description: "Natural hormone supplement that regulates the sleep-wake cycle. Helps improve sleep quality and duration without dependency risk.",
      dosage: "1-5mg 30 minutes before bedtime",
      category: "general",
      estimated_cost_min: 3,
      estimated_cost_max: 10,
      currency: "USD",
      is_over_the_counter: true,
    });
  }
  if (data.stress_level === "high") {
    meds.push({
      name: "Ashwagandha",
      description: "Adaptogenic herb that reduces cortisol levels and helps the body manage stress. Also improves sleep quality and reduces anxiety.",
      dosage: "300-600mg once daily",
      category: "general",
      estimated_cost_min: 8,
      estimated_cost_max: 20,
      currency: "USD",
      is_over_the_counter: true,
    });
  }
  if (data.smoking_status === "current") {
    meds.push({
      name: "Nicotine Patch",
      description: "Transdermal nicotine replacement therapy that delivers controlled nicotine through the skin. Reduces withdrawal symptoms during smoking cessation.",
      dosage: "21mg patch daily (step down over 8-10 weeks)",
      category: "general",
      estimated_cost_min: 15,
      estimated_cost_max: 35,
      currency: "USD",
      is_over_the_counter: true,
    });
  }

  if (meds.length === 0) {
    meds.push({
      name: "Multivitamin",
      description: "Daily multivitamin supplement providing essential vitamins and minerals to support overall health and fill nutritional gaps.",
      dosage: "1 tablet once daily with food",
      category: "general",
      estimated_cost_min: 5,
      estimated_cost_max: 15,
      currency: "USD",
      is_over_the_counter: true,
    });
  }

  return meds;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const data: HealthData = await req.json();

    const cardiac = calculateCardiacRisk(data);
    const diabetes = calculateDiabetesRisk(data);
    const hypertension = calculateHypertensionRisk(data);

    const overallScore = Math.round((cardiac.score + diabetes.score + hypertension.score) / 3);
    const overallLevel = classifyRisk(overallScore);

    const recommendations = generateRecommendations(data, cardiac, diabetes, hypertension);
    const medicine_suggestions = generateMedicineSuggestions(data, cardiac, diabetes, hypertension);

    const totalCostMin = medicine_suggestions.reduce((sum, m) => sum + m.estimated_cost_min, 0);
    const totalCostMax = medicine_suggestions.reduce((sum, m) => sum + m.estimated_cost_max, 0);

    const result = {
      cardiac_risk: cardiac.level,
      cardiac_score: cardiac.score,
      diabetes_risk: diabetes.level,
      diabetes_score: diabetes.score,
      hypertension_risk: hypertension.level,
      hypertension_score: hypertension.score,
      overall_risk: overallLevel,
      overall_score: overallScore,
      recommendations,
      medicine_suggestions,
      estimated_monthly_cost: {
        min: totalCostMin,
        max: totalCostMax,
        currency: "USD",
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
