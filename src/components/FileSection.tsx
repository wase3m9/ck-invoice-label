
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { FileList } from './FileList';
import { ProcessedFile } from '../hooks/useFileProcessor';

interface FileSectionProps {
  files: ProcessedFile[];
  onSave: (file: ProcessedFile) => void;
}

export const FileSection = ({ files, onSave }: FileSectionProps) => {
  if (files.length === 0) return null;

  return (
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
      <FileList 
        files={files} 
        onSave={onSave}
      />
    </div>
  );
};
