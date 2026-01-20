import { z } from "zod";

export const journalEntrySchema = z.object({
  // Consumption Details
  strain: z.string().min(1, "Strain name is required"),
  strain_2: z.string().optional(),
  thc_percentage: z.string().optional().transform(val => val ? parseFloat(val) : null),
  cbd_percentage: z.string().optional().transform(val => val ? parseFloat(val) : null),
  dosageAmount: z.string().min(1, "Dosage amount is required"),
  dosageUnit: z.string(),
  method: z.string().min(1, "Method is required"),
  consumption_time: z.date(), // Calculated from minutesAgo in the UI, but we might just store minutesAgo in the form state for now? Actually, let's stick to minutesAgo for the UI state.
  minutesAgo: z.number().default(0),

  // Badges
  observations: z.array(z.string()).default([]),
  activities: z.array(z.string()).default([]),
  negative_side_effects: z.array(z.string()).default([]),
  
  // Metadata
  notes: z.string().optional(),
  icon: z.string().default("leaf"),
  
  // Full Tracking - Before
  before_mood: z.number().min(1).max(10).default(5),
  before_pain: z.number().min(1).max(10).default(5),
  before_anxiety: z.number().min(1).max(10).default(5),
  before_energy: z.number().min(1).max(10).default(5),
  before_focus: z.number().min(1).max(10).default(5),
  before_notes: z.string().optional(),

  // Full Tracking - After
  after_mood: z.number().min(1).max(10).default(5),
  after_pain: z.number().min(1).max(10).default(5),
  after_anxiety: z.number().min(1).max(10).default(5),
  after_energy: z.number().min(1).max(10).default(5),
  after_focus: z.number().min(1).max(10).default(5),
  
  effects_duration_minutes: z.number().nullable().optional(),
  
  // UI State (not saved to DB directly)
  isQuickEntry: z.boolean().default(true),
  entryFormTab: z.enum(['before', 'consumption', 'after']).default('before'),
});

export type JournalEntryFormValues = z.infer<typeof journalEntrySchema>;
