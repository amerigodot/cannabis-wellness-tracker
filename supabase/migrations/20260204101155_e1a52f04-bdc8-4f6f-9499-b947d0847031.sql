-- Fix: ip_rate_limits should NOT allow SELECT for regular users
-- The table contains IP addresses which are sensitive data
-- Only service role should be able to read/manage this table

-- First, drop the overly permissive ALL policy
DROP POLICY IF EXISTS "Service role can manage IP rate limits" ON public.ip_rate_limits;

-- Create separate policies with proper restrictions:
-- Service role can do everything (via service_role key, not regular auth)
-- Regular users should have NO access to this table

-- Policy for INSERT (service role only, enforced by RLS being enabled)
CREATE POLICY "Service role can insert IP rate limits" 
ON public.ip_rate_limits 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Policy for SELECT (service role only)
CREATE POLICY "Service role can select IP rate limits" 
ON public.ip_rate_limits 
FOR SELECT 
TO service_role
USING (true);

-- Policy for UPDATE (service role only)
CREATE POLICY "Service role can update IP rate limits" 
ON public.ip_rate_limits 
FOR UPDATE 
TO service_role
USING (true);

-- Policy for DELETE (service role only)
CREATE POLICY "Service role can delete IP rate limits" 
ON public.ip_rate_limits 
FOR DELETE 
TO service_role
USING (true);