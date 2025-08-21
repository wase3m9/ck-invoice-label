-- Fix security issues by removing public insert policies and ensuring proper user authentication

-- Remove the public insert policy for invoices
DROP POLICY IF EXISTS "Anyone can insert invoices" ON public.invoices;

-- Ensure invoices user_id is not nullable for security
ALTER TABLE public.invoices 
ALTER COLUMN user_id SET NOT NULL;

-- Ensure bank_statements user_id is not nullable for security  
ALTER TABLE public.bank_statements
ALTER COLUMN user_id SET NOT NULL;

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