
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as pdfjs from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.mjs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const VALID_LOCATIONS = ['Bluewater', 'Lakeside', 'Canterbury', 'Brighton', 'Guildford'];

// Initialize PDF.js worker
const pdfjsWorker = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.mjs');
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

async function extractTextFromPDF(pdfData: ArrayBuffer): Promise<string> {
  try {
    const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
    let fullText = '';
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    console.log('Extracted text from PDF:', fullText);
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      throw new Error('No PDF file provided');
    }

    console.log('Processing PDF file:', file.name);

    // Extract text from PDF
    const pdfArrayBuffer = await file.arrayBuffer();
    const extractedText = await extractTextFromPDF(pdfArrayBuffer);

    console.log('Successfully extracted text from PDF');

    // Call OpenAI API with extracted text
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an AI trained to extract invoice details from text. The invoice will be from one of these specific locations: ${VALID_LOCATIONS.join(', ')}. 
                     First, search the text carefully to identify which of these locations appears in the document.
                     
                     Then extract:
                     1. Location (MUST be one of: ${VALID_LOCATIONS.join(', ')})
                     2. Supplier name (company that issued the invoice)
                     3. Invoice number
                     4. Gross invoice amount (total including taxes)
                     
                     Return ONLY a JSON object with these exact fields: location, supplier_name, invoice_number, gross_invoice_amount.
                     The location field MUST be exactly one of the valid locations listed above.
                     Format the amount as a plain number without currency symbols.
                     
                     If none of the valid locations are found in the text, use the most likely location based on any address or geographical information in the document.`
          },
          {
            role: "user",
            content: extractedText
          }
        ],
        max_tokens: 1000
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error('Failed to process invoice with OpenAI');
    }

    const openAIData = await openAIResponse.json();
    console.log('Raw OpenAI response:', openAIData);

    try {
      const responseText = openAIData.choices[0].message.content;
      console.log('OpenAI content:', responseText);

      const extractedDetails = JSON.parse(responseText);

      // Validate required fields
      const requiredFields = ['location', 'supplier_name', 'invoice_number', 'gross_invoice_amount'];
      for (const field of requiredFields) {
        if (!extractedDetails[field]) {
          console.error(`Missing required field: ${field}`);
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate location is one of the allowed values
      if (!VALID_LOCATIONS.includes(extractedDetails.location)) {
        console.error('Invalid location:', extractedDetails.location);
        throw new Error(`Invalid location. Must be one of: ${VALID_LOCATIONS.join(', ')}`);
      }

      // Clean up amount format - remove any non-numeric characters except decimal point
      extractedDetails.gross_invoice_amount = extractedDetails.gross_invoice_amount
        .toString()
        .replace(/[^0-9.]/g, '')
        .trim();

      console.log('Successfully extracted details:', extractedDetails);
      
      return new Response(
        JSON.stringify({ details: extractedDetails }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse extracted invoice details');
    }
  } catch (error) {
    console.error('Error processing invoice:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
