import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import * as xlsx from 'https://deno.land/x/xlsx@0.18.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing bank statement file:', filePath);

    // Download the PDF file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('pdfs')
      .download(filePath);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      throw new Error('Failed to download file');
    }

    // Extract text from PDF using dynamic import
    const pdfParse = await import('https://esm.sh/pdf-parse@1.1.1');
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    let pdfText = '';
    try {
      const data = await pdfParse.default(buffer);
      pdfText = data.text;
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      throw new Error('Failed to extract text from PDF');
    }

    console.log('Extracted PDF text length:', pdfText.length);

    // Use OpenAI to extract structured data
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a bank statement parser. Extract transaction data from bank statements and return structured JSON.

Return a JSON object with this exact structure:
{
  "bank_name": "Bank Name",
  "account_number": "Account Number",
  "statement_period": "Period (e.g., Jan 2024)",
  "opening_balance": 0.00,
  "closing_balance": 0.00,
  "total_credits": 0.00,
  "total_debits": 0.00,
  "total_transactions": 0,
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "Transaction description",
      "debit": 0.00,
      "credit": 0.00,
      "balance": 0.00,
      "reference": "Reference number"
    }
  ]
}

Important:
- Parse ALL transactions from the statement
- Use negative values for debits, positive for credits
- Include running balance if available
- Extract all available transaction details
- If a field is not available, use null or appropriate default`
          },
          {
            role: 'user',
            content: `Parse this bank statement text and extract all transaction data:\n\n${pdfText.substring(0, 4000)}`
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', await openaiResponse.text());
      throw new Error('Failed to process with AI');
    }

    const openaiData = await openaiResponse.json();
    const extractedData = JSON.parse(openaiData.choices[0].message.content);

    console.log('Extracted bank statement data:', {
      bank: extractedData.bank_name,
      account: extractedData.account_number,
      transactions: extractedData.transactions?.length || 0
    });

    // Create Excel workbook
    const workbook = xlsx.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Bank Statement Summary'],
      [''],
      ['Bank Name', extractedData.bank_name],
      ['Account Number', extractedData.account_number],
      ['Statement Period', extractedData.statement_period],
      ['Opening Balance', extractedData.opening_balance],
      ['Closing Balance', extractedData.closing_balance],
      ['Total Credits', extractedData.total_credits],
      ['Total Debits', extractedData.total_debits],
      ['Total Transactions', extractedData.total_transactions],
    ];
    
    const summarySheet = xlsx.utils.aoa_to_sheet(summaryData);
    xlsx.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Transactions sheet
    if (extractedData.transactions && extractedData.transactions.length > 0) {
      const transactionHeaders = ['Date', 'Description', 'Debit', 'Credit', 'Balance', 'Reference'];
      const transactionData = [
        transactionHeaders,
        ...extractedData.transactions.map((t: any) => [
          t.date || '',
          t.description || '',
          t.debit || '',
          t.credit || '',
          t.balance || '',
          t.reference || ''
        ])
      ];
      
      const transactionSheet = xlsx.utils.aoa_to_sheet(transactionData);
      xlsx.utils.book_append_sheet(workbook, transactionSheet, 'Transactions');
    }

    // Generate Excel file
    const excelBuffer = xlsx.write(workbook, { type: 'array', bookType: 'xlsx' });
    const excelBlob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });

    // Upload Excel file to storage
    const excelFileName = `bank-statements/excel/${Date.now()}_${extractedData.bank_name || 'statement'}.xlsx`;
    const { data: excelUpload, error: excelError } = await supabase.storage
      .from('pdfs')
      .upload(excelFileName, excelBlob, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

    if (excelError) {
      console.error('Error uploading Excel file:', excelError);
      throw new Error('Failed to save Excel file');
    }

    console.log('Excel file created:', excelFileName);

    return new Response(JSON.stringify({
      details: extractedData,
      excelFilePath: excelUpload.path
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in convert-bank-statement function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});