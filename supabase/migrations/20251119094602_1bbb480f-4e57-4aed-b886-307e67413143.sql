-- Drop and recreate UPDATE policy without WITH CHECK
DROP POLICY IF EXISTS "Users can update their own journal entries" ON public.journal_entries;

CREATE POLICY "Users can update their own journal entries" 
ON public.journal_entries 
FOR UPDATE 
USING (auth.uid() = user_id);