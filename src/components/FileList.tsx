
import { ProcessingStatus, ProcessingState } from './ProcessingStatus';
import { FileText, Download, Save } from 'lucide-react';

interface FileItem {
  name: string;
  size: number;
  status: ProcessingState;
  downloadUrl?: string;
}

interface FileListProps {
  files: FileItem[];
  onDownload?: (file: FileItem) => void;
  onSave?: (file: FileItem) => void;
}

export const FileList = ({ files, onDownload, onSave }: FileListProps) => {
  if (files.length === 0) return null;

  return (
    <div className="space-y-4">
      {files.map((file, index) => (
        <div key={index} className="file-item flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-accent" />
            <div>
              <p className="font-medium text-gray-900 truncate max-w-[300px]">
                {file.name}
              </p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ProcessingStatus state={file.status} />
            {file.downloadUrl && (
              <>
                <button
                  onClick={() => onDownload?.(file)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="View file"
                >
                  <Download className="h-5 w-5 text-accent" />
                </button>
                <button
                  onClick={() => onSave?.(file)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="Save file"
                >
                  <Save className="h-5 w-5 text-accent" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
