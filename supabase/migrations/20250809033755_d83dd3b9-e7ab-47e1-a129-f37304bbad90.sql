-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create table for bank statement processing records
CREATE TABLE public.bank_statements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  original_filename TEXT NOT NULL,
  processed_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  excel_file_path TEXT,
  bank_name TEXT,
  account_number TEXT,
  statement_period TEXT,
  total_transactions INTEGER DEFAULT 0,
  total_credits NUMERIC DEFAULT 0,
  total_debits NUMERIC DEFAULT 0,
  opening_balance NUMERIC,
  closing_balance NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  downloaded_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.bank_statements ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own bank statements" 
ON public.bank_statements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bank statements" 
ON public.bank_statements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank statements" 
ON public.bank_statements 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank statements" 
ON public.bank_statements 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bank_statements_updated_at
BEFORE UPDATE ON public.bank_statements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();