-- Create a fresh table for E2EE keys to avoid issues with user_encryption_salts
CREATE TABLE IF NOT EXISTS public.e2ee_vault (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  public_key TEXT NOT NULL,
  wrapped_private_key TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  vault_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.e2ee_vault ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own vault"
  ON public.e2ee_vault
  FOR ALL
  USING (auth.uid() = user_id);

-- Refresh cache
NOTIFY pgrst, 'reload schema';
