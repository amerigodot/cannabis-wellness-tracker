import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  deriveKeyFromPassword,
  generateSalt,
  hashPasswordForSession,
  storeKeyMaterial,
  getStoredKeyMaterial,
  clearKeyMaterial,
  encryptData,
  decryptData,
  SensitiveJournalFields,
  EncryptedData,
} from "@/lib/crypto";

interface EncryptionContextType {
  isUnlocked: boolean;
  isLoading: boolean;
  encryptionEnabled: boolean;
  unlockWithPassword: (password: string) => Promise<boolean>;
  setupEncryption: (password: string) => Promise<boolean>;
  lock: () => void;
  encrypt: (data: SensitiveJournalFields) => Promise<EncryptedData | null>;
  decrypt: (encrypted: EncryptedData) => Promise<SensitiveJournalFields | null>;
  needsMigration: boolean;
  setNeedsMigration: (value: boolean) => void;
}

const EncryptionContext = createContext<EncryptionContextType | null>(null);

export const useEncryption = () => {
  const context = useContext(EncryptionContext);
  if (!context) {
    throw new Error("useEncryption must be used within EncryptionProvider");
  }
  return context;
};

interface EncryptionProviderProps {
  children: React.ReactNode;
}

export const EncryptionProvider: React.FC<EncryptionProviderProps> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [userSalt, setUserSalt] = useState<string | null>(null);
  const [needsMigration, setNeedsMigration] = useState(false);

  // Check if user has encryption set up
  useEffect(() => {
    const checkEncryptionStatus = async () => {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if user has encryption salt (meaning encryption is set up)
        const { data: saltData } = await supabase
          .from("user_encryption_salts")
          .select("password_salt, key_version")
          .eq("user_id", session.user.id)
          .single();

        if (saltData) {
          setEncryptionEnabled(true);
          setUserSalt(saltData.password_salt);
          
          // Check if we have stored key material in session
          const stored = getStoredKeyMaterial();
          if (stored && stored.salt === saltData.password_salt) {
            // Re-derive key from stored password hash
            // Note: User needs to re-enter password after session ends
            setIsUnlocked(false); // Can't auto-unlock without password
          }
        } else {
          setEncryptionEnabled(false);
        }

        // Check if user has unencrypted entries (needs migration)
        const { data: entries } = await supabase
          .from("journal_entries")
          .select("id, encrypted_data")
          .eq("user_id", session.user.id)
          .is("encrypted_data", null)
          .limit(1);

        if (entries && entries.length > 0) {
          setNeedsMigration(true);
        }
      } catch (error) {
        console.error("Error checking encryption status:", error);
      }

      setIsLoading(false);
    };

    checkEncryptionStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkEncryptionStatus();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Set up encryption for the first time
  const setupEncryption = useCallback(async (password: string): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;

      // Generate new salt
      const salt = generateSalt();

      // Derive key from password
      const key = await deriveKeyFromPassword(password, salt);

      // Store salt in database
      const { error } = await supabase
        .from("user_encryption_salts")
        .upsert({
          user_id: session.user.id,
          password_salt: salt,
          key_version: 1,
        });

      if (error) {
        console.error("Error storing encryption salt:", error);
        return false;
      }

      // Store key material in session
      const passwordHash = await hashPasswordForSession(password);
      storeKeyMaterial(passwordHash, salt);

      setEncryptionKey(key);
      setUserSalt(salt);
      setEncryptionEnabled(true);
      setIsUnlocked(true);

      return true;
    } catch (error) {
      console.error("Error setting up encryption:", error);
      return false;
    }
  }, []);

  // Unlock with password
  const unlockWithPassword = useCallback(async (password: string): Promise<boolean> => {
    try {
      if (!userSalt) {
        console.error("No salt found for user");
        return false;
      }

      // Derive key from password
      const key = await deriveKeyFromPassword(password, userSalt);

      // Store for session
      const passwordHash = await hashPasswordForSession(password);
      storeKeyMaterial(passwordHash, userSalt);

      setEncryptionKey(key);
      setIsUnlocked(true);

      return true;
    } catch (error) {
      console.error("Error unlocking:", error);
      return false;
    }
  }, [userSalt]);

  // Lock (clear key from memory)
  const lock = useCallback(() => {
    setEncryptionKey(null);
    setIsUnlocked(false);
    clearKeyMaterial();
  }, []);

  // Encrypt data
  const encrypt = useCallback(async (data: SensitiveJournalFields): Promise<EncryptedData | null> => {
    if (!encryptionKey) {
      console.error("Encryption key not available");
      return null;
    }

    try {
      return await encryptData(encryptionKey, data);
    } catch (error) {
      console.error("Encryption error:", error);
      return null;
    }
  }, [encryptionKey]);

  // Decrypt data
  const decrypt = useCallback(async (encrypted: EncryptedData): Promise<SensitiveJournalFields | null> => {
    if (!encryptionKey) {
      console.error("Encryption key not available");
      return null;
    }

    try {
      return await decryptData(encryptionKey, encrypted);
    } catch (error) {
      console.error("Decryption error:", error);
      return null;
    }
  }, [encryptionKey]);

  return (
    <EncryptionContext.Provider
      value={{
        isUnlocked,
        isLoading,
        encryptionEnabled,
        unlockWithPassword,
        setupEncryption,
        lock,
        encrypt,
        decrypt,
        needsMigration,
        setNeedsMigration,
      }}
    >
      {children}
    </EncryptionContext.Provider>
  );
};

export default EncryptionProvider;
