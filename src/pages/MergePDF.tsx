
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
  ArrowLeftRight,
  Home,
  FileUp,
  LogOut
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PDFDocument } from 'pdf-lib';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type MergeFile = {
  id: string;
  file: File;
};

const MergePDF = () => {
  const [files, setFiles] = useState<MergeFile[]>([]);
  const [merging, setMerging] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(file => 
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    
    if (pdfFiles.length < acceptedFiles.length) {
      toast.warning(`${acceptedFiles.length - pdfFiles.length} non-PDF files were ignored`);
    }
    
    const newFiles = pdfFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    
    if (pdfFiles.length > 0) {
      toast.success(`${pdfFiles.length} PDF file${pdfFiles.length === 1 ? '' : 's'} added`);
    }
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
  };

  const combinePdfs = async (pdfFiles: File[]): Promise<Uint8Array> => {
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of pdfFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
      }
      
      const mergedPdfBytes = await mergedPdf.save();
      
      return mergedPdfBytes;
    } catch (error) {
      console.error('Error merging PDFs:', error);
      throw new Error('Failed to merge PDF files');
    }
  };

  const downloadMergedFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error("Please add at least 2 PDF files to merge");
      return;
    }

    setMerging(true);
    try {
      const combinedPdfBytes = await combinePdfs(files.map(f => f.file));
      
      const blob = new Blob([combinedPdfBytes], { type: 'application/pdf' });
      
      const mergedFileName = `merged-${new Date().toISOString().slice(0, 10)}.pdf`;
      
      toast.success("PDFs merged successfully!");
      
      downloadMergedFile(blob, mergedFileName);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      toast.error("Error merging PDFs. Please try again.");
    } finally {
      setMerging(false);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFiles(items);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto relative">
        <div className="absolute left-0 top-0 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/auth')}
            className="h-10 w-10 rounded-full"
            aria-label="Go to home page"
          >
            <Home className="h-18 w-18" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="h-10 w-10 rounded-full"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight flex items-center justify-center gap-3">
            <FileUp className="h-8 w-8" />
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
          <div className="glass-card p-8 mb-8 bg-[#fff5f5]">
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
                            className="file-item flex items-center bg-[#f9f9f9] p-4 rounded-md"
                          >
                            <div className="bg-gray-200 text-gray-700 font-medium rounded-full w-8 h-8 flex items-center justify-center mr-4">
                              {index + 1}
                            </div>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
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
                                aria-label="Move up"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => moveFile(file.id, 'down')}
                                disabled={index === files.length - 1}
                                className="h-8 w-8"
                                aria-label="Move down"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFile(file.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                aria-label="Remove file"
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
            
            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleMerge}
                disabled={files.length < 2 || merging}
                className="px-6 bg-gray-700 hover:bg-gray-800"
              >
                <Download className="mr-2 h-4 w-4" />
                {merging ? "Merging PDFs..." : "Merge PDFs"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MergePDF;
