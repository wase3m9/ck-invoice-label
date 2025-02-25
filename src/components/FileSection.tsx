
import { Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { FileList } from './FileList';
import { ProcessedFile } from '../types/file';
import { useState } from 'react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';

interface FileSectionProps {
  files: ProcessedFile[];
  onSave: (file: ProcessedFile) => void;
  onDelete: (file: ProcessedFile) => void;
}

export const FileSection = ({ files, onSave, onDelete }: FileSectionProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (files.length === 0) return null;

  const handleDownloadAll = async () => {
    if (files.length === 0) {
      toast.error('No files to download');
      return;
    }

    setIsDownloading(true);
    const toastId = toast.loading('Creating zip file...');

    try {
      const downloadableFiles = files.filter(file => file.downloadUrl && file.filePath);
      
      if (downloadableFiles.length === 0) {
        toast.error('No processed files available to download');
        return;
      }

      const { data } = await supabase.functions.invoke('create-zip', {
        body: { files: downloadableFiles }
      });

      // Convert the response to a blob
      const blob = await data.blob();

      try {
        // Try to use the File System Access API first
        if (window.showSaveFilePicker) {
          const handle = await window.showSaveFilePicker({
            suggestedName: `invoices-${new Date().toISOString().slice(0,10)}.zip`,
            types: [{
              description: 'ZIP Archive',
              accept: {
                'application/zip': ['.zip'],
              },
            }],
          });
          
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          toast.success('Files downloaded successfully');
        } else {
          // Fallback for browsers that don't support File System Access API
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `invoices-${new Date().toISOString().slice(0,10)}.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success('Files ready to save');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error saving zip file:', err);
          toast.error('Failed to save zip file');
        }
      }
    } catch (error) {
      console.error('Error downloading files:', error);
      toast.error('Failed to create zip file');
    } finally {
      setIsDownloading(false);
      toast.dismiss(toastId);
    }
  };

  return (
    <div className="glass-card p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Uploaded Files
        </h2>
        <Button
          variant="outline"
          onClick={handleDownloadAll}
          disabled={isDownloading || files.length === 0}
          className="inline-flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          {isDownloading ? 'Creating Zip...' : 'Download All'}
        </Button>
      </div>
      <FileList 
        files={files} 
        onSave={onSave}
        onDelete={onDelete}
      />
    </div>
  );
};
