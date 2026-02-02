export interface ClinicalDiagnosis {
  icd10Code: string;
  name: string;
  dateDiagnosed: Date;
  status: 'active' | 'remission' | 'resolved';
}

export interface Product {
  name: string;
  strain: string;
  type: 'flower' | 'oil' | 'capsule' | 'edible' | 'topical' | 'vape';
  thcContent: number; // mg or %
  cbdContent: number; // mg or %
  batchId?: string;
}

export interface DosingSchedule {
  frequency: 'prn' | 'daily' | 'bid' | 'tid' | 'qid';
  targetTHC: number; // mg/day
  targetCBD: number; // mg/day
  instructions: string;
}

export interface CannabisRegimen {
  products: Product[];
  dosing: DosingSchedule;
  route: "oral" | "sublingual" | "vaporised" | "topical";
  startDate: Date;
  prescribingClinician?: string;
}

export interface PatientReportedOutcomes {
  date: Date;
  painScore: number; // 0-10 NRS
  anxietyScore: number; // GAD-7 (0-21)
  sleepQuality: number; // 0-10 (subset of PSQI)
  sideEffects: string[];
  functionalStatus: string;
}

export interface AdverseEvent {
  date: Date;
  type: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  description: string;
  actionTaken: string;
}

export interface SafetyFlag {
  code: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  detectedAt: Date;
}

export interface ConsentScope {
  share_symptom_scores: boolean;
  share_notes: boolean;
  share_adverse_events: boolean;
  share_regimen: boolean;
}

export interface Demographics {
  dateOfBirth: Date;
  gender: string;
  weight?: number; // kg
  height?: number; // cm
}

export interface PatientCard {
  id: string;
  demographics: Demographics;
  diagnoses: ClinicalDiagnosis[];
  regimen: CannabisRegimen;
  proms: PatientReportedOutcomes[];
  adverseEvents: AdverseEvent[];
  safetyFlags: SafetyFlag[];
  sharingConsent: ConsentScope;
  lastSync: Date;
}
