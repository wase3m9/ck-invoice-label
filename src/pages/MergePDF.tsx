import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  FilesIcon, 
  Upload, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  FileText,
  FolderOpen,
  Download,
  ArrowLeftRight
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

type MergeFile = {
  id: string;
  file: File;
};

const MergePDF = () => {
  const [files, setFiles] = useState<MergeFile[]>([]);
  const [merging, setMerging] = useState(false);
  const [mergedFileUrl, setMergedFileUrl] = useState<string | null>(null);
  const [mergedFileName, setMergedFileName] = useState<string>('merged-document.pdf');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    setMergedFileUrl(null);
    toast.success(`${acceptedFiles.length} files added`);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    noClick: true
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
    setMergedFileUrl(null);
  };

  const moveFile = (id: string, direction: 'up' | 'down') => {
    const index = files.findIndex(file => file.id === id);
    if (index === -1) return;
    
    const newFiles = [...files];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= files.length) return;
    
    const temp = newFiles[index];
    newFiles[index] = newFiles[newIndex];
    newFiles[newIndex] = temp;
    
    setFiles(newFiles);
    setMergedFileUrl(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error("Please add at least 2 PDF files to merge");
      return;
    }

    setMerging(true);
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file${index}`, file.file);
      });

      const combinedPdfBytes = await combinePdfs(files.map(f => f.file));
      const blob = new Blob([combinedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setMergedFileUrl(url);
      setMergedFileName(`merged-${new Date().toISOString().slice(0, 10)}.pdf`);
      
      toast.success("PDFs merged successfully! You can now download the merged file.");
    } catch (error) {
      console.error('Error merging PDFs:', error);
      toast.error("Error merging PDFs. Please try again.");
    } finally {
      setMerging(false);
    }
  };

  const combinePdfs = async (pdfFiles: File[]): Promise<Uint8Array> => {
    const totalSize = pdfFiles.reduce((sum, file) => sum + file.size, 0);
    const result = new Uint8Array(totalSize);
    
    let offset = 0;
    for (const file of pdfFiles) {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      
      result.set(bytes, offset);
      offset += bytes.length;
    }
    
    return result;
  };

  const handleDownload = () => {
    if (!mergedFileUrl) {
      toast.error("No merged file available to download");
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.href = mergedFileUrl;
      link.download = mergedFileName;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(mergedFileUrl);
      }, 100);
      
      toast.success("Download started!");
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Error downloading file. Please try again.");
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFiles(items);
    setMergedFileUrl(null);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Merge PDF Files
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Combine PDFs in the order you want with the easiest PDF merger available. Simply upload your PDF files, arrange them in your preferred order, and merge them into a single document.
          </p>
        </div>

        <div className="glass-card p-8 mb-8">
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
                or select files
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
        </div>

        {files.length > 0 && (
          <div className="glass-card p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FilesIcon className="mr-2" /> Files to Merge
            </h2>
            <p className="text-sm text-gray-500 mb-4 flex items-center justify-center">
              <ArrowLeftRight className="mr-2 h-4 w-4 text-primary" />
              Drag to reorder or use the arrows to change the order. Files will be merged in the order shown.
            </p>
            
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {files.map((file, index) => (
                      <Draggable key={file.id} draggableId={file.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="file-item flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="bg-primary/10 text-primary font-medium rounded-md w-8 h-8 flex items-center justify-center">
                                {index + 1}
                              </div>
                              <FileText className="h-8 w-8 text-foreground flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 truncate">
                                  {file.file.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {(file.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => moveFile(file.id, 'up')}
                                disabled={index === 0}
                                className="h-8 w-8"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => moveFile(file.id, 'down')}
                                disabled={index === files.length - 1}
                                className="h-8 w-8"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFile(file.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            
            <div className="mt-6 flex justify-center gap-3">
              <Button
                onClick={handleMerge}
                disabled={files.length < 2 || merging}
                className="px-6"
              >
                {merging ? "Merging PDFs..." : "Merge PDFs"}
              </Button>
              
              {mergedFileUrl && (
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="px-6"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Merged PDF
                </Button>
              )}
            </div>
          </div>
        )}

        {mergedFileUrl && (
          <div className="glass-card p-8 mb-8 bg-green-50 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-green-800 flex items-center">
                <FileText className="mr-2" /> Merged Document Ready
              </h2>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="px-4 border-green-500 text-green-700 hover:bg-green-100"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
            <p className="text-green-700 mb-2">
              Your merged PDF is ready to download. The file will be named: <span className="font-semibold">{mergedFileName}</span>
            </p>
            <p className="text-sm text-green-600">
              Note: This link will only be available for this session. Make sure to download your file before closing the browser.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MergePDF;
