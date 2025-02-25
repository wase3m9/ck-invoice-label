
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { pdfText } = await req.json();

    // For demonstration, we'll simulate the GPT extraction with mock data
    // In a real implementation, this would use OpenAI's API to extract details
    const mockDetails = {
      location: "London",
      supplier_name: "Office Supplies Ltd",
      invoice_number: "INV-2024-001",
      gross_invoice_amount: "250.00"
    };

    return new Response(
      JSON.stringify({ details: JSON.stringify(mockDetails) }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in process-invoice function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process invoice' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
