
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFilesDrop: (files: File[]) => void;
}

export const FileUpload = ({ onFilesDrop }: FileUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesDrop(acceptedFiles);
  }, [onFilesDrop]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 30,
    noClick: true, // Disable click on the entire dropzone to open file dialog
  });

  return (
    <div 
      {...getRootProps()} 
      className={`dropzone ${isDragActive ? 'dropzone-active' : 'border-gray-200 hover:border-accent'}`}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900">
          {isDragActive ? 'Drop PDFs here...' : 'Drag & drop PDFs here'}
        </p>
        <p className="mt-2 text-sm text-gray-500 mb-4">
          or select files (max 30 files)
        </p>
        <Button 
          onClick={open} 
          type="button" 
          variant="outline" 
          className="mt-2"
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          Select PDF Files
        </Button>
      </div>
    </div>
  );
};
