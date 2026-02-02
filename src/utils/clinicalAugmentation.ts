import { JournalEntry } from "@/types/journal";
import { CannabisRegimen } from "@/types/patient";
import { subWeeks, isAfter, differenceInDays } from "date-fns";

export interface ClinicalMetrics {
  timeRange: { start: Date; end: Date };
  doseMetrics: {
    meanDailyTHC: number; // mg
    meanDailyCBD: number; // mg
    adherenceRate: number; // 0-1 percentage
    doseDrift: number; // % change from prescribed (+ or -)
  };
  symptomTrends: {
    painDelta: number; // change since baseline (last 2 weeks vs previous)
    anxietyDelta: number;
    sleepDelta: number; // change in quality
    trajectorySlope: "improving" | "stable" | "worsening";
  };
  adverseEventRate: number; // events per week
  riskFlags: string[]; // e.g., "high_dose", "daily_use", "respiratory_risk"
  utilization: {
    combustionRate: number; // % of entries using smoking
    morningUseRate: number; // % of entries before 12pm
  };
}

/**
 * Edge AI Feature Engineering
 * Computes deterministic clinical features from raw journal logs locally.
 * This prepares a high-signal "context object" for the LLM or Dashboard.
 */
export function computeClinicalFeatures(
  entries: JournalEntry[],
  regimen?: CannabisRegimen
): ClinicalMetrics {
  const now = new Date();
  const twoWeeksAgo = subWeeks(now, 2);
  const fourWeeksAgo = subWeeks(now, 4);

  // Filter recent windows
  const recentEntries = entries.filter(e => isAfter(new Date(e.created_at), twoWeeksAgo));
  const previousEntries = entries.filter(e => 
    isAfter(new Date(e.created_at), fourWeeksAgo) && 
    !isAfter(new Date(e.created_at), twoWeeksAgo)
  );
  
  // 1. Dose Metrics Calculation
  let totalTHC = 0;
  let totalCBD = 0;
  let combustionCount = 0;
  let morningCount = 0;

  recentEntries.forEach(e => {
    // Infer dosage if string provided (simplified logic)
    const doseVal = parseFloat(e.dosage) || 0; 
    const thcPercent = e.thc_percentage || 0;
    const cbdPercent = e.cbd_percentage || 0;
    
    // Rudimentary calc: dose (mg/g) * % -> mg cannabinoids
    // Adjust logic based on units in real app
    const inferredTHC = doseVal * (thcPercent / 100) * 1000; // placeholder math
    const inferredCBD = doseVal * (cbdPercent / 100) * 1000;

    totalTHC += inferredTHC > 0 ? inferredTHC : (e.thc_percentage || 5); // Fallback estimate
    totalCBD += inferredCBD > 0 ? inferredCBD : (e.cbd_percentage || 0);

    if (e.method?.toLowerCase().includes("smok") || e.method?.toLowerCase().includes("joint") || e.method?.toLowerCase().includes("pipe")) {
      combustionCount++;
    }

    const hour = new Date(e.consumption_time || e.created_at).getHours();
    if (hour < 12) morningCount++;
  });

  const daysInWindow = Math.max(1, differenceInDays(now, twoWeeksAgo));
  const meanDailyTHC = totalTHC / daysInWindow;
  const meanDailyCBD = totalCBD / daysInWindow;

  // Compare against regimen if available
  const targetTHC = regimen?.dosing.targetTHC || 20; // Default reference
  const doseDrift = ((meanDailyTHC - targetTHC) / targetTHC) * 100;

  const expectedEntries = regimen?.dosing.frequency === 'daily' ? daysInWindow : 
                          regimen?.dosing.frequency === 'bid' ? daysInWindow * 2 : daysInWindow;
  const adherenceRate = Math.min(100, (recentEntries.length / Math.max(1, expectedEntries)) * 100);

  // 2. Symptom Trends (Recent vs Previous Window)
  const getAvg = (set: JournalEntry[], field: 'before_pain' | 'before_anxiety' | 'after_sleep') => {
    const valid = set.filter(e => typeof e[field] === 'number');
    if (valid.length === 0) return 0;
    return valid.reduce((acc, curr) => acc + (curr[field] || 0), 0) / valid.length;
  };

  const currentPain = getAvg(recentEntries, 'before_pain');
  const prevPain = getAvg(previousEntries, 'before_pain');
  
  const currentAnxiety = getAvg(recentEntries, 'before_anxiety');
  const prevAnxiety = getAvg(previousEntries, 'before_anxiety');

  // Negative delta = improvement for pain/anxiety
  const painDelta = currentPain - prevPain; 
  const anxietyDelta = currentAnxiety - prevAnxiety;
  
  let trajectorySlope: "improving" | "stable" | "worsening" = "stable";
  if (painDelta < -1 || anxietyDelta < -1) trajectorySlope = "improving";
  if (painDelta > 1 || anxietyDelta > 1) trajectorySlope = "worsening";

  // 3. Risk Flags (LRCUG & Clinical Rules)
  const riskFlags: string[] = [];
  
  if (meanDailyTHC > 40) riskFlags.push("High THC Dose (>40mg/day)");
  if (combustionCount / recentEntries.length > 0.5) riskFlags.push("Respiratory Risk (Combustion)");
  if (recentEntries.length > daysInWindow * 3) riskFlags.push("Heavy Use (>3x daily)");
  if (morningCount / recentEntries.length > 0.3) riskFlags.push("Early Morning Use");
  if (trajectorySlope === "worsening") riskFlags.push("Worsening Symptom Trajectory");

  const adverseEvents = recentEntries.reduce((acc, e) => acc + (e.negative_side_effects?.length || 0), 0);
  const adverseEventRate = adverseEvents / Math.max(1, daysInWindow / 7); // per week

  return {
    timeRange: { start: twoWeeksAgo, end: now },
    doseMetrics: {
      meanDailyTHC,
      meanDailyCBD,
      adherenceRate,
      doseDrift
    },
    symptomTrends: {
      painDelta,
      anxietyDelta,
      sleepDelta: 0, // Placeholder
      trajectorySlope
    },
    adverseEventRate,
    riskFlags,
    utilization: {
      combustionRate: (combustionCount / Math.max(1, recentEntries.length)) * 100,
      morningUseRate: (morningCount / Math.max(1, recentEntries.length)) * 100
    }
  };
}

