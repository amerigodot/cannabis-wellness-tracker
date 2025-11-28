-- Add before state tracking columns (1-10 scales)
ALTER TABLE public.journal_entries
ADD COLUMN before_mood INTEGER CHECK (before_mood BETWEEN 1 AND 10),
ADD COLUMN before_pain INTEGER CHECK (before_pain BETWEEN 1 AND 10),
ADD COLUMN before_anxiety INTEGER CHECK (before_anxiety BETWEEN 1 AND 10),
ADD COLUMN before_energy INTEGER CHECK (before_energy BETWEEN 1 AND 10),
ADD COLUMN before_focus INTEGER CHECK (before_focus BETWEEN 1 AND 10),
ADD COLUMN before_notes TEXT,

-- Add after state tracking columns (1-10 scales)
ADD COLUMN after_mood INTEGER CHECK (after_mood BETWEEN 1 AND 10),
ADD COLUMN after_pain INTEGER CHECK (after_pain BETWEEN 1 AND 10),
ADD COLUMN after_anxiety INTEGER CHECK (after_anxiety BETWEEN 1 AND 10),
ADD COLUMN after_energy INTEGER CHECK (after_energy BETWEEN 1 AND 10),
ADD COLUMN after_focus INTEGER CHECK (after_focus BETWEEN 1 AND 10),

-- Add entry workflow state
ADD COLUMN entry_status TEXT DEFAULT 'complete' CHECK (entry_status IN ('pending_after', 'complete')),
ADD COLUMN effects_duration_minutes INTEGER;