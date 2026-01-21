import { useState, useEffect, useMemo, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { JournalEntry } from "@/types/journal";
import { SAMPLE_ENTRIES } from "@/data/sampleEntries";
import { useInfiniteJournalEntries } from "./useInfiniteJournalEntries";
import { mockDataProvider } from "@/services/mockDataProvider";
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, isWithinInterval, parseISO } from "date-fns";

export type TimeRangeFilter = 'all' | 'today' | 'week' | 'month';

export interface UseJournalEntriesReturn {
  entries: JournalEntry[];
  loading: boolean;
  isDemoMode: boolean;
  filteredEntries: JournalEntry[];
  totalCount: number;
  // Pagination
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  // CRUD operations
  createEntry: (data: Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;
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
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoEntries, setDemoEntries] = useState<JournalEntry[]>([]);
  
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
      mockDataProvider.init();
      setDemoEntries(mockDataProvider.getAllEntries());
    }
  }, []);

  // Use React Query infinite hook for real data
  const {
    entries: queryEntries,
    totalCount,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    createEntry,
    updateEntry,
    deleteEntry,
    updateNotes,
    updateConsumptionTime,
  } = useInfiniteJournalEntries(user, isDemoMode);

  // Use demo entries or query entries
  const entries = isDemoMode ? demoEntries : queryEntries;
  const loading = isDemoMode ? false : isLoading;

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

  // Filtered entries (memoized for performance)
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
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
  }, [entries, isEntryInTimeRange, filterObservations, filterActivities, filterSideEffects, filterMethods]);

  // Local/Demo Mode CRUD Operations
  const demoCreateEntry = async (data: Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>) => {
    const newEntry = mockDataProvider.createEntry(data);
    setDemoEntries(mockDataProvider.getAllEntries());
    return true;
  };

  const demoUpdateEntry = async (entryId: string, updates: Partial<JournalEntry>) => {
    mockDataProvider.updateEntry(entryId, updates);
    setDemoEntries(mockDataProvider.getAllEntries());
    return true;
  };

  const demoDeleteEntry = async (entryId: string) => {
    mockDataProvider.deleteEntry(entryId);
    setDemoEntries(mockDataProvider.getAllEntries());
    return true;
  };

  const demoUpdateNotes = async (entryId: string, notes: string) => {
    mockDataProvider.updateEntry(entryId, { notes });
    setDemoEntries(mockDataProvider.getAllEntries());
    return true;
  };

  const demoUpdateTime = async (entryId: string, time: Date) => {
    mockDataProvider.updateEntry(entryId, { consumption_time: time.toISOString() });
    setDemoEntries(mockDataProvider.getAllEntries());
    return true;
  };

  const handleRefetch = async () => {
    if (!isDemoMode) {
      await refetch();
    }
  };

  return {
    entries,
    loading,
    isDemoMode,
    filteredEntries,
    totalCount: isDemoMode ? demoEntries.length : totalCount,
    // Pagination
    fetchNextPage: isDemoMode ? () => {} : fetchNextPage,
    hasNextPage: isDemoMode ? false : (hasNextPage ?? false),
    isFetchingNextPage: isDemoMode ? false : isFetchingNextPage,
    // CRUD
    createEntry: isDemoMode ? demoCreateEntry : createEntry,
    updateEntry: isDemoMode ? demoUpdateEntry : updateEntry,
    deleteEntry: isDemoMode ? demoDeleteEntry : deleteEntry,
    updateNotes: isDemoMode ? demoUpdateNotes : updateNotes,
    updateConsumptionTime: isDemoMode ? demoUpdateTime : updateConsumptionTime,
    // Filters
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
    // Refetch
    refetchEntries: handleRefetch,
  };
};
