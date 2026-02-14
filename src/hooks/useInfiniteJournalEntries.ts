import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { JournalEntry } from "@/types/journal";
import { toast } from "sonner";
import { triggerMilestoneCelebration, MILESTONES, MILESTONE_DETAILS } from "@/utils/milestones";
import { useE2EE } from "./useE2EE";
import { useEffect, useState, useMemo } from "react";

const PAGE_SIZE = 20;

// ... fetchEntriesPage implementation ...

export const useInfiniteJournalEntries = (user: User | null, isDemoMode: boolean) => {
  const queryClient = useQueryClient();
  const { isUnlocked, encryptPayload, decryptPayload } = useE2EE();
  const [decryptedEntries, setDecryptedEntries] = useState<JournalEntry[]>([]);

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

  const rawEntries = useMemo(() => data?.pages.flatMap((page) => page.entries) || [], [data?.pages]);

  // Flatten and Decrypt entries
  useEffect(() => {
    let isMounted = true;

    const decryptAll = async () => {
      if (!rawEntries.length) {
        setDecryptedEntries([]);
        return;
      }

      const processed = await Promise.all(rawEntries.map(async (entry) => {
        if ((entry as any).is_encrypted && isUnlocked) {
          try {
            const decrypted = await decryptPayload({
              payload: (entry as any).encrypted_payload,
              wrappedKey: (entry as any).wrapped_aes_key,
              iv: (entry as any).encryption_iv
            });
            return { ...entry, ...decrypted };
          } catch (e) {
            console.error("Decryption failed for entry", entry.id, e);
            return { ...entry, strain: "[Encrypted - Unlock Vault]" };
          }
        }
        return entry;
      }));

      if (isMounted) {
        setDecryptedEntries(processed);
      }
    };

    decryptAll();

    return () => {
      isMounted = false;
    };
  }, [rawEntries, isUnlocked, decryptPayload]);

  const entries = decryptedEntries;
  const totalCount = data?.pages[0]?.totalCount || 0;

  // Create entry mutation
  const createMutation = useMutation({
    mutationFn: async (entryData: Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error("User not authenticated");
      
      const payload: Partial<JournalEntry> = { ...entryData };
      let e2eeFields = {};

      if (isUnlocked) {
        // Encrypt the sensitive fields
        const encrypted = await encryptPayload(entryData);
        e2eeFields = {
          is_encrypted: true,
          ...encrypted,
          // Zero out sensitive fields in plaintext columns for privacy
          strain: "Encrypted",
          dosage: "Encrypted",
          notes: null,
          observations: [],
          activities: [],
          negative_side_effects: []
        };
      }

      const { data, error } = await supabase.from("journal_entries").insert({
        user_id: user.id,
        ...payload,
        ...e2eeFields
      }).select().single();

      if (error) throw error;
      return data;
    },
    // ... rest of createMutation ...
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
