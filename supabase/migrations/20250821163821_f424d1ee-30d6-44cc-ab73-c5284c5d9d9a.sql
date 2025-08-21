-- Remove public read access from invoices table
DROP POLICY IF EXISTS "Anyone can read invoices" ON public.invoices;