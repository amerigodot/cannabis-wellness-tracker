-- Create ip_rate_limits table for tracking requests by IP address
CREATE TABLE IF NOT EXISTS public.ip_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ip_address, endpoint, window_start)
);

-- Enable RLS on ip_rate_limits table
ALTER TABLE public.ip_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage IP rate limits (for edge functions)
CREATE POLICY "Service role can manage IP rate limits"
ON public.ip_rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create index for efficient IP lookups
CREATE INDEX IF NOT EXISTS idx_ip_rate_limits_ip_endpoint_window 
ON public.ip_rate_limits(ip_address, endpoint, window_start);

-- Create function to clean up old IP rate limit records (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_ip_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.ip_rate_limits
  WHERE window_start < now() - INTERVAL '1 hour';
END;
$$;