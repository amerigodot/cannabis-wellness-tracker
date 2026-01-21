// src/data/clinicalProtocols.ts

export interface Protocol {
  id: string;
  trigger: string;
  recommendation: string;
  contraindication: string;
  source: string;
}

export const CLINICAL_PROTOCOLS: Protocol[] = [
  {
    id: "ANX-01",
    trigger: "Anxiety Score > 6",
    recommendation: "Suggest CBD-dominant strains (Ratio 1:1 or higher CBD). Recommend reduction in THC dosage.",
    contraindication: "Avoid high-THC Sativa strains which may exacerbate tachycardia and racing thoughts.",
    source: "LRCUG (Lower Risk Cannabis Use Guidelines)"
  },
  {
    id: "TOL-01",
    trigger: "Usage Frequency: Daily AND Effectiveness < 40%",
    recommendation: "Suggest a 'Tolerance Break' protocol (48-72 hours minimum). Explain CB1 receptor downregulation.",
    contraindication: "Do not simply recommend increasing dosage, as this leads to dependency.",
    source: "Clinical Management of Cannabinoid Tolerance"
  },
  {
    id: "PULM-01",
    trigger: "Method: Smoking AND Symptom: Cough/Shortness of Breath",
    recommendation: "Strongly advise switching to non-inhalational methods (Edibles, Tinctures) or dry herb vaporization.",
    contraindication: "Combustion produces tar and carcinogens harmful to lung tissue.",
    source: "Harm Reduction Coalition"
  },
  {
    id: "EDIB-01",
    trigger: "Method: Edible AND Onset < 60 mins",
    recommendation: "Remind patient of 'First Pass Metabolism' delay (45-120 mins). Advise against redosing early.",
    contraindication: "Overconsumption risk is highest with premature redosing of edibles.",
    source: "Emergency Medicine Toxicology"
  }
];

export const SYSTEM_PERSONA = `
You are MedGemma-Edge, a specialized Clinical Decision Support Agent for cannabis therapy.
Your Goal: Maximize patient wellness while strictly minimizing harm.

OPERATIONAL RULES:
1. EVIDENCE-BASED: Only make claims supported by the provided Clinical Protocols.
2. HARM REDUCTION: Always prioritize safety over efficacy. If a user is taking high doses, warn them.
3. NON-JUDGMENTAL: Use objective, clinical language.
4. LIMITATIONS: You are an AI, not a doctor. Always end with "Consult your healthcare provider."
`;
