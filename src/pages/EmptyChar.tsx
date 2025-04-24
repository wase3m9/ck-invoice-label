
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Home, 
  FileText,
  Copy
} from 'lucide-react';

const EmptyChar = () => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  
  const emptyChar = '\u200B'; // Zero-width space character

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(emptyChar);
      toast.success('Empty character copied to clipboard');
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto relative">
        <div className="absolute left-0 top-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="h-10 w-10 rounded-full"
            aria-label="Go to home page"
          >
            <Home className="h-18 w-18" />
          </Button>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight flex items-center justify-center gap-3">
            <Copy className="h-8 w-8" />
            Empty Character Tool
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Generate an invisible zero-width space character that can be used in situations where regular spaces are not accepted or visible.
          </p>
        </div>

        <div className="glass-card p-8 mb-8">
          <div className="text-center space-y-6">
            <div className="bg-gray-100 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Zero-Width Space Character</h2>
              <p className="text-gray-600 mb-4">
                This invisible character helps in text formatting and can prevent unwanted word breaks.
              </p>
              <pre className="bg-white border rounded p-4 text-sm text-gray-700 overflow-x-auto">
                {JSON.stringify(emptyChar)}
              </pre>
            </div>
            
            <Button 
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 mt-6"
              variant={copied ? "secondary" : "default"}
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyChar;
