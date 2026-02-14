import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as crypto from "@/lib/crypto";
import { toast } from "sonner";

interface VaultStatus {
  hasVault: boolean;
  isUnlocked: boolean;
  loading: boolean;
}

export function useE2EE() {
  const [status, setVaultStatus] = useState<VaultStatus>({
    hasVault: false,
    isUnlocked: false,
    loading: true,
  });
  const [keys, setKeys] = useState<{ publicKey: CryptoKey; privateKey: CryptoKey } | null>(null);

  const checkVault = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setVaultStatus({ hasVault: false, isUnlocked: false, loading: false });
      return;
    }

    const { data, error } = await supabase
      .from("user_encryption_salts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    setVaultStatus({
      hasVault: !!data,
      isUnlocked: !!keys,
      loading: false,
    });
  }, [keys]);

  useEffect(() => {
    checkVault();
  }, [checkVault]);

  /**
   * Setup a new vault with a passphrase.
   */
  const setupVault = async (passphrase: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Generate new 4096-bit key pair
      const keyPair = await crypto.generateAsymmetricKeyPair();
      
      // 2. Derive Wrapping Key from passphrase
      const salt = crypto.generateSalt();
      const wrappingKey = await crypto.deriveKey(passphrase, salt);

      // 3. Wrap private key
      const { encryptedKey, iv } = await crypto.encryptPrivateKey(keyPair.privateKey, wrappingKey);
      
      // 4. Export public key
      const publicKeyJWK = await crypto.exportKeyJWK(keyPair.publicKey);

      // 5. Save to Supabase (using existing user_encryption_salts table)
      const { error } = await supabase.from("user_encryption_salts").upsert({
        user_id: user.id,
        password_salt: salt,
        public_key: publicKeyJWK,
        encrypted_private_key: JSON.stringify({ encryptedKey, iv }),
        key_version: 2
      });

      if (error) throw error;

      setKeys({ publicKey: keyPair.publicKey, privateKey: keyPair.privateKey });
      toast.success("End-to-End Encryption enabled! Your keys are secure.");
      return true;
    } catch (error) {
      console.error("Vault setup error:", error);
      toast.error("Failed to setup E2EE vault");
      return false;
    }
  };

  /**
   * Unlock existing vault with passphrase.
   */
  const unlockVault = async (passphrase: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_encryption_salts")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error || !data) throw new Error("Vault not found");

      // 1. Import public key
      const publicKey = await crypto.importKeyJWK(data.public_key, "public");

      // 2. Unwrap private key
      const wrappingKey = await crypto.deriveKey(passphrase, data.password_salt);
      const { encryptedKey, iv } = JSON.parse(data.encrypted_private_key);
      const privateKey = await crypto.decryptPrivateKey(encryptedKey, iv, wrappingKey);

      setKeys({ publicKey, privateKey });
      toast.success("Vault unlocked. Journal decrypted.");
      return true;
    } catch (error) {
      console.error("Vault unlock error:", error);
      toast.error("Invalid passphrase. Could not decrypt private key.");
      return false;
    }
  };

  /**
   * Helper to encrypt a journal entry payload
   */
  const encryptPayload = useCallback(async (data: object) => {
    if (!keys?.publicKey) throw new Error("Vault locked");
    const encrypted = await crypto.encryptData(keys.publicKey, data as any);
    
    return {
      encrypted_payload: encrypted.ciphertext,
      wrapped_aes_key: encrypted.encryptedKey,
      encryption_iv: encrypted.iv,
    };
  }, [keys]);

  /**
   * Helper to decrypt a journal entry payload
   */
  const decryptPayload = useCallback(async (encrypted: { payload: string; wrappedKey: string; iv: string }) => {
    if (!keys?.privateKey) throw new Error("Vault locked");
    
    const decrypted = await crypto.decryptData(
      keys.privateKey,
      {
        ciphertext: encrypted.payload,
        encryptedKey: encrypted.wrappedKey,
        iv: encrypted.iv,
        version: 2
      }
    );

    return decrypted;
  }, [keys]);

  return {
    ...status,
    setupVault,
    unlockVault,
    encryptPayload,
    decryptPayload,
    isLocked: !keys,
  };
}
