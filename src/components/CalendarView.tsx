import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { format, isSameDay, parseISO, startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, isWithinInterval } from "date-fns";
import { Leaf, Bell, FileText, Trash2, Pill, Droplet, Cigarette, Cookie, Coffee, Sparkles, Heart, Brain, Zap, Rocket, Flame, Clock, Wind, Beaker, Pipette } from "lucide-react";
import { toast } from "sonner";

interface JournalEntry {
  id: string;
  created_at: string;
  consumption_time: string;
  strain: string;
  strain_2?: string | null;
  thc_percentage?: number | null;
  cbd_percentage?: number | null;
  dosage: string;
  method: string;
  observations: string[];
  activities: string[];
  negative_side_effects: string[];
  notes: string | null;
  icon: string;
  entry_status?: string | null;
  effects_duration_minutes?: number | null;
  before_mood?: number | null;
  before_pain?: number | null;
  before_anxiety?: number | null;
  before_energy?: number | null;
  before_focus?: number | null;
  before_notes?: string | null;
  after_mood?: number | null;
  after_pain?: number | null;
  after_anxiety?: number | null;
  after_energy?: number | null;
  after_focus?: number | null;
}

interface Reminder {
  id: string;
  title: string;
  reminder_time: string;
  is_active: boolean;
  recurrence: string;
}

