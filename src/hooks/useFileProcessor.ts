
import { useState } from 'react';
import { toast } from 'sonner';
import { ProcessedFile } from '../types/file';
import { downloadFile, deleteFile, processFile } from '../utils/fileUtils';
import { ProcessingState } from '../components/ProcessingStatus';

export const useFileProcessor = (
  labelFormat: string[], 
  generateFileName: (details: any) => string,
  userId: string
) => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);

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
        const processedDetails = await processFile(file, generateFileName, userId);
        
        setFiles(prev => {
          const updated = [...prev];
          const fileIndex = prev.findIndex(f => f.name === file.name);
          if (fileIndex !== -1) {
            updated[fileIndex] = {
              ...updated[fileIndex],
              name: processedDetails.name,
              status: 'success',
              downloadUrl: processedDetails.downloadUrl,
              filePath: processedDetails.filePath, // Add filePath here
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
    try {
      await downloadFile(file);
      toast.success(`${file.name} downloaded. File will be removed in 10 minutes.`);
    } catch (error) {
      console.error('Error saving file:', error);
      toast.error(`Failed to save ${file.name}`);
    }
  };

  const handleDelete = async (file: ProcessedFile) => {
    try {
      await deleteFile(file);
      setFiles(prev => prev.filter(f => f.name !== file.name));
      toast.success(`${file.name} deleted successfully`);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  return { files, handleFilesDrop, handleSave, handleDelete };
};
