
import { useState } from 'react';
import { FileUpload } from '../components/FileUpload';
import { FileList } from '../components/FileList';
import { ProcessingState } from '../components/ProcessingStatus';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

interface ProcessedFile {
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
}

const Index = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);

  const processFile = async (file: File) => {
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(filePath, file);

      if (uploadError) throw new Error('Failed to upload file');

      // Create FormData to send the file
      const formData = new FormData();
      formData.append('file', file);

      // Process the PDF with GPT
      const response = await fetch('https://yjhamwwwryfswimjjzgt.supabase.co/functions/v1/process-invoice', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGFtd3d3cnlmc3dpbWpqemd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDMxNTYsImV4cCI6MjA1NjA3OTE1Nn0.bjbj1u32328r2NepQxBlhQeo_D3VXJpRR5VDzCR09DQ`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process invoice');
      }

      const { details } = await response.json();
      const parsedDetails = JSON.parse(details);

      // Generate new filename based on extracted details
      const newFilename = `${parsedDetails.location} - ${parsedDetails.supplier_name} ${parsedDetails.invoice_number} £${parsedDetails.gross_invoice_amount}.pdf`;

      // Store invoice details in the database
      const { error: dbError } = await supabase
        .from('invoices')
        .insert({
          original_filename: file.name,
          processed_filename: newFilename,
          file_path: filePath,
          location: parsedDetails.location,
          supplier_name: parsedDetails.supplier_name,
          invoice_number: parsedDetails.invoice_number,
          gross_invoice_amount: parsedDetails.gross_invoice_amount
        });

      if (dbError) throw new Error('Failed to save invoice details');

      // Get the download URL
      const { data: { publicUrl } } = supabase.storage
        .from('pdfs')
        .getPublicUrl(filePath);

      return {
        name: newFilename,
        details: parsedDetails,
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

    // Process each file
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

  const handleDownload = async (file: ProcessedFile) => {
    if (file.downloadUrl) {
      window.open(file.downloadUrl, '_blank');
      toast.success(`Downloading ${file.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PDF Invoice Organizer
          </h1>
          <p className="text-lg text-gray-600">
            Upload your invoices and we'll organize them automatically
          </p>
        </div>

        <div className="glass-card p-8 mb-8">
          <FileUpload onFilesDrop={handleFilesDrop} />
        </div>

        {files.length > 0 && (
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Uploaded Files
              </h2>
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
                onClick={() => toast.info('Downloading all files')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download All
              </button>
            </div>
            <FileList files={files} onDownload={handleDownload} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
