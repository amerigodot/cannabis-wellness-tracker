-- Add second optional strain field to journal_entries table
ALTER TABLE public.journal_entries 
ADD COLUMN strain_2 text;