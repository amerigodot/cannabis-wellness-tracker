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
  dosage: string;
  method: string;
  observations: string[];
  activities: string[];
  negative_side_effects: string[];
  notes: string | null;
  icon: string;
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
  setFilterMethods
}: {
  filterObservations: string[];
  setFilterObservations: React.Dispatch<React.SetStateAction<string[]>>;
  filterActivities: string[];
  setFilterActivities: React.Dispatch<React.SetStateAction<string[]>>;
  filterSideEffects: string[];
  setFilterSideEffects: React.Dispatch<React.SetStateAction<string[]>>;
  filterMethods: string[];
  setFilterMethods: React.Dispatch<React.SetStateAction<string[]>>;
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
  const [timeRangeFilter, setTimeRangeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

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

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time subscription for all entry changes
  useEffect(() => {
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
  }, []);

  const fetchData = async () => {
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
    setEditingEntryId(entry.id);
    setEditingNotes(entry.notes || "");
  };

  const saveNotes = async () => {
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
    setEditingTimeEntryId(entryId);
    setEditingTime(new Date(currentTime));
  };

  const saveTimeEdit = async () => {
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
    setDeleteEntryId(entryId);
    setShowDeleteDialog(true);
  };

  const handlePermanentDelete = async () => {
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
    <div className="grid gap-6 md:grid-cols-2">
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
          <div className="flex gap-2 mt-4">
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
                              <p className="font-medium">{entry.strain}</p>
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
                                  <SheetTitle>Notes for {entry.strain}</SheetTitle>
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
                            className={`flex items-center gap-1 cursor-pointer transition-all hover:scale-105 ${
                              filterMethods.includes(entry.method) ? "ring-2 ring-primary" : ""
                            }`}
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
                              return <MethodIcon className="h-3 w-3" />;
                            })()}
                            {entry.method}
                          </Badge>
                        </div>
                        {entry.observations.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {entry.observations.map((obs, idx) => (
                              <Badge 
                                key={idx} 
                                className={`text-xs cursor-pointer transition-all hover:scale-105 ${
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
                        )}
                        {entry.activities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {entry.activities.map((activity, idx) => (
                              <Badge 
                                key={idx} 
                                className={`text-xs cursor-pointer transition-all hover:scale-105 ${
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
                        )}
                        {entry.negative_side_effects.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {entry.negative_side_effects.map((effect, idx) => (
                              <Badge 
                                key={idx} 
                                className={`text-xs cursor-pointer transition-all hover:scale-105 ${
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
