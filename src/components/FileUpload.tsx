
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFilesDrop: (files: File[]) => void;
}

export const FileUpload = ({ onFilesDrop }: FileUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesDrop(acceptedFiles);
  }, [onFilesDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 30,
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
        <p className="mt-2 text-sm text-gray-500">
          or click to select files (max 30 files)
        </p>
      </div>
    </div>
  );
};
