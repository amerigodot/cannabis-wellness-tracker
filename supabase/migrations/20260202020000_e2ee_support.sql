-- Migration: Add E2EE Support (Restored)

-- 1. Enhance journal_entries for E2EE
ALTER TABLE public.journal_entries 
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS encrypted_payload TEXT,
ADD COLUMN IF NOT EXISTS encryption_iv TEXT,
ADD COLUMN IF NOT EXISTS wrapped_aes_key TEXT;

-- 2. Enhance user_encryption_salts for Asymmetric Keys
ALTER TABLE public.user_encryption_salts
  ADD COLUMN IF NOT EXISTS public_key TEXT,
  ADD COLUMN IF NOT EXISTS encrypted_private_key TEXT,
  ADD COLUMN IF NOT EXISTS private_key_version INTEGER DEFAULT 1;
