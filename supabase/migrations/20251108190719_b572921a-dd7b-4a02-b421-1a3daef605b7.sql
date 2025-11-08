-- Fix the UPDATE policy to include WITH CHECK clause
DROP POLICY IF EXISTS "Users can update their own journal entries" ON public.journal_entries;

CREATE POLICY "Users can update their own journal entries" 
ON public.journal_entries 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);