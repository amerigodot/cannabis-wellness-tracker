-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can update their own journal entries" ON public.journal_entries;

-- Create separate policies for regular updates vs soft deletes
CREATE POLICY "Users can update their own journal entries" 
ON public.journal_entries 
FOR UPDATE 
USING (auth.uid() = user_id AND is_deleted = false)
WITH CHECK (auth.uid() = user_id AND is_deleted = false);

CREATE POLICY "Users can soft delete their own journal entries" 
ON public.journal_entries 
FOR UPDATE 
USING (auth.uid() = user_id AND is_deleted = false)
WITH CHECK (auth.uid() = user_id AND is_deleted = true);