-- Create profiles table to store user roles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('patient', 'clinician')) DEFAULT 'patient',
  full_name TEXT,
  clinician_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create link_codes table for temporary 6-digit codes
CREATE TABLE IF NOT EXISTS public.link_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL CHECK (code ~ '^[0-9]{6}$'),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '15 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(code)
);

-- Enable RLS on link_codes
ALTER TABLE public.link_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can manage their own link codes" ON public.link_codes
  FOR ALL USING (auth.uid() = user_id);

-- Create clinician_patient_links table
CREATE TABLE IF NOT EXISTS public.clinician_patient_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinician_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_scope JSONB NOT NULL DEFAULT '{
    "share_symptom_scores": true,
    "share_notes": false,
    "share_adverse_events": true,
    "share_regimen": true
  }'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'revoked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(patient_id, clinician_id)
);

-- Enable RLS on clinician_patient_links
ALTER TABLE public.clinician_patient_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients and clinicians can view their own links" ON public.clinician_patient_links
  FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = clinician_id);

CREATE POLICY "Patients can manage their links" ON public.clinician_patient_links
  FOR UPDATE USING (auth.uid() = patient_id);

CREATE POLICY "Patients can delete their links" ON public.clinician_patient_links
  FOR DELETE USING (auth.uid() = patient_id);

-- Function to handle profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'patient'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();