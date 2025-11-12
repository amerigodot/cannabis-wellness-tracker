-- Add recurrence column to reminders table
ALTER TABLE public.reminders 
ADD COLUMN recurrence TEXT NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly'));