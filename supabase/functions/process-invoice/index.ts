
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

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64String = btoa(String.fromCharCode.apply(null, uint8Array));

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
            content: `You are an AI trained to extract invoice details. You'll receive a PDF file converted to base64. 
                     Please extract the following information: location (office location), supplier name (company that issued the invoice), 
                     invoice number, and gross invoice amount (total amount including taxes). 
                     Return ONLY a JSON object with these fields: location, supplier_name, invoice_number, gross_invoice_amount`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please extract the invoice details from this document. Return only the JSON object with the required fields."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64String}`
                }
              }
            ]
          }
        ]
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error('Failed to process invoice with OpenAI');
    }

    const openAIData = await openAIResponse.json();
    
    try {
      // Try to parse the JSON from the response
      const responseText = openAIData.choices[0].message.content;
      const extractedDetails = JSON.parse(responseText);

      // Validate the extracted details
      if (!extractedDetails.location || 
          !extractedDetails.supplier_name || 
          !extractedDetails.invoice_number || 
          !extractedDetails.gross_invoice_amount) {
        throw new Error('Missing required fields in extracted details');
      }

      // Clean up the amount format
      extractedDetails.gross_invoice_amount = extractedDetails.gross_invoice_amount
        .replace(/[^0-9.]/g, '') // Remove all non-numeric characters except decimal point
        .trim();

      console.log('Successfully extracted details:', extractedDetails);
      
      return new Response(
        JSON.stringify({ details: extractedDetails }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Raw OpenAI response:', openAIData.choices[0].message.content);
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
