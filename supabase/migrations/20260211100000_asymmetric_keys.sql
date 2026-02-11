-- Add asymmetric key support to encryption metadata
ALTER TABLE public.user_encryption_salts
  ADD COLUMN IF NOT EXISTS public_key TEXT,
  ADD COLUMN IF NOT EXISTS encrypted_private_key TEXT,
  ADD COLUMN IF NOT EXISTS private_key_version INTEGER DEFAULT 1;