export const CalendarView = ({ 
  filterObservations, 
  setFilterObservations, 
  filterActivities, 
  setFilterActivities, 
  filterSideEffects, 
  setFilterSideEffects,
  filterMethods,
  setFilterMethods,
  isDemoMode,
  demoEntries = []
}: {
  filterObservations: string[];
  setFilterObservations: React.Dispatch<React.SetStateAction<string[]>>;
  filterActivities: string[];
  setFilterActivities: React.Dispatch<React.SetStateAction<string[]>>;
  filterSideEffects: string[];
  setFilterSideEffects: React.Dispatch<React.SetStateAction<string[]>>;
  filterMethods: string[];
  setFilterMethods: React.Dispatch<React.SetStateAction<string[]>>;
  isDemoMode: boolean;
  demoEntries?: any[];
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string>("");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  const [editingTimeEntryId, setEditingTimeEntryId] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState<Date>(new Date());

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

  const getMethodIcon = (method: string) => {
    const methodIconMap: Record<string, typeof Wind> = {
      "Vape": Wind,
      "Smoke": Cigarette,
      "Oil": Droplet,
      "Tincture": Beaker,
      "Topical": Pipette,
      "Edible": Cookie,
    };
    return methodIconMap[method] || Leaf;
  };

  // Calculate effectiveness score from before/after metrics
  const calculateEffectiveness = (entry: JournalEntry): { score: number; label: string; color: string } => {
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

  const isEntryInTimeRange = (entry: JournalEntry) => {
    return true; // Show all entries regardless of time
  };

  useEffect(() => {
    fetchData();
  }, [isDemoMode, demoEntries]);

  // Real-time subscription for all entry changes (skip in demo mode)
  useEffect(() => {
    if (isDemoMode) return;
    
    const entriesChannel = supabase
      .channel('calendar-entries-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'journal_entries'
        },
        (payload) => {
          console.log('Entry changed in calendar:', payload.eventType);
          fetchData();
        }
      )
      .subscribe();

    const remindersChannel = supabase
      .channel('calendar-reminders-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'reminders'
        },
        (payload) => {
          console.log('Reminder changed in calendar:', payload.eventType);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(entriesChannel);
      supabase.removeChannel(remindersChannel);
    };
  }, [isDemoMode]);

  const fetchData = async () => {
    if (isDemoMode) {
      setEntries(demoEntries || []);
      setReminders([
        {
          id: "demo-reminder-1",
          title: "Log evening entry",
          reminder_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          is_active: true,
          recurrence: "daily"
        },
        {
          id: "demo-reminder-2",
          title: "Weekly wellness check",
          reminder_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true,
          recurrence: "weekly"
        }
      ]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    const { data: entriesData, error: entriesError } = await supabase
      .from("journal_entries")
      .select("id, created_at, consumption_time, strain, dosage, method, observations, activities, negative_side_effects, notes, icon")
      .eq("is_deleted", false)
      .order("consumption_time", { ascending: false });

    const { data: remindersData, error: remindersError } = await supabase
      .from("reminders")
      .select("*")
      .eq("is_active", true)
      .order("reminder_time", { ascending: true });

    if (entriesError) {
      toast.error("Error loading entries: " + entriesError.message);
    } else {
      setEntries(entriesData || []);
    }

    if (remindersError) {
      toast.error("Error loading reminders: " + remindersError.message);
    } else {
      setReminders(remindersData || []);
    }

    setLoading(false);
  };

  const getEntriesForDate = (date: Date) => {
    return entries.filter((entry) =>
      isSameDay(parseISO(entry.consumption_time || entry.created_at), date) && isEntryInTimeRange(entry)
    );
  };

  const getRemindersForDate = (date: Date) => {
    return reminders.filter((reminder) =>
      isSameDay(parseISO(reminder.reminder_time), date)
    );
  };

  const getDatesWithData = () => {
    const dates = new Set<string>();
    
    entries.forEach((entry) => {
      dates.add(format(parseISO(entry.consumption_time || entry.created_at), "yyyy-MM-dd"));
    });
    
    reminders.forEach((reminder) => {
      dates.add(format(parseISO(reminder.reminder_time), "yyyy-MM-dd"));
    });
    
    return dates;
  };

  const getDatesWithFilteredData = () => {
    const dates = new Set<string>();
    
    // Filter entries based on active filters
    const filteredEntries = entries.filter(entry => {
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
    });
    
    filteredEntries.forEach((entry) => {
      dates.add(format(parseISO(entry.consumption_time || entry.created_at), "yyyy-MM-dd"));
    });
    
    // Always include reminders
    reminders.forEach((reminder) => {
      dates.add(format(parseISO(reminder.reminder_time), "yyyy-MM-dd"));
    });
    
    return dates;
  };

  const openNotesDialog = (entry: JournalEntry) => {
    if (isDemoMode) {
      toast.error("Demo mode is read-only. Sign up to add or edit notes!");
      return;
    }
    setEditingEntryId(entry.id);
    setEditingNotes(entry.notes || "");
  };

  const saveNotes = async () => {
    if (isDemoMode) {
      toast.error("Demo mode is read-only. Sign up to make changes!");
      return;
    }
    
    if (!editingEntryId) return;

    const { error } = await supabase
      .from("journal_entries")
      .update({ notes: editingNotes })
      .eq("id", editingEntryId);

    if (error) {
      toast.error("Error saving notes: " + error.message);
    } else {
      toast.success("Notes saved!");
      fetchData();
      setEditingEntryId(null);
    }
  };

  const openTimeEditDialog = (entryId: string, currentTime: string) => {
    if (isDemoMode) {
      toast.error("Demo mode is read-only. Sign up to edit consumption times!");
      return;
    }
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
      fetchData();
      setEditingTimeEntryId(null);
    }
  };

  const deleteEntry = (entryId: string) => {
    if (isDemoMode) {
      toast.error("Demo mode is read-only. Sign up to make changes!");
      return;
    }
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
      fetchData();
    }
    
    setShowDeleteDialog(false);
    setDeleteEntryId(null);
  };

  const datesWithData = getDatesWithFilteredData();
  const selectedDateEntries = selectedDate ? getEntriesForDate(selectedDate).filter(entry => {
    // Apply the same filters as getDatesWithFilteredData
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
  }) : [];
  const selectedDateReminders = selectedDate ? getRemindersForDate(selectedDate) : [];

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Calendar</CardTitle>
            {(filterObservations.length > 0 || filterActivities.length > 0 || filterSideEffects.length > 0 || filterMethods.length > 0) && (
              <Badge variant="secondary" className="text-xs">
                {filterObservations.length + filterActivities.length + filterSideEffects.length + filterMethods.length} filter(s) active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {(filterObservations.length > 0 || filterActivities.length > 0 || filterSideEffects.length > 0 || filterMethods.length > 0) && (
            <div className="mb-4 p-3 rounded-lg bg-muted/50">
              <Label className="text-xs font-semibold mb-2 block">Showing dates with:</Label>
              <div className="flex flex-wrap gap-1">
                {filterObservations.map(obs => (
                  <Badge key={obs} className="text-xs bg-observation text-observation-foreground">
                    {obs}
                  </Badge>
                ))}
                {filterActivities.map(act => (
                  <Badge key={act} className="text-xs bg-activity text-activity-foreground">
                    {act}
                  </Badge>
                ))}
                {filterSideEffects.map(eff => (
                  <Badge key={eff} className="text-xs bg-side-effect text-side-effect-foreground">
                    {eff}
                  </Badge>
                ))}
                {filterMethods.map(method => (
                  <Badge key={method} variant="outline" className="text-xs flex items-center gap-1">
                    {(() => {
                      const MethodIcon = getMethodIcon(method);
                      return <MethodIcon className="h-3 w-3" />;
                    })()}
                    {method}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasData: (date) => datesWithData.has(format(date, "yyyy-MM-dd")),
            }}
            modifiersClassNames={{
              hasData: "font-bold relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary",
            }}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle>
                {format(selectedDate, "MMMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDateEntries.length === 0 && selectedDateReminders.length === 0 && (
                <p className="text-muted-foreground text-sm">No entries or reminders for this date</p>
              )}

              {selectedDateReminders.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Reminders
                  </h3>
                  {selectedDateReminders.map((reminder) => (
                    <Card key={reminder.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{reminder.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(reminder.reminder_time), "h:mm a")}
                          </p>
                        </div>
                        {reminder.recurrence !== "none" && (
                          <Badge variant="secondary">{reminder.recurrence}</Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {selectedDateEntries.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Leaf className="h-4 w-4" />
                    Journal Entries
                  </h3>
                  {selectedDateEntries.map((entry) => {
                    const IconComponent = getIconComponent(entry.icon || 'leaf');
                    
                    return (
                    <Card key={entry.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-full bg-primary/10 flex-shrink-0">
                                <IconComponent className="h-4 w-4 text-primary" />
                              </div>
                              <p className="font-medium">
                                {entry.strain}
                                {entry.strain_2 && <span className="text-muted-foreground"> + {entry.strain_2}</span>}
                              </p>
                            </div>
                            <button
                              onClick={() => openTimeEditDialog(entry.id, entry.consumption_time || entry.created_at)}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer ml-8"
                            >
                              <Clock className="h-3 w-3" />
                              <span className="hover:underline">
                                {format(parseISO(entry.consumption_time || entry.created_at), "p")}
                              </span>
                            </button>
                          </div>
                          <div className="flex gap-1">
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openNotesDialog(entry)}
                                  className="h-8 w-8 p-0"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </SheetTrigger>
                              <SheetContent>
                                <SheetHeader>
                                  <SheetTitle>
                                    Notes for {entry.strain}
                                    {entry.strain_2 && <span> + {entry.strain_2}</span>}
                                  </SheetTitle>
                                </SheetHeader>
                                <div className="mt-4 space-y-4">
                                  <Textarea
                                    placeholder="Add your personal notes here..."
                                    value={editingNotes}
                                    onChange={(e) => setEditingNotes(e.target.value)}
                                    className="min-h-[200px]"
                                  />
                                  <Button onClick={saveNotes} className="w-full">
                                    Save Notes
                                  </Button>
                                </div>
                              </SheetContent>
                            </Sheet>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteEntry(entry.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <Badge variant="outline">{entry.dosage}</Badge>
                          <Badge 
                            variant="outline" 
                            className={`flex items-center gap-1 cursor-pointer transition-all hover:scale-105 hover:opacity-80 ${
                              filterMethods.includes(entry.method) ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => {
                              setFilterMethods(prev => 
                                prev.includes(entry.method) 
                                  ? prev.filter(m => m !== entry.method)
                                  : [...prev, entry.method]
                              );
                            }}
                            title={filterMethods.includes(entry.method) ? "Click to remove filter" : "Click to add filter"}
                          >
                            {(() => {
                              const MethodIcon = getMethodIcon(entry.method);
                              return <MethodIcon className="h-3 w-3" />;
                            })()}
                            {entry.method}
                          </Badge>
                          {entry.thc_percentage != null && (
                            <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400">
                              THC {entry.thc_percentage}%
                            </Badge>
                          )}
                          {entry.cbd_percentage != null && (
                            <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400">
                              CBD {entry.cbd_percentage}%
                            </Badge>
                          )}
                        </div>
                        
                        {/* Before/After Metrics & Effectiveness */}
                        {entry.before_mood && entry.after_mood && entry.entry_status !== 'pending_after' && (
                          <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold">Effectiveness</span>
                              {(() => {
                                const effectiveness = calculateEffectiveness(entry);
                                return (
                                  <Badge className={`${effectiveness.color} text-white text-xs`}>
                                    {effectiveness.label} ({effectiveness.score}%)
                                  </Badge>
                                );
                              })()}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Mood:</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">{entry.before_mood}</span>
                                  <span>→</span>
                                  <span className="font-semibold">{entry.after_mood}</span>
                                  {entry.after_mood !== entry.before_mood && (
                                    <span className={`text-xs font-bold ${entry.after_mood > entry.before_mood ? 'text-green-500' : 'text-red-500'}`}>
                                      {entry.after_mood > entry.before_mood ? '↑' : '↓'}{Math.abs(entry.after_mood - entry.before_mood)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Pain:</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">{entry.before_pain}</span>
                                  <span>→</span>
                                  <span className="font-semibold">{entry.after_pain}</span>
                                  {entry.after_pain !== entry.before_pain && (
                                    <span className={`text-xs font-bold ${entry.after_pain! < entry.before_pain! ? 'text-green-500' : 'text-red-500'}`}>
                                      {entry.after_pain! < entry.before_pain! ? '↓' : '↑'}{Math.abs(entry.after_pain! - entry.before_pain!)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Anxiety:</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">{entry.before_anxiety}</span>
                                  <span>→</span>
                                  <span className="font-semibold">{entry.after_anxiety}</span>
                                  {entry.after_anxiety !== entry.before_anxiety && (
                                    <span className={`text-xs font-bold ${entry.after_anxiety! < entry.before_anxiety! ? 'text-green-500' : 'text-red-500'}`}>
                                      {entry.after_anxiety! < entry.before_anxiety! ? '↓' : '↑'}{Math.abs(entry.after_anxiety! - entry.before_anxiety!)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Energy:</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">{entry.before_energy}</span>
                                  <span>→</span>
                                  <span className="font-semibold">{entry.after_energy}</span>
                                  {entry.after_energy !== entry.before_energy && (
                                    <span className={`text-xs font-bold ${entry.after_energy! > entry.before_energy! ? 'text-green-500' : 'text-red-500'}`}>
                                      {entry.after_energy! > entry.before_energy! ? '↑' : '↓'}{Math.abs(entry.after_energy! - entry.before_energy!)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between col-span-2">
                                <span className="text-muted-foreground">Focus:</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">{entry.before_focus}</span>
                                  <span>→</span>
                                  <span className="font-semibold">{entry.after_focus}</span>
                                  {entry.after_focus !== entry.before_focus && (
                                    <span className={`text-xs font-bold ${entry.after_focus! > entry.before_focus! ? 'text-green-500' : 'text-red-500'}`}>
                                      {entry.after_focus! > entry.before_focus! ? '↑' : '↓'}{Math.abs(entry.after_focus! - entry.before_focus!)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {entry.observations.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {entry.observations.map((obs, idx) => (
                              <Badge 
                                key={idx} 
                                className={`text-xs cursor-pointer transition-all hover:scale-105 hover:opacity-80 ${
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
                                title={filterObservations.includes(obs) ? "Click to remove filter" : "Click to add filter"}
                              >
                                {obs}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {entry.activities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {entry.activities.map((activity, idx) => (
                              <Badge 
                                key={idx} 
                                className={`text-xs cursor-pointer transition-all hover:scale-105 hover:opacity-80 ${
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
                                title={filterActivities.includes(activity) ? "Click to remove filter" : "Click to add filter"}
                              >
                                {activity}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {entry.negative_side_effects.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {entry.negative_side_effects.map((effect, idx) => (
                              <Badge 
                                key={idx} 
                                className={`text-xs cursor-pointer transition-all hover:scale-105 hover:opacity-80 ${
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
                                title={filterSideEffects.includes(effect) ? "Click to remove filter" : "Click to add filter"}
                              >
                                {effect}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground italic">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

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
              <Label htmlFor="calendar-edit-date">Date</Label>
              <Input
                id="calendar-edit-date"
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
              <Label htmlFor="calendar-edit-time">Time</Label>
              <Input
                id="calendar-edit-time"
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
    </div>
  );
};
