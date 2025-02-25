
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Buffer } from "https://deno.land/std@0.168.0/node/buffer.ts";
import JSZip from 'https://esm.sh/jszip@3.10.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { files } = await req.json()

    if (!files || !Array.isArray(files) || files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No files provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const zip = new JSZip()

    // Download and add each file to the zip
    for (const file of files) {
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('pdfs')
        .download(file.filePath)

      if (downloadError) {
        console.error(`Error downloading file ${file.name}:`, downloadError)
        continue
      }

      const arrayBuffer = await fileData.arrayBuffer()
      zip.file(file.name, arrayBuffer)
    }

    // Generate the zip file
    const zipContent = await zip.generateAsync({ type: 'arraybuffer' })

    return new Response(
      zipContent,
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="invoices-${new Date().toISOString().slice(0,10)}.zip"`,
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating zip:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create zip file' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
