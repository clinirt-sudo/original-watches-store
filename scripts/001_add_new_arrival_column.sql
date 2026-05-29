-- Migration: add new_arrival boolean to ecom_products
-- Adds a nullable boolean column with default false so admin UI can persist the flag.

ALTER TABLE public.ecom_products
  ADD COLUMN IF NOT EXISTS new_arrival boolean DEFAULT false;

-- Optional: ensure existing rows are false (should already be default for new rows)
UPDATE public.ecom_products SET new_arrival = false WHERE new_arrival IS NULL;
