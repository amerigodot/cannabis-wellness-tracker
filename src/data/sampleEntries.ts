import { JournalEntry } from "@/types/journal";

export const SAMPLE_ENTRIES: JournalEntry[] = [
  {
    id: "1",
    user_id: "demo-user",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
    consumption_time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    strain: "Blue Dream",
    dosage: "0.25g",
    method: "Vape",
    observations: ["Creative", "Energetic", "Focused"],
    activities: ["Work", "Art"],
    negative_side_effects: [],
    mood_score: 8,
    medical_symptoms: [{ name: "Anxiety", score: 3 }, { name: "Pain", score: 2 }],
    notes: "Great for morning focus.",
    is_deleted: false,
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    user_id: "demo-user",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    consumption_time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    strain: "Granddaddy Purple",
    dosage: "10mg",
    method: "Edible",
    observations: ["Relaxed", "Sleepy"],
    activities: ["Sleep", "Movie"],
    negative_side_effects: ["Dry Mouth"],
    mood_score: 9,
    medical_symptoms: [{ name: "Insomnia", score: 8 }, { name: "Pain", score: 6 }],
    notes: "Took 1 hour to kick in. Slept great.",
    is_deleted: false,
    updated_at: new Date().toISOString()
  },
  {
    id: "3", // High Risk Example
    user_id: "demo-user",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    consumption_time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    strain: "Super Lemon Haze",
    dosage: "0.5g",
    method: "Smoking",
    observations: ["Anxious", "Paranoid", "Racing Thoughts"],
    activities: ["Social"],
    negative_side_effects: ["Anxiety", "Palpitations"],
    mood_score: 3,
    medical_symptoms: [{ name: "Anxiety", score: 9 }],
    notes: "Too strong. Felt heart racing. Not good for social settings.",
    is_deleted: false,
    updated_at: new Date().toISOString()
  },
  {
    id: "4", // Tolerance Example
    user_id: "demo-user",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // Yesterday
    consumption_time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    strain: "OG Kush",
    dosage: "0.5g",
    method: "Vape",
    observations: ["Normal"],
    activities: ["Gaming"],
    negative_side_effects: [],
    mood_score: 5,
    medical_symptoms: [{ name: "Boredom", score: 4 }],
    notes: "Didnt feel much. Maybe tolerance is up?",
    is_deleted: false,
    updated_at: new Date().toISOString()
  },
  {
    id: "5", // Protocol Alignment (CBD Success)
    user_id: "demo-user",
    created_at: new Date().toISOString(), // Today
    consumption_time: new Date().toISOString(),
    strain: "ACDC",
    dosage: "1ml",
    method: "Tincture",
    observations: ["Calm", "Pain Free"],
    activities: ["Work"],
    negative_side_effects: [],
    mood_score: 9,
    medical_symptoms: [{ name: "Anxiety", score: 2 }, { name: "Inflammation", score: 1 }],
    notes: "Perfect for daytime. No high, just relief.",
    is_deleted: false,
    updated_at: new Date().toISOString()
  }
];