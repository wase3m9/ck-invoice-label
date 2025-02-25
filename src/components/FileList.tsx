
import { ProcessingStatus, ProcessingState } from './ProcessingStatus';
import { FileText, Save, Trash2 } from 'lucide-react';

interface FileItem {
  name: string;
  size: number;
  status: ProcessingState;
  downloadUrl?: string;
  filePath?: string;
}

interface FileListProps {
  files: FileItem[];
  onSave?: (file: FileItem) => void;
  onDelete?: (file: FileItem) => void;
}

export const FileList = ({ files, onSave, onDelete }: FileListProps) => {
  if (files.length === 0) return null;

  return (
    <div className="space-y-4">
      {files.map((file, index) => (
        <div key={index} className="file-item flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <FileText className="h-8 w-8 text-foreground flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 break-all pr-4">
                {file.name}
              </p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <ProcessingStatus state={file.status} />
            {file.downloadUrl && (
              <>
                <button
                  onClick={() => onSave?.(file)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="Save file"
                >
                  <Save className="h-5 w-5 text-foreground" />
                </button>
                <button
                  onClick={() => onDelete?.(file)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="Delete file"
                >
                  <Trash2 className="h-5 w-5 text-destructive" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
