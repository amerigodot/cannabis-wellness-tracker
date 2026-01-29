-- Remove the email column from email_preferences table
-- Edge functions will fetch email from auth.users directly instead

ALTER TABLE public.email_preferences DROP COLUMN email;