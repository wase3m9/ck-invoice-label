import { supabase } from '@/integrations/supabase/client';
import { ProcessedFile } from '../types/file';

// Declare global interface for File System Access API
declare global {
  interface Window {
    showSaveFilePicker?: (options?: {
      suggestedName?: string;
      types?: {
        description: string;
        accept: Record<string, string[]>;
      }[];
    }) => Promise<FileSystemFileHandle>;
  }
}

export const downloadBankStatement = async (file: ProcessedFile): Promise<void> => {
  console.log('Downloading bank statement:', file.name);

  // Update download timestamp in database
  const { error: updateError } = await supabase
    .from('bank_statements')
    .update({ downloaded_at: new Date().toISOString() })
    .eq('file_path', file.filePath);

  if (updateError) {
    console.error('Error updating download timestamp:', updateError);
  }

  // Try using File System Access API first (Chrome/Edge)
  if (window.showSaveFilePicker) {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: file.name,
        types: [{
          description: 'Excel files',
          accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
        }]
      });
      
      const response = await fetch(file.downloadUrl!);
      const blob = await response.blob();
      
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      
      return;
    } catch (error) {
      console.log('File System Access API failed, falling back to download link');
    }
  }

  // Fallback for other browsers
  const link = document.createElement('a');
  link.href = file.downloadUrl!;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const deleteBankStatement = async (file: ProcessedFile): Promise<void> => {
  console.log('Deleting bank statement:', file.name);

  if (file.filePath) {
    // Delete from Supabase storage
    const { error: storageError } = await supabase.storage
      .from('pdfs')
      .remove([file.filePath]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
      throw storageError;
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('bank_statements')
      .delete()
      .eq('file_path', file.filePath);

    if (dbError) {
      console.error('Error deleting from database:', dbError);
      throw dbError;
    }
  }
};

export const processBankStatement = async (
  file: File, 
  generateFileName: (details: any) => string
): Promise<{ name: string; details: any; downloadUrl: string; filePath: string }> => {
  console.log('Processing bank statement:', file.name);

  // Upload file to Supabase storage
  const fileName = `bank-statements/${Date.now()}_${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('pdfs')
    .upload(fileName, file);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error('Failed to upload file');
  }

  try {
    // Call the edge function to process the bank statement
    const { data: functionData, error: functionError } = await supabase.functions
      .invoke('convert-bank-statement', {
        body: { filePath: uploadData.path }
      });

    if (functionError) {
      console.error('Function error:', functionError);
      throw new Error('Failed to process bank statement');
    }

    const { details, excelFilePath } = functionData;

    // Save details to database
    const { error: insertError } = await supabase
      .from('bank_statements')
      .insert({
        user_id: null, // No auth in this app
        original_filename: file.name,
        processed_filename: generateFileName(details),
        file_path: uploadData.path,
        excel_file_path: excelFilePath,
        bank_name: details.bank_name,
        account_number: details.account_number,
        statement_period: details.statement_period,
        total_transactions: details.total_transactions,
        total_credits: details.total_credits,
        total_debits: details.total_debits,
        opening_balance: details.opening_balance,
        closing_balance: details.closing_balance
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to save bank statement details');
    }

    // Get download URL for the Excel file
    const { data: urlData } = supabase.storage
      .from('pdfs')
      .getPublicUrl(excelFilePath);

    return {
      name: generateFileName(details),
      details,
      downloadUrl: urlData.publicUrl,
      filePath: uploadData.path
    };
  } catch (error) {
    // Clean up uploaded file if processing failed
    await supabase.storage.from('pdfs').remove([uploadData.path]);
    throw error;
  }
};