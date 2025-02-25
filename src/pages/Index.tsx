
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
}

const Index = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);

  const handleFilesDrop = (droppedFiles: File[]) => {
    const newFiles = droppedFiles.map(file => ({
      name: file.name,
      size: file.size,
      status: 'processing' as ProcessingState
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate processing
    newFiles.forEach((file, index) => {
      setTimeout(() => {
        setFiles(prev => {
          const updated = [...prev];
          const fileIndex = prev.findIndex(f => f.name === file.name);
          if (fileIndex !== -1) {
            updated[fileIndex] = {
              ...updated[fileIndex],
              status: 'success',
              downloadUrl: '#' // In real implementation, this would be the actual download URL
            };
          }
          return updated;
        });
        toast.success(`${file.name} processed successfully`);
      }, (index + 1) * 1500);
    });
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
