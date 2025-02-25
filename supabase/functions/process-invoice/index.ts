
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    // Convert PDF to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
    const dataUrl = `data:application/pdf;base64,${base64String}`;

    console.log('Successfully converted PDF to base64');

    // Call OpenAI API
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
            content: `You are an AI trained to analyze invoices. When given a PDF invoice, extract:
                     1. Location (office location)
                     2. Supplier name (company that issued the invoice)
                     3. Invoice number
                     4. Gross invoice amount (total including taxes)
                     Return ONLY a JSON object with these exact fields: location, supplier_name, invoice_number, gross_invoice_amount.
                     Format the amount as a plain number without currency symbols.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract the invoice details from this PDF. Return only the JSON object with the required fields."
              },
              {
                type: "image_url",
                image_url: {
                  url: dataUrl
                }
              }
            ]
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
