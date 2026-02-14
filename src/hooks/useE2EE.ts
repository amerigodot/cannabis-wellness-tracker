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

    // Try e2ee_vault first, fallback to user_encryption_salts
    let { data, error } = await supabase
      .from("e2ee_vault")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (error && (error.code === 'PGRST205' || error.code === 'PGRST204')) {
      // Table missing or schema cache error, check user_encryption_salts for JSON-blob vault
      try {
        const { data: saltData } = await supabase
          .from("user_encryption_salts")
          .select("password_salt")
          .eq("user_id", user.id)
          .single();
        
        if (saltData?.password_salt?.startsWith("VAULT_V3:")) {
          data = { user_id: user.id } as any;
        }
      } catch (e) {
        console.error("Resilient check failed:", e);
      }
    }

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

      const vaultData = {
        public_key: publicKeyJWK,
        wrapped_private_key: JSON.stringify({ encryptedKey, iv }),
        password_salt: salt,
        vault_version: 3
      };

      // 5. Try saving to fresh e2ee_vault table
      const { error: vaultError } = await supabase.from("e2ee_vault").upsert({
        user_id: user.id,
        ...vaultData
      });

      if (vaultError && (vaultError.code === 'PGRST205' || vaultError.code === 'PGRST204')) {
        // Fallback: Store as JSON blob in user_encryption_salts.password_salt
        const jsonVault = "VAULT_V3:" + btoa(JSON.stringify(vaultData));
        const { error: saltError } = await supabase.from("user_encryption_salts").upsert({
          user_id: user.id,
          password_salt: jsonVault,
          key_version: 3
        });
        if (saltError) throw saltError;
      } else if (vaultError) {
        throw vaultError;
      }

      setKeys({ publicKey: keyPair.publicKey, privateKey: keyPair.privateKey });
      toast.success("Security Vault initialized! (Resilient Storage Active)");
      return true;
    } catch (error) {
      console.error("Vault setup error:", error);
      toast.error("Failed to setup E2EE vault. Database schema sync issues detected.");
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

      let vault: any = null;

      // 1. Try e2ee_vault
      const { data: vData, error: vError } = await supabase
        .from("e2ee_vault")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (!vError && vData) {
        vault = vData;
      } else {
        // 2. Try user_encryption_salts JSON blob
        const { data: sData } = await supabase
          .from("user_encryption_salts")
          .select("password_salt")
          .eq("user_id", user.id)
          .single();
        
        if (sData?.password_salt?.startsWith("VAULT_V3:")) {
          const raw = sData.password_salt.substring(9);
          vault = JSON.parse(atob(raw));
        }
      }

      if (!vault) throw new Error("Vault not found in any storage provider");

      // 1. Import public key
      const publicKey = await crypto.importKeyJWK(vault.public_key, "public");

      // 2. Unwrap private key
      const wrappingKey = await crypto.deriveKey(passphrase, vault.password_salt);
      const { encryptedKey, iv } = JSON.parse(vault.wrapped_private_key);
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
