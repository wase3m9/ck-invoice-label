
import { useState } from 'react';
import { FileUpload } from '../components/FileUpload';
import { FileList } from '../components/FileList';
import { ProcessingState } from '../components/ProcessingStatus';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

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
      // First, read the PDF text (in a real implementation, we'd use a PDF parsing library)
      const text = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsText(file);
      });

      // Process the PDF text with GPT
      const response = await fetch('/functions/process-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfText: text }),
      });

      if (!response.ok) throw new Error('Failed to process invoice');

      const { details } = await response.json();
      const parsedDetails = JSON.parse(details);

      // Generate new filename based on extracted details
      const newFilename = `${parsedDetails.location} - ${parsedDetails.supplier_name} ${parsedDetails.invoice_number} £${parsedDetails.gross_invoice_amount}.pdf`;

      return {
        name: newFilename,
        details: parsedDetails,
        downloadUrl: '#', // In real implementation, this would be the actual download URL
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

  const handleDownload = (file: ProcessedFile) => {
    // In a real implementation, this would trigger the actual download
    toast.info(`Downloading ${file.name}`);
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
