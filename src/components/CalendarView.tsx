import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { format, isSameDay, parseISO } from "date-fns";
import { Leaf, Bell, FileText, Trash2, Pill, Droplet, Cigarette, Cookie, Coffee, Sparkles, Heart, Brain, Zap } from "lucide-react";
import { toast } from "sonner";

interface JournalEntry {
  id: string;
  created_at: string;
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
  setFilterSideEffects 
}: {
  filterObservations: string[];
  setFilterObservations: React.Dispatch<React.SetStateAction<string[]>>;
  filterActivities: string[];
  setFilterActivities: React.Dispatch<React.SetStateAction<string[]>>;
  filterSideEffects: string[];
  setFilterSideEffects: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string>("");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);

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
    };
    return iconMap[iconName] || Leaf;
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
      .select("id, created_at, strain, dosage, method, observations, activities, negative_side_effects, notes, icon")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

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
      isSameDay(parseISO(entry.created_at), date)
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
      dates.add(format(parseISO(entry.created_at), "yyyy-MM-dd"));
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
    });
    
    filteredEntries.forEach((entry) => {
      dates.add(format(parseISO(entry.created_at), "yyyy-MM-dd"));
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
    return true;
  }) : [];
  const selectedDateReminders = selectedDate ? getRemindersForDate(selectedDate) : [];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Calendar</CardTitle>
            {(filterObservations.length > 0 || filterActivities.length > 0 || filterSideEffects.length > 0) && (
              <Badge variant="secondary" className="text-xs">
                {filterObservations.length + filterActivities.length + filterSideEffects.length} filter(s) active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {(filterObservations.length > 0 || filterActivities.length > 0 || filterSideEffects.length > 0) && (
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
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-primary/10 flex-shrink-0">
                              <IconComponent className="h-4 w-4 text-primary" />
                            </div>
                            <p className="font-medium">{entry.strain}</p>
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
                          <Badge variant="outline">{entry.method}</Badge>
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
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(entry.created_at), "h:mm a")}
                        </p>
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
    </div>
  );
};
