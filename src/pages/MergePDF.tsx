
import { useState } from 'react';
import { FileUpload } from '../components/FileUpload';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileList } from '../components/FileList';
import { ProcessedFile } from '../types/file';
import { ArrowDownUp, FileMerge } from 'lucide-react';

const MergePDF = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);

  const handleFilesDrop = (droppedFiles: File[]) => {
    const newFiles = droppedFiles.map(file => ({
      name: file.name,
      size: file.size,
      status: 'success' as const
    }));

    setFiles(prev => [...prev, ...newFiles]);
    toast.success(`${droppedFiles.length} file(s) added successfully`);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error('Please upload at least 2 PDF files to merge');
      return;
    }

    setIsMerging(true);
    const toastId = toast.loading('Merging PDFs...');

    // Placeholder for actual merge functionality
    // This would typically call a backend API or Supabase function
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('PDFs merged successfully! Download link is ready.');
      setIsMerging(false);
      toast.dismiss(toastId);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      toast.error('Failed to merge PDFs');
      setIsMerging(false);
      toast.dismiss(toastId);
    }
  };

  const handleDelete = (file: ProcessedFile) => {
    setFiles(prev => prev.filter(f => f.name !== file.name));
    toast.success(`${file.name} removed from merge list`);
  };

  const handleReorder = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === files.length - 1)) {
      return;
    }

    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    setFiles(newFiles);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Merge PDF Files
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Combine PDFs in the order you want with the easiest PDF merger available. Simply upload your PDF files, arrange them in the desired order, and click merge.
          </p>
        </div>

        <div className="glass-card p-8 mb-8">
          <FileUpload onFilesDrop={handleFilesDrop} />
          
          {files.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Files to merge (in this order)</h2>
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="file-item flex items-center justify-between">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full mr-3">
                      {index + 1}
                    </span>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReorder(index, 'up')}
                        disabled={index === 0}
                        className="text-gray-500"
                      >
                        <ArrowDownUp className="h-4 w-4 rotate-90" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReorder(index, 'down')}
                        disabled={index === files.length - 1}
                        className="text-gray-500"
                      >
                        <ArrowDownUp className="h-4 w-4 -rotate-90" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(file)}
                        className="h-8 w-8"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={handleMerge} 
                  disabled={isMerging || files.length < 2}
                  className="px-8"
                >
                  <FileMerge className="mr-2 h-5 w-5" />
                  {isMerging ? 'Merging...' : 'Merge PDFs'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MergePDF;
