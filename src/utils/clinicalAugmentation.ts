import { JournalEntry } from "@/types/journal";

/**
 * Transforms raw journal entries into a high-signal Clinical Narrative.
 * This acts as "Data Augmentation" for the LLM, pre-calculating trends
 * that might be subtle in the raw data.
 */
export function generateClinicalNarrative(entries: JournalEntry[]): string {
  if (!entries || entries.length === 0) return "No patient history available.";

  const recentEntries = entries.slice(0, 10);
  
  // 1. Calculate Averages
  let avgAnxiety = 0;
  let avgRelief = 0;
  let totalTHC = 0;
  
  recentEntries.forEach(e => {
    const anxiety = e.medical_symptoms?.find(s => s.name === "Anxiety")?.score || 0;
    const relief = e.effectiveness_score || 0; // Assuming this exists or is derived
    
    avgAnxiety += anxiety;
    avgRelief += relief;
  });
  
  avgAnxiety = avgAnxiety / recentEntries.length;
  
  // 2. Identify Trends (Augmentation)
  const isHighRisk = avgAnxiety > 7;
  const isFrequentUser = recentEntries.length >= 7; // e.g., 7 entries in last view
  
  // 3. Detect "Red Flag" patterns
  const redFlags = [];
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
