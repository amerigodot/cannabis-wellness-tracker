-- Add activities column to journal_entries table
ALTER TABLE public.journal_entries
ADD COLUMN activities text[] NOT NULL DEFAULT '{}'::text[];