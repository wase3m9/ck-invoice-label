
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfText } = await req.json();

    const prompt = `Extract the following details from this invoice:
    - Location (City/Region)
    - Supplier Name (without Ltd)
    - Invoice Number
    - Gross Invoice Amount (in £)
    
    Please return the information in JSON format like this:
    {
      "location": "city",
      "supplier_name": "name",
      "invoice_number": "number",
      "gross_invoice_amount": "amount"
    }
    
    Invoice text:
    ${pdfText}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an invoice processing assistant. Extract invoice details and return them in JSON format.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await response.json();
    const extractedDetails = data.choices[0].message.content;

    return new Response(JSON.stringify({ details: extractedDetails }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing invoice:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
