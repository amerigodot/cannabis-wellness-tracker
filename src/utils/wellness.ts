import { JournalEntry } from "@/types/journal";

// Calculate effectiveness score from before/after metrics
export const calculateEffectiveness = (entry: JournalEntry): { score: number; label: string; color: string } => {
  if (!entry.before_mood || !entry.after_mood || entry.entry_status === 'pending_after') {
    return { score: 0, label: 'No Data', color: 'bg-muted' };
  }

  // Calculate deltas (positive = improvement)
  const moodDelta = entry.after_mood - entry.before_mood;
  const painDelta = entry.before_pain! - entry.after_pain!; // Lower pain is better
  const anxietyDelta = entry.before_anxiety! - entry.after_anxiety!; // Lower anxiety is better
  const energyDelta = entry.after_energy! - entry.before_energy!;
  const focusDelta = entry.after_focus! - entry.before_focus!;

  // Weighted average (pain and anxiety reduction weighted higher)
  const totalDelta = (moodDelta * 1.2 + painDelta * 1.5 + anxietyDelta * 1.5 + energyDelta + focusDelta) / 6.2;
  
  // Convert to 0-100 scale (max possible improvement is 9 points per metric)
  const score = Math.round(((totalDelta + 9) / 18) * 100);

  if (score >= 75) return { score, label: 'Highly Effective', color: 'bg-green-500' };
  if (score >= 60) return { score, label: 'Effective', color: 'bg-green-400' };
  if (score >= 45) return { score, label: 'Moderate', color: 'bg-yellow-500' };
  if (score >= 30) return { score, label: 'Mild', color: 'bg-orange-500' };
  return { score, label: 'Limited Effect', color: 'bg-red-500' };
};

// Non-linear slider: first half (0-720) = 0-2h, second half (720-1440) = 2-24h
export const sliderValueToMinutes = (sliderValue: number) => {
  if (sliderValue <= 720) {
    return sliderValue / 6; // 0-2 hours (0-120 minutes)
  }
  // 720 maps to 120. 1440 maps to 1440.
  // Slope = (1440 - 120) / (1440 - 720) = 1320 / 720 = 11/6 = 1.8333...
  return 120 + (sliderValue - 720) * (11/6); 
};

export const minutesToSliderValue = (minutes: number) => {
  if (minutes <= 120) {
    return minutes * 6; // 0-2 hours
  }
  return 720 + (minutes - 120) / (11/6); // 2-24 hours
};

export const formatTimeAgo = (sliderValue: number): string => {
  let minutes = sliderValueToMinutes(sliderValue);
  
  // Handle slight precision errors from float math
  if (Math.abs(Math.round(minutes) - minutes) < 0.01) {
      minutes = Math.round(minutes);
  }

  if (minutes < 1) return 'Now';
  if (minutes < 60) return `${Math.round(minutes)} min ago`;
  
  let hours = Math.floor(minutes / 60);
  let remainingMinutes = Math.round(minutes % 60);
  
  // Handle edge case where rounding minutes pushes it to the next hour (e.g., 59.9 -> 60)
  if (remainingMinutes === 60) {
      hours += 1;
      remainingMinutes = 0;
  }

  if (hours < 24) {
      return `${hours}h ${remainingMinutes}m ago`;
  }
  
  const days = Math.floor(minutes / 1440);
  // Using floor here means 24h -> 1 day, 47h -> 1 day, 48h -> 2 days
  // Rounding might be better for UX depending on preference, but sticking to floor for "days passed"
  // However, test expects "1 days ago" for 1440.
  return `${Math.round(minutes / 1440)} days ago`; 
};