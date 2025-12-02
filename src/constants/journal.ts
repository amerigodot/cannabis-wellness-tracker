import { Leaf, Pill, Droplet, Cigarette, Cookie, Coffee, Sparkles, Heart, Brain, Zap, Rocket, Flame, Wind, Beaker, Pipette } from "lucide-react";

export const COMMON_OBSERVATIONS = [
  "Pain Relief",
  "Relaxation",
  "Better Sleep",
  "Reduced Anxiety",
  "Improved Focus",
  "Appetite Increase",
  "Mood Lift",
  "Reduced Inflammation",
  "Muscle Relaxation",
  "Creativity Boost",
  "Nausea Relief",
  "Energy Increase",
  "Euphoria",
  "Increased Sociability",
  "Time Distortion",
  "Body Tingling",
  "Increased Sensation",
  "Giggly/Happy",
  "Calm/Peaceful",
  "Mind Clarity",
];

export const COMMON_ACTIVITIES = [
  "Social",
  "Music",
  "Painting",
  "Gaming",
  "Exercise",
  "Cooking",
  "Reading",
  "Writing",
  "Meditation",
  "Movies",
  "TV Shows",
  "Learning",
  "Studying",
  "Work",
  "Relaxing",
  "Photography",
  "Crafts",
  "Gardening",
  "Shopping",
  "Cleaning",
  "Nature/Outdoors",
  "Yoga",
  "Dancing",
  "Sports",
];

export const NEGATIVE_SIDE_EFFECTS = [
  "Dry Mouth",
  "Dry Eyes",
  "Red Eyes",
  "Dizziness",
  "Paranoia",
  "Anxiety",
  "Headache",
  "Fatigue",
  "Increased Heart Rate",
  "Coughing",
  "Throat Irritation",
  "Nausea",
  "Memory Issues",
  "Confusion",
  "Restlessness",
  "Impaired Coordination",
  "Hunger/Munchies",
];

export const AVAILABLE_ICONS = [
  { name: "Leaf", value: "leaf" },
  { name: "Pill", value: "pill" },
  { name: "Droplet", value: "droplet" },
  { name: "Cigarette", value: "cigarette" },
  { name: "Cookie", value: "cookie" },
  { name: "Coffee", value: "coffee" },
  { name: "Sparkles", value: "sparkles" },
  { name: "Heart", value: "heart" },
  { name: "Brain", value: "brain" },
  { name: "Zap", value: "zap" },
  { name: "Space", value: "rocket" },
  { name: "Fire", value: "flame" },
];

export const ENTRY_PRESETS = [
  {
    name: "Morning Session",
    icon: Coffee,
    observations: ["Energy Increase", "Mood Lift", "Improved Focus", "Mind Clarity"],
    activities: ["Work", "Exercise", "Studying", "Learning"],
  },
  {
    name: "Evening Relaxation",
    icon: Heart,
    observations: ["Relaxation", "Better Sleep", "Reduced Anxiety", "Calm/Peaceful"],
    activities: ["Reading", "TV Shows", "Meditation", "Nature/Outdoors"],
  },
  {
    name: "Social Gathering",
    icon: Sparkles,
    observations: ["Mood Lift", "Increased Sociability", "Giggly/Happy", "Euphoria"],
    activities: ["Social", "Music", "Dancing", "Gaming"],
  },
  {
    name: "Creative Work",
    icon: Brain,
    observations: ["Creativity Boost", "Improved Focus", "Increased Sensation", "Mood Lift"],
    activities: ["Writing", "Painting", "Music", "Photography", "Crafts"],
  },
  {
    name: "Pain Relief",
    icon: Heart,
    observations: ["Pain Relief", "Reduced Inflammation", "Muscle Relaxation", "Body Tingling"],
    activities: ["Relaxing", "Yoga", "Meditation", "Nature/Outdoors"],
  },
];

export const getMethodIcon = (method: string) => {
  const methodIconMap: Record<string, typeof Leaf> = {
    "Vape": Wind,
    "Smoke": Cigarette,
    "Oil": Droplet,
    "Tincture": Beaker,
    "Topical": Pipette,
    "Edible": Cookie,
  };
  return methodIconMap[method] || Leaf;
};

export const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, typeof Leaf> = {
    leaf: Leaf,
    pill: Pill,
    droplet: Droplet,
    cigarette: Cigarette,
    cookie: Cookie,
    coffee: Coffee,
    sparkles: Sparkles,
    heart: Heart,
    brain: Brain,
    zap: Zap,
    rocket: Rocket,
    flame: Flame,
  };
  return iconMap[iconName] || Leaf;
};
