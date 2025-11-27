-- Add THC and CBD percentage columns to journal_entries table
ALTER TABLE public.journal_entries 
ADD COLUMN thc_percentage numeric(5,2),
ADD COLUMN cbd_percentage numeric(5,2);