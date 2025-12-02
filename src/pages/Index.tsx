import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { LandingPage } from "@/components/LandingPage";
import { AchievementBadges } from "@/components/AchievementBadges";
import { EntryList } from "@/components/dashboard/EntryList";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Leaf, Calendar, Clock, LogOut, Trash2, List, FileText, Droplet, Cigarette, Cookie, Sparkles, Heart, Brain, Zap, Loader2, Wind, Beaker, Pipette, Bell, Activity, AlertCircle, Smile, ChevronDown, Settings, Target } from "lucide-react";
import { toast } from "sonner";
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { triggerMilestoneCelebration, MILESTONES, MILESTONE_DETAILS } from "@/utils/milestones";

import { JournalEntry } from "@/types/journal";
import { sliderValueToMinutes, formatTimeAgo } from "@/utils/wellness";
import { 
  COMMON_OBSERVATIONS, 
  COMMON_ACTIVITIES, 
  NEGATIVE_SIDE_EFFECTS, 
  AVAILABLE_ICONS, 
  ENTRY_PRESETS,
  getIconComponent 
} from "@/constants/journal";
import { SAMPLE_ENTRIES } from "@/data/sampleEntries";

const Index = () => {
  const navigate = useNavigate();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [strain, setStrain] = useState("");
  const [strain2, setStrain2] = useState("");
  const [thcPercentage, setThcPercentage] = useState("");
  const [cbdPercentage, setCbdPercentage] = useState("");
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
  const [minutesAgo, setMinutesAgo] = useState<number>(720);
  const [editingTimeEntryId, setEditingTimeEntryId] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState<Date>(new Date());
  const [timeRangeFilter, setTimeRangeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');
  
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showRemindersSheet, setShowRemindersSheet] = useState(false);
  
  const [observationsOpen, setObservationsOpen] = useState(() => {
    const saved = localStorage.getItem('observationsOpen');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [activitiesOpen, setActivitiesOpen] = useState(() => {
    const saved = localStorage.getItem('activitiesOpen');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [sideEffectsOpen, setSideEffectsOpen] = useState(() => {
    const saved = localStorage.getItem('sideEffectsOpen');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [highlightObservations, setHighlightObservations] = useState(false);
  const [highlightActivities, setHighlightActivities] = useState(false);
  
  const [entryFormTab, setEntryFormTab] = useState<'before' | 'consumption' | 'after'>('before');
  const [beforeMood, setBeforeMood] = useState<number>(5);
  const [beforePain, setBeforePain] = useState<number>(5);
  const [beforeAnxiety, setBeforeAnxiety] = useState<number>(5);
  const [beforeEnergy, setBeforeEnergy] = useState<number>(5);
  const [beforeFocus, setBeforeFocus] = useState<number>(5);
  const [beforeNotes, setBeforeNotes] = useState("");
  const [afterMood, setAfterMood] = useState<number>(5);
  const [afterPain, setAfterPain] = useState<number>(5);
  const [afterAnxiety, setAfterAnxiety] = useState<number>(5);
  const [afterEnergy, setAfterEnergy] = useState<number>(5);
  const [afterFocus, setAfterFocus] = useState<number>(5);
  const [entryStatus, setEntryStatus] = useState<'pending_after' | 'complete'>('complete');
  const [effectsDurationMinutes, setEffectsDurationMinutes] = useState<number | null>(null);
  const [isQuickEntry, setIsQuickEntry] = useState(false);

  useEffect(() => {
    const demoMode = localStorage.getItem("demoMode") === "true";
    setIsDemoMode(demoMode);
    
    if (demoMode) {
      setEntries(SAMPLE_ENTRIES);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      setUser(session?.user ?? null);
    }
  );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session) {
        fetchEntries();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const channel = supabase
      .channel('journal-entries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
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

  useEffect(() => {
    localStorage.setItem('observationsOpen', JSON.stringify(observationsOpen));
  }, [observationsOpen]);

  useEffect(() => {
    localStorage.setItem('activitiesOpen', JSON.stringify(activitiesOpen));
  }, [activitiesOpen]);

  useEffect(() => {
    localStorage.setItem('sideEffectsOpen', JSON.stringify(sideEffectsOpen));
  }, [sideEffectsOpen]);

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
      
      if (data && data.length > 0) {
        const lastEntry = data[0];
        setStrain(lastEntry.strain);
        setStrain2(lastEntry.strain_2 || "");
        setThcPercentage(lastEntry.thc_percentage?.toString() || "");
        setCbdPercentage(lastEntry.cbd_percentage?.toString() || "");
        setMethod(lastEntry.method);
        
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
    
    setFilterObservations([]);
    setFilterActivities([]);
    setFilterSideEffects([]);
    setFilterMethods([]);
    
    setObservationsOpen(true);
    setActivitiesOpen(true);
    setHighlightObservations(true);
    setHighlightActivities(true);
    
    setTimeout(() => {
      setHighlightObservations(false);
      setHighlightActivities(false);
    }, 800);
    
    toast.success(`Applied ${preset.name} preset`);
  };

  const clearAllSelections = () => {
    setSelectedObservations([]);
    setSelectedActivities([]);
    setSelectedNegativeSideEffects([]);
    toast.success("All selections cleared");
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

    const previousEntryCount = entries.length;

    setIsSubmitting(true);
    const dosage = `${dosageAmount}${dosageUnit}`;
    
    const consumptionTime = new Date();
    consumptionTime.setMinutes(consumptionTime.getMinutes() - sliderValueToMinutes(minutesAgo));

    let status: 'pending_after' | 'complete' = 'complete';
    
    if (!isQuickEntry && entryFormTab !== 'after') {
      status = 'pending_after';
    }

    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      strain,
      strain_2: strain2 || null,
      thc_percentage: thcPercentage ? parseFloat(thcPercentage) : null,
      cbd_percentage: cbdPercentage ? parseFloat(cbdPercentage) : null,
      dosage,
      method,
      observations: selectedObservations,
      activities: selectedActivities,
      negative_side_effects: selectedNegativeSideEffects,
      notes: notes || null,
      icon: selectedIcon,
      consumption_time: consumptionTime.toISOString(),
      entry_status: status,
      before_mood: !isQuickEntry ? beforeMood : null,
      before_pain: !isQuickEntry ? beforePain : null,
      before_anxiety: !isQuickEntry ? beforeAnxiety : null,
      before_energy: !isQuickEntry ? beforeEnergy : null,
      before_focus: !isQuickEntry ? beforeFocus : null,
      before_notes: !isQuickEntry ? beforeNotes : null,
      after_mood: !isQuickEntry && entryFormTab === 'after' ? afterMood : null,
      after_pain: !isQuickEntry && entryFormTab === 'after' ? afterPain : null,
      after_anxiety: !isQuickEntry && entryFormTab === 'after' ? afterAnxiety : null,
      after_energy: !isQuickEntry && entryFormTab === 'after' ? afterEnergy : null,
      after_focus: !isQuickEntry && entryFormTab === 'after' ? afterFocus : null,
      effects_duration_minutes: !isQuickEntry && entryFormTab === 'after' ? effectsDurationMinutes : null,
    });

    setIsSubmitting(false);

    if (error) {
      toast.error("Error saving entry: " + error.message);
    } else {
      setShowSuccessAnimation(true);
      
      if (status === 'pending_after') {
        toast.success("Entry saved! Complete the 'After' state when ready.", {
          description: "You'll be reminded to complete it soon.",
          duration: 5000,
        });
      } else {
        const newEntryCount = previousEntryCount + 1;
        const milestoneReached = MILESTONES.find(
          (milestone) => milestone === newEntryCount
        );

        if (milestoneReached) {
          const details = MILESTONE_DETAILS[milestoneReached as keyof typeof MILESTONE_DETAILS];
          
          triggerMilestoneCelebration(milestoneReached);
          
          toast.success(details.message, {
            description: `${details.icon} You've logged ${milestoneReached} entries! Keep going!`,
            duration: 6000,
          });
        } else {
          toast.success("Entry saved successfully! 🎉");
        }
      }
      
      setNotes("");
      setSelectedActivities([]);
      setSelectedObservations([]);
      setSelectedNegativeSideEffects([]);
      setMinutesAgo(0);
      setBeforeMood(5);
      setBeforePain(5);
      setBeforeAnxiety(5);
      setBeforeEnergy(5);
      setBeforeFocus(5);
      setBeforeNotes("");
      setAfterMood(5);
      setAfterPain(5);
      setAfterAnxiety(5);
      setAfterEnergy(5);
      setAfterFocus(5);
      setEffectsDurationMinutes(null);
      setEntryFormTab('before');
      
      fetchEntries();

      setTimeout(() => setShowSuccessAnimation(false), 500);
    }
  };

  const handleCompletePendingEntry = async (entryId: string) => {
    if (isDemoMode) {
      toast.error("Demo mode is read-only. Sign up to complete entries!");
      return;
    }

    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    setIsQuickEntry(false);
    setStrain(entry.strain);
    setStrain2(entry.strain_2 || "");
    setThcPercentage(entry.thc_percentage?.toString() || "");
    setCbdPercentage(entry.cbd_percentage?.toString() || "");
    setMethod(entry.method);
    setSelectedObservations(entry.observations);
    setSelectedActivities(entry.activities);
    setSelectedNegativeSideEffects(entry.negative_side_effects);
    setNotes(entry.notes || "");
    setSelectedIcon(entry.icon);
    
    setBeforeMood(entry.before_mood || 5);
    setBeforePain(entry.before_pain || 5);
    setBeforeAnxiety(entry.before_anxiety || 5);
    setBeforeEnergy(entry.before_energy || 5);
    setBeforeFocus(entry.before_focus || 5);
    setBeforeNotes(entry.before_notes || "");

    setEntryFormTab('after');

    await supabase.from("journal_entries").delete().eq("id", entryId);

    document.getElementById('new-entry-card')?.scrollIntoView({ behavior: 'smooth' });
    
    toast.info("Complete the 'After' state to finish this entry");
  };

  const handleDelete = (entryId: string) => {
    setDeleteEntryId(entryId);
    setShowDeleteDialog(true);
  };

  const handlePermanentDelete = async () => {
    if (isDemoMode) {
      toast.error("Demo mode is read-only. Sign up to make changes!");
      setShowDeleteDialog(false);
      return;
    }

    if (!deleteEntryId) return;

    const { error } = await supabase
      .from("journal_entries")
      .update({ is_deleted: true })
      .eq("id", deleteEntryId);

    if (error) {
      toast.error("Error deleting entry: " + error.message);
    } else {
      toast.success("Entry moved to trash");
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

  const filteredEntries = entries.filter(entry => {
    if (!isEntryInTimeRange(entry)) return false;
    
    if (filterObservations.length > 0) {
      if (!filterObservations.some(obs => entry.observations.includes(obs))) {
        return false;
      }
    }
    
    if (filterActivities.length > 0) {
      if (!filterActivities.some(act => entry.activities.includes(act))) {
        return false;
      }
    }
    
    if (filterSideEffects.length > 0) {
      if (!filterSideEffects.some(eff => entry.negative_side_effects.includes(eff))) {
        return false;
      }
    }
    
    if (filterMethods.length > 0) {
      if (!filterMethods.includes(entry.method)) {
        return false;
      }
    }
    
    return true;
  });

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }
  
  if (!user && !isDemoMode) {
    return <LandingPage />;
  }

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
            <div className="flex-1">
              {entries.length >= 10 && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/tools")}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Wellness Tools
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/settings")}
                className="rounded-full"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
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

        {/* Achievement Badges */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          <AchievementBadges entryCount={entries.length} />
        </div>

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

          {/* Entry Mode Toggle */}
          <div className="flex items-center justify-between p-4 mb-6 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex flex-col gap-1">
              <Label htmlFor="entry-mode" className="text-sm font-semibold cursor-pointer">
                {isQuickEntry ? "Quick Entry Mode" : "Full Tracking Mode"}
              </Label>
              <p className="text-xs text-muted-foreground">
                {isQuickEntry 
                  ? "Fast logging with consumption details and observations only" 
                  : "Track before/after states with detailed effectiveness metrics"}
              </p>
            </div>
            <Switch
              id="entry-mode"
              checked={!isQuickEntry}
              onCheckedChange={(checked) => setIsQuickEntry(!checked)}
            />
          </div>

          {isQuickEntry ? (
            // Quick Entry Mode - Single simplified form
            <div className="space-y-6">
              {/* Basic Info - Strains */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="strain2">Second Strain (Optional)</Label>
                  <Input
                    id="strain2"
                    value={strain2}
                    onChange={(e) => setStrain2(e.target.value)}
                    placeholder="e.g., OG Kush"
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* Cannabinoid Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="thc">THC % (Optional)</Label>
                  <Input
                    id="thc"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={thcPercentage}
                    onChange={(e) => setThcPercentage(e.target.value)}
                    placeholder="e.g., 24.5"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="cbd">CBD % (Optional)</Label>
                  <Input
                    id="cbd"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={cbdPercentage}
                    onChange={(e) => setCbdPercentage(e.target.value)}
                    placeholder="e.g., 0.5"
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* Dosage and Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {formatTimeAgo(minutesAgo)}
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

              {/* Mood Card */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Experience Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                            className="flex flex-col gap-1 h-auto py-3 hover:bg-primary/30 hover:border-primary hover:text-primary hover:shadow-lg transition-all duration-200"
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

                  {/* Experience Categories */}
                  <div className="space-y-4">
                    {(selectedObservations.length > 0 || selectedActivities.length > 0 || selectedNegativeSideEffects.length > 0) && (
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllSelections}
                          className="text-muted-foreground hover:text-foreground gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Clear All Selections
                        </Button>
                      </div>
                    )}
                    {/* Observations */}
                    <Collapsible open={observationsOpen} onOpenChange={setObservationsOpen}>
                      <div className={`border border-observation/30 rounded-lg bg-observation/5 hover:bg-observation/10 transition-all duration-300 ${
                        highlightObservations ? 'ring-2 ring-observation shadow-lg scale-[1.02]' : ''
                      }`}>
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-4 text-left">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-observation/20">
                                  <Smile className="w-4 h-4 text-observation" />
                                </div>
                                <Label className="text-base font-semibold text-foreground cursor-pointer">Positive Observations</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                {selectedObservations.length > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {selectedObservations.length} selected
                                  </Badge>
                                )}
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${observationsOpen ? 'rotate-180' : ''}`} />
                              </div>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4">
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
                        </CollapsibleContent>
                      </div>
                    </Collapsible>

                    {/* Activities */}
                    <Collapsible open={activitiesOpen} onOpenChange={setActivitiesOpen}>
                      <div className={`border border-activity/30 rounded-lg bg-activity/5 hover:bg-activity/10 transition-all duration-300 ${
                        highlightActivities ? 'ring-2 ring-activity shadow-lg scale-[1.02]' : ''
                      }`}>
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-4 text-left">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-activity/20">
                                  <Activity className="w-4 h-4 text-activity" />
                                </div>
                                <Label className="text-base font-semibold text-foreground cursor-pointer">Activities</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                {selectedActivities.length > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {selectedActivities.length} selected
                                  </Badge>
                                )}
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activitiesOpen ? 'rotate-180' : ''}`} />
                              </div>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4">
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
                        </CollapsibleContent>
                      </div>
                    </Collapsible>

                    {/* Negative Side Effects */}
                    <Collapsible open={sideEffectsOpen} onOpenChange={setSideEffectsOpen}>
                      <div className="border border-side-effect/30 rounded-lg bg-side-effect/5 hover:bg-side-effect/10 transition-colors duration-200">
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-4 text-left">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-side-effect/20">
                                  <AlertCircle className="w-4 h-4 text-side-effect" />
                                </div>
                                <Label className="text-base font-semibold text-foreground cursor-pointer">Negative Side Effects</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                {selectedNegativeSideEffects.length > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {selectedNegativeSideEffects.length} selected
                                  </Badge>
                                )}
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${sideEffectsOpen ? 'rotate-180' : ''}`} />
                              </div>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4">
                            <p className="text-xs text-muted-foreground mb-3">Any unwanted effects?</p>
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
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  </div>
                </CardContent>
              </Card>

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
                className={`w-full transition-all duration-300 ${
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
          ) : (
            // Full Tracking Mode - Tabbed interface with Before/After
            <Tabs value={entryFormTab} onValueChange={(value) => setEntryFormTab(value as 'before' | 'consumption' | 'after')} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="before">Before</TabsTrigger>
              <TabsTrigger value="consumption">Consumption</TabsTrigger>
              <TabsTrigger value="after">After</TabsTrigger>
            </TabsList>

            {/* Before Tab */}
            <TabsContent value="before" className="space-y-6">
              <p className="text-sm text-muted-foreground mb-4">
                Track how you're feeling before consumption to measure the effectiveness
              </p>
              
              <div className="space-y-6">
                {/* Mood Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Smile className="w-4 h-4 text-primary" />
                      Mood
                    </Label>
                    <span className="text-sm text-muted-foreground">{beforeMood}/10</span>
                  </div>
                  <Slider
                    value={[beforeMood]}
                    onValueChange={(value) => setBeforeMood(value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Very Low</span>
                    <span>Excellent</span>
                  </div>
                </div>

                {/* Pain Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-side-effect" />
                      Pain Level
                    </Label>
                    <span className="text-sm text-muted-foreground">{beforePain}/10</span>
                  </div>
                  <Slider
                    value={[beforePain]}
                    onValueChange={(value) => setBeforePain(value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>No Pain</span>
                    <span>Severe Pain</span>
                  </div>
                </div>

                {/* Anxiety Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" />
                      Anxiety Level
                    </Label>
                    <span className="text-sm text-muted-foreground">{beforeAnxiety}/10</span>
                  </div>
                  <Slider
                    value={[beforeAnxiety]}
                    onValueChange={(value) => setBeforeAnxiety(value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>No Anxiety</span>
                    <span>High Anxiety</span>
                  </div>
                </div>

                {/* Energy Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accent" />
                      Energy Level
                    </Label>
                    <span className="text-sm text-muted-foreground">{beforeEnergy}/10</span>
                  </div>
                  <Slider
                    value={[beforeEnergy]}
                    onValueChange={(value) => setBeforeEnergy(value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Very Low</span>
                    <span>Very High</span>
                  </div>
                </div>

                {/* Focus Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Focus Level
                    </Label>
                    <span className="text-sm text-muted-foreground">{beforeFocus}/10</span>
                  </div>
                  <Slider
                    value={[beforeFocus]}
                    onValueChange={(value) => setBeforeFocus(value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Can't Focus</span>
                    <span>Very Focused</span>
                  </div>
                </div>

                {/* Before Notes */}
                <div className="space-y-2">
                  <Label htmlFor="before-notes">Before Notes (Optional)</Label>
                  <Textarea
                    id="before-notes"
                    value={beforeNotes}
                    onChange={(e) => setBeforeNotes(e.target.value)}
                    placeholder="How are you feeling right now? Any symptoms or context..."
                    className="min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <Button onClick={() => setEntryFormTab('consumption')} className="w-full" size="lg">
                Continue to Consumption Details
              </Button>
            </TabsContent>

            {/* Consumption Tab */}
            <TabsContent value="consumption" className="space-y-6">
              {/* Basic Info - Strains */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="strain-full">Strain Name</Label>
                  <Input
                    id="strain-full"
                    value={strain}
                    onChange={(e) => setStrain(e.target.value)}
                    placeholder="e.g., Blue Dream"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="strain2-full">Second Strain (Optional)</Label>
                  <Input
                    id="strain2-full"
                    value={strain2}
                    onChange={(e) => setStrain2(e.target.value)}
                    placeholder="e.g., OG Kush"
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* Cannabinoid Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="thc-full">THC % (Optional)</Label>
                  <Input
                    id="thc-full"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={thcPercentage}
                    onChange={(e) => setThcPercentage(e.target.value)}
                    placeholder="e.g., 24.5"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="cbd-full">CBD % (Optional)</Label>
                  <Input
                    id="cbd-full"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={cbdPercentage}
                    onChange={(e) => setCbdPercentage(e.target.value)}
                    placeholder="e.g., 0.5"
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* Dosage and Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dosage-full">Dosage</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="dosage-full"
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
                  <Label htmlFor="method-full">Method</Label>
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
                    {formatTimeAgo(minutesAgo)}
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
                
              <div className="flex gap-3">
                <Button 
                  onClick={() => setEntryFormTab('after')} 
                  className="flex-1"
                  size="lg"
                  variant="outline"
                >
                  Continue to After State
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  className="flex-1"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Save as Pending
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* After Tab */}
            <TabsContent value="after" className="space-y-6">
              <p className="text-sm text-muted-foreground mb-4">
                Track how you're feeling after consumption and record your experience
              </p>
              
              <div className="space-y-6">
                {/* After Sliders */}
                <div className="space-y-6">
                  {/* Mood Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Smile className="w-4 h-4 text-primary" />
                        Mood Now
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{afterMood}/10</span>
                        {afterMood !== beforeMood && (
                          <span className={`text-xs font-medium ${afterMood > beforeMood ? 'text-green-500' : 'text-red-500'}`}>
                            {afterMood > beforeMood ? '↑' : '↓'}{Math.abs(afterMood - beforeMood)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Slider
                      value={[afterMood]}
                      onValueChange={(value) => setAfterMood(value[0])}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Pain Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-side-effect" />
                        Pain Level Now
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{afterPain}/10</span>
                        {afterPain !== beforePain && (
                          <span className={`text-xs font-medium ${afterPain < beforePain ? 'text-green-500' : 'text-red-500'}`}>
                            {afterPain < beforePain ? '↓' : '↑'}{Math.abs(afterPain - beforePain)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Slider
                      value={[afterPain]}
                      onValueChange={(value) => setAfterPain(value[0])}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Anxiety Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Brain className="w-4 h-4 text-primary" />
                        Anxiety Level Now
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{afterAnxiety}/10</span>
                        {afterAnxiety !== beforeAnxiety && (
                          <span className={`text-xs font-medium ${afterAnxiety < beforeAnxiety ? 'text-green-500' : 'text-red-500'}`}>
                            {afterAnxiety < beforeAnxiety ? '↓' : '↑'}{Math.abs(afterAnxiety - beforeAnxiety)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Slider
                      value={[afterAnxiety]}
                      onValueChange={(value) => setAfterAnxiety(value[0])}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Energy Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Zap className="w-4 h-4 text-accent" />
                        Energy Level Now
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{afterEnergy}/10</span>
                        {afterEnergy !== beforeEnergy && (
                          <span className={`text-xs font-medium ${afterEnergy > beforeEnergy ? 'text-green-500' : 'text-red-500'}`}>
                            {afterEnergy > beforeEnergy ? '↑' : '↓'}{Math.abs(afterEnergy - beforeEnergy)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Slider
                      value={[afterEnergy]}
                      onValueChange={(value) => setAfterEnergy(value[0])}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Focus Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Focus Level Now
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{afterFocus}/10</span>
                        {afterFocus !== beforeFocus && (
                          <span className={`text-xs font-medium ${afterFocus > beforeFocus ? 'text-green-500' : 'text-red-500'}`}>
                            {afterFocus > beforeFocus ? '↑' : '↓'}{Math.abs(afterFocus - beforeFocus)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Slider
                      value={[afterFocus]}
                      onValueChange={(value) => setAfterFocus(value[0])}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Effects Duration */}
                <div>
                  <Label htmlFor="effects-duration">How long did the effects last?</Label>
                  <Select 
                    value={effectsDurationMinutes?.toString() || ""} 
                    onValueChange={(value) => setEffectsDurationMinutes(value ? parseInt(value) : null)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                      <SelectItem value="360">6+ hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mood Card */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      Experience Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                              className="flex flex-col gap-1 h-auto py-3 hover:bg-primary/30 hover:border-primary hover:text-primary hover:shadow-lg transition-all duration-200"
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

                    {/* Experience Categories */}
                    <div className="space-y-4">
                      {(selectedObservations.length > 0 || selectedActivities.length > 0 || selectedNegativeSideEffects.length > 0) && (
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllSelections}
                            className="text-muted-foreground hover:text-foreground gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Clear All Selections
                          </Button>
                        </div>
                      )}
                      {/* Observations */}
                      <Collapsible open={observationsOpen} onOpenChange={setObservationsOpen}>
                        <div className={`border border-observation/30 rounded-lg bg-observation/5 hover:bg-observation/10 transition-all duration-300 ${
                          highlightObservations ? 'ring-2 ring-observation shadow-lg scale-[1.02]' : ''
                        }`}>
                          <CollapsibleTrigger asChild>
                            <button className="w-full p-4 text-left">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-md bg-observation/20">
                                    <Smile className="w-4 h-4 text-observation" />
                                  </div>
                                  <Label className="text-base font-semibold text-foreground cursor-pointer">Positive Observations</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  {selectedObservations.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {selectedObservations.length} selected
                                    </Badge>
                                  )}
                                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${observationsOpen ? 'rotate-180' : ''}`} />
                                </div>
                              </div>
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="px-4 pb-4">
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
                          </CollapsibleContent>
                        </div>
                      </Collapsible>

                      {/* Activities */}
                      <Collapsible open={activitiesOpen} onOpenChange={setActivitiesOpen}>
                        <div className={`border border-activity/30 rounded-lg bg-activity/5 hover:bg-activity/10 transition-all duration-300 ${
                          highlightActivities ? 'ring-2 ring-activity shadow-lg scale-[1.02]' : ''
                        }`}>
                          <CollapsibleTrigger asChild>
                            <button className="w-full p-4 text-left">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-md bg-activity/20">
                                    <Activity className="w-4 h-4 text-activity" />
                                  </div>
                                  <Label className="text-base font-semibold text-foreground cursor-pointer">Activities</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  {selectedActivities.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {selectedActivities.length} selected
                                    </Badge>
                                  )}
                                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activitiesOpen ? 'rotate-180' : ''}`} />
                                </div>
                              </div>
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="px-4 pb-4">
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
                          </CollapsibleContent>
                        </div>
                      </Collapsible>

                      {/* Negative Side Effects */}
                      <Collapsible open={sideEffectsOpen} onOpenChange={setSideEffectsOpen}>
                        <div className="border border-side-effect/30 rounded-lg bg-side-effect/5 hover:bg-side-effect/10 transition-colors duration-200">
                          <CollapsibleTrigger asChild>
                            <button className="w-full p-4 text-left">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-md bg-side-effect/20">
                                    <AlertCircle className="w-4 h-4 text-side-effect" />
                                  </div>
                                  <Label className="text-base font-semibold text-foreground cursor-pointer">Negative Side Effects</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  {selectedNegativeSideEffects.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {selectedNegativeSideEffects.length} selected
                                    </Badge>
                                  )}
                                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${sideEffectsOpen ? 'rotate-180' : ''}`} />
                                </div>
                              </div>
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="px-4 pb-4">
                              <p className="text-xs text-muted-foreground mb-3">Any unwanted effects?</p>
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
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    </div>
                  </CardContent>
                </Card>

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
                  className={`w-full transition-all duration-300 ${
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
            </TabsContent>
          </Tabs>
          )}
        </Card>

        {/* Insights Chart */}
        {entries.length > 0 && (
          <div id="insights-section" className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <InsightsChart 
              entries={filteredEntries}
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
                <EntryList
                  entries={filteredEntries}
                  isDemoMode={isDemoMode}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  timeRangeFilter={timeRangeFilter}
                  setTimeRangeFilter={setTimeRangeFilter}
                  filterObservations={filterObservations}
                  filterActivities={filterActivities}
                  filterSideEffects={filterSideEffects}
                  filterMethods={filterMethods}
                  setFilterObservations={setFilterObservations}
                  setFilterActivities={setFilterActivities}
                  setFilterSideEffects={setFilterSideEffects}
                  setFilterMethods={setFilterMethods}
                  onOpenNotesDialog={openNotesDialog}
                  onDelete={handleDelete}
                  onOpenTimeEditDialog={openTimeEditDialog}
                  onCompletePendingEntry={handleCompletePendingEntry}
                />
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
