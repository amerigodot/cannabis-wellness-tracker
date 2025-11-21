import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InsightsChart } from "@/components/InsightsChart";
import { Reminders } from "@/components/Reminders";
import { CalendarView } from "@/components/CalendarView";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Leaf, Calendar, Clock, LogOut, Trash2, List, FileText, Pill, Droplet, Cigarette, Cookie, Coffee, Sparkles, Heart, Brain, Zap, Rocket, Flame, Loader2, Wind, Beaker, Pipette, Bell, Activity, AlertCircle, Smile } from "lucide-react";
import { toast } from "sonner";
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, isWithinInterval, parseISO } from "date-fns";

interface JournalEntry {
  id: string;
  user_id: string;
  created_at: string;
  consumption_time: string;
  strain: string;
  dosage: string;
  method: string;
  observations: string[];
  activities: string[];
  negative_side_effects: string[];
  notes: string | null;
  icon: string;
}

const COMMON_OBSERVATIONS = [
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
];

const COMMON_ACTIVITIES = [
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
  "Work",
  "Relaxing",
];

const NEGATIVE_SIDE_EFFECTS = [
  "Dry Mouth",
  "Dry Eyes",
  "Dizziness",
  "Paranoia",
  "Anxiety",
  "Headache",
  "Fatigue",
  "Increased Heart Rate",
  "Coughing",
  "Nausea",
  "Memory Issues",
  "Confusion",
];

