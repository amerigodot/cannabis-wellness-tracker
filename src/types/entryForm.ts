import { z } from "zod";

export const entryFormSchema = z.object({
  // Basic consumption info
  strain: z.string().min(1, "Strain name is required").max(100),
  strain2: z.string().max(100).optional(),
  thcPercentage: z.string().optional(),
  cbdPercentage: z.string().optional(),
  dosageAmount: z.string().min(1, "Dosage is required"),
  dosageUnit: z.enum(["g", "ml", "mg"]),
  method: z.string().min(1, "Method is required"),
  selectedIcon: z.string().default("leaf"),
  minutesAgo: z.number().min(0).max(1440).default(0),
  
  // Observations, activities, side effects
  observations: z.array(z.string()).default([]),
  activities: z.array(z.string()).default([]),
  negativeSideEffects: z.array(z.string()).default([]),
  notes: z.string().optional(),
  
  // Before state
  beforeMood: z.number().min(1).max(10).default(5),
  beforePain: z.number().min(1).max(10).default(5),
  beforeAnxiety: z.number().min(1).max(10).default(5),
  beforeEnergy: z.number().min(1).max(10).default(5),
  beforeFocus: z.number().min(1).max(10).default(5),
  beforeNotes: z.string().optional(),
  
  // After state
  afterMood: z.number().min(1).max(10).default(5),
  afterPain: z.number().min(1).max(10).default(5),
  afterAnxiety: z.number().min(1).max(10).default(5),
  afterEnergy: z.number().min(1).max(10).default(5),
  afterFocus: z.number().min(1).max(10).default(5),
  effectsDurationMinutes: z.number().nullable().optional(),
  
  // Entry mode
  isQuickEntry: z.boolean().default(false),
  entryFormTab: z.enum(["before", "consumption", "after"]).default("before"),
});

export type EntryFormValues = z.infer<typeof entryFormSchema>;

export const defaultFormValues: EntryFormValues = {
  strain: "",
  strain2: "",
  thcPercentage: "",
  cbdPercentage: "",
  dosageAmount: "",
  dosageUnit: "g",
  method: "",
  selectedIcon: "leaf",
  minutesAgo: 0,
  observations: [],
  activities: [],
  negativeSideEffects: [],
  notes: "",
  beforeMood: 5,
  beforePain: 5,
  beforeAnxiety: 5,
  beforeEnergy: 5,
  beforeFocus: 5,
  beforeNotes: "",
  afterMood: 5,
  afterPain: 5,
  afterAnxiety: 5,
  afterEnergy: 5,
  afterFocus: 5,
  effectsDurationMinutes: null,
  isQuickEntry: false,
  entryFormTab: "before",
};
