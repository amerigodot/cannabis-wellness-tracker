-- Add is_deleted column to journal_entries for soft deletes
ALTER TABLE public.journal_entries 
ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false;

-- Create an index for better query performance
CREATE INDEX idx_journal_entries_is_deleted ON public.journal_entries(is_deleted);

-- Update the SELECT policy to filter out deleted entries
DROP POLICY IF EXISTS "Users can view their own journal entries" ON public.journal_entries;

CREATE POLICY "Users can view their own journal entries" 
ON public.journal_entries 
FOR SELECT 
USING (auth.uid() = user_id AND is_deleted = false);