export interface JournalEntry {
  id: string;
  user_id: string;
  created_at: string;
  consumption_time: string;
  strain: string;
  strain_2?: string | null;
  thc_percentage?: number | null;
  cbd_percentage?: number | null;
  dosage: string;
  method: string;
  observations: string[];
  activities: string[];
  negative_side_effects: string[];
  notes: string | null;
  icon: string;
  entry_status?: string | null;
  effects_duration_minutes?: number | null;
  before_mood?: number | null;
  before_pain?: number | null;
  before_anxiety?: number | null;
  before_energy?: number | null;
  before_focus?: number | null;
  before_notes?: string | null;
  after_mood?: number | null;
  after_pain?: number | null;
  after_anxiety?: number | null;
  after_energy?: number | null;
  after_focus?: number | null;
  is_deleted?: boolean;
  // Separate THC/CBD weights
  thc_weight?: number | null;
  cbd_weight?: number | null;
  dosage_unit?: string | null;
}
