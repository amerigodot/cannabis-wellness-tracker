// Sample AI Wellness Report Data for demonstration purposes
export const sampleAIReport = {
  title: "Medical Marijuana Wellness Report",
  preparedBy: "Wellness Analytics Expert",
  reportingPeriod: "10/13/2025 - 12/07/2025",
  totalEntries: 42,
  
  usageOverview: {
    mostCommonStrains: [
      { name: "Amnesia + Green Poison", entries: 37, percentage: 88.1 },
      { name: "Amnesia + Critical Kush XXL", entries: 3, percentage: 7.1 },
      { name: "Amnesia", entries: 2, percentage: 4.8 },
    ],
    mostCommonDosages: [
      { dosage: "0.4g", entries: 30, percentage: 71.4, note: "Standard and preferred dosage" },
      { dosage: "0.3g/0.35g", entries: 8, percentage: 19.0, note: "Used predominantly in the earlier part of the reporting period" },
      { dosage: "1.2g", entries: 4, percentage: 9.5, note: "Higher dosage used consistently on a single day" },
    ],
    consumptionMethod: { method: "Vape", entries: 42, percentage: 100 },
  },
  
  patternRecognition: {
    positiveObservations: [
      { effect: "Relaxation", entries: 21, percentage: 50 },
      { effect: "Reduced Anxiety", entries: 18, percentage: 42.9 },
      { effect: "Mood Lift", entries: 15, percentage: 35.7 },
      { effect: "Energy Increase", entries: 10, percentage: 23.8 },
      { effect: "Improved Focus", entries: 9, percentage: 21.4 },
      { effect: "Muscle Relaxation", entries: 9, percentage: 21.4 },
      { effect: "Creativity Boost", entries: 6, percentage: 14.3 },
      { effect: "Appetite Increase", entries: 6, percentage: 14.3 },
      { effect: "Calm/Peaceful", entries: 5, percentage: 11.9 },
      { effect: "Mind Clarity", entries: 4, percentage: 9.5 },
      { effect: "Pain Relief", entries: 4, percentage: 9.5 },
      { effect: "Reduced Inflammation", entries: 4, percentage: 9.5 },
      { effect: "Better Sleep", entries: 3, percentage: 7.1 },
    ],
    recurringActivities: [
      { activity: "Work", entries: 11, percentage: 26.2, associations: ["Improved Focus", "Creativity Boost", "Energy Increase"] },
      { activity: "Music", entries: 11, percentage: 26.2, associations: ["Relaxation", "Mood Lift", "Creativity Boost"] },
      { activity: "Meditation", entries: 9, percentage: 21.4, associations: ["Relaxation", "Reduced Anxiety", "Calm/Peaceful"] },
      { activity: "Social", entries: 6, percentage: 14.3, associations: ["Increased Sociability", "Mood Lift", "Relaxation"] },
      { activity: "Reading", entries: 4, percentage: 9.5, associations: [] },
      { activity: "Nature/Outdoors", entries: 3, percentage: 7.1, associations: [] },
      { activity: "Cooking", entries: 2, percentage: 4.8, associations: [] },
      { activity: "Exercise", entries: 2, percentage: 4.8, associations: [] },
      { activity: "TV Shows", entries: 2, percentage: 4.8, associations: [] },
    ],
    negativeSideEffects: [
      { effect: "Anxiety", entries: 2, percentage: 4.8 },
      { effect: "Dry Eyes", entries: 1, percentage: 2.4 },
      { effect: "Fatigue", entries: 1, percentage: 2.4 },
      { effect: "Dry Mouth", entries: 1, percentage: 2.4 },
      { effect: "Paranoia", entries: 1, percentage: 2.4 },
      { effect: "Memory Issues", entries: 1, percentage: 2.4 },
      { effect: "Confusion", entries: 1, percentage: 2.4 },
      { effect: "Headache", entries: 1, percentage: 2.4 },
    ],
  },
  
  effectivenessAnalysis: {
    overallStrainPerformance: {
      strain: "Amnesia + Green Poison",
      highlights: [
        "Consistently reduced anxiety and promoted relaxation (18 and 21 entries respectively)",
        "Frequent mood lift (15 entries) and energy increase (10 entries)",
        "Cognitive enhancement: improved focus (9 entries) and creativity boost (6 entries)",
        "Physical relief: muscle relaxation (9 entries), pain relief (3 entries), reduced inflammation (4 entries)",
      ],
    },
    dosageImpact: [
      {
        dosage: "0.4g",
        description: "Highly effective for a wide range of benefits including relaxation, anxiety reduction, mood lift, improved focus, and energy increase. Most versatile dosage.",
      },
      {
        dosage: "0.3g/0.35g",
        description: "Associated with muscle relaxation, energy increase, reduced anxiety, and mood lift. Effective for some benefits at lower doses.",
      },
      {
        dosage: "1.2g",
        description: "Specifically highlighted relaxation, reduced anxiety, appetite increase, and reduced inflammation. Strong and reproducible effect for specific benefits.",
      },
    ],
  },
  
  sideEffectsSummary: {
    overallRate: "19% (8 out of 42 entries)",
    mostFrequent: "Anxiety (2 occurrences)",
    recommendations: [
      "Consider external factors when anxiety occurs",
      "Ensure adequate hydration for dryness symptoms",
      "Monitor carefully when introducing new strains",
    ],
  },
  
  recommendations: [
    {
      title: "Continue with Amnesia + Green Poison (0.4g)",
      description: "This blend and dosage consistently delivered desired therapeutic effects with minimal negative side effects.",
    },
    {
      title: "Monitor Higher Dosages for Specific Needs",
      description: "The 1.2g dosage showed pronounced effects for reduced inflammation and appetite increase. Consider experimenting carefully.",
    },
    {
      title: "Cautious Approach to Strain Changes",
      description: "New strains coincided with new negative side effects. Start with lower dosages and monitor closely.",
    },
    {
      title: "Hydration for Dryness",
      description: "Ensure adequate hydration before and during use to mitigate dry eyes and dry mouth.",
    },
    {
      title: "Continue Detailed Journaling",
      description: "Meticulous logging is invaluable for refining personalized insights and optimization.",
    },
  ],
};
