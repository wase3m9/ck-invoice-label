
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Valid locations for the mock data
const validLocations = ['Brighton', 'Bluewater', 'Lakeside', 'Canterbury', 'Guildford'];

// Example supplier names
const exampleSuppliers = [
  'Nando\'s',
  'Costa Coffee',
  'Starbucks',
  'Pizza Express',
  'Wagamama',
  'Pret A Manger'
];

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

    // Generate random mock data with valid locations and suppliers
    const mockDetails = {
      location: validLocations[Math.floor(Math.random() * validLocations.length)],
      supplier_name: exampleSuppliers[Math.floor(Math.random() * exampleSuppliers.length)],
      invoice_number: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      gross_invoice_amount: (Math.random() * 200 + 50).toFixed(2)
    };

    console.log('Generated mock details:', mockDetails);

    return new Response(
      JSON.stringify({ details: mockDetails }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
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