/**
 * Transforms raw journal entries into a high-signal Clinical Narrative.
 * This acts as "Data Augmentation" for the LLM, pre-calculating trends
 * that might be subtle in the raw data.
 */
export function generateClinicalNarrative(entries: JournalEntry[]): string {
  if (!entries || entries.length === 0) return "No patient history available.";

  const recentEntries = entries.slice(0, 10);
  
  // 1. Calculate Averages from available mood/anxiety data
  let totalAnxiety = 0;
  let anxietyCount = 0;
  
  recentEntries.forEach(e => {
    // Use before_anxiety or after_anxiety if available
    const anxiety = e.before_anxiety ?? e.after_anxiety ?? 0;
    if (anxiety > 0) {
      totalAnxiety += anxiety;
      anxietyCount++;
    }
  });
  
  const avgAnxiety = anxietyCount > 0 ? totalAnxiety / anxietyCount : 0;
  
  // 2. Identify Trends (Augmentation)
  const isHighRisk = avgAnxiety > 7;
  const isFrequentUser = recentEntries.length >= 7; // e.g., 7 entries in last view
  
  // 3. Detect "Red Flag" patterns
  const redFlags: string[] = [];
  const smokingEntries = recentEntries.filter(e => e.method === "Smoking").length;
  if (smokingEntries > 5) redFlags.push("High frequency of combustion (Respiratory Risk)");
  
  const badReactions = recentEntries.filter(e => e.negative_side_effects?.length > 0);
  const sideEffectRate = (badReactions.length / recentEntries.length) * 100;
  
  // 4. Construct Narrative
  return `
[CLINICAL SUMMARY]
- Observation Window: Last ${recentEntries.length} sessions.
- Average Anxiety Score: ${avgAnxiety.toFixed(1)}/10 (${isHighRisk ? "ELEVATED" : "Stable"}).
- Adverse Event Rate: ${sideEffectRate.toFixed(0)}%.
- Primary Consumption Method: ${smokingEntries > 5 ? "Combustion (High Risk)" : "Varied"}.
- Detected Patterns: ${redFlags.length > 0 ? redFlags.join(", ") : "None"}.
- Tolerance Signal: ${isFrequentUser ? "Possible downregulation of CB1 receptors suspected." : "Naive/Low Tolerance."}
`;
}