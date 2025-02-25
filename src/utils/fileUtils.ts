
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { ProcessedFile } from '../types/file';

// Add type definition for the File System Access API
declare global {
  interface Window {
    showSaveFilePicker?: (options?: {
      suggestedName?: string;
      types?: Array<{
        description: string;
        accept: Record<string, string[]>;
      }>;
    }) => Promise<FileSystemFileHandle>;
  }
}

const downloadWithFilePicker = async (blob: Blob, fileName: string): Promise<void> => {
  if (!window.showSaveFilePicker) {
    throw new Error('File System Access API not supported');
  }

  const handle = await window.showSaveFilePicker({
    suggestedName: fileName,
    types: [{
      description: 'PDF Document',
      accept: {
        'application/pdf': ['.pdf'],
      },
    }],
  });
  
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
};

const downloadFallback = (blob: Blob, fileName: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.download = fileName;
  
  document.body.appendChild(link);
  link.click();
  
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
};

export const downloadFile = async (file: ProcessedFile): Promise<void> => {
  if (!file.downloadUrl || !file.filePath) {
    throw new Error('Invalid file data for download');
  }

  // Update download timestamp
  const { error: updateError } = await supabase
    .from('invoices')
    .update({ downloaded_at: new Date().toISOString() })
    .eq('file_path', file.filePath);

  if (updateError) {
    console.error('Error updating download timestamp:', updateError);
    throw updateError;
  }

  // Fetch file
  const response = await fetch(file.downloadUrl);
  const blob = await response.blob();
  
  try {
    // Try using the File System Access API first
    await downloadWithFilePicker(blob, file.name);
    toast.success(`${file.name} saved successfully`);
  } catch (err) {
    // If File System Access API is not supported or user cancelled, use fallback
    if (err.message === 'File System Access API not supported') {
      downloadFallback(blob, file.name);
      toast.success(`${file.name} downloaded successfully`);
    } else if (err.name !== 'AbortError') {
      // Only show error if it's not a user cancellation
      console.error('Error saving file:', err);
      toast.error(`Failed to save ${file.name}`);
      throw err;
    }
  }
};

export const deleteFile = async (file: ProcessedFile): Promise<void> => {
  if (!file.filePath) {
    throw new Error('Invalid file data for deletion');
  }

  // Remove from storage
  const { error: deleteError } = await supabase.storage
    .from('pdfs')
    .remove([file.filePath]);

  if (deleteError) throw deleteError;

  // Remove from database
  const { error: dbError } = await supabase
    .from('invoices')
    .delete()
    .eq('file_path', file.filePath);

  if (dbError) throw dbError;
};

export const processFile = async (
  file: File, 
  generateFileName: (details: any) => string
): Promise<{ name: string; details: any; downloadUrl: string; filePath: string }> => {
  const fileExt = file.name.split('.').pop();
  const filePath = `${crypto.randomUUID()}.${fileExt}`;
  
  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('pdfs')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error('Failed to upload file');
  }

  // Process with edge function
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://yjhamwwwryfswimjjzgt.supabase.co/functions/v1/process-invoice', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGFtd3d3cnlmc3dpbWpqemd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDMxNTYsImV4cCI6MjA1NjA3OTE1Nn0.bjbj1u32328r2NepQxBlhQeo_D3VXJpRR5VDzCR09DQ`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Edge function error:', errorData);
    throw new Error(errorData.error || 'Failed to process invoice');
  }

  const data = await response.json();
  const extractedDetails = data.details;
  
  // Store the raw amount for database
  const rawAmount = extractedDetails.gross_invoice_amount;
  
  // Format the amount for display/filename
  if (extractedDetails.gross_invoice_amount) {
    const amount = parseFloat(extractedDetails.gross_invoice_amount);
    extractedDetails.gross_invoice_amount = amount.toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  const newFilename = generateFileName(extractedDetails);

  // Save to database using the raw amount
  const { error: dbError } = await supabase
    .from('invoices')
    .insert({
      original_filename: file.name,
      processed_filename: newFilename,
      file_path: filePath,
      location: extractedDetails.location,
      supplier_name: extractedDetails.supplier_name,
      invoice_number: extractedDetails.invoice_number,
      gross_invoice_amount: rawAmount // Use the raw amount for database storage
    });

  if (dbError) {
    console.error('Database error:', dbError);
    throw new Error('Failed to save invoice details');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('pdfs')
    .getPublicUrl(filePath);

  return {
    name: newFilename,
    details: extractedDetails,
    downloadUrl: publicUrl,
    filePath: filePath,
  };
};
