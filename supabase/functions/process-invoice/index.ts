
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

async function convertPDFPageToImage(pdfData: ArrayBuffer): Promise<string> {
  try {
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;
    
    // Get the first page
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality

    // Create canvas
    const canvas = new OffscreenCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    // Render PDF page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    // Convert canvas to blob
    const blob = await canvas.convertToBlob();
    
    // Convert blob to base64
    const arrayBuffer = await blob.arrayBuffer();
    const base64String = btoa(
      new Uint8Array(arrayBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    return `data:image/png;base64,${base64String}`;
  } catch (error) {
    console.error('PDF conversion error:', error);
    throw new Error('Failed to convert PDF to image');
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

    // Convert PDF to image
    const pdfArrayBuffer = await file.arrayBuffer();
    const imageBase64 = await convertPDFPageToImage(pdfArrayBuffer);

    console.log('Successfully converted PDF to image');

    // Call OpenAI API with the image
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
            content: "You are an AI trained to extract invoice details from images. Extract the following: location (office location), supplier name (company name), invoice number, and gross invoice amount (total including taxes). Return ONLY a JSON object with these fields: location, supplier_name, invoice_number, gross_invoice_amount"
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract the invoice details from this image and return only the JSON object."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
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
      // Parse the JSON response
      const responseText = openAIData.choices[0].message.content;
      console.log('OpenAI response:', responseText);
      
      const extractedDetails = JSON.parse(responseText);

      // Validate required fields
      if (!extractedDetails.location || 
          !extractedDetails.supplier_name || 
          !extractedDetails.invoice_number || 
          !extractedDetails.gross_invoice_amount) {
        throw new Error('Missing required fields in extracted details');
      }

      // Clean up amount format
      extractedDetails.gross_invoice_amount = extractedDetails.gross_invoice_amount
        .replace(/[^0-9.]/g, '')
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
