import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { JournalEntry } from "@/types/journal";
import { toast } from "sonner";
import { triggerMilestoneCelebration, MILESTONES, MILESTONE_DETAILS } from "@/utils/milestones";

const PAGE_SIZE = 20;

interface FetchEntriesParams {
  pageParam?: number;
  userId: string;
}

interface EntriesPage {
  entries: JournalEntry[];
  nextCursor: number | null;
  totalCount: number;
}

const fetchEntriesPage = async ({ pageParam = 0, userId }: FetchEntriesParams): Promise<EntriesPage> => {
  const from = pageParam * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Get total count first
  const { count } = await supabase
    .from("journal_entries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_deleted", false);

  // Fetch page of entries
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("is_deleted", false)
    .order("consumption_time", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const totalCount = count || 0;
  const hasMore = from + PAGE_SIZE < totalCount;

  return {
    entries: data || [],
    nextCursor: hasMore ? pageParam + 1 : null,
    totalCount,
  };
};

export const useInfiniteJournalEntries = (user: User | null, isDemoMode: boolean) => {
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["journal-entries", user?.id],
    queryFn: ({ pageParam }) => fetchEntriesPage({ pageParam, userId: user!.id }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled: !!user && !isDemoMode,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Flatten all pages into a single array
  const entries = data?.pages.flatMap((page) => page.entries) || [];
  const totalCount = data?.pages[0]?.totalCount || 0;

  // Create entry mutation
  const createMutation = useMutation({
    mutationFn: async (entryData: Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase.from("journal_entries").insert({
        user_id: user.id,
        ...entryData
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      const previousEntryCount = totalCount;
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
      } else if (variables.entry_status === 'pending_after') {
        toast.success("Entry saved! Complete the 'After' state when ready.", {
          description: "You'll be reminded to complete it soon.",
          duration: 5000,
        });
      } else {
        toast.success("Entry saved successfully! 🎉");
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
    onError: (error: Error) => {
      toast.error("Error saving entry: " + error.message);
    },
  });

  // Update entry mutation
  const updateMutation = useMutation({
    mutationFn: async ({ entryId, updates }: { entryId: string; updates: Partial<JournalEntry> }) => {
      const { error } = await supabase
        .from("journal_entries")
        .update(updates)
        .eq("id", entryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
    onError: (error: Error) => {
      toast.error("Error updating entry: " + error.message);
    },
  });

  // Delete entry mutation (soft delete)
  const deleteMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from("journal_entries")
        .update({ is_deleted: true })
        .eq("id", entryId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Entry moved to trash");
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
    onError: (error: Error) => {
      toast.error("Error deleting entry: " + error.message);
    },
  });

  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async ({ entryId, notes }: { entryId: string; notes: string }) => {
      const { error } = await supabase
        .from("journal_entries")
        .update({ notes })
        .eq("id", entryId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Notes updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
    onError: (error: Error) => {
      toast.error("Error updating notes: " + error.message);
    },
  });

  // Update consumption time mutation
  const updateTimeMutation = useMutation({
    mutationFn: async ({ entryId, time }: { entryId: string; time: Date }) => {
      const { error } = await supabase
        .from("journal_entries")
        .update({ consumption_time: time.toISOString() })
        .eq("id", entryId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Consumption time updated!");
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
    onError: (error: Error) => {
      toast.error("Error updating time: " + error.message);
    },
  });

  return {
    entries,
    totalCount,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    // Mutations
    createEntry: async (entryData: Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>) => {
      if (isDemoMode) {
        toast.error("Demo mode is read-only. Sign up to save entries!");
        return false;
      }
      try {
        await createMutation.mutateAsync(entryData);
        return true;
      } catch {
        return false;
      }
    },
    updateEntry: async (entryId: string, updates: Partial<JournalEntry>) => {
      if (isDemoMode) {
        toast.error("Demo mode is read-only. Sign up to make changes!");
        return false;
      }
      try {
        await updateMutation.mutateAsync({ entryId, updates });
        return true;
      } catch {
        return false;
      }
    },
    deleteEntry: async (entryId: string) => {
      if (isDemoMode) {
        toast.error("Demo mode is read-only. Sign up to make changes!");
        return false;
      }
      try {
        await deleteMutation.mutateAsync(entryId);
        return true;
      } catch {
        return false;
      }
    },
    updateNotes: async (entryId: string, notes: string) => {
      if (isDemoMode) {
        toast.error("Demo mode is read-only. Sign up to make changes!");
        return false;
      }
      try {
        await updateNotesMutation.mutateAsync({ entryId, notes });
        return true;
      } catch {
        return false;
      }
    },
    updateConsumptionTime: async (entryId: string, time: Date) => {
      if (isDemoMode) {
        toast.error("Demo mode is read-only. Sign up to make changes!");
        return false;
      }
      try {
        await updateTimeMutation.mutateAsync({ entryId, time });
        return true;
      } catch {
        return false;
      }
    },
  };
};
