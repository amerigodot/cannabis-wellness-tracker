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
  generateAsymmetricKeyPair,
  exportKeyJWK,
  importKeyJWK,
  encryptPrivateKey,
  decryptPrivateKey,
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
  
  // Keys
  const [wrappingKey, setWrappingKey] = useState<CryptoKey | null>(null); // V1 Symmetric Key & V2 Key Wrapper
  const [publicKey, setPublicKey] = useState<CryptoKey | null>(null);     // V2 Public Key
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);   // V2 Private Key
  
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
          .select("password_salt, key_version, public_key")
          .eq("user_id", session.user.id)
          .single();

        if (saltData) {
          setEncryptionEnabled(true);
          setUserSalt(saltData.password_salt);
          
          // Import Public Key if available
          if (saltData.public_key) {
            try {
              const importedPub = await importKeyJWK(saltData.public_key, "public");
              setPublicKey(importedPub);
            } catch (e) {
              console.error("Failed to import public key:", e);
            }
          }

          // Check if we have stored key material in session
          const stored = getStoredKeyMaterial();
          if (stored && stored.salt === saltData.password_salt) {
             // Session exists, but we require explicit unlock for security
            setIsUnlocked(false);
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

      // 1. Generate new salt
      const salt = generateSalt();

      // 2. Derive Wrapping Key (AES) from password
      const wrapperKey = await deriveKeyFromPassword(password, salt);

      // 3. Generate Asymmetric Key Pair (RSA)
      const keyPair = await generateAsymmetricKeyPair();
      
      // 4. Wrap (Encrypt) Private Key
      const { encryptedKey, iv } = await encryptPrivateKey(keyPair.privateKey, wrapperKey);
      const encryptedPrivateKeyBlob = JSON.stringify({ encryptedKey, iv });

      // 5. Export Public Key
      const publicKeyJWK = await exportKeyJWK(keyPair.publicKey);

      // 6. Store in database
      const { error } = await supabase
        .from("user_encryption_salts")
        .upsert({
          user_id: session.user.id,
          password_salt: salt,
          key_version: 2, // Version 2 for Asymmetric
          public_key: publicKeyJWK,
          encrypted_private_key: encryptedPrivateKeyBlob
        });

      if (error) {
        console.error("Error storing encryption keys:", error);
        return false;
      }

      // Store key material in session
      const passwordHash = await hashPasswordForSession(password);
      storeKeyMaterial(passwordHash, salt);

      // Update State
      setWrappingKey(wrapperKey);
      setPublicKey(keyPair.publicKey);
      setPrivateKey(keyPair.privateKey);
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
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;

      // 1. Fetch encrypted private key
      const { data: keyData } = await supabase
        .from("user_encryption_salts")
        .select("encrypted_private_key, public_key, key_version")
        .eq("user_id", session.user.id)
        .single();

      // 2. Derive Wrapping Key
      const wrapperKey = await deriveKeyFromPassword(password, userSalt);
      setWrappingKey(wrapperKey);

      // 3. Decrypt Private Key (if available - V2)
      if (keyData?.encrypted_private_key) {
        try {
          const { encryptedKey, iv } = JSON.parse(keyData.encrypted_private_key);
          const unwrappedPrivateKey = await decryptPrivateKey(encryptedKey, iv, wrapperKey);
          setPrivateKey(unwrappedPrivateKey);
        } catch (e) {
          console.error("Failed to unwrap private key (wrong password?):", e);
          return false;
        }
      }

      // 4. Import Public Key if not already loaded
      if (keyData?.public_key && !publicKey) {
        const importedPub = await importKeyJWK(keyData.public_key, "public");
        setPublicKey(importedPub);
      }

      // Store for session
      const passwordHash = await hashPasswordForSession(password);
      storeKeyMaterial(passwordHash, userSalt);

      setIsUnlocked(true);
      return true;
    } catch (error) {
      console.error("Error unlocking:", error);
      return false;
    }
  }, [userSalt, publicKey]);

  // Lock (clear key from memory)
  const lock = useCallback(() => {
    setWrappingKey(null);
    setPrivateKey(null);
    // We keep publicKey as it's not sensitive
    setIsUnlocked(false);
    clearKeyMaterial();
  }, []);

  // Encrypt data
  const encrypt = useCallback(async (data: SensitiveJournalFields): Promise<EncryptedData | null> => {
    try {
      // Prefer V2 (Asymmetric)
      if (publicKey) {
        return await encryptData(publicKey, data);
      }
      
      // Fallback V1 (Symmetric)
      if (wrappingKey) {
        return await encryptData(wrappingKey, data);
      }

      console.error("No encryption key available");
      return null;
    } catch (error) {
      console.error("Encryption error:", error);
      return null;
    }
  }, [publicKey, wrappingKey]);

  // Decrypt data
  const decrypt = useCallback(async (encrypted: EncryptedData): Promise<SensitiveJournalFields | null> => {
    try {
      // V2 Decryption (Asymmetric)
      if (encrypted.version === 2) {
        if (!privateKey) throw new Error("Private key not unlocked");
        return await decryptData(privateKey, encrypted);
      }
      
      // V1 Decryption (Symmetric)
      if (wrappingKey) {
        return await decryptData(wrappingKey, encrypted);
      }

      throw new Error("No suitable decryption key available");
    } catch (error) {
      console.error("Decryption error:", error);
      return null;
    }
  }, [privateKey, wrappingKey]);

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
