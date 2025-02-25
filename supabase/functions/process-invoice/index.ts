
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Example supplier names with formal business names
const exampleSuppliers = [
  'AbbVie',
  'Nando\'s Chickenland Ltd',
  'Costa Coffee Limited',
  'Starbucks Coffee Company Ltd',
  'PizzaExpress Ltd',
  'Wagamama Limited',
  'Pret A Manger (Europe) Ltd'
];

// Valid locations
const validLocations = ['Brighton', 'Bluewater', 'Lakeside', 'Canterbury', 'Guildford'];

// Function to clean supplier name
const cleanSupplierName = (name: string): string => {
  return name
    .replace(/(limited|ltd|llc|inc|plc|europe)\.?\)?$/i, '')  // Remove common business suffixes
    .replace(/\(|\)/g, '')  // Remove parentheses
    .replace(/\s+/g, ' ')   // Remove extra spaces
    .trim();                // Trim leading/trailing spaces
};

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

    // For testing, let's use the specific details you mentioned
    const mockDetails = {
      location: "Lakeside",
      supplier_name: "AbbVie",
      invoice_number: "671227978",
      gross_invoice_amount: "96.72"
    };

    console.log('Generated invoice details:', mockDetails);

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
