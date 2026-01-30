import { useCallback } from "react";
import { useEncryption } from "@/contexts/EncryptionContext";
import { JournalEntry } from "@/types/journal";
import { SensitiveJournalFields, EncryptedData } from "@/lib/crypto";

/**
 * Hook to encrypt/decrypt journal entries
 * Wraps the encryption context with journal-specific helpers
 */
export const useEncryptedJournal = () => {
  const { encrypt, decrypt, isUnlocked, encryptionEnabled } = useEncryption();

  /**
   * Extract sensitive fields from a journal entry
   */
  const extractSensitiveFields = useCallback((entry: Partial<JournalEntry>): SensitiveJournalFields => {
    return {
      strain: entry.strain || "",
      strain_2: entry.strain_2,
      notes: entry.notes,
      before_notes: entry.before_notes,
      observations: entry.observations || [],
      activities: entry.activities || [],
      negative_side_effects: entry.negative_side_effects || [],
      dosage: entry.dosage || "",
      before_mood: entry.before_mood,
      before_pain: entry.before_pain,
      before_anxiety: entry.before_anxiety,
      before_energy: entry.before_energy,
      before_focus: entry.before_focus,
      after_mood: entry.after_mood,
      after_pain: entry.after_pain,
      after_anxiety: entry.after_anxiety,
      after_energy: entry.after_energy,
      after_focus: entry.after_focus,
      effects_duration_minutes: entry.effects_duration_minutes,
      thc_percentage: entry.thc_percentage,
      cbd_percentage: entry.cbd_percentage,
      method: entry.method || "",
      icon: entry.icon || "leaf",
    };
  }, []);

  /**
   * Merge decrypted fields back into entry
   */
  const mergeDecryptedFields = useCallback((
    entry: JournalEntry, 
    decrypted: SensitiveJournalFields
  ): JournalEntry => {
    return {
      ...entry,
      strain: decrypted.strain,
      strain_2: decrypted.strain_2,
      notes: decrypted.notes,
      before_notes: decrypted.before_notes,
      observations: decrypted.observations,
      activities: decrypted.activities,
      negative_side_effects: decrypted.negative_side_effects,
      dosage: decrypted.dosage,
      before_mood: decrypted.before_mood,
      before_pain: decrypted.before_pain,
      before_anxiety: decrypted.before_anxiety,
      before_energy: decrypted.before_energy,
      before_focus: decrypted.before_focus,
      after_mood: decrypted.after_mood,
      after_pain: decrypted.after_pain,
      after_anxiety: decrypted.after_anxiety,
      after_energy: decrypted.after_energy,
      after_focus: decrypted.after_focus,
      effects_duration_minutes: decrypted.effects_duration_minutes,
      thc_percentage: decrypted.thc_percentage,
      cbd_percentage: decrypted.cbd_percentage,
      method: decrypted.method,
      icon: decrypted.icon,
    };
  }, []);

  /**
   * Encrypt entry data for storage
   * Returns the encrypted data blob and placeholder values for sensitive fields
   */
  const encryptEntry = useCallback(async (
    entry: Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>
  ): Promise<{
    encryptedData: string;
    encryptionVersion: number;
    sanitizedEntry: Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>;
  } | null> => {
    if (!encryptionEnabled || !isUnlocked) {
      return null;
    }

    const sensitiveFields = extractSensitiveFields(entry);
    const encrypted = await encrypt(sensitiveFields);
    
    if (!encrypted) {
      return null;
    }

    // Return sanitized entry with placeholders
    return {
      encryptedData: JSON.stringify(encrypted),
      encryptionVersion: 1,
      sanitizedEntry: {
        ...entry,
        strain: "[encrypted]",
        strain_2: null,
        notes: null,
        before_notes: null,
        observations: [],
        activities: [],
        negative_side_effects: [],
        dosage: "[encrypted]",
        before_mood: null,
        before_pain: null,
        before_anxiety: null,
        before_energy: null,
        before_focus: null,
        after_mood: null,
        after_pain: null,
        after_anxiety: null,
        after_energy: null,
        after_focus: null,
        effects_duration_minutes: null,
        thc_percentage: null,
        cbd_percentage: null,
        method: "[encrypted]",
        icon: null,
      },
    };
  }, [encryptionEnabled, isUnlocked, extractSensitiveFields, encrypt]);

  /**
   * Decrypt an entry that has encrypted_data
   */
  const decryptEntry = useCallback(async (entry: JournalEntry & { encrypted_data?: string | null }): Promise<JournalEntry> => {
    // If no encrypted data or not unlocked, return as-is
    if (!entry.encrypted_data || !isUnlocked) {
      return entry;
    }

    try {
      const encrypted: EncryptedData = JSON.parse(entry.encrypted_data);
      const decrypted = await decrypt(encrypted);
      
      if (!decrypted) {
        return entry;
      }

      return mergeDecryptedFields(entry, decrypted);
    } catch (error) {
      console.error("Failed to decrypt entry:", error);
      return entry;
    }
  }, [isUnlocked, decrypt, mergeDecryptedFields]);

  /**
   * Decrypt multiple entries
   */
  const decryptEntries = useCallback(async (
    entries: (JournalEntry & { encrypted_data?: string | null })[]
  ): Promise<JournalEntry[]> => {
    if (!isUnlocked) {
      return entries;
    }

    return Promise.all(entries.map(decryptEntry));
  }, [isUnlocked, decryptEntry]);

  /**
   * Check if an entry is encrypted
   */
  const isEntryEncrypted = useCallback((entry: JournalEntry & { encrypted_data?: string | null }): boolean => {
    return !!entry.encrypted_data;
  }, []);

  return {
    encryptEntry,
    decryptEntry,
    decryptEntries,
    isEntryEncrypted,
    canEncrypt: encryptionEnabled && isUnlocked,
    needsUnlock: encryptionEnabled && !isUnlocked,
  };
};
