
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { ProcessedFile } from '../types/file';

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
    // Try to use the File System Access API first
    if (window.showSaveFilePicker) {
      const handle = await window.showSaveFilePicker({
        suggestedName: file.name,
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
      toast.success(`${file.name} saved successfully`);
      return;
    }
  } catch (err) {
    // If user cancelled the save dialog, silently continue to fallback
    if (err.name !== 'AbortError') {
      console.error('Error using File System Access API:', err);
    }
  }

  // Fallback method for browsers that don't support File System Access API
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.download = file.name;
  link.target = '_blank'; // This helps trigger the "Save As" dialog in more browsers
  
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);

  toast.success(`${file.name} ready to save`);
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
  generateFileName: (details: any) => string,
  userId: string
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

  // Process with edge function using Supabase client
  const { data, error } = await supabase.functions.invoke('process-invoice', {
    body: { filePath: filePath },
  });

  if (error) {
    console.error('Edge function error:', error);
    throw new Error('Failed to process invoice');
  }

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

  // Save to database with authenticated user ID
  const { error: dbError } = await supabase
    .from('invoices')
    .insert({
      user_id: userId,
      original_filename: file.name,
      processed_filename: newFilename,
      file_path: filePath,
      location: extractedDetails.location,
      supplier_name: extractedDetails.supplier_name,
      invoice_number: extractedDetails.invoice_number,
      gross_invoice_amount: rawAmount
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
