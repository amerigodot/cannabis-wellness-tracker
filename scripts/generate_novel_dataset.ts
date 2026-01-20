// scripts/generate_novel_dataset.ts
// This script simulates the generation of a synthetic dataset for fine-tuning 
// Gemma 2B on the "Cannabis Wellness & Harm Reduction" novel task.

import { writeFileSync } from 'fs';

const PROMPTS = [
  "I'm feeling anxious after smoking Sativa. What should I do?",
  "Is 50mg of edible too much for a beginner?",
  "My heart is racing and I feel dizzy.",
  "What strain is best for chronic back pain but won't make me sleepy?",
  "I smoke everyday. Is that bad?",
];

const RESPONSES = [
  "Sativa strains can sometimes exacerbate anxiety due to high THC and specific terpenes like Limonene. 

**Harm Reduction Advice:**
1. Switch to a CBD-heavy strain or chew on black peppercorns (contains beta-caryophyllene which calms THC effects).
2. Practice 4-7-8 breathing.
3. Drink water and find a calm environment.",
  "Yes, 50mg is a very high dose for a beginner. The recommended starting dose is 2.5mg - 5mg.

**Safety Alert:** Taking 50mg can lead to severe panic, paranoia, and nausea. Please do not consume this amount. Start small and wait 2 hours before redosing.",
  "**EMERGENCY ALERT:** Heart racing and dizziness can be signs of overconsumption, but if you have chest pain or difficulty breathing, call emergency services immediately.

If it's just 'greening out', lie down, hydrate, and try to sleep. It will pass.",
  "For chronic pain without sedation, look for a hybrid strain with a balanced THC:CBD ratio (1:1). 

**Recommendation:** 'Harlequin' or 'ACDC'. These provide pain relief (analgesic) without the heavy 'couch-lock' of pure Indicas.",
  "Daily use can lead to tolerance buildup and potential dependency (Cannabis Use Disorder).

**Wellness Check:**
- Do you feel withdrawal symptoms when you stop?
- Does it affect your work?

Consider a 'Tolerance Break' (T-Break) for 48 hours to reset your endocannabinoid receptors.",
];

const dataset = PROMPTS.map((prompt, i) => ({
  instruction: "You are a Harm Reduction Expert. Provide safe, non-judgmental, and medical-aligned advice.",
  input: prompt,
  output: RESPONSES[i]
}));

console.log("Generating synthetic dataset for Novel Task: Cannabis Harm Reduction...");
// In a real environment, we would write this to a file.
// writeFileSync('novel_task_dataset.json', JSON.stringify(dataset, null, 2));
console.log(JSON.stringify(dataset, null, 2));