const AVAILABLE_ICONS = [
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

const ENTRY_PRESETS = [
  {
    name: "Morning Session",
    icon: Coffee,
    observations: ["Energy Increase", "Mood Lift", "Improved Focus"],
    activities: ["Work", "Exercise", "Cooking"],
  },
  {
    name: "Evening Relaxation",
    icon: Heart,
    observations: ["Relaxation", "Better Sleep", "Reduced Anxiety"],
    activities: ["Reading", "Movies", "Meditation"],
  },
  {
    name: "Social Gathering",
    icon: Sparkles,
    observations: ["Mood Lift", "Reduced Anxiety", "Creativity Boost"],
    activities: ["Social", "Music", "Gaming"],
  },
  {
    name: "Creative Work",
    icon: Brain,
    observations: ["Creativity Boost", "Improved Focus", "Mood Lift"],
    activities: ["Writing", "Painting", "Music"],
  },
  {
    name: "Pain Relief",
    icon: Heart,
    observations: ["Pain Relief", "Reduced Inflammation", "Muscle Relaxation"],
    activities: ["Relaxing", "Meditation", "Reading"],
  },
];

const getMethodIcon = (method: string) => {
  const methodIconMap: Record<string, any> = {
    "Vape": Wind,
    "Smoke": Cigarette,
    "Oil": Droplet,
    "Tincture": Beaker,
    "Topical": Pipette,
    "Edible": Cookie,
  };
  return methodIconMap[method] || Leaf;
};

const SAMPLE_ENTRIES: JournalEntry[] = [
  // Day 1-3: Starting period with varied effects
  {
    id: "demo-1",
    user_id: "demo",
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Blue Dream",
    dosage: "0.5g",
    method: "Vape",
    observations: ["Relaxation", "Mood Lift"],
    activities: ["Reading", "Music"],
    negative_side_effects: ["Dry Mouth"],
    notes: "Great for evening relaxation.",
    icon: "leaf",
  },
  {
    id: "demo-2",
    user_id: "demo",
    created_at: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Sour Diesel",
    dosage: "0.3g",
    method: "Smoke",
    observations: ["Energy Increase", "Reduced Anxiety"],
    activities: ["Work", "Exercise"],
    negative_side_effects: [],
    notes: "Morning boost, felt productive.",
    icon: "zap",
  },
  {
    id: "demo-3",
    user_id: "demo",
    created_at: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Jack Herer",
    dosage: "0.4g",
    method: "Vape",
    observations: ["Relaxation", "Appetite Increase", "Energy Increase"],
    activities: ["Social", "Cooking"],
    negative_side_effects: [],
    notes: "Balanced effects, good for daytime.",
    icon: "heart",
  },
  
  // Week 2: Increasing Relaxation and Reduced Anxiety
  {
    id: "demo-4",
    user_id: "demo",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Granddaddy Purple",
    dosage: "0.6g",
    method: "Vape",
    observations: ["Relaxation", "Reduced Anxiety", "Mood Lift"],
    activities: ["Meditation", "Movies"],
    negative_side_effects: [],
    notes: "Very calming evening session.",
    icon: "sparkles",
  },
  {
    id: "demo-5",
    user_id: "demo",
    created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Pineapple Express",
    dosage: "0.5g",
    method: "Smoke",
    observations: ["Reduced Anxiety", "Mood Lift", "Energy Increase"],
    activities: ["Gaming", "Social"],
    negative_side_effects: ["Dry Eyes"],
    notes: "Great for social activities.",
    icon: "flame",
  },
  {
    id: "demo-6",
    user_id: "demo",
    created_at: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Northern Lights",
    dosage: "0.7g",
    method: "Edible",
    observations: ["Relaxation", "Appetite Increase"],
    activities: ["Cooking", "Relaxing"],
    negative_side_effects: ["Fatigue"],
    notes: "Strong body effects.",
    icon: "cookie",
  },
  {
    id: "demo-7",
    user_id: "demo",
    created_at: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Green Crack",
    dosage: "0.3g",
    method: "Vape",
    observations: ["Energy Increase", "Mood Lift", "Reduced Anxiety"],
    activities: ["Work", "Exercise"],
    negative_side_effects: [],
    notes: "Perfect morning strain.",
    icon: "zap",
  },
  
  // Week 3: Peak Relaxation period
  {
    id: "demo-8",
    user_id: "demo",
    created_at: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Bubba Kush",
    dosage: "0.8g",
    method: "Vape",
    observations: ["Relaxation", "Relaxation", "Reduced Anxiety", "Mood Lift"],
    activities: ["Meditation", "Music"],
    negative_side_effects: [],
    notes: "Deeply relaxing experience.",
    icon: "brain",
  },
  {
    id: "demo-9",
    user_id: "demo",
    created_at: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "OG Kush",
    dosage: "0.6g",
    method: "Smoke",
    observations: ["Relaxation", "Mood Lift", "Appetite Increase"],
    activities: ["Social", "Cooking"],
    negative_side_effects: ["Dry Mouth"],
    notes: "Classic effects.",
    icon: "leaf",
  },
  {
    id: "demo-10",
    user_id: "demo",
    created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Purple Haze",
    dosage: "0.4g",
    method: "Vape",
    observations: ["Relaxation", "Reduced Anxiety", "Energy Increase"],
    activities: ["Painting", "Music"],
    negative_side_effects: [],
    notes: "Creative and relaxed.",
    icon: "sparkles",
  },
  {
    id: "demo-11",
    user_id: "demo",
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "White Widow",
    dosage: "0.5g",
    method: "Vape",
    observations: ["Relaxation", "Mood Lift", "Reduced Anxiety", "Mood Lift"],
    activities: ["Reading", "Relaxing"],
    negative_side_effects: [],
    notes: "Mellow evening.",
    icon: "heart",
  },
  {
    id: "demo-12",
    user_id: "demo",
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Durban Poison",
    dosage: "0.3g",
    method: "Smoke",
    observations: ["Energy Increase", "Reduced Anxiety"],
    activities: ["Work", "Writing"],
    negative_side_effects: [],
    notes: "Focus and energy.",
    icon: "zap",
  },
  
  // Week 4: Balanced period with variety
  {
    id: "demo-13",
    user_id: "demo",
    created_at: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Girl Scout Cookies",
    dosage: "0.6g",
    method: "Edible",
    observations: ["Mood Lift", "Relaxation", "Appetite Increase"],
    activities: ["Social", "Movies"],
    negative_side_effects: ["Dry Mouth"],
    notes: "Sweet effects, lasted hours.",
    icon: "cookie",
  },
  {
    id: "demo-14",
    user_id: "demo",
    created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Lemon Haze",
    dosage: "0.4g",
    method: "Vape",
    observations: ["Energy Increase", "Mood Lift", "Reduced Anxiety"],
    activities: ["Exercise", "Gaming"],
    negative_side_effects: [],
    notes: "Uplifting citrus effects.",
    icon: "zap",
  },
  {
    id: "demo-15",
    user_id: "demo",
    created_at: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "LA Confidential",
    dosage: "0.7g",
    method: "Vape",
    observations: ["Relaxation", "Appetite Increase", "Reduced Anxiety"],
    activities: ["Cooking", "Relaxing"],
    negative_side_effects: ["Fatigue"],
    notes: "Heavy relaxation.",
    icon: "brain",
  },
  {
    id: "demo-16",
    user_id: "demo",
    created_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "AK-47",
    dosage: "0.5g",
    method: "Smoke",
    observations: ["Mood Lift", "Energy Increase", "Reduced Anxiety"],
    activities: ["Social", "Music"],
    negative_side_effects: [],
    notes: "Balanced hybrid effects.",
    icon: "flame",
  },
  {
    id: "demo-17",
    user_id: "demo",
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Skywalker OG",
    dosage: "0.6g",
    method: "Vape",
    observations: ["Relaxation", "Mood Lift"],
    activities: ["Meditation", "Reading"],
    negative_side_effects: [],
    notes: "Peaceful evening.",
    icon: "rocket",
  },
  
  // Week 5: Diverse effects
  {
    id: "demo-18",
    user_id: "demo",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Trainwreck",
    dosage: "0.4g",
    method: "Smoke",
    observations: ["Energy Increase", "Mood Lift", "Appetite Increase"],
    activities: ["Work", "Cooking"],
    negative_side_effects: ["Dry Eyes"],
    notes: "Energetic and hungry.",
    icon: "zap",
  },
  {
    id: "demo-19",
    user_id: "demo",
    created_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Gelato",
    dosage: "0.5g",
    method: "Vape",
    observations: ["Mood Lift", "Relaxation", "Reduced Anxiety"],
    activities: ["Movies", "Social"],
    negative_side_effects: [],
    notes: "Sweet and smooth.",
    icon: "heart",
  },
  {
    id: "demo-20",
    user_id: "demo",
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Chemdawg",
    dosage: "0.6g",
    method: "Smoke",
    observations: ["Energy Increase", "Reduced Anxiety"],
    activities: ["Exercise", "Gaming"],
    negative_side_effects: [],
    notes: "Strong diesel aroma.",
    icon: "flame",
  },
  {
    id: "demo-21",
    user_id: "demo",
    created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Amnesia Haze",
    dosage: "0.4g",
    method: "Vape",
    observations: ["Mood Lift", "Energy Increase", "Appetite Increase"],
    activities: ["Writing", "Music"],
    negative_side_effects: [],
    notes: "Uplifting cerebral high.",
    icon: "brain",
  },
  {
    id: "demo-22",
    user_id: "demo",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Blue Cheese",
    dosage: "0.7g",
    method: "Edible",
    observations: ["Relaxation", "Appetite Increase", "Mood Lift"],
    activities: ["Cooking", "Relaxing"],
    negative_side_effects: ["Fatigue"],
    notes: "Unique flavor profile.",
    icon: "cookie",
  },
  
  // Recent days: Current usage patterns
  {
    id: "demo-23",
    user_id: "demo",
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Strawberry Cough",
    dosage: "0.3g",
    method: "Vape",
    observations: ["Energy Increase", "Mood Lift"],
    activities: ["Social", "Exercise"],
    negative_side_effects: [],
    notes: "Sweet berry taste.",
    icon: "heart",
  },
  {
    id: "demo-24",
    user_id: "demo",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Master Kush",
    dosage: "0.6g",
    method: "Vape",
    observations: ["Relaxation", "Reduced Anxiety"],
    activities: ["Meditation", "Reading"],
    negative_side_effects: [],
    notes: "Classic indica effects.",
    icon: "leaf",
  },
  {
    id: "demo-25",
    user_id: "demo",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Tangie",
    dosage: "0.4g",
    method: "Smoke",
    observations: ["Energy Increase", "Mood Lift", "Reduced Anxiety"],
    activities: ["Work", "Music"],
    negative_side_effects: [],
    notes: "Citrus explosion.",
    icon: "zap",
  },
  {
    id: "demo-26",
    user_id: "demo",
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Wedding Cake",
    dosage: "0.5g",
    method: "Vape",
    observations: ["Mood Lift", "Relaxation", "Appetite Increase"],
    activities: ["Movies", "Cooking"],
    negative_side_effects: ["Dry Mouth"],
    notes: "Delicious and relaxing.",
    icon: "sparkles",
  },
  {
    id: "demo-27",
    user_id: "demo",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Super Silver Haze",
    dosage: "0.4g",
    method: "Vape",
    observations: ["Energy Increase", "Mood Lift", "Reduced Anxiety"],
    activities: ["Gaming", "Social"],
    negative_side_effects: [],
    notes: "Long-lasting energy.",
    icon: "zap",
  },
  {
    id: "demo-28",
    user_id: "demo",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Purple Kush",
    dosage: "0.7g",
    method: "Edible",
    observations: ["Relaxation", "Appetite Increase", "Mood Lift"],
    activities: ["Relaxing", "Cooking"],
    negative_side_effects: ["Fatigue"],
    notes: "Heavy body high.",
    icon: "cookie",
  },
  {
    id: "demo-29",
    user_id: "demo",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Maui Wowie",
    dosage: "0.5g",
    method: "Smoke",
    observations: ["Energy Increase", "Mood Lift", "Appetite Increase"],
    activities: ["Exercise", "Music"],
    negative_side_effects: [],
    notes: "Tropical vibes.",
    icon: "flame",
  },
  {
    id: "demo-30",
    user_id: "demo",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Gorilla Glue",
    dosage: "0.6g",
    method: "Vape",
    observations: ["Relaxation", "Mood Lift", "Reduced Anxiety"],
    activities: ["Movies", "Relaxing"],
    negative_side_effects: [],
    notes: "Sticky and potent.",
    icon: "brain",
  },
  {
    id: "demo-31",
    user_id: "demo",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Pineapple Express",
    dosage: "0.4g",
    method: "Vape",
    observations: ["Energy Increase", "Mood Lift"],
    activities: ["Work", "Social"],
    negative_side_effects: [],
    notes: "Great daytime strain.",
    icon: "zap",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [strain, setStrain] = useState("");
  const [dosageAmount, setDosageAmount] = useState("");
  const [dosageUnit, setDosageUnit] = useState("g");
  const [method, setMethod] = useState("");
  const [selectedObservations, setSelectedObservations] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedNegativeSideEffects, setSelectedNegativeSideEffects] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("leaf");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  const [filterObservations, setFilterObservations] = useState<string[]>([]);
  const [filterActivities, setFilterActivities] = useState<string[]>([]);
  const [filterSideEffects, setFilterSideEffects] = useState<string[]>([]);
  const [filterMethods, setFilterMethods] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [minutesAgo, setMinutesAgo] = useState<number>(720); // Default to 2 hours (720 slider value = 120 minutes)
  const [editingTimeEntryId, setEditingTimeEntryId] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState<Date>(new Date());
  const [timeRangeFilter, setTimeRangeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');
  
  // Swipe detection state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showRemindersSheet, setShowRemindersSheet] = useState(false);

  // Non-linear slider: first half (0-720) = 0-2h, second half (720-1440) = 2-24h
  const sliderValueToMinutes = (sliderValue: number) => {
    if (sliderValue <= 720) {
      return sliderValue / 6; // 0-2 hours (0-120 minutes)
    }
    return 120 + (sliderValue - 720) * 1.8333; // 2-24 hours (120-1440 minutes)
  };

  const minutesToSliderValue = (minutes: number) => {
    if (minutes <= 120) {
      return minutes * 6; // 0-2 hours
    }
    return 720 + (minutes - 120) / 1.8333; // 2-24 hours
  };

  useEffect(() => {
    // Check for demo mode
    const demoMode = localStorage.getItem("demoMode") === "true";
    setIsDemoMode(demoMode);
    
    if (demoMode) {
      setEntries(SAMPLE_ENTRIES);
      setLoading(false);
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        setLoading(false);
        fetchEntries();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Real-time subscription for all entry changes
  useEffect(() => {
    const channel = supabase
      .channel('journal-entries-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'journal_entries'
        },
        (payload) => {
          console.log('Entry changed:', payload.eventType);
          fetchEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("is_deleted", false)
      .order("consumption_time", { ascending: false });

    if (error) {
      toast.error("Error loading entries: " + error.message);
    } else {
      setEntries(data || []);
      
      // Set form defaults from last entry (strain, dosage, method only)
      if (data && data.length > 0) {
        const lastEntry = data[0];
        setStrain(lastEntry.strain);
        setMethod(lastEntry.method);
        
        // Parse dosage (e.g., "0.5g" -> amount: "0.5", unit: "g")
        const dosageMatch = lastEntry.dosage.match(/^([\d.]+)(\w+)$/);
        if (dosageMatch) {
          setDosageAmount(dosageMatch[1]);
          setDosageUnit(dosageMatch[2]);
        }
      }
    }
  };

  const toggleObservation = (obs: string) => {
    setSelectedObservations((prev) =>
      prev.includes(obs) ? prev.filter((o) => o !== obs) : [...prev, obs]
    );
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity]
    );
  };

  const toggleNegativeSideEffect = (effect: string) => {
    setSelectedNegativeSideEffects((prev) =>
      prev.includes(effect) ? prev.filter((e) => e !== effect) : [...prev, effect]
    );
  };

  const applyPreset = (preset: typeof ENTRY_PRESETS[0]) => {
    setSelectedObservations(preset.observations);
    setSelectedActivities(preset.activities);
    toast.success(`Applied ${preset.name} preset`);
  };

  const isEntryInTimeRange = (entry: JournalEntry) => {
    const consumptionDate = parseISO(entry.consumption_time || entry.created_at);
    const now = new Date();
    
    switch (timeRangeFilter) {
      case 'today':
        return isWithinInterval(consumptionDate, {
          start: startOfDay(now),
          end: endOfDay(now)
        });
      case 'week':
        return isWithinInterval(consumptionDate, {
          start: startOfWeek(now),
          end: endOfWeek(now)
        });
      case 'month':
        return isWithinInterval(consumptionDate, {
          start: startOfMonth(now),
          end: endOfMonth(now)
        });
      case 'all':
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (isDemoMode) {
      toast.error("Demo mode is read-only. Sign up to save entries!");
      return;
    }

    if (!strain || !dosageAmount || !method) {
      toast.error("Please fill in strain, dosage, and method");
      return;
    }

    if (!user) return;

    setIsSubmitting(true);
    const dosage = `${dosageAmount}${dosageUnit}`;
    
    // Calculate consumption time based on minutes ago (convert slider value to actual minutes)
    const consumptionTime = new Date();
    consumptionTime.setMinutes(consumptionTime.getMinutes() - sliderValueToMinutes(minutesAgo));

    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      strain,
      dosage,
      method,
      observations: selectedObservations,
      activities: selectedActivities,
      negative_side_effects: selectedNegativeSideEffects,
      notes: notes || null,
      icon: selectedIcon,
      consumption_time: consumptionTime.toISOString(),
    });

    setIsSubmitting(false);

    if (error) {
      toast.error("Error saving entry: " + error.message);
    } else {
      setShowSuccessAnimation(true);
      toast.success("Entry saved successfully! 🎉");
      
      // Clear form fields
      setNotes("");
      setSelectedActivities([]);
      setSelectedObservations([]);
      setSelectedNegativeSideEffects([]);
      setMinutesAgo(0);
      
      // Refresh entries
      fetchEntries();

      // Hide success animation after 500ms
      setTimeout(() => setShowSuccessAnimation(false), 500);
    }
  };

  const handleDelete = (entryId: string) => {
    setDeleteEntryId(entryId);
    setShowDeleteDialog(true);
  };

  const handlePermanentDelete = async () => {
    if (isDemoMode) {
      toast.error("Demo mode is read-only. Sign up to make changes!");
      setShowDeleteDialog(false);
      setDeleteEntryId(null);
      return;
    }

    if (!deleteEntryId) return;
    
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", deleteEntryId);

    if (error) {
      toast.error("Error deleting entry: " + error.message);
    } else {
      toast.success("Entry permanently deleted");
      fetchEntries();
    }
    
    setShowDeleteDialog(false);
    setDeleteEntryId(null);
  };

  const handleSignOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem("demoMode");
      navigate("/auth");
      return;
    }
    await supabase.auth.signOut();
    navigate("/auth");
  };
  

  const openNotesDialog = (entryId?: string, existingNotes?: string) => {
    if (isDemoMode) {
      toast.error("Demo mode is read-only. Sign up to add or edit notes!");
      return;
    }
    
    if (entryId) {
      setEditingEntryId(entryId);
      setTempNotes(existingNotes || "");
    } else {
      setEditingEntryId(null);
      setTempNotes(notes);
    }
    setNotesDialogOpen(true);
  };

  const saveNotes = async () => {
    if (isDemoMode && editingEntryId) {
      toast.error("Demo mode is read-only. Sign up to make changes!");
      setNotesDialogOpen(false);
      return;
    }

    if (editingEntryId) {
      // Update existing entry
      const { error } = await supabase
        .from("journal_entries")
        .update({ notes: tempNotes })
        .eq("id", editingEntryId);

      if (error) {
        toast.error("Error updating notes: " + error.message);
      } else {
        toast.success("Notes updated successfully!");
        fetchEntries();
      }
    } else {
      // Update new entry notes
      setNotes(tempNotes);
    }
    setNotesDialogOpen(false);
    setEditingEntryId(null);
    setTempNotes("");
  };

  const openTimeEditDialog = (entryId: string, currentTime: string) => {
    setEditingTimeEntryId(entryId);
    setEditingTime(new Date(currentTime));
  };

  const saveTimeEdit = async () => {
    if (isDemoMode) {
      toast.error("Demo mode is read-only. Sign up to make changes!");
      setEditingTimeEntryId(null);
      return;
    }
    
    if (!editingTimeEntryId) return;

    const { error } = await supabase
      .from("journal_entries")
      .update({ consumption_time: editingTime.toISOString() })
      .eq("id", editingTimeEntryId);

    if (error) {
      toast.error("Error updating time: " + error.message);
    } else {
      toast.success("Consumption time updated!");
      fetchEntries();
      setEditingTimeEntryId(null);
    }
  };
  
  // Swipe detection - minimum distance for swipe (50px)
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && activeTab === 'list') {
      setActiveTab('calendar');
    }
    if (isRightSwipe && activeTab === 'calendar') {
      setActiveTab('list');
    }
  };

  const getIconComponent = (iconName: string) => {
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

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          {isDemoMode && (
            <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  🎭 Demo Mode - Exploring with sample data (read-only)
                </p>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem("demoMode");
                    navigate("/auth");
                  }}
                >
                  Sign Up to Save Your Data
                </Button>
              </div>
            </div>
          )}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1"></div>
            <div className="flex gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">{isDemoMode ? "Exit demo" : "Sign out"}</span>
              </Button>
            </div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <Leaf className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
              Medical Marijuana Journal
            </h1>
            <p className="text-muted-foreground text-lg">Track your wellness journey with ease</p>
          </div>
        </header>

        {/* Entry Form */}
        <Card id="new-entry-card" className="p-6 md:p-8 mb-8 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              New Entry
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  {(() => {
                    const IconComponent = getIconComponent(selectedIcon);
                    return <IconComponent className="h-4 w-4" />;
                  })()}
                  Select Icon
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="grid grid-cols-3 gap-3 p-4">
                  {AVAILABLE_ICONS.map((icon) => {
                    const IconComponent = getIconComponent(icon.value);
                    return (
                      <DropdownMenuItem
                        key={icon.value}
                        onClick={() => setSelectedIcon(icon.value)}
                        className={`p-6 justify-center cursor-pointer rounded-lg transition-all duration-200 hover:scale-110 hover:bg-primary/20 ${
                          selectedIcon === icon.value ? 'bg-primary/10 scale-105' : ''
                        }`}
                        title={icon.name}
                      >
                        <IconComponent className="h-10 w-10 transition-transform" />
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid gap-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="strain">Strain Name</Label>
                <Input
                  id="strain"
                  value={strain}
                  onChange={(e) => setStrain(e.target.value)}
                  placeholder="e.g., Blue Dream"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="dosage">Dosage</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    id="dosage"
                    type="number"
                    step="0.1"
                    value={dosageAmount}
                    onChange={(e) => setDosageAmount(e.target.value)}
                    placeholder="e.g., 0.5"
                    className="flex-1"
                  />
                  <Select value={dosageUnit} onValueChange={setDosageUnit}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="mg">mg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="method">Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select method">
                      {method && (
                        <div className="flex items-center gap-2">
                          {method === "Vape" && <Wind className="h-4 w-4" />}
                          {method === "Smoke" && <Cigarette className="h-4 w-4" />}
                          {method === "Oil" && <Droplet className="h-4 w-4" />}
                          {method === "Tincture" && <Beaker className="h-4 w-4" />}
                          {method === "Topical" && <Pipette className="h-4 w-4" />}
                          {method === "Edible" && <Cookie className="h-4 w-4" />}
                          <span>{method}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vape">
                      <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4" />
                        <span>Vape</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Smoke">
                      <div className="flex items-center gap-2">
                        <Cigarette className="h-4 w-4" />
                        <span>Smoke</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Oil">
                      <div className="flex items-center gap-2">
                        <Droplet className="h-4 w-4" />
                        <span>Oil</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Tincture">
                      <div className="flex items-center gap-2">
                        <Beaker className="h-4 w-4" />
                        <span>Tincture</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Topical">
                      <div className="flex items-center gap-2">
                        <Pipette className="h-4 w-4" />
                        <span>Topical</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Edible">
                      <div className="flex items-center gap-2">
                        <Cookie className="h-4 w-4" />
                        <span>Edible</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Time Since Consumption */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Time Since Consumption</Label>
                <span className="text-sm text-muted-foreground">
                  {sliderValueToMinutes(minutesAgo) === 0 ? 'Now' : 
                   sliderValueToMinutes(minutesAgo) < 60 ? `${Math.round(sliderValueToMinutes(minutesAgo))} min ago` :
                   sliderValueToMinutes(minutesAgo) < 1440 ? `${Math.floor(sliderValueToMinutes(minutesAgo) / 60)}h ${Math.round(sliderValueToMinutes(minutesAgo) % 60)}m ago` :
                   `${Math.floor(sliderValueToMinutes(minutesAgo) / 1440)} days ago`}
                </span>
              </div>
              <div className="relative">
                <Slider
                  value={[minutesAgo]}
                  onValueChange={(value) => setMinutesAgo(value[0])}
                  max={1440}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="relative text-xs text-muted-foreground h-4 mt-1">
                <span className="absolute left-0">Now</span>
                <span className="absolute left-[25%] -translate-x-1/2">1h</span>
                <span className="absolute left-[50%] -translate-x-1/2 font-medium">2h</span>
                <span className="absolute left-[59.09%] -translate-x-1/2 hidden sm:inline">6h</span>
                <span className="absolute left-[72.73%] -translate-x-1/2">12h</span>
                <span className="absolute right-0">24h</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-primary" />
                <Label className="text-base font-semibold">Quick Presets</Label>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Apply common combinations for your session type
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {ENTRY_PRESETS.map((preset) => {
                  const PresetIcon = preset.icon;
                  return (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      className="flex flex-col gap-1 h-auto py-3 hover:bg-primary/10 hover:border-primary transition-all"
                      onClick={() => applyPreset(preset)}
                    >
                      <PresetIcon className="w-5 h-5" />
                      <span className="text-xs font-medium text-center leading-tight">
                        {preset.name}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Experience Categories - Framed Sections */}
            <div className="space-y-4">
              {/* Observations */}
              <div className="border border-observation/30 rounded-lg p-4 bg-observation/5 hover:bg-observation/10 transition-colors duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-observation/20">
                      <Smile className="w-4 h-4 text-observation" />
                    </div>
                    <Label className="text-base font-semibold text-foreground">Positive Observations</Label>
                  </div>
                  {selectedObservations.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedObservations.length} selected
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">What positive effects are you experiencing?</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_OBSERVATIONS.map((obs) => (
                    <Badge
                      key={obs}
                      variant="outline"
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-observation ${
                        selectedObservations.includes(obs) 
                          ? "bg-observation text-observation-foreground border-observation scale-105" 
                          : "bg-background hover:bg-observation/10"
                      }`}
                      onClick={() => toggleObservation(obs)}
                    >
                      {obs}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div className="border border-activity/30 rounded-lg p-4 bg-activity/5 hover:bg-activity/10 transition-colors duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-activity/20">
                      <Activity className="w-4 h-4 text-activity" />
                    </div>
                    <Label className="text-base font-semibold text-foreground">Activities</Label>
                  </div>
                  {selectedActivities.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedActivities.length} selected
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">What are you doing during or after use?</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_ACTIVITIES.map((activity) => (
                    <Badge
                      key={activity}
                      variant="outline"
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-activity ${
                        selectedActivities.includes(activity) 
                          ? "bg-activity text-activity-foreground border-activity scale-105" 
                          : "bg-background hover:bg-activity/10"
                      }`}
                      onClick={() => toggleActivity(activity)}
                    >
                      {activity}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Negative Side Effects */}
              <div className="border border-side-effect/30 rounded-lg p-4 bg-side-effect/5 hover:bg-side-effect/10 transition-colors duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-side-effect/20">
                      <AlertCircle className="w-4 h-4 text-side-effect" />
                    </div>
                    <Label className="text-base font-semibold text-foreground">Negative Side Effects</Label>
                  </div>
                  {selectedNegativeSideEffects.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedNegativeSideEffects.length} selected
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">Any unwanted effects you're noticing?</p>
                <div className="flex flex-wrap gap-2">
                  {NEGATIVE_SIDE_EFFECTS.map((effect) => (
                    <Badge
                      key={effect}
                      variant="outline"
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-side-effect ${
                        selectedNegativeSideEffects.includes(effect) 
                          ? "bg-side-effect text-side-effect-foreground border-side-effect scale-105" 
                          : "bg-background hover:bg-side-effect/10"
                      }`}
                      onClick={() => toggleNegativeSideEffect(effect)}
                    >
                      {effect}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Personal Notes */}
            <div>
              <Sheet open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => openNotesDialog()}
                    disabled={isDemoMode}
                  >
                    <FileText className="h-4 w-4" />
                    {notes ? "Edit Notes" : "Add Notes"}
                    {notes && <Badge variant="secondary" className="ml-auto">{notes.length} chars</Badge>}
                  </Button>
                </SheetTrigger>
                <SheetContent onCloseAutoFocus={(e) => e.preventDefault()}>
                  <SheetHeader>
                    <SheetTitle>Personal Notes</SheetTitle>
                    <SheetDescription>
                      Add any additional observations, feelings, or context about this entry.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <Textarea
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="How are you feeling? Any additional observations or context..."
                      className="min-h-[300px] resize-none"
                    />
                    <Button
                      onClick={saveNotes}
                      className="w-full mt-4"
                    >
                      Save Notes
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Button
              onClick={handleSubmit}
              className={`w-full md:w-auto md:ml-auto transition-all duration-300 ${
                showSuccessAnimation ? 'animate-in zoom-in-95 bg-green-500 hover:bg-green-600' : ''
              }`}
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Entry'
              )}
            </Button>
          </div>
        </Card>

        {/* Reminders - Removed from main flow, now accessible via floating button */}

        {/* Insights Chart */}
        {entries.length > 0 && (
          <div id="insights-section" className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <InsightsChart 
              entries={entries.filter(entry => {
                // Filter by time range
                if (!isEntryInTimeRange(entry)) return false;
                
                // Filter by observations
                if (filterObservations.length > 0) {
                  if (!filterObservations.some(obs => entry.observations.includes(obs))) {
                    return false;
                  }
                }
                
                // Filter by activities
                if (filterActivities.length > 0) {
                  if (!filterActivities.some(act => entry.activities.includes(act))) {
                    return false;
                  }
                }
                
                // Filter by side effects
                if (filterSideEffects.length > 0) {
                  if (!filterSideEffects.some(eff => entry.negative_side_effects.includes(eff))) {
                    return false;
                  }
                }
                
                return true;
              })}
              filterObservations={filterObservations}
              setFilterObservations={setFilterObservations}
              filterActivities={filterActivities}
              setFilterActivities={setFilterActivities}
              filterSideEffects={filterSideEffects}
              setFilterSideEffects={setFilterSideEffects}
            />
          </div>
        )}

        {/* Entries List and Calendar View */}
        {entries.length > 0 && (
          <div 
            className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'calendar')} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto mb-6 grid-cols-2">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Calendar View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                {/* Active Filters */}
                {(filterObservations.length > 0 || filterActivities.length > 0 || filterSideEffects.length > 0 || filterMethods.length > 0) && (
                  <Card className="p-4 mb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Label className="text-sm font-semibold mb-2 block">Active Filters:</Label>
                        <div className="flex flex-wrap gap-2">
                          {filterObservations.map(obs => (
                            <Badge 
                              key={obs} 
                              className="bg-observation text-observation-foreground cursor-pointer hover:opacity-80"
                              onClick={() => setFilterObservations(prev => prev.filter(o => o !== obs))}
                            >
                              {obs} ×
                            </Badge>
                          ))}
                          {filterActivities.map(act => (
                            <Badge 
                              key={act} 
                              className="bg-activity text-activity-foreground cursor-pointer hover:opacity-80"
                              onClick={() => setFilterActivities(prev => prev.filter(a => a !== act))}
                            >
                              {act} ×
                            </Badge>
                          ))}
                          {filterSideEffects.map(eff => (
                            <Badge 
                              key={eff} 
                              className="bg-side-effect text-side-effect-foreground cursor-pointer hover:opacity-80"
                              onClick={() => setFilterSideEffects(prev => prev.filter(e => e !== eff))}
                            >
                              {eff} ×
                            </Badge>
                          ))}
                          {filterMethods.map(method => (
                            <Badge 
                              key={method} 
                              variant="default"
                              className="flex items-center gap-1 cursor-pointer hover:opacity-80"
                              onClick={() => setFilterMethods(prev => prev.filter(m => m !== method))}
                            >
                              {(() => {
                                const MethodIcon = getMethodIcon(method);
                                return <MethodIcon className="h-3 w-3" />;
                              })()}
                              {method} ×
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setFilterObservations([]);
                          setFilterActivities([]);
                          setFilterSideEffects([]);
                          setFilterMethods([]);
                        }}
                      >
                        Clear All
                      </Button>
                    </div>
                  </Card>
                )}
                
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Recent Entries</h2>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="sort" className="text-sm text-muted-foreground">Sort by:</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger id="sort" className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-desc">Newest First</SelectItem>
                        <SelectItem value="date-asc">Oldest First</SelectItem>
                        <SelectItem value="strain-asc">Strain (A-Z)</SelectItem>
                        <SelectItem value="strain-desc">Strain (Z-A)</SelectItem>
                        <SelectItem value="dosage-asc">Dosage (Low-High)</SelectItem>
                        <SelectItem value="dosage-desc">Dosage (High-Low)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Time Range Filter */}
                <Card className="p-4 mb-6">
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-semibold">Filter by Time:</Label>
                    <div className="grid grid-cols-2 sm:flex gap-2">
                      <Button
                        variant={timeRangeFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRangeFilter('all')}
                        className="sm:flex-1"
                      >
                        All Time
                      </Button>
                      <Button
                        variant={timeRangeFilter === 'today' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRangeFilter('today')}
                        className="sm:flex-1"
                      >
                        Today
                      </Button>
                      <Button
                        variant={timeRangeFilter === 'week' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRangeFilter('week')}
                        className="sm:flex-1"
                      >
                        This Week
                      </Button>
                      <Button
                        variant={timeRangeFilter === 'month' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRangeFilter('month')}
                        className="sm:flex-1"
                      >
                        This Month
                      </Button>
                    </div>
                  </div>
                </Card>
                
                <div className="space-y-4">
                  {[...entries]
                    .filter(entry => {
                      // Filter by time range first
                      if (!isEntryInTimeRange(entry)) {
                        return false;
                      }
                      // Filter by observations
                      if (filterObservations.length > 0) {
                        if (!filterObservations.some(obs => entry.observations.includes(obs))) {
                          return false;
                        }
                      }
                      // Filter by activities
                      if (filterActivities.length > 0) {
                        if (!filterActivities.some(act => entry.activities.includes(act))) {
                          return false;
                        }
                      }
                      // Filter by side effects
                      if (filterSideEffects.length > 0) {
                        if (!filterSideEffects.some(eff => entry.negative_side_effects.includes(eff))) {
                          return false;
                        }
                      }
                      // Filter by method
                      if (filterMethods.length > 0) {
                        if (!filterMethods.includes(entry.method)) {
                          return false;
                        }
                      }
                      return true;
                    })
                    .sort((a, b) => {
                    switch (sortBy) {
                      case "date-asc":
                        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                      case "date-desc":
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                      case "strain-asc":
                        return a.strain.localeCompare(b.strain);
                      case "strain-desc":
                        return b.strain.localeCompare(a.strain);
                      case "dosage-asc":
                        return parseFloat(a.dosage) - parseFloat(b.dosage);
                      case "dosage-desc":
                        return parseFloat(b.dosage) - parseFloat(a.dosage);
                      default:
                        return 0;
                    }
                  }).map((entry, index) => {
                    const IconComponent = getIconComponent(entry.icon || 'leaf');
                    
                    return (
                    <Card 
                      key={entry.id} 
                      className="overflow-hidden hover:shadow-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{entry.strain}</h3>
                              <button
                                onClick={() => openTimeEditDialog(entry.id, entry.consumption_time || entry.created_at)}
                                className="flex items-center gap-2 text-sm text-muted-foreground mt-1 hover:text-primary transition-colors cursor-pointer"
                              >
                                <Clock className="h-3 w-3" />
                                <span className="hover:underline">{new Date(entry.consumption_time || entry.created_at).toLocaleString()}</span>
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openNotesDialog(entry.id, entry.notes || "")}
                              className="text-muted-foreground hover:text-primary rounded-full"
                            >
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">Add/Edit notes</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(entry.id)}
                              className="text-muted-foreground hover:text-destructive rounded-full"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete entry</span>
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Dosage</Label>
                            <p className="font-medium">{entry.dosage}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Method</Label>
                            <p 
                              className="font-medium flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                              onClick={() => {
                                setFilterMethods(prev => 
                                  prev.includes(entry.method) 
                                    ? prev.filter(m => m !== entry.method)
                                    : [...prev, entry.method]
                                );
                              }}
                            >
                              {(() => {
                                const MethodIcon = getMethodIcon(entry.method);
                                return <MethodIcon className="h-4 w-4" />;
                              })()}
                              {entry.method}
                            </p>
                          </div>
                        </div>

                        {entry.observations.length > 0 && (
                          <div className="mb-4">
                            <Label className="text-xs text-muted-foreground mb-2 block">Observations</Label>
                            <div className="flex flex-wrap gap-2">
                              {entry.observations.map((obs) => (
                                <Badge 
                                  key={obs} 
                                  className={`px-2 py-1 cursor-pointer transition-all hover:scale-105 ${
                                    filterObservations.includes(obs)
                                      ? "bg-observation text-observation-foreground"
                                      : "bg-observation-light text-observation-foreground"
                                  }`}
                                  onClick={() => {
                                    setFilterObservations(prev => 
                                      prev.includes(obs) 
                                        ? prev.filter(o => o !== obs)
                                        : [...prev, obs]
                                    );
                                  }}
                                >
                                  {obs}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {entry.activities.length > 0 && (
                          <div className="mb-4">
                            <Label className="text-xs text-muted-foreground mb-2 block">Activities</Label>
                            <div className="flex flex-wrap gap-2">
                              {entry.activities.map((activity) => (
                                <Badge 
                                  key={activity} 
                                  className={`px-2 py-1 cursor-pointer transition-all hover:scale-105 ${
                                    filterActivities.includes(activity)
                                      ? "bg-activity text-activity-foreground"
                                      : "bg-activity-light text-activity-foreground"
                                  }`}
                                  onClick={() => {
                                    setFilterActivities(prev => 
                                      prev.includes(activity) 
                                        ? prev.filter(a => a !== activity)
                                        : [...prev, activity]
                                    );
                                  }}
                                >
                                  {activity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {entry.negative_side_effects.length > 0 && (
                          <div className="mb-4">
                            <Label className="text-xs text-muted-foreground mb-2 block">Negative Side Effects</Label>
                            <div className="flex flex-wrap gap-2">
                              {entry.negative_side_effects.map((effect) => (
                                <Badge 
                                  key={effect} 
                                  className={`px-2 py-1 cursor-pointer transition-all hover:scale-105 ${
                                    filterSideEffects.includes(effect)
                                      ? "bg-side-effect text-side-effect-foreground"
                                      : "bg-side-effect-light text-side-effect-foreground"
                                  }`}
                                  onClick={() => {
                                    setFilterSideEffects(prev => 
                                      prev.includes(effect) 
                                        ? prev.filter(e => e !== effect)
                                        : [...prev, effect]
                                    );
                                  }}
                                >
                                  {effect}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {entry.notes && (
                          <div>
                            <Label className="text-xs text-muted-foreground mb-2 block">Notes</Label>
                            <p className="text-sm text-muted-foreground leading-relaxed">{entry.notes}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="calendar">
                <CalendarView 
                  filterObservations={filterObservations}
                  setFilterObservations={setFilterObservations}
                  filterActivities={filterActivities}
                  setFilterActivities={setFilterActivities}
                  filterSideEffects={filterSideEffects}
                  setFilterSideEffects={setFilterSideEffects}
                  filterMethods={filterMethods}
                  setFilterMethods={setFilterMethods}
                  isDemoMode={isDemoMode}
                  demoEntries={SAMPLE_ENTRIES}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-12 text-muted-foreground animate-in fade-in duration-700">
            <Leaf className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No entries yet. Start your wellness journey above!</p>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Entry</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete this entry? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handlePermanentDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Consumption Time Dialog */}
        <Dialog open={!!editingTimeEntryId} onOpenChange={(open) => !open && setEditingTimeEntryId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Consumption Time</DialogTitle>
              <DialogDescription>
                Adjust when this entry was consumed
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingTime.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newDate = new Date(editingTime);
                    const [year, month, day] = e.target.value.split('-').map(Number);
                    newDate.setFullYear(year, month - 1, day);
                    setEditingTime(newDate);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Time</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={editingTime.toTimeString().slice(0, 5)}
                  onChange={(e) => {
                    const newDate = new Date(editingTime);
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    newDate.setHours(hours, minutes);
                    setEditingTime(newDate);
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingTimeEntryId(null)}>
                Cancel
              </Button>
              <Button onClick={saveTimeEdit}>
                Save Time
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reminders Floating Action Button Sheet */}
        <Sheet open={showRemindersSheet} onOpenChange={setShowRemindersSheet}>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Reminders</SheetTitle>
              <SheetDescription>
                Manage your wellness reminders
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <Reminders />
            </div>
          </SheetContent>
        </Sheet>

        {/* Floating Action Button */}
        <button
          onClick={() => setShowRemindersSheet(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-110 transition-all duration-200 flex items-center justify-center"
          aria-label="Open reminders"
        >
          <Bell className="h-6 w-6" />
        </button>
      </main>
    </div>
  );
};

export default Index;
