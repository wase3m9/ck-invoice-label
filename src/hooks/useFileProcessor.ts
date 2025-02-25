
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { ProcessingState } from '../components/ProcessingStatus';

export interface ProcessedFile {
  name: string;
  size: number;
  status: ProcessingState;
  downloadUrl?: string;
  details?: {
    location: string;
    supplier_name: string;
    invoice_number: string;
    gross_invoice_amount: string;
  };
  filePath?: string;
}

export const useFileProcessor = (labelFormat: string[], generateFileName: (details: any) => string) => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);

  const processFile = async (file: File) => {
    try {
      console.log('Starting file processing:', file.name);
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      console.log('Uploading to storage...');
      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload file');
      }

      const formData = new FormData();
      formData.append('file', file);

      console.log('Processing with edge function...');
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
      console.log('Edge function response:', data);
      
      const extractedDetails = data.details;
      const newFilename = generateFileName(extractedDetails);

      console.log('Saving to database...');
      const { error: dbError } = await supabase
        .from('invoices')
        .insert({
          original_filename: file.name,
          processed_filename: newFilename,
          file_path: filePath,
          location: extractedDetails.location,
          supplier_name: extractedDetails.supplier_name,
          invoice_number: extractedDetails.invoice_number,
          gross_invoice_amount: extractedDetails.gross_invoice_amount
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
      };
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  };

  const handleFilesDrop = async (droppedFiles: File[]) => {
    const newFiles = droppedFiles.map(file => ({
      name: file.name,
      size: file.size,
      status: 'processing' as ProcessingState
    }));

    setFiles(prev => [...prev, ...newFiles]);

    for (let i = 0; i < droppedFiles.length; i++) {
      const file = droppedFiles[i];
      try {
        const processedDetails = await processFile(file);
        
        setFiles(prev => {
          const updated = [...prev];
          const fileIndex = prev.findIndex(f => f.name === file.name);
          if (fileIndex !== -1) {
            updated[fileIndex] = {
              ...updated[fileIndex],
              name: processedDetails.name,
              status: 'success',
              downloadUrl: processedDetails.downloadUrl,
              details: processedDetails.details,
            };
          }
          return updated;
        });
        
        toast.success(`${file.name} processed successfully`);
      } catch (error) {
        console.error('File processing error:', error);
        setFiles(prev => {
          const updated = [...prev];
          const fileIndex = prev.findIndex(f => f.name === file.name);
          if (fileIndex !== -1) {
            updated[fileIndex] = {
              ...updated[fileIndex],
              status: 'error',
            };
          }
          return updated;
        });
        
        toast.error(`Failed to process ${file.name}`);
      }
    }
  };

  const handleSave = async (file: ProcessedFile) => {
    if (file.downloadUrl && file.filePath) {
      try {
        // First update the downloaded_at timestamp
        const { error: updateError } = await supabase
          .from('invoices')
          .update({ downloaded_at: new Date().toISOString() })
          .eq('file_path', file.filePath);

        if (updateError) {
          console.error('Error updating download timestamp:', updateError);
          throw updateError;
        }

        // Then download the file
        const response = await fetch(file.downloadUrl);
        const blob = await response.blob();
        
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = file.name;
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadLink.href);
        
        toast.success(`${file.name} downloaded. File will be removed in 10 minutes.`);
      } catch (error) {
        console.error('Error saving file:', error);
        toast.error(`Failed to save ${file.name}`);
      }
    }
  };

  const handleDelete = async (file: ProcessedFile) => {
    try {
      if (file.filePath) {
        const { error: deleteError } = await supabase.storage
          .from('pdfs')
          .remove([file.filePath]);

        if (deleteError) throw deleteError;

        const { error: dbError } = await supabase
          .from('invoices')
          .delete()
          .eq('file_path', file.filePath);

        if (dbError) throw dbError;
      }

      setFiles(prev => prev.filter(f => f.name !== file.name));
      toast.success(`${file.name} deleted successfully`);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  return { files, handleFilesDrop, handleSave, handleDelete };
};
