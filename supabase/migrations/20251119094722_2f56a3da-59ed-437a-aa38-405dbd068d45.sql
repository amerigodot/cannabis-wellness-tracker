-- Add policy to allow users to view their deleted entries
CREATE POLICY "Users can view their deleted journal entries" 
ON public.journal_entries 
FOR SELECT 
USING (auth.uid() = user_id AND is_deleted = true);