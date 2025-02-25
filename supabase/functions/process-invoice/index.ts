
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
    
    console.log('Extracted text length:', fullText.length);
    console.log('First 500 characters of extracted text:', fullText.substring(0, 500));
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

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text could be extracted from the PDF');
    }

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
            content: `Extract invoice details from the following text. The location MUST be one of: ${VALID_LOCATIONS.join(', ')}. 
                     
                     Return a JSON object with these exact fields:
                     - location (must be one of the valid locations listed above)
                     - supplier_name (company that issued the invoice)
                     - invoice_number
                     - gross_invoice_amount (as a number without currency symbols)
                     
                     Example format:
                     {
                       "location": "Brighton",
                       "supplier_name": "ABC Company",
                       "invoice_number": "INV-123",
                       "gross_invoice_amount": "1234.56"
                     }
                     
                     If you cannot find a specific location, use contextual clues to determine the most likely location from the valid list.
                     Return ONLY the JSON object, no other text.`
          },
          {
            role: "user",
            content: extractedText
          }
        ],
        temperature: 0, // Add this to make responses more consistent
        max_tokens: 1000
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error('Failed to process invoice with OpenAI');
    }

    const openAIData = await openAIResponse.json();
    
    if (!openAIData.choices || !openAIData.choices[0] || !openAIData.choices[0].message) {
      console.error('Unexpected OpenAI response structure:', openAIData);
      throw new Error('Invalid response from OpenAI');
    }

    const responseText = openAIData.choices[0].message.content.trim();
    console.log('OpenAI response text:', responseText);

    try {
      const extractedDetails = JSON.parse(responseText);
      console.log('Parsed response:', extractedDetails);

      // Validate required fields
      const requiredFields = ['location', 'supplier_name', 'invoice_number', 'gross_invoice_amount'];
      const missingFields = requiredFields.filter(field => !extractedDetails[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate location is one of the allowed values
      if (!VALID_LOCATIONS.includes(extractedDetails.location)) {
        throw new Error(`Invalid location "${extractedDetails.location}". Must be one of: ${VALID_LOCATIONS.join(', ')}`);
      }

      // Clean up amount format
      extractedDetails.gross_invoice_amount = extractedDetails.gross_invoice_amount
        .toString()
        .replace(/[^0-9.]/g, '')
        .trim();

      if (!extractedDetails.gross_invoice_amount || isNaN(parseFloat(extractedDetails.gross_invoice_amount))) {
        throw new Error('Invalid gross invoice amount');
      }

      console.log('Successfully validated details:', extractedDetails);
      
      return new Response(
        JSON.stringify({ details: extractedDetails }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Error processing OpenAI response:', parseError);
      console.error('Raw response text:', responseText);
      throw new Error(`Failed to parse invoice details: ${parseError.message}`);
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
