-- Add separate THC and CBD weight columns to journal_entries
ALTER TABLE public.journal_entries 
ADD COLUMN thc_weight NUMERIC(10, 4) NULL,
ADD COLUMN cbd_weight NUMERIC(10, 4) NULL,
ADD COLUMN dosage_unit TEXT DEFAULT 'g' NULL;