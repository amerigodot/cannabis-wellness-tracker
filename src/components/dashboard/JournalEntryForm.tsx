import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, Clock, Trash2, FileText, Droplet, Cigarette, Cookie, 
  Heart, Brain, Zap, Loader2, Wind, Beaker, Pipette, Activity, 
  AlertCircle, Smile, ChevronDown, Target 
} from "lucide-react";
import { toast } from "sonner";

import { JournalEntry } from "@/types/journal";
import { EntryFormValues, entryFormSchema, defaultFormValues } from "@/types/entryForm";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { sliderValueToMinutes, formatTimeAgo } from "@/utils/wellness";
import { 
  COMMON_OBSERVATIONS, 
  COMMON_ACTIVITIES, 
  NEGATIVE_SIDE_EFFECTS, 
  AVAILABLE_ICONS, 
  ENTRY_PRESETS,
  getIconComponent 
} from "@/constants/journal";

interface JournalEntryFormProps {
  isDemoMode: boolean;
  onSubmit: (data: Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;
  onUpdate: (entryId: string, updates: Partial<JournalEntry>) => Promise<boolean>;
  lastEntry?: JournalEntry | null;
  pendingEntryToComplete?: JournalEntry | null;
  onCancelPendingCompletion?: () => void;
}

export const JournalEntryForm = ({ 
  isDemoMode, 
  onSubmit, 
  onUpdate,
  lastEntry, 
  pendingEntryToComplete,
  onCancelPendingCompletion,
}: JournalEntryFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [tempNotes, setTempNotes] = useState("");
  
  // Persist form state and slider history
  const [formDraft, setFormDraft] = useLocalStorage<EntryFormValues | null>("journal_form_draft", null);
  const [sliderHistory, setSliderHistory] = useLocalStorage<{timestamp: number, field: string, value: number}[]>("journal_slider_history", []);
  
  // Collapsible section states
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

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: defaultFormValues,
  });

  const isQuickEntry = watch("isQuickEntry");
  const entryFormTab = watch("entryFormTab");
  const observations = watch("observations");
  const activities = watch("activities");
  const negativeSideEffects = watch("negativeSideEffects");
  const notes = watch("notes");
  const method = watch("method");
  const selectedIcon = watch("selectedIcon");
  const minutesAgo = watch("minutesAgo");
  const beforeMood = watch("beforeMood");
  const beforePain = watch("beforePain");
  const beforeAnxiety = watch("beforeAnxiety");
  const beforeEnergy = watch("beforeEnergy");
  const beforeFocus = watch("beforeFocus");
  const afterMood = watch("afterMood");
  const afterPain = watch("afterPain");
  const afterAnxiety = watch("afterAnxiety");
  const afterEnergy = watch("afterEnergy");
  const afterFocus = watch("afterFocus");
  
  const hasLoadedDraft = useRef(false);

  // Auto-load draft on init
  useEffect(() => {
    if (!hasLoadedDraft.current && !pendingEntryToComplete && formDraft) {
      // Restore draft if we're not explicitly editing an existing entry
      // We use a timeout to allow the defaultValues to settle first if needed
      const timer = setTimeout(() => {
        reset(formDraft);
        toast.info("Restored your previous session");
        hasLoadedDraft.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pendingEntryToComplete, reset, formDraft]);

  // Sync form state to local storage (draft)
  useEffect(() => {
    if (!pendingEntryToComplete) {
      const subscription = watch((value) => {
        setFormDraft(value as EntryFormValues);
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, setFormDraft, pendingEntryToComplete]);

  // Log slider changes to history
  useEffect(() => {
    const timestamp = Date.now();
    // Helper to log if value changed
    const logChange = (field: string, value: number) => {
      setSliderHistory(prev => {
        const last = prev[prev.length - 1];
        // Avoid duplicate logs for same value (debounce effect naturally via react batching, but check anyway)
        if (last && last.field === field && last.value === value) return prev;
        return [...prev, { timestamp, field, value }];
      });
    };

    if (afterMood) logChange('afterMood', afterMood);
  }, [afterMood, setSliderHistory]);

  useEffect(() => { if (afterPain) setSliderHistory(prev => [...prev, { timestamp: Date.now(), field: 'afterPain', value: afterPain }]); }, [afterPain, setSliderHistory]);
  useEffect(() => { if (afterAnxiety) setSliderHistory(prev => [...prev, { timestamp: Date.now(), field: 'afterAnxiety', value: afterAnxiety }]); }, [afterAnxiety, setSliderHistory]);
  useEffect(() => { if (afterEnergy) setSliderHistory(prev => [...prev, { timestamp: Date.now(), field: 'afterEnergy', value: afterEnergy }]); }, [afterEnergy, setSliderHistory]);
  useEffect(() => { if (afterFocus) setSliderHistory(prev => [...prev, { timestamp: Date.now(), field: 'afterFocus', value: afterFocus }]); }, [afterFocus, setSliderHistory]);

  // Persist collapsible states
  useEffect(() => {
    localStorage.setItem('observationsOpen', JSON.stringify(observationsOpen));
  }, [observationsOpen]);

  useEffect(() => {
    localStorage.setItem('activitiesOpen', JSON.stringify(activitiesOpen));
  }, [activitiesOpen]);

  useEffect(() => {
    localStorage.setItem('sideEffectsOpen', JSON.stringify(sideEffectsOpen));
  }, [sideEffectsOpen]);

  // Set defaults from last entry (only when not completing a pending entry)
  useEffect(() => {
    if (pendingEntryToComplete) return; // Skip if completing pending entry
    
    if (lastEntry) {
      setValue("strain", lastEntry.strain);
      setValue("strain2", lastEntry.strain_2 || "");
      setValue("thcPercentage", lastEntry.thc_percentage?.toString() || "");
      setValue("cbdPercentage", lastEntry.cbd_percentage?.toString() || "");
      setValue("method", lastEntry.method);
      
      const dosageMatch = lastEntry.dosage.match(/^([\d.]+)(\w+)$/);
      if (dosageMatch) {
        setValue("dosageAmount", dosageMatch[1]);
        setValue("dosageUnit", dosageMatch[2] as "g" | "ml" | "mg");
      }
    }
  }, [lastEntry, setValue, pendingEntryToComplete]);

  // Populate form when completing a pending entry
  useEffect(() => {
    if (!pendingEntryToComplete) return;
    
    // Populate consumption details from the pending entry
    setValue("strain", pendingEntryToComplete.strain);
    setValue("strain2", pendingEntryToComplete.strain_2 || "");
    setValue("thcPercentage", pendingEntryToComplete.thc_percentage?.toString() || "");
    setValue("cbdPercentage", pendingEntryToComplete.cbd_percentage?.toString() || "");
    setValue("method", pendingEntryToComplete.method);
    setValue("selectedIcon", pendingEntryToComplete.icon || "leaf");
    setValue("observations", pendingEntryToComplete.observations || []);
    setValue("activities", pendingEntryToComplete.activities || []);
    setValue("negativeSideEffects", pendingEntryToComplete.negative_side_effects || []);
    setValue("notes", pendingEntryToComplete.notes || "");
    
    // Set before state values
    const beforeMood = pendingEntryToComplete.before_mood || 5;
    const beforePain = pendingEntryToComplete.before_pain || 5;
    const beforeAnxiety = pendingEntryToComplete.before_anxiety || 5;
    const beforeEnergy = pendingEntryToComplete.before_energy || 5;
    const beforeFocus = pendingEntryToComplete.before_focus || 5;
    
    setValue("beforeMood", beforeMood);
    setValue("beforePain", beforePain);
    setValue("beforeAnxiety", beforeAnxiety);
    setValue("beforeEnergy", beforeEnergy);
    setValue("beforeFocus", beforeFocus);
    setValue("beforeNotes", pendingEntryToComplete.before_notes || "");
    
    // Default after state values to before state values (user can adjust from there)
    setValue("afterMood", beforeMood);
    setValue("afterPain", beforePain);
    setValue("afterAnxiety", beforeAnxiety);
    setValue("afterEnergy", beforeEnergy);
    setValue("afterFocus", beforeFocus);
    
    // Parse dosage
    const dosageMatch = pendingEntryToComplete.dosage.match(/^([\d.]+)(\w+)$/);
    if (dosageMatch) {
      setValue("dosageAmount", dosageMatch[1]);
      setValue("dosageUnit", dosageMatch[2] as "g" | "ml" | "mg");
    }
    
    // Switch to Full Tracking mode and go to "after" tab
    setValue("isQuickEntry", false);
    setValue("entryFormTab", "after");
    
    // Set time to 0 (now) since we're completing the entry
    setValue("minutesAgo", 0);
    
  }, [pendingEntryToComplete, setValue]);

  const toggleArrayItem = (field: "observations" | "activities" | "negativeSideEffects", item: string) => {
    const current = watch(field);
    const updated = current.includes(item) 
      ? current.filter(i => i !== item) 
      : [...current, item];
    setValue(field, updated);
  };

  const applyPreset = (preset: typeof ENTRY_PRESETS[0]) => {
    setValue("observations", preset.observations);
    setValue("activities", preset.activities);
    
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
    setValue("observations", []);
    setValue("activities", []);
    setValue("negativeSideEffects", []);
    toast.success("All selections cleared");
  };

  const handleFormSubmit = async (data: EntryFormValues) => {
    if (isDemoMode) {
      toast.error("Demo mode is read-only. Sign up to save entries!");
      return;
    }

    if (!data.strain || !data.dosageAmount || !data.method) {
      toast.error("Please fill in strain, dosage, and method");
      return;
    }

    setIsSubmitting(true);
    
    const dosage = `${data.dosageAmount}${data.dosageUnit}`;
    
    // If completing a pending entry, we use the original consumption time
    // Otherwise, calculate from minutesAgo
    let consumptionTime: Date;
    if (pendingEntryToComplete) {
      consumptionTime = new Date(pendingEntryToComplete.consumption_time || pendingEntryToComplete.created_at);
    } else {
      consumptionTime = new Date();
      consumptionTime.setMinutes(consumptionTime.getMinutes() - sliderValueToMinutes(data.minutesAgo));
    }

    // When completing a pending entry, always set status to complete
    let status: 'pending_after' | 'complete' = 'complete';
    if (!pendingEntryToComplete && !data.isQuickEntry && data.entryFormTab !== 'after') {
      status = 'pending_after';
    }

    const entryData: Omit<JournalEntry, 'id' | 'user_id' | 'created_at'> = {
      strain: data.strain,
      strain_2: data.strain2 || null,
      thc_percentage: data.thcPercentage ? parseFloat(data.thcPercentage) : null,
      cbd_percentage: data.cbdPercentage ? parseFloat(data.cbdPercentage) : null,
      dosage,
      method: data.method,
      observations: data.observations,
      activities: data.activities,
      negative_side_effects: data.negativeSideEffects,
      notes: data.notes || null,
      icon: data.selectedIcon,
      consumption_time: consumptionTime.toISOString(),
      entry_status: status,
      // For pending entry completion, preserve the original before values
      before_mood: pendingEntryToComplete ? pendingEntryToComplete.before_mood : (!data.isQuickEntry ? data.beforeMood : null),
      before_pain: pendingEntryToComplete ? pendingEntryToComplete.before_pain : (!data.isQuickEntry ? data.beforePain : null),
      before_anxiety: pendingEntryToComplete ? pendingEntryToComplete.before_anxiety : (!data.isQuickEntry ? data.beforeAnxiety : null),
      before_energy: pendingEntryToComplete ? pendingEntryToComplete.before_energy : (!data.isQuickEntry ? data.beforeEnergy : null),
      before_focus: pendingEntryToComplete ? pendingEntryToComplete.before_focus : (!data.isQuickEntry ? data.beforeFocus : null),
      before_notes: pendingEntryToComplete ? pendingEntryToComplete.before_notes : (!data.isQuickEntry ? data.beforeNotes : null),
      // For pending entry completion, we're on the after tab, so always save after values
      after_mood: pendingEntryToComplete ? data.afterMood : (!data.isQuickEntry && data.entryFormTab === 'after' ? data.afterMood : null),
      after_pain: pendingEntryToComplete ? data.afterPain : (!data.isQuickEntry && data.entryFormTab === 'after' ? data.afterPain : null),
      after_anxiety: pendingEntryToComplete ? data.afterAnxiety : (!data.isQuickEntry && data.entryFormTab === 'after' ? data.afterAnxiety : null),
      after_energy: pendingEntryToComplete ? data.afterEnergy : (!data.isQuickEntry && data.entryFormTab === 'after' ? data.afterEnergy : null),
      after_focus: pendingEntryToComplete ? data.afterFocus : (!data.isQuickEntry && data.entryFormTab === 'after' ? data.afterFocus : null),
      effects_duration_minutes: pendingEntryToComplete ? data.effectsDurationMinutes : (!data.isQuickEntry && data.entryFormTab === 'after' ? data.effectsDurationMinutes : null),
    };

    let success: boolean;
    
    if (pendingEntryToComplete) {
      // Update the existing pending entry
      success = await onUpdate(pendingEntryToComplete.id, entryData);
      if (success) {
        onCancelPendingCompletion?.(); // Clear the pending entry state
        toast.success("Entry completed successfully!");
      }
    } else {
      // Create a new entry
      success = await onSubmit(entryData);
    }
    
    setIsSubmitting(false);

    if (success) {
      setShowSuccessAnimation(true);
      
      // Clear draft and history
      setFormDraft(null);
      setSliderHistory([]);
      
      // Reset form (keep consumption defaults)
      reset({
        ...defaultFormValues,
        strain: data.strain,
        strain2: data.strain2,
        thcPercentage: data.thcPercentage,
        cbdPercentage: data.cbdPercentage,
        dosageAmount: data.dosageAmount,
        dosageUnit: data.dosageUnit,
        method: data.method,
      });
      
      setTimeout(() => setShowSuccessAnimation(false), 500);
    }
  };

  const openNotesDialog = () => {
    if (isDemoMode) {
      toast.error("Demo mode is read-only. Sign up to add or edit notes!");
      return;
    }
    setTempNotes(notes || "");
    setNotesDialogOpen(true);
  };

  const saveNotes = () => {
    setValue("notes", tempNotes);
    setNotesDialogOpen(false);
  };

  const MethodIcon = ({ method }: { method: string }) => {
    switch (method) {
      case "Vape": return <Wind className="h-4 w-4" />;
      case "Smoke": return <Cigarette className="h-4 w-4" />;
      case "Oil": return <Droplet className="h-4 w-4" />;
      case "Tincture": return <Beaker className="h-4 w-4" />;
      case "Topical": return <Pipette className="h-4 w-4" />;
      case "Edible": return <Cookie className="h-4 w-4" />;
      default: return null;
    }
  };

  // Render Consumption Fields (shared between quick and full modes)
  const renderConsumptionFields = () => (
    <>
      {/* Strains */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="strain">Strain Name</Label>
          <Controller
            name="strain"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="e.g., Blue Dream" className="mt-1.5" />
            )}
          />
          {errors.strain && <p className="text-sm text-destructive mt-1">{errors.strain.message}</p>}
        </div>
        <div>
          <Label htmlFor="strain2">Second Strain (Optional)</Label>
          <Controller
            name="strain2"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="e.g., OG Kush" className="mt-1.5" />
            )}
          />
        </div>
      </div>

      {/* Cannabinoids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="thc">THC % (Optional)</Label>
          <Controller
            name="thcPercentage"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" min="0" max="100" placeholder="e.g., 24.5" className="mt-1.5" />
            )}
          />
        </div>
        <div>
          <Label htmlFor="cbd">CBD % (Optional)</Label>
          <Controller
            name="cbdPercentage"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" min="0" max="100" placeholder="e.g., 0.5" className="mt-1.5" />
            )}
          />
        </div>
      </div>

      {/* Dosage and Method */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dosage">Dosage</Label>
          <div className="flex gap-2 mt-1.5">
            <Controller
              name="dosageAmount"
              control={control}
              render={({ field }) => (
                <Input {...field} type="number" step="0.1" placeholder="e.g., 0.5" className="flex-1" />
              )}
            />
            <Controller
              name="dosageUnit"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="mg">mg</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="method">Method</Label>
          <Controller
            name="method"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select method">
                    {field.value && (
                      <div className="flex items-center gap-2">
                        <MethodIcon method={field.value} />
                        <span>{field.value}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {["Vape", "Smoke", "Oil", "Tincture", "Topical", "Edible"].map((m) => (
                    <SelectItem key={m} value={m}>
                      <div className="flex items-center gap-2">
                        <MethodIcon method={m} />
                        <span>{m}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Time Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Time Since Consumption</Label>
          <span className="text-sm text-muted-foreground">{formatTimeAgo(minutesAgo)}</span>
        </div>
        <Controller
          name="minutesAgo"
          control={control}
          render={({ field }) => (
            <Slider
              value={[field.value]}
              onValueChange={(value) => field.onChange(value[0])}
              max={1440}
              step={1}
              className="w-full"
            />
          )}
        />
        <div className="relative text-xs text-muted-foreground h-4 mt-1">
          <span className="absolute left-0">Now</span>
          <span className="absolute left-[25%] -translate-x-1/2">1h</span>
          <span className="absolute left-[50%] -translate-x-1/2 font-medium">2h</span>
          <span className="absolute left-[59.09%] -translate-x-1/2 hidden sm:inline">6h</span>
          <span className="absolute left-[72.73%] -translate-x-1/2">12h</span>
          <span className="absolute right-0">24h</span>
        </div>
      </div>
    </>
  );

  // Render Experience Card (observations, activities, side effects)
  const renderExperienceCard = () => (
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
            {ENTRY_PRESETS.map((preset) => {
              const PresetIcon = preset.icon;
              return (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  type="button"
                  className="flex flex-col gap-1.5 h-auto min-h-[56px] py-3 px-2 hover:bg-primary/30 hover:border-primary hover:text-primary hover:shadow-lg transition-all duration-200 touch-manipulation"
                  onClick={() => applyPreset(preset)}
                >
                  <PresetIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-[11px] sm:text-xs font-medium text-center leading-tight">
                    {preset.name}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Clear button */}
        {(observations.length > 0 || activities.length > 0 || negativeSideEffects.length > 0) && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              type="button"
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
              <button type="button" className="w-full p-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-observation/20">
                      <Smile className="w-4 h-4 text-observation" />
                    </div>
                    <Label className="text-base font-semibold text-foreground cursor-pointer">Positive Observations</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    {observations.length > 0 && (
                      <Badge variant="secondary" className="text-xs">{observations.length} selected</Badge>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${observationsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4">
                <p className="text-xs text-muted-foreground mb-3">What positive effects are you experiencing?</p>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {COMMON_OBSERVATIONS.map((obs) => (
                    <Badge
                      key={obs}
                      variant="outline"
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-observation min-h-[44px] px-3 py-2 text-sm touch-manipulation ${
                        observations.includes(obs) 
                          ? "bg-observation text-observation-foreground border-observation scale-105" 
                          : "bg-background hover:bg-observation/10"
                      }`}
                      onClick={() => toggleArrayItem("observations", obs)}
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
              <button type="button" className="w-full p-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-activity/20">
                      <Activity className="w-4 h-4 text-activity" />
                    </div>
                    <Label className="text-base font-semibold text-foreground cursor-pointer">Activities</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    {activities.length > 0 && (
                      <Badge variant="secondary" className="text-xs">{activities.length} selected</Badge>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activitiesOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4">
                <p className="text-xs text-muted-foreground mb-3">What are you doing during or after use?</p>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {COMMON_ACTIVITIES.map((activity) => (
                    <Badge
                      key={activity}
                      variant="outline"
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-activity min-h-[44px] px-3 py-2 text-sm touch-manipulation ${
                        activities.includes(activity) 
                          ? "bg-activity text-activity-foreground border-activity scale-105" 
                          : "bg-background hover:bg-activity/10"
                      }`}
                      onClick={() => toggleArrayItem("activities", activity)}
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
              <button type="button" className="w-full p-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-side-effect/20">
                      <AlertCircle className="w-4 h-4 text-side-effect" />
                    </div>
                    <Label className="text-base font-semibold text-foreground cursor-pointer">Negative Side Effects</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    {negativeSideEffects.length > 0 && (
                      <Badge variant="secondary" className="text-xs">{negativeSideEffects.length} selected</Badge>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${sideEffectsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4">
                <p className="text-xs text-muted-foreground mb-3">Any unwanted effects?</p>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {NEGATIVE_SIDE_EFFECTS.map((effect) => (
                    <Badge
                      key={effect}
                      variant="outline"
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-side-effect min-h-[44px] px-3 py-2 text-sm touch-manipulation ${
                        negativeSideEffects.includes(effect) 
                          ? "bg-side-effect text-side-effect-foreground border-side-effect scale-105" 
                          : "bg-background hover:bg-side-effect/10"
                      }`}
                      onClick={() => toggleArrayItem("negativeSideEffects", effect)}
                    >
                      {effect}
                    </Badge>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </CardContent>
    </Card>
  );

  // Render metric slider
  const renderMetricSlider = (
    name: keyof EntryFormValues,
    label: string,
    icon: React.ReactNode,
    lowLabel: string,
    highLabel: string,
    compareValue?: number,
    invertComparison?: boolean
  ) => {
    const value = watch(name) as number;
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            {icon}
            {label}
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{value}/10</span>
            {compareValue !== undefined && value !== compareValue && (
              <span className={`text-xs font-medium ${
                invertComparison 
                  ? (value < compareValue ? 'text-green-500' : 'text-red-500')
                  : (value > compareValue ? 'text-green-500' : 'text-red-500')
              }`}>
                {invertComparison 
                  ? (value < compareValue ? '↓' : '↑')
                  : (value > compareValue ? '↑' : '↓')
                }{Math.abs(value - compareValue)}
              </span>
            )}
          </div>
        </div>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Slider
              value={[field.value as number]}
              onValueChange={(v) => field.onChange(v[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      </div>
    );
  };

  // Render Notes Sheet
  const renderNotesSheet = () => (
    <Sheet open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className="w-full justify-start gap-2"
          onClick={openNotesDialog}
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
          <Button onClick={saveNotes} className="w-full mt-4">
            Save Notes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );

  const IconComponent = getIconComponent(selectedIcon);

  return (
    <Card id="new-entry-card" className={`p-6 md:p-8 mb-8 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 ${pendingEntryToComplete ? 'ring-2 ring-accent border-accent' : ''}`}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {/* Pending Entry Completion Banner */}
        {pendingEntryToComplete && (
          <div className="mb-6 p-4 bg-accent/20 border border-accent rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" />
                <div>
                  <p className="font-semibold text-accent">Completing Pending Entry</p>
                  <p className="text-xs text-muted-foreground">
                    {pendingEntryToComplete.strain} - {new Date(pendingEntryToComplete.consumption_time || pendingEntryToComplete.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancelPendingCompletion}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            {pendingEntryToComplete ? "Complete Entry" : "New Entry"}
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" type="button" className="gap-2">
                <IconComponent className="h-4 w-4" />
                Select Icon
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="grid grid-cols-3 gap-3 p-4">
                {AVAILABLE_ICONS.map((icon) => {
                  const IconComp = getIconComponent(icon.value);
                  return (
                    <DropdownMenuItem
                      key={icon.value}
                      onClick={() => setValue("selectedIcon", icon.value)}
                      className={`p-6 justify-center cursor-pointer rounded-lg transition-all duration-200 hover:scale-110 hover:bg-primary/20 ${
                        selectedIcon === icon.value ? 'bg-primary/10 scale-105' : ''
                      }`}
                      title={icon.name}
                    >
                      <IconComp className="h-10 w-10 transition-transform" />
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Entry Mode Toggle - hide when completing pending entry */}
        {!pendingEntryToComplete && (
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
            <Controller
              name="isQuickEntry"
              control={control}
              render={({ field }) => (
                <Switch
                  id="entry-mode"
                  checked={!field.value}
                  onCheckedChange={(checked) => field.onChange(!checked)}
                />
              )}
            />
          </div>
        )}

        {isQuickEntry && !pendingEntryToComplete ? (
          <div className="space-y-6">
            {renderConsumptionFields()}
            {renderExperienceCard()}
            {renderNotesSheet()}
            
            <Button
              type="submit"
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
          <Tabs value={entryFormTab} onValueChange={(v) => setValue("entryFormTab", v as "before" | "consumption" | "after")} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="before">Before</TabsTrigger>
              <TabsTrigger value="consumption">Consumption</TabsTrigger>
              <TabsTrigger value="after">After</TabsTrigger>
            </TabsList>

            <TabsContent value="before" className="space-y-6">
              <p className="text-sm text-muted-foreground mb-4">
                Track how you're feeling before consumption to measure the effectiveness
              </p>
              
              <div className="space-y-6">
                {renderMetricSlider("beforeMood", "Mood", <Smile className="w-4 h-4 text-primary" />, "Very Low", "Excellent")}
                {renderMetricSlider("beforePain", "Pain Level", <AlertCircle className="w-4 h-4 text-side-effect" />, "No Pain", "Severe Pain")}
                {renderMetricSlider("beforeAnxiety", "Anxiety Level", <Brain className="w-4 h-4 text-primary" />, "No Anxiety", "Severe Anxiety")}
                {renderMetricSlider("beforeEnergy", "Energy Level", <Zap className="w-4 h-4 text-accent" />, "Very Low", "Very High")}
                {renderMetricSlider("beforeFocus", "Focus Level", <Target className="w-4 h-4 text-primary" />, "Very Distracted", "Very Focused")}
                
                <div className="space-y-2">
                  <Label htmlFor="before-notes">Before Notes (Optional)</Label>
                  <Controller
                    name="beforeNotes"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        placeholder="How are you feeling right now? Any symptoms or context..."
                        className="min-h-[100px] resize-none"
                      />
                    )}
                  />
                </div>
              </div>

              <Button type="button" onClick={() => setValue("entryFormTab", "consumption")} className="w-full" size="lg">
                Continue to Consumption Details
              </Button>
            </TabsContent>

            <TabsContent value="consumption" className="space-y-6">
              {renderConsumptionFields()}
              {renderNotesSheet()}
              
              <div className="flex gap-3">
                <Button 
                  type="button"
                  onClick={() => setValue("entryFormTab", "after")} 
                  className="flex-1"
                  size="lg"
                  variant="outline"
                >
                  Continue to After State
                </Button>
                <Button 
                  type="submit"
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

            <TabsContent value="after" className="space-y-6">
              {/* Show pending entry summary when completing */}
              {pendingEntryToComplete && (
                <div className="p-4 bg-muted/50 rounded-lg border border-border/50 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Entry Summary</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs">Strain</span>
                      <span className="font-medium">{pendingEntryToComplete.strain}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Dosage</span>
                      <span className="font-medium">{pendingEntryToComplete.dosage}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Method</span>
                      <span className="font-medium">{pendingEntryToComplete.method}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Consumed</span>
                      <span className="font-medium">
                        {new Date(pendingEntryToComplete.consumption_time || pendingEntryToComplete.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground block mb-2">Before State</span>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs text-center">
                      <div className="bg-background/50 rounded-md p-2">
                        <span className="text-muted-foreground block text-[10px]">Mood</span>
                        <span className="font-semibold">{pendingEntryToComplete.before_mood || 5}</span>
                      </div>
                      <div className="bg-background/50 rounded-md p-2">
                        <span className="text-muted-foreground block text-[10px]">Pain</span>
                        <span className="font-semibold">{pendingEntryToComplete.before_pain || 5}</span>
                      </div>
                      <div className="bg-background/50 rounded-md p-2">
                        <span className="text-muted-foreground block text-[10px]">Anxiety</span>
                        <span className="font-semibold">{pendingEntryToComplete.before_anxiety || 5}</span>
                      </div>
                      <div className="bg-background/50 rounded-md p-2">
                        <span className="text-muted-foreground block text-[10px]">Energy</span>
                        <span className="font-semibold">{pendingEntryToComplete.before_energy || 5}</span>
                      </div>
                      <div className="bg-background/50 rounded-md p-2">
                        <span className="text-muted-foreground block text-[10px]">Focus</span>
                        <span className="font-semibold">{pendingEntryToComplete.before_focus || 5}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground mb-4">
                Track how you're feeling after consumption and record your experience
              </p>
              
              <div className="space-y-6">
                {renderMetricSlider("afterMood", "Mood Now", <Smile className="w-4 h-4 text-primary" />, "Very Low", "Excellent", beforeMood)}
                {renderMetricSlider("afterPain", "Pain Level Now", <AlertCircle className="w-4 h-4 text-side-effect" />, "No Pain", "Severe Pain", beforePain, true)}
                {renderMetricSlider("afterAnxiety", "Anxiety Level Now", <Brain className="w-4 h-4 text-primary" />, "No Anxiety", "Severe Anxiety", beforeAnxiety, true)}
                {renderMetricSlider("afterEnergy", "Energy Level Now", <Zap className="w-4 h-4 text-accent" />, "Very Low", "Very High", beforeEnergy)}
                {renderMetricSlider("afterFocus", "Focus Level Now", <Target className="w-4 h-4 text-primary" />, "Very Distracted", "Very Focused", beforeFocus)}
              </div>

              {renderExperienceCard()}

              <Button
                type="submit"
                className={`w-full transition-all duration-300 ${
                  showSuccessAnimation ? 'animate-in zoom-in-95 bg-green-500 hover:bg-green-600' : ''
                }`}
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {pendingEntryToComplete ? 'Completing...' : 'Saving...'}
                  </>
                ) : pendingEntryToComplete ? (
                  <>
                    <Activity className="mr-2 h-4 w-4" />
                    Complete Entry
                  </>
                ) : (
                  'Save Complete Entry'
                )}
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </form>
    </Card>
  );
};
