/**
 * Client-side encryption utilities using Web Crypto API
 * 
 * This module provides zero-knowledge encryption where:
 * - Keys are derived from user password using PBKDF2
 * - Data is encrypted with AES-256-GCM (Symmetric) or Hybrid (RSA+AES)
 * - Server never sees unencrypted private keys
 */

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

export interface EncryptedData {
  ciphertext: string; // Base64 encoded
  iv: string; // Base64 encoded
  encryptedKey?: string; // Base64 encoded (for V2 hybrid encryption)
  version: number;
}

export interface SensitiveJournalFields {
  strain: string;
  strain_2?: string | null;
  notes?: string | null;
  before_notes?: string | null;
  observations: string[];
  activities: string[];
  negative_side_effects: string[];
  dosage: string;
  // Mood scores are also sensitive health data
  before_mood?: number | null;
  before_pain?: number | null;
  before_anxiety?: number | null;
  before_energy?: number | null;
  before_focus?: number | null;
  after_mood?: number | null;
  after_pain?: number | null;
  after_anxiety?: number | null;
  after_energy?: number | null;
  after_focus?: number | null;
  effects_duration_minutes?: number | null;
  thc_percentage?: number | null;
  cbd_percentage?: number | null;
  method: string;
  icon: string;
}

/**
 * Generate a cryptographically secure random salt
 */
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return arrayBufferToBase64(salt);
}

/**
 * Derive an AES-256 key from password using PBKDF2
 */
export async function deriveKey(password: string, saltBase64: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const saltArray = base64ToArrayBuffer(saltBase64);
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // Derive AES-GCM key - copy salt to a new ArrayBuffer to avoid SharedArrayBuffer issues
  const saltBuffer = new ArrayBuffer(saltArray.byteLength);
  new Uint8Array(saltBuffer).set(saltArray);
  
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: KEY_LENGTH,
    },
    true, // Extractable (needed for wrapping private keys)
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
  );
}

/**
 * Generate RSA-OAEP Key Pair for Asymmetric Encryption
 */
export async function generateAsymmetricKeyPair(): Promise<CryptoKeyPair> {
  return await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true, // Extractable
    ["encrypt", "decrypt"]
  );
}

/**
 * Export key to JWK format (stringified)
 */
export async function exportKeyJWK(key: CryptoKey): Promise<string> {
  const jwk = await crypto.subtle.exportKey("jwk", key);
  return JSON.stringify(jwk);
}

/**
 * Import key from JWK format
 */
export async function importKeyJWK(jwkString: string, type: "public" | "private"): Promise<CryptoKey> {
  const jwk = JSON.parse(jwkString);
  return await crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    [type === "public" ? "encrypt" : "decrypt"]
  );
}

/**
 * Wrap (Encrypt) Private Key with Password-Derived Key
 */
export async function encryptPrivateKey(privateKey: CryptoKey, wrappingKey: CryptoKey): Promise<{ encryptedKey: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  const encrypted = await crypto.subtle.wrapKey(
    "jwk",
    privateKey,
    wrappingKey,
    {
      name: "AES-GCM",
      iv: iv,
    }
  );

  return {
    encryptedKey: arrayBufferToBase64(new Uint8Array(encrypted)),
    iv: arrayBufferToBase64(iv)
  };
}

/**
 * Unwrap (Decrypt) Private Key with Password-Derived Key
 */
export async function decryptPrivateKey(encryptedKeyBase64: string, ivBase64: string, wrappingKey: CryptoKey): Promise<CryptoKey> {
  const encryptedKey = base64ToArrayBuffer(encryptedKeyBase64);
  const iv = base64ToArrayBuffer(ivBase64);

  return await crypto.subtle.unwrapKey(
    "jwk",
    encryptedKey,
    wrappingKey,
    {
      name: "AES-GCM",
      iv: iv,
    },
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
}

/**
 * Encrypt sensitive journal fields
 * Supports V1 (Symmetric) and V2 (Hybrid Asymmetric)
 */
export async function encryptData(
  key: CryptoKey, // Can be AES (V1) or RSA Public Key (V2)
  data: SensitiveJournalFields
): Promise<EncryptedData> {
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(data));
  const ivArray = new Uint8Array(IV_LENGTH);
  crypto.getRandomValues(ivArray);
  const ivBuffer = ivArray.buffer;

  // Version 2: Hybrid Encryption (if key is RSA Public Key)
  if (key.algorithm.name === "RSA-OAEP") {
    // 1. Generate Ephemeral AES Key
    const ephemeralKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt"]
    );

    // 2. Encrypt Data with Ephemeral Key
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: ivBuffer },
      ephemeralKey,
      plaintext
    );

    // 3. Encrypt Ephemeral Key with RSA Public Key
    const rawEphemeralKey = await crypto.subtle.exportKey("raw", ephemeralKey);
    const encryptedKey = await crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      key,
      rawEphemeralKey
    );

    return {
      ciphertext: arrayBufferToBase64(new Uint8Array(ciphertext)),
      iv: arrayBufferToBase64(ivArray),
      encryptedKey: arrayBufferToBase64(new Uint8Array(encryptedKey)),
      version: 2,
    };
  } 
  
  // Version 1: Symmetric Encryption (Legacy)
  else {
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: ivBuffer },
      key,
      plaintext
    );

    return {
      ciphertext: arrayBufferToBase64(new Uint8Array(ciphertext)),
      iv: arrayBufferToBase64(ivArray),
      version: 1,
    };
  }
}

