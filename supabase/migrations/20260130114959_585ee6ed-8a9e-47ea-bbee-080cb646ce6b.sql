-- Phase 2: Privacy-First Database Schema Changes

-- Create encryption metadata table to store user salts
CREATE TABLE public.user_encryption_salts (
  user_id UUID PRIMARY KEY,
  password_salt TEXT NOT NULL,
  key_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_encryption_salts ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own encryption salt
CREATE POLICY "Users can view their own encryption salt"
  ON public.user_encryption_salts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own encryption salt"
  ON public.user_encryption_salts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own encryption salt"
  ON public.user_encryption_salts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add encrypted data columns to journal_entries
ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS encrypted_data TEXT,
  ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT NULL;

-- Add privacy_mode_enabled to email_preferences for tracking user preference
ALTER TABLE public.email_preferences
  ADD COLUMN IF NOT EXISTS privacy_mode_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS data_migrated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create trigger to update updated_at on user_encryption_salts
CREATE OR REPLACE FUNCTION public.update_encryption_salt_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_encryption_salts_updated_at
  BEFORE UPDATE ON public.user_encryption_salts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_encryption_salt_updated_at();