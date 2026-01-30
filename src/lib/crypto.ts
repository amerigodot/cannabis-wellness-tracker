/**
 * Client-side encryption utilities using Web Crypto API
 * 
 * This module provides zero-knowledge encryption where:
 * - Keys are derived from user password using PBKDF2
 * - Data is encrypted with AES-256-GCM
 * - Server never sees encryption keys
 */

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

export interface EncryptedData {
  ciphertext: string; // Base64 encoded
  iv: string; // Base64 encoded
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
    false, // Not extractable
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt sensitive journal fields
 */
export async function encryptData(
  key: CryptoKey,
  data: SensitiveJournalFields
): Promise<EncryptedData> {
  const encoder = new TextEncoder();
  const ivArray = new Uint8Array(IV_LENGTH);
  crypto.getRandomValues(ivArray);
  
  // Copy to new ArrayBuffer to avoid SharedArrayBuffer issues
  const ivBuffer = new ArrayBuffer(ivArray.byteLength);
  new Uint8Array(ivBuffer).set(ivArray);
  
  const plaintext = encoder.encode(JSON.stringify(data));
  
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: ivBuffer,
    },
    key,
    plaintext
  );

  return {
    ciphertext: arrayBufferToBase64(new Uint8Array(ciphertext)),
    iv: arrayBufferToBase64(ivArray),
    version: 1,
  };
}

/**
 * Decrypt sensitive journal fields
 */
export async function decryptData(
  key: CryptoKey,
  encrypted: EncryptedData
): Promise<SensitiveJournalFields> {
  const decoder = new TextDecoder();
  
  const ciphertextArray = base64ToArrayBuffer(encrypted.ciphertext);
  const ivArray = base64ToArrayBuffer(encrypted.iv);
  
  // Copy to new ArrayBuffers to avoid SharedArrayBuffer issues
  const ivBuffer = new ArrayBuffer(ivArray.byteLength);
  new Uint8Array(ivBuffer).set(ivArray);
  
  const ciphertextBuffer = new ArrayBuffer(ciphertextArray.byteLength);
  new Uint8Array(ciphertextBuffer).set(ciphertextArray);
  
  const plaintext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBuffer,
    },
    key,
    ciphertextBuffer
  );

  return JSON.parse(decoder.decode(plaintext));
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
