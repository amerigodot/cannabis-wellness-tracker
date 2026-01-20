import { describe, it, expect } from "vitest";
import { calculateEffectiveness, sliderValueToMinutes, formatTimeAgo } from "./wellness";
import { JournalEntry } from "@/types/journal";

describe("wellness utilities", () => {
  describe("calculateEffectiveness", () => {
    it("should return 0 score and 'No Data' label if before_mood or after_mood is missing or entry is pending_after", () => {
      const entry1: Partial<JournalEntry> = { 
        entry_status: 'pending_after',
        before_mood: 5, after_mood: 8
      };
      expect(calculateEffectiveness(entry1 as JournalEntry)).toEqual({ score: 0, label: 'No Data', color: 'bg-muted' });

      const entry2: Partial<JournalEntry> = {
        before_mood: undefined, after_mood: 8
      };
      expect(calculateEffectiveness(entry2 as JournalEntry)).toEqual({ score: 0, label: 'No Data', color: 'bg-muted' });

      const entry3: Partial<JournalEntry> = {
        before_mood: 5, after_mood: undefined
      };
      expect(calculateEffectiveness(entry3 as JournalEntry)).toEqual({ score: 0, label: 'No Data', color: 'bg-muted' });
    });

    it("should calculate score correctly with positive improvements", () => {
      const entry: Partial<JournalEntry> = {
        before_mood: 5, before_pain: 7, before_anxiety: 6, before_energy: 4, before_focus: 5,
        after_mood: 8, after_pain: 3, after_anxiety: 3, after_energy: 7, after_focus: 8,
        entry_status: 'complete'
      };
      expect(calculateEffectiveness(entry as JournalEntry).score).toBe(68);
      expect(calculateEffectiveness(entry as JournalEntry).label).toBe('Effective');
    });

    it("should calculate score correctly with mixed improvements", () => {
      const entry: Partial<JournalEntry> = {
        before_mood: 5, before_pain: 5, before_anxiety: 5, before_energy: 5, before_focus: 5,
        after_mood: 5, after_pain: 5, after_anxiety: 5, after_energy: 5, after_focus: 5,
        entry_status: 'complete'
      };
      expect(calculateEffectiveness(entry as JournalEntry).score).toBe(50);
      expect(calculateEffectiveness(entry as JournalEntry).label).toBe('Moderate');
    });

    it("should calculate score correctly with negative changes", () => {
      const entry: Partial<JournalEntry> = {
        before_mood: 8, before_pain: 3, before_anxiety: 3, before_energy: 7, before_focus: 8,
        after_mood: 5, after_pain: 7, after_anxiety: 6, after_energy: 4, after_focus: 5,
        entry_status: 'complete'
      };
      expect(calculateEffectiveness(entry as JournalEntry).score).toBe(32);
      expect(calculateEffectiveness(entry as JournalEntry).label).toBe('Mild');
    });
  });

  describe("sliderValueToMinutes", () => {
    it("should convert slider value to minutes correctly for 0-2 hours range", () => {
      expect(sliderValueToMinutes(0)).toBe(0); // Now
      expect(sliderValueToMinutes(360)).toBe(60); // 1 hour (360/6)
      expect(sliderValueToMinutes(720)).toBe(120); // 2 hours (720/6)
    });

    it("should convert slider value to minutes correctly for 2-24 hours range", () => {
      // 721 maps to 120 + 1 * (11/6) = 121.833...
      expect(sliderValueToMinutes(721)).toBeCloseTo(120 + 1.8333, 1); 
      
      // 1080 maps to 120 + 360 * (11/6) = 120 + 660 = 780
      expect(sliderValueToMinutes(1080)).toBeCloseTo(780, 1); 
      
      // 1440 maps to 120 + 720 * (11/6) = 120 + 1320 = 1440
      expect(sliderValueToMinutes(1440)).toBeCloseTo(1440, 1); 
    });
  });

  describe("formatTimeAgo", () => {
    it("should return 'Now' for 0 minutes ago", () => {
      expect(formatTimeAgo(0)).toBe("Now");
    });

    it("should format minutes correctly for less than 60 minutes", () => {
      expect(formatTimeAgo(1)).toBe("Now"); // 1 / 6 = 0.166 min < 1 min -> Now
      expect(formatTimeAgo(6)).toBe("1 min ago"); // 6 / 6 = 1 min
      expect(formatTimeAgo(30)).toBe("5 min ago"); // 30 / 6 = 5
      expect(formatTimeAgo(359)).toBe("60 min ago"); // 359 / 6 = 59.83 -> rounds to 60
    });

    it("should format hours and minutes correctly for less than 24 hours", () => {
      expect(formatTimeAgo(360)).toBe("1h 0m ago"); // 1 hour
      expect(formatTimeAgo(720)).toBe("2h 0m ago"); // 2 hours
      // 1080 slider -> 780 minutes -> 13h 0m
      expect(formatTimeAgo(1080)).toBe("13h 0m ago"); 
      // 1439 slider -> ~1438.16 minutes -> ~23h 58m
      expect(formatTimeAgo(1439)).toBe("23h 58m ago"); 
    });

    it("should format days correctly for 24 hours or more", () => {
      expect(formatTimeAgo(1440)).toBe("1 days ago"); // 24 hours (1440 mins)
      // 2880 slider -> ~4080 minutes -> ~2.83 days -> 3 days
      expect(formatTimeAgo(2880)).toBe("3 days ago"); 
    });
  });
});
