-- Clean up existing data and fix security issues

-- First, delete existing records with null user_id since they're from the insecure period
DELETE FROM public.invoices WHERE user_id IS NULL;
DELETE FROM public.bank_statements WHERE user_id IS NULL;

-- Now make user_id columns non-nullable for security
ALTER TABLE public.invoices 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.bank_statements
ALTER COLUMN user_id SET NOT NULL;

-- Remove the public insert policy for invoices
DROP POLICY IF EXISTS "Anyone can insert invoices" ON public.invoices;

-- Create proper RLS policies for invoices
CREATE POLICY "Users can insert their own invoices" 
ON public.invoices 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create proper RLS policies for bank_statements
CREATE POLICY "Users can insert their own bank statements" 
ON public.bank_statements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);