-- Drop both conflicting UPDATE policies
DROP POLICY IF EXISTS "Users can update their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can soft delete their own journal entries" ON public.journal_entries;

-- Create single unified UPDATE policy that allows both updates and soft deletes
CREATE POLICY "Users can update their own journal entries" 
ON public.journal_entries 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);