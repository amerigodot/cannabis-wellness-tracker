-- Create tool_usage table to track when users last used each AI tool
CREATE TABLE public.tool_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tool_id TEXT NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tool_id)
);

-- Enable Row Level Security
ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own tool usage" 
ON public.tool_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tool usage" 
ON public.tool_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tool usage" 
ON public.tool_usage 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for efficient lookups
CREATE INDEX idx_tool_usage_user_tool ON public.tool_usage(user_id, tool_id);
CREATE INDEX idx_tool_usage_last_used ON public.tool_usage(last_used_at);