/**
 * Decrypt sensitive journal fields
 * Supports V1 (Symmetric) and V2 (Hybrid Asymmetric)
 */
export async function decryptData(
  key: CryptoKey, // AES Key (V1) or RSA Private Key (V2)
  encrypted: EncryptedData
): Promise<SensitiveJournalFields> {
  const decoder = new TextDecoder();
  const ciphertextArray = base64ToArrayBuffer(encrypted.ciphertext);
  const ivArray = base64ToArrayBuffer(encrypted.iv);
  
  let decryptedBuffer: ArrayBuffer;

  // Version 2: Hybrid Decryption
  if (encrypted.version === 2 && encrypted.encryptedKey && key.algorithm.name === "RSA-OAEP") {
    // 1. Decrypt Ephemeral Key with RSA Private Key
    const encryptedKeyBuffer = base64ToArrayBuffer(encrypted.encryptedKey);
    const ephemeralKeyRaw = await crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      key,
      encryptedKeyBuffer
    );

    // 2. Import Ephemeral Key
    const ephemeralKey = await crypto.subtle.importKey(
      "raw",
      ephemeralKeyRaw,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    // 3. Decrypt Data with Ephemeral Key
    decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivArray },
      ephemeralKey,
      ciphertextArray
    );
  } 
  
  // Version 1: Symmetric Decryption
  else {
    decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivArray },
      key,
      ciphertextArray
    );
  }

  return JSON.parse(decoder.decode(decryptedBuffer));
}

/**
 * Export key to storable format (for sessionStorage)
 * Note: Key is stored as JWK in session storage for the session duration
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  // We need to create an exportable version for session storage
  // Since our key is not extractable, we'll store the raw key material differently
  // Actually, we'll store the password hash instead
  throw new Error("Keys should not be exported - store password-derived data instead");
}

/**
 * Session key storage utilities
 */
const SESSION_KEY_NAME = "mmj_encryption_key";
const SESSION_SALT_NAME = "mmj_encryption_salt";

export function storeKeyMaterial(passwordHash: string, salt: string): void {
  sessionStorage.setItem(SESSION_KEY_NAME, passwordHash);
  sessionStorage.setItem(SESSION_SALT_NAME, salt);
}

export function getStoredKeyMaterial(): { passwordHash: string; salt: string } | null {
  const passwordHash = sessionStorage.getItem(SESSION_KEY_NAME);
  const salt = sessionStorage.getItem(SESSION_SALT_NAME);
  
  if (passwordHash && salt) {
    return { passwordHash, salt };
  }
  return null;
}

export function clearKeyMaterial(): void {
  sessionStorage.removeItem(SESSION_KEY_NAME);
  sessionStorage.removeItem(SESSION_SALT_NAME);
}

/**
 * Create a password hash for session storage
 * This is NOT the encryption key, just a representation for key derivation
 */
export async function hashPasswordForSession(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return arrayBufferToBase64(new Uint8Array(hashBuffer));
}

/**
 * Derive key from stored hash (re-derive from password on unlock)
 * Since we can't store the actual key, user must re-enter password
 */
export async function deriveKeyFromPassword(password: string, salt: string): Promise<CryptoKey> {
  return deriveKey(password, salt);
}

// Utility functions for Base64 encoding/decoding
function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Verify a password against stored hash
 */
export async function verifyPasswordHash(password: string, storedHash: string): Promise<boolean> {
  const hash = await hashPasswordForSession(password);
  return hash === storedHash;
}
