-- Enable real-time updates for journal_entries table
ALTER TABLE public.journal_entries REPLICA IDENTITY FULL;

-- Add journal_entries to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.journal_entries;