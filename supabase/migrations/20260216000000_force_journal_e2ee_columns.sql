-- Force schema reload and ensure E2EE columns exist in journal_entries
ALTER TABLE public.journal_entries 
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS encrypted_payload TEXT,
ADD COLUMN IF NOT EXISTS encryption_iv TEXT,
ADD COLUMN IF NOT EXISTS wrapped_aes_key TEXT;

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';
