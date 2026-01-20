// src/data/knowledgeBase.ts

export interface ClinicalGuideline {
  id: string;
  source: "PMC10998028" | "RACGP" | "LRCUG" | "Clinical_Synthesis";
  category: "Condition" | "Safety_Protocol" | "Prescribing_Protocol";
  tags: string[];
  content: {
    condition?: string;
    cannabis_role?: "First-line" | "Adjunct" | "Not Recommended" | "Mixed Evidence";
    product_type?: string; 
    route?: string;
    dosing?: {
      start: string;
      titration: string;
      max?: string;
    };
    adverse_effects?: string[];
    risk_modifiers?: string[];
    guideline_strength?: "Strong" | "Weak" | "Evidence Level: Low/Moderate/High";
    text_summary: string;
  };
}

export interface PatientResource {
  id: string;
  source: "LRCUG" | "Patient_Leaflet";
  topic: "Safety" | "Usage" | "Side_Effects";
  title: string;
  content: string; // Simplified, non-jargon text
}

export interface CrisisTemplate {
  trigger_keywords: string[];
  response_template: string;
  action_required: "Call Emergency" | "De-escalate & Monitor";
}

// ==========================================
// 1. TRIAGE KNOWLEDGE BASE (Clinician-Facing)
// ==========================================
export const CLINICAL_GUIDELINES: ClinicalGuideline[] = [
  {
    id: "pain-01",
    source: "PMC10998028",
    category: "Condition",
    tags: ["chronic pain", "neuropathic", "prescribing"],
    content: {
      condition: "Chronic Pain",
      cannabis_role: "Adjunct",
      product_type: "Oral CBD-dominant or Balanced (1:1)",
      route: "Oral (oils/capsules) preferred; Inhaled only for breakthrough",
      dosing: {
        start: "CBD 5mg BID or THC:CBD 2.5mg:2.5mg HS",
        titration: "Increase CBD by 10mg q3d. If adding THC, start 1-2.5mg HS, titrate by 1-2.5mg q7d.",
        max: "THC 30mg/day (Ceiling dose)"
      },
      adverse_effects: ["Sedation", "Dizziness", "Cognitive impairment", "Hypotension"],
      risk_modifiers: ["CV history", "Psychosis risk", "Elderly (>65)"],
      guideline_strength: "Weak",
      text_summary: "For chronic neuropathic/nociplastic pain: Initiate with CBD-predominant oral formulations. Titrate slowly. Add THC only if CBD insufficient, starting at 2.5mg HS. Max THC 30mg/day. Monitor for adverse cognitive effects."
    }
  },
  {
    id: "anxiety-01",
    source: "RACGP",
    category: "Condition",
    tags: ["anxiety", "ptsd", "prescribing"],
    content: {
      condition: "Anxiety Disorders",
      cannabis_role: "Not Recommended", // Strict guideline adherence
      product_type: "CBD Isolate (if trialed)",
      route: "Oral",
      dosing: {
        start: "CBD 20-50mg/day",
        titration: "Titrate to effect; Avoid THC (Anxiogenic risk)",
        max: "CBD 400-600mg (High dose often needed for anxiolysis)"
      },
      adverse_effects: ["THC-induced panic", "Paranoia", "Worsening symptoms"],
      risk_modifiers: ["Naive users", "Young age <25"],
      text_summary: "Evidence weak. THC is often contra-indicated due to risk of exacerbating anxiety. If prescribing, use high-dose CBD isolate. Monitor for worsening symptoms."
    }
  },
  {
    id: "triage-safety",
    source: "Clinical_Synthesis",
    category: "Safety_Protocol",
    tags: ["contraindications", "red flags"],
    content: {
      text_summary: "ABSOLUTE CONTRAINDICATIONS: 1. History of Psychosis/Schizophrenia. 2. Unstable Cardiac Disease (Angina/Arrhythmia). 3. Pregnancy/Breastfeeding. RELATIVE: Age <25, Substance Use Disorder. DRIVING: 4-8h washout for inhaled, 8-12h for oral."
    }
  }
];

// ==========================================
// 2. USER/COACH KNOWLEDGE BASE (Patient-Facing)
// ==========================================
export const PATIENT_EDUCATION: PatientResource[] = [
  {
    id: "edu-01",
    source: "LRCUG",
    topic: "Usage",
    title: "Start Low, Go Slow",
    content: "When trying a new product, start with a very low dose (e.g., 2.5mg THC or less). Wait at least 2 hours for edibles or 15 minutes for inhalation before taking more. Effects can be delayed."
  },
  {
    id: "edu-02",
    source: "LRCUG",
    topic: "Safety",
    title: "Avoid Combustion",
    content: "Smoking cannabis can harm your lungs. Using a vaporizer or oral products (oils, capsules) is safer for your respiratory health."
  },
  {
    id: "edu-03",
    source: "Patient_Leaflet",
    topic: "Side_Effects",
    title: "Managing Side Effects",
    content: "If you feel too high or anxious ('greening out'): 1. Don't panic, it will pass. 2. Find a quiet place. 3. Drink water. 4. Do not drive. CBD can sometimes help counteract the effects of THC."
  },
  {
    id: "edu-04",
    source: "LRCUG",
    topic: "Safety",
    title: "Driving & Impairment",
    content: "Cannabis impairs your ability to drive. Do not drive for at least 6-8 hours after using, or longer if you feel impaired. It is illegal and dangerous."
  }
];

// ==========================================
// 3. CRISIS PROTOCOLS (Shared Safety Layer)
// ==========================================
export const CRISIS_TEMPLATES: CrisisTemplate[] = [
  {
    trigger_keywords: ["chest pain", "heart racing", "palpitations", "tightness"],
    action_required: "Call Emergency",
    response_template: "⚠️ **MEDICAL ALERT: CARDIOVASCULAR SYMPTOMS**\n\nCannabis can cause tachycardia (fast heart rate), but **chest pain** requires immediate medical attention to rule out cardiac events.\n\n1. Stop using cannabis immediately.\n2. Sit down and try to remain calm.\n3. **CALL EMERGENCY SERVICES (911) NOW** if you have chest pain, shortness of breath, or fainting."
  },
  {
    trigger_keywords: ["dying", "fear of dying", "going crazy", "losing control", "derealisation"],
    action_required: "De-escalate & Monitor",
    response_template: "🛡️ **HARM REDUCTION: ACUTE PANIC / 'GREENING OUT'**\n\nYou are likely experiencing an acute panic reaction to THC. This is a known, temporary adverse effect.\n\n**PROTOCOL:**\n1. **Reassurance:** You are not dying. This feeling is chemical and temporary. It will pass.\n2. **Environment:** Move to a quiet, dimly lit room. Reduce sensory input.\n3. **Hydration:** Drink water (sip slowly).\n4. **Breathing:** Focus on slow exhalation (4-7-8 breathing).\n5. **Safety:** Do NOT drive. Do NOT take more."
  },
  {
    trigger_keywords: ["suicide", "kill myself", "hurt myself", "hearing voices", "hallucination"],
    action_required: "Call Emergency",
    response_template: "🚨 **EMERGENCY: MENTAL HEALTH CRISIS**\n\nYou are describing symptoms that require immediate professional support.\n\n1. **CALL EMERGENCY SERVICES (988 or 911) IMMEDIATELY.**\n2. Do not be alone if possible.\n3. Cannabis can induce acute psychosis in vulnerable individuals; this requires medical management."
  }
];