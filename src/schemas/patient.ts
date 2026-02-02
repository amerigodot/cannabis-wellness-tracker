import { z } from "zod";

export const clinicalDiagnosisSchema = z.object({
  icd10Code: z.string(),
  name: z.string(),
  dateDiagnosed: z.coerce.date(),
  status: z.enum(['active', 'remission', 'resolved']),
});

export const productSchema = z.object({
  name: z.string(),
  strain: z.string(),
  type: z.enum(['flower', 'oil', 'capsule', 'edible', 'topical', 'vape']),
  thcContent: z.number().min(0),
  cbdContent: z.number().min(0),
  batchId: z.string().optional(),
});

export const dosingScheduleSchema = z.object({
  frequency: z.enum(['prn', 'daily', 'bid', 'tid', 'qid']),
  targetTHC: z.number().min(0),
  targetCBD: z.number().min(0),
  instructions: z.string(),
});

export const cannabisRegimenSchema = z.object({
  products: z.array(productSchema),
  dosing: dosingScheduleSchema,
  route: z.enum(["oral", "sublingual", "vaporised", "topical"]),
  startDate: z.coerce.date(),
  prescribingClinician: z.string().optional(),
});

export const patientReportedOutcomesSchema = z.object({
  date: z.coerce.date(),
  painScore: z.number().min(0).max(10),
  anxietyScore: z.number().min(0).max(21), // GAD-7 max is 21
  sleepQuality: z.number().min(0).max(10),
  sideEffects: z.array(z.string()),
  functionalStatus: z.string(),
});

export const adverseEventSchema = z.object({
  date: z.coerce.date(),
  type: z.string(),
  severity: z.enum(['mild', 'moderate', 'severe', 'life-threatening']),
  description: z.string(),
  actionTaken: z.string(),
});

export const safetyFlagSchema = z.object({
  code: z.string(),
  level: z.enum(['info', 'warning', 'critical']),
  message: z.string(),
  detectedAt: z.coerce.date(),
});

export const consentScopeSchema = z.object({
  share_symptom_scores: z.boolean(),
  share_notes: z.boolean(),
  share_adverse_events: z.boolean(),
  share_regimen: z.boolean(),
});

export const demographicsSchema = z.object({
  dateOfBirth: z.coerce.date(),
  gender: z.string(),
  weight: z.number().optional(),
  height: z.number().optional(),
});

export const patientCardSchema = z.object({
  id: z.string(),
  demographics: demographicsSchema,
  diagnoses: z.array(clinicalDiagnosisSchema),
  regimen: cannabisRegimenSchema,
  proms: z.array(patientReportedOutcomesSchema),
  adverseEvents: z.array(adverseEventSchema),
  safetyFlags: z.array(safetyFlagSchema),
  sharingConsent: consentScopeSchema,
  lastSync: z.coerce.date(),
});