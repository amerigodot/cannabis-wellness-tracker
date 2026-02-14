-- Migration: Add E2EE Support (Restored)

-- 1. Enhance journal_entries for E2EE
ALTER TABLE public.journal_entries 
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS encrypted_payload TEXT,
ADD COLUMN IF NOT EXISTS encryption_iv TEXT,
ADD COLUMN IF NOT EXISTS wrapped_aes_key TEXT;

-- Note: The existing user_encryption_salts table will be used for keys.
