// src/data/knowledgeBase.ts

// ==========================================
// 1. JSON SCHEMA DEFINITIONS (Strict Clinical Facts)
// ==========================================

export type GuidelineSource = 
  | "ACOEM_2025" // American College of Occupational and Environmental Medicine
  | "NCSCT_2025" // National Centre for Smoking Cessation and Training (Harm Reduction)
  | "LRCUG_v2"   // Lower Risk Cannabis Use Guidelines (Updated)
  | "RACGP_2024" // Royal Australian College of General Practitioners
  | "Expert_Consensus";

export type EvidenceLevel = "High" | "Moderate" | "Low" | "Insufficient";

export interface DosingProtocol {
  initial_dose: string;        // e.g., "2.5mg THC"
  titration_step: string;      // e.g., "+1-2.5mg q3d"
  max_daily_dose: string;      // e.g., "30mg THC"
  ceiling_dose?: string;       // Clinical hard stop
  bioavailability_note: string; // e.g., "Oral: 6-20%, Inhaled: 10-35%"
}

export interface ClinicalFactsheet {
  id: string;
  condition: string;
  indication_status: "Approved" | "Off-label" | "Contraindicated";
  primary_goal: string;        // Numeric/Measurable (e.g., "Pain score reduction >30%")
  review_timeline: string;     // e.g., "Review at 2 weeks, 3 months"
  protocol: DosingProtocol;
  contraindications: string[];
  drug_interactions: string[]; // CYP450 flags
  source: GuidelineSource;
  evidence_level: EvidenceLevel;
  last_updated: string;        // ISO Date
}

// ==========================================
// 2. STABLE CLINICAL KNOWLEDGE BASE (Embedded)
// ==========================================

export const CLINICAL_FACTSHEETS: Record<string, ClinicalFactsheet> = {
  "chronic_pain": {
    id: "PAIN-001",
    condition: "Chronic Neuropathic Pain",
    indication_status: "Off-label",
    primary_goal: "Pain intensity reduction ≥30% on VAS; Improvement in sleep scores",
    review_timeline: "Initial: 2 weeks. Maintenance: Every 3 months.",
    protocol: {
      initial_dose: "2.5mg THC : 2.5mg CBD (Balanced) at HS (Bedtime)",
      titration_step: "Increase by 2.5mg THC every 3-7 days if tolerated",
      max_daily_dose: "30mg THC (Total Daily)",
      ceiling_dose: "40mg THC (Risk of cognitive AE outweighs benefit)",
      bioavailability_note: "Oral onset 60-120m. Do not re-dose before 3h."
    },
    contraindications: [
      "Unstable cardiac disease (Angina/Arrhythmia)",
      "Personal/Family history of psychosis",
      "Pregnancy/Breastfeeding"
    ],
    drug_interactions: ["Warfarin (INR increase)", "Clobazam", "Theophylline"],
    source: "ACOEM_2025",
    evidence_level: "Moderate",
    last_updated: "2025-01-15"
  },
  "anxiety": {
    id: "ANX-002",
    condition: "Generalized Anxiety Disorder",
    indication_status: "Off-label",
    primary_goal: "Reduction in GAD-7 score; Improved sleep onset",
    review_timeline: "Initial: 1 week (Monitor for paradoxical anxiety).",
    protocol: {
      initial_dose: "20-50mg CBD Isolate (NO THC)",
      titration_step: "+20mg CBD q3d",
      max_daily_dose: "400-600mg CBD",
      bioavailability_note: "Sublingual oil preferred for anxiety (faster onset 15-45m)"
    },
    contraindications: [
      "THC hypersensitivity",
      "Severe hepatic impairment"
    ],
    drug_interactions: ["Clobazam (Sedation)", "Valproate"],
    source: "RACGP_2024",
    evidence_level: "Low", // Important distinction
    last_updated: "2024-12-10"
  }
};

// ==========================================
// 3. CRISIS INTERCEPTION MODULE (State Machine Templates)
// ==========================================

export interface CrisisState {
  id: string;
  triggers: string[]; // Keywords
  clinical_state: "Panic" | "Psychosis" | "Cardiovascular" | "Derealization";
  immediate_action: string;
  deescalation_script: string;
}

export const CRISIS_MODULE: CrisisState[] = [
  {
    id: "PANIC-ACUTE",
    triggers: ["dying", "heart attack", "can't breathe", "going crazy", "too high"],
    clinical_state: "Panic",
    immediate_action: "Rule out organic cause via symptom check. Initiate grounding.",
    deescalation_script: "You are experiencing a temporary chemical reaction. Your vitals are likely stable. This will pass in 20-40 minutes. Sit upright, sip water, and follow this breathing pace: Inhale 4s, Hold 7s, Exhale 8s."
  },
  {
    id: "DEREALIZATION",
    triggers: ["not real", "floating", "loss of self", "dreaming", "detached"],
    clinical_state: "Derealization",
    immediate_action: "Sensory grounding. Reduce THC input immediately.",
    deescalation_script: "You are safe. This is 'Derealization', a known side effect of THC affecting the temporal lobe. It is not permanent. Focus on physical sensations: Feel the chair under you. Name 3 things you can see. Rub your hands together."
  }
];

// ==========================================
// 4. RETRIEVAL HOOKS (Dynamic)
// ==========================================
// In a browser setup, we define 'search queries' that the UI can execute
// against PubMed if the user needs more recent data than the embedded JSON.

export const DYNAMIC_RETRIEVAL_QUERIES = {
  "pain_updates": "cannabis chronic pain guidelines 2024 2025 review",
  "interaction_check": "cannabis drug interactions cytochrome p450 updated"
};
