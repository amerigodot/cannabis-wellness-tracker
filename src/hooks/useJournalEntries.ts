import { useState, useEffect, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { JournalEntry } from "@/types/journal";
import { SAMPLE_ENTRIES } from "@/data/sampleEntries";
import { toast } from "sonner";
import { triggerMilestoneCelebration, MILESTONES, MILESTONE_DETAILS } from "@/utils/milestones";
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, isWithinInterval, parseISO } from "date-fns";

export type TimeRangeFilter = 'all' | 'today' | 'week' | 'month';

export interface UseJournalEntriesReturn {
  entries: JournalEntry[];
  loading: boolean;
  isDemoMode: boolean;
  filteredEntries: JournalEntry[];
  // CRUD operations
  createEntry: (entryData: Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;
  updateEntry: (entryId: string, updates: Partial<JournalEntry>) => Promise<boolean>;
  deleteEntry: (entryId: string) => Promise<boolean>;
  // Notes operations
  updateNotes: (entryId: string, notes: string) => Promise<boolean>;
  // Time operations
  updateConsumptionTime: (entryId: string, time: Date) => Promise<boolean>;
  // Filtering
  filterObservations: string[];
  setFilterObservations: (filters: string[]) => void;
  filterActivities: string[];
  setFilterActivities: (filters: string[]) => void;
  filterSideEffects: string[];
  setFilterSideEffects: (filters: string[]) => void;
  filterMethods: string[];
  setFilterMethods: (filters: string[]) => void;
  timeRangeFilter: TimeRangeFilter;
  setTimeRangeFilter: (filter: TimeRangeFilter) => void;
  // Refetch
  refetchEntries: () => Promise<void>;
}

export const useJournalEntries = (user: User | null): UseJournalEntriesReturn => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Filters
  const [filterObservations, setFilterObservations] = useState<string[]>([]);
  const [filterActivities, setFilterActivities] = useState<string[]>([]);
  const [filterSideEffects, setFilterSideEffects] = useState<string[]>([]);
  const [filterMethods, setFilterMethods] = useState<string[]>([]);
  const [timeRangeFilter, setTimeRangeFilter] = useState<TimeRangeFilter>('all');

  // Check demo mode on mount
  useEffect(() => {
    const demoMode = localStorage.getItem("demoMode") === "true";
    setIsDemoMode(demoMode);
    
    if (demoMode) {
      setEntries(SAMPLE_ENTRIES);
      setLoading(false);
    }
  }, []);

  // Fetch entries when user changes
  useEffect(() => {
    if (isDemoMode) return;
    
    if (user) {
      fetchEntries();
    } else {
      setLoading(false);
    }
  }, [user, isDemoMode]);

  // Set up realtime subscription
  useEffect(() => {
    if (isDemoMode) return;

    const channel = supabase
      .channel('journal-entries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journal_entries'
        },
        () => {
          fetchEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isDemoMode]);

  const fetchEntries = useCallback(async () => {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("is_deleted", false)
      .order("consumption_time", { ascending: false });

    if (error) {
      toast.error("Error loading entries: " + error.message);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  }, []);

  const isEntryInTimeRange = useCallback((entry: JournalEntry) => {
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
  }, [timeRangeFilter]);

  // Filtered entries
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

  const createEntry = useCallback(async (entryData: Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    if (isDemoMode) {
      toast.error("Demo mode is read-only. Sign up to save entries!");
      return false;
    }

    if (!user) return false;

    const previousEntryCount = entries.length;

    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      ...entryData
    });

    if (error) {
      toast.error("Error saving entry: " + error.message);
      return false;
    }

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
    } else if (entryData.entry_status === 'pending_after') {
      toast.success("Entry saved! Complete the 'After' state when ready.", {
        description: "You'll be reminded to complete it soon.",
        duration: 5000,
      });
    } else {
      toast.success("Entry saved successfully! 🎉");
    }

    await fetchEntries();
    return true;
  }, [isDemoMode, user, entries.length, fetchEntries]);

  const updateEntry = useCallback(async (entryId: string, updates: Partial<JournalEntry>): Promise<boolean> => {
    if (isDemoMode) {
      toast.error("Demo mode is read-only. Sign up to make changes!");
      return false;
    }

    const { error } = await supabase
      .from("journal_entries")
      .update(updates)
      .eq("id", entryId);

    if (error) {
      toast.error("Error updating entry: " + error.message);
      return false;
    }

    await fetchEntries();
    return true;
  }, [isDemoMode, fetchEntries]);

  const deleteEntry = useCallback(async (entryId: string): Promise<boolean> => {
    if (isDemoMode) {
      toast.error("Demo mode is read-only. Sign up to make changes!");
      return false;
    }

    const { error } = await supabase
      .from("journal_entries")
      .update({ is_deleted: true })
      .eq("id", entryId);

    if (error) {
      toast.error("Error deleting entry: " + error.message);
      return false;
    }

    toast.success("Entry moved to trash");
    await fetchEntries();
    return true;
  }, [isDemoMode, fetchEntries]);

  const updateNotes = useCallback(async (entryId: string, notes: string): Promise<boolean> => {
    if (isDemoMode) {
      toast.error("Demo mode is read-only. Sign up to make changes!");
      return false;
    }

    const { error } = await supabase
      .from("journal_entries")
      .update({ notes })
      .eq("id", entryId);

    if (error) {
      toast.error("Error updating notes: " + error.message);
      return false;
    }

    toast.success("Notes updated successfully!");
    await fetchEntries();
    return true;
  }, [isDemoMode, fetchEntries]);

  const updateConsumptionTime = useCallback(async (entryId: string, time: Date): Promise<boolean> => {
    if (isDemoMode) {
      toast.error("Demo mode is read-only. Sign up to make changes!");
      return false;
    }

    const { error } = await supabase
      .from("journal_entries")
      .update({ consumption_time: time.toISOString() })
      .eq("id", entryId);

    if (error) {
      toast.error("Error updating time: " + error.message);
      return false;
    }

    toast.success("Consumption time updated!");
    await fetchEntries();
    return true;
  }, [isDemoMode, fetchEntries]);

  return {
    entries,
    loading,
    isDemoMode,
    filteredEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    updateNotes,
    updateConsumptionTime,
    filterObservations,
    setFilterObservations,
    filterActivities,
    setFilterActivities,
    filterSideEffects,
    setFilterSideEffects,
    filterMethods,
    setFilterMethods,
    timeRangeFilter,
    setTimeRangeFilter,
    refetchEntries: fetchEntries,
  };
};
