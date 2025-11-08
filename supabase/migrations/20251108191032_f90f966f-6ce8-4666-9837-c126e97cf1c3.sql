-- Add negative_side_effects column to journal_entries table
ALTER TABLE public.journal_entries
ADD COLUMN negative_side_effects text[] NOT NULL DEFAULT '{}'::text[];