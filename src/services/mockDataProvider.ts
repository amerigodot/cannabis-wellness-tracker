import { JournalEntry } from "@/types/journal";
import { SAMPLE_ENTRIES } from "@/data/sampleEntries";

const STORAGE_KEY = "local_journal_entries";

export const mockDataProvider = {
  /**
   * Initialize local storage with sample data if empty
   */
  init: () => {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_ENTRIES));
    }
  },

  /**
   * Fetch all entries (simulating a database select)
   */
  getAllEntries: (): JournalEntry[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  /**
   * Add a new entry
   */
  createEntry: (entry: Omit<JournalEntry, "id" | "created_at" | "updated_at">): JournalEntry => {
    const entries = mockDataProvider.getAllEntries();
    const newEntry: JournalEntry = {
      ...entry,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: "demo-user",
      is_deleted: false
    };
    
    const updatedEntries = [newEntry, ...entries];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    return newEntry;
  },

  /**
   * Update an entry
   */
  updateEntry: (id: string, updates: Partial<JournalEntry>): JournalEntry | null => {
    const entries = mockDataProvider.getAllEntries();
    const index = entries.findIndex(e => e.id === id);
    
    if (index === -1) return null;
    
    const updatedEntry = { ...entries[index], ...updates, updated_at: new Date().toISOString() };
    entries[index] = updatedEntry;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return updatedEntry;
  },

  /**
   * Delete (Soft delete)
   */
  deleteEntry: (id: string): boolean => {
    const entries = mockDataProvider.getAllEntries();
    const filtered = entries.filter(e => e.id !== id); // Hard delete for mock simplicity, or soft if preferred
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },
  
  /**
   * Reset to default samples
   */
  reset: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_ENTRIES));
  }
};
