-- Allow clinicians to view journal entries of patients they are linked to
CREATE POLICY "Clinicians can view linked patient entries" ON public.journal_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clinician_patient_links cpl
      WHERE cpl.clinician_id = auth.uid()
      AND cpl.patient_id = journal_entries.user_id
      AND cpl.status = 'active'
      AND (cpl.consent_scope->>'share_symptom_scores')::boolean = true
    )
  );

-- Allow clinicians to view diagnoses (if we had a diagnoses table, but for now just journals)
-- We'll assume other tables might need similar policies later, but journals are key for the AI summary.