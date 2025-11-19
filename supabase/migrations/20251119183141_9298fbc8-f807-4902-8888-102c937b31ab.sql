-- Add consumption_time field to journal_entries table
ALTER TABLE public.journal_entries 
ADD COLUMN consumption_time TIMESTAMP WITH TIME ZONE;

-- Set default to created_at for existing entries
UPDATE public.journal_entries 
SET consumption_time = created_at 
WHERE consumption_time IS NULL;