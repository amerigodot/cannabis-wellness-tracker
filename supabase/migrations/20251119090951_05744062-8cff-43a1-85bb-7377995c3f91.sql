-- Add icon field to journal_entries table
ALTER TABLE public.journal_entries
ADD COLUMN icon TEXT DEFAULT 'leaf';