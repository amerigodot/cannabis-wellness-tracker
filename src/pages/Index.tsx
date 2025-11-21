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
import { OnboardingTour } from "@/components/OnboardingTour";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Leaf, Calendar, Clock, LogOut, Trash2, List, FileText, Pill, Droplet, Cigarette, Cookie, Coffee, Sparkles, Heart, Brain, Zap, Rocket, Flame, Loader2, Wind, Beaker, Pipette } from "lucide-react";
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
  {
    id: "demo-1",
    user_id: "demo",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Blue Dream",
    dosage: "0.5g",
    method: "Vape",
    observations: ["Pain Relief", "Relaxation", "Better Sleep"],
    activities: ["Reading", "Music"],
    negative_side_effects: ["Dry Mouth"],
    notes: "Great for evening relaxation. Helped with back pain.",
    icon: "leaf",
  },
  {
    id: "demo-2",
    user_id: "demo",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Sour Diesel",
    dosage: "0.3g",
    method: "Smoke",
    observations: ["Energy Increase", "Improved Focus", "Creativity Boost"],
    activities: ["Work", "Writing"],
    negative_side_effects: [],
    notes: "Perfect for morning productivity boost.",
    icon: "zap",
  },
  {
    id: "demo-3",
    user_id: "demo",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "OG Kush",
    dosage: "1.0g",
    method: "Edible",
    observations: ["Mood Lift", "Appetite Increase", "Relaxation"],
    activities: ["Social", "Cooking"],
    negative_side_effects: ["Dry Eyes"],
    notes: "Strong effects, lasted several hours.",
    icon: "cookie",
  },
  {
    id: "demo-4",
    user_id: "demo",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    consumption_time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    strain: "Northern Lights",
    dosage: "0.7g",
    method: "Vape",
    observations: ["Better Sleep", "Muscle Relaxation", "Reduced Anxiety"],
    activities: ["Meditation", "Relaxing"],
    negative_side_effects: ["Fatigue"],
    notes: "Excellent for nighttime use. Very calming.",
    icon: "sparkles",
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
  const [minutesAgo, setMinutesAgo] = useState<number>(0);
  const [editingTimeEntryId, setEditingTimeEntryId] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState<Date>(new Date());
  const [timeRangeFilter, setTimeRangeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showOnboarding, setShowOnboarding] = useState(false);

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
        } else if (event === 'SIGNED_IN') {
          // Check if this is the user's first time
          const hasSeenOnboarding = localStorage.getItem(`onboarding_completed_${session.user.id}`);
          console.log('[Onboarding] SIGNED_IN event - hasSeenOnboarding:', hasSeenOnboarding, 'userId:', session.user.id);
          if (!hasSeenOnboarding) {
            console.log('[Onboarding] Showing onboarding tour');
            setShowOnboarding(true);
          }
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
        
        // Check if this is the user's first time (for initial load)
        const hasSeenOnboarding = localStorage.getItem(`onboarding_completed_${session.user.id}`);
        console.log('[Onboarding] Initial load - hasSeenOnboarding:', hasSeenOnboarding, 'userId:', session.user.id);
        if (!hasSeenOnboarding) {
          console.log('[Onboarding] Showing onboarding tour');
          setShowOnboarding(true);
        }
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
  
  const handleOnboardingComplete = () => {
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, "true");
    }
    setShowOnboarding(false);
  };

  const openNotesDialog = (entryId?: string, existingNotes?: string) => {
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <OnboardingTour isOpen={showOnboarding} onComplete={handleOnboardingComplete} />
      
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
                {/* Tick marks - positions match non-linear distribution (2h at 50%) */}
                <div className="absolute top-[9px] left-0 right-0 pointer-events-none">
                  {/* 15min at 6.25% */}
                  <div className="absolute w-px h-2 bg-muted-foreground/40" style={{ left: '6.25%' }} />
                  {/* 30min at 12.5% */}
                  <div className="absolute w-px h-2 bg-muted-foreground/40" style={{ left: '12.5%' }} />
                  {/* 1h at 25% */}
                  <div className="absolute w-px h-3 bg-muted-foreground/60" style={{ left: '25%' }} />
                  {/* 2h at 50% */}
                  <div className="absolute w-px h-3 bg-muted-foreground/60" style={{ left: '50%' }} />
                  {/* 6h at 59.09% */}
                  <div className="absolute w-px h-3 bg-muted-foreground/60" style={{ left: '59.09%' }} />
                  {/* 12h at 72.73% */}
                  <div className="absolute w-px h-3 bg-muted-foreground/60" style={{ left: '72.73%' }} />
                  {/* 18h at 86.36% */}
                  <div className="absolute w-px h-2 bg-muted-foreground/40" style={{ left: '86.36%' }} />
                </div>
              </div>
              <div className="relative text-xs text-muted-foreground h-4 mt-1">
                <span className="absolute left-0">Now</span>
                <span className="absolute left-[25%] -translate-x-1/2">1h</span>
                <span className="absolute left-[50%] -translate-x-1/2">2h</span>
                <span className="absolute left-[72.73%] -translate-x-1/2">12h</span>
                <span className="absolute right-0">24h</span>
              </div>
            </div>

            {/* Activities */}
            <div>
              <Label className="mb-3 block">Activities</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_ACTIVITIES.map((activity) => (
                  <Badge
                    key={activity}
                    variant="outline"
                    className={`cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-md hover:border-activity ${
                      selectedActivities.includes(activity) 
                        ? "bg-activity text-activity-foreground border-activity scale-105 animate-in zoom-in-95 duration-200" 
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                    onClick={() => toggleActivity(activity)}
                  >
                    {activity}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Observations */}
            <div>
              <Label className="mb-3 block">Observations</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_OBSERVATIONS.map((obs) => (
                  <Badge
                    key={obs}
                    variant="outline"
                    className={`cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-md hover:border-observation ${
                      selectedObservations.includes(obs) 
                        ? "bg-observation text-observation-foreground border-observation scale-105 animate-in zoom-in-95 duration-200" 
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                    onClick={() => toggleObservation(obs)}
                  >
                    {obs}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Negative Side Effects */}
            <div>
              <Label className="mb-3 block">Negative Side Effects</Label>
              <div className="flex flex-wrap gap-2">
                {NEGATIVE_SIDE_EFFECTS.map((effect) => (
                  <Badge
                    key={effect}
                    variant="outline"
                    className={`cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-md hover:border-side-effect ${
                      selectedNegativeSideEffects.includes(effect) 
                        ? "bg-side-effect text-side-effect-foreground border-side-effect scale-105 animate-in zoom-in-95 duration-200" 
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                    onClick={() => toggleNegativeSideEffect(effect)}
                  >
                    {effect}
                  </Badge>
                ))}
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

        {/* Reminders */}
        <div id="reminders-section" className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Reminders />
        </div>

        {/* Insights Chart */}
        {entries.length > 0 && (
          <div id="insights-section" className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <InsightsChart 
              entries={entries}
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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <Tabs defaultValue="list" className="w-full">
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
                    <div className="flex gap-2">
                      <Button
                        variant={timeRangeFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRangeFilter('all')}
                        className="flex-1"
                      >
                        All Time
                      </Button>
                      <Button
                        variant={timeRangeFilter === 'today' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRangeFilter('today')}
                        className="flex-1"
                      >
                        Today
                      </Button>
                      <Button
                        variant={timeRangeFilter === 'week' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRangeFilter('week')}
                        className="flex-1"
                      >
                        This Week
                      </Button>
                      <Button
                        variant={timeRangeFilter === 'month' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRangeFilter('month')}
                        className="flex-1"
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
      </main>
    </div>
  );
};

export default Index;
