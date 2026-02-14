-- Explicitly add asymmetric key columns to user_encryption_salts
-- This is a separate migration to ensure it runs even if previous ones were marked as applied

ALTER TABLE public.user_encryption_salts
  ADD COLUMN IF NOT EXISTS public_key TEXT,
  ADD COLUMN IF NOT EXISTS encrypted_private_key TEXT,
  ADD COLUMN IF NOT EXISTS private_key_version INTEGER DEFAULT 1;

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';
