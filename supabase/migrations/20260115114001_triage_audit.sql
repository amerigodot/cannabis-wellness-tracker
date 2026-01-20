create table if not exists public.triage_audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  symptoms text not null,
  risk_level text not null, -- 'Emergency', 'Urgent', 'Routine', 'Self-Care'
  disposition text not null,
  fhir_export_status text default 'pending', -- Simulated FHIR integration status
  encrypted_metadata jsonb -- For additional HIPAA-compliant metadata
);

-- Enable RLS
alter table public.triage_audit_logs enable row level security;

-- Policy: Users can only see their own logs (HIPAA: Patient Access)
create policy "Users can view own triage logs"
  on public.triage_audit_logs for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own logs
create policy "Users can insert own triage logs"
  on public.triage_audit_logs for insert
  with check (auth.uid() = user_id);
