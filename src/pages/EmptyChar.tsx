
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Home, Copy, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const EmptyChar = () => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const emptyChar = '\u200B'; // Zero-width space character

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(emptyChar);
      toast.success('Empty character copied to clipboard');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
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
            Empty Character Tool
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Click the button below to copy an invisible empty character to your clipboard. This character can be used where regular spaces are not accepted.
          </p>
        </div>

        <div className="glass-card p-8">
          <div className="text-center space-y-6">
            <Button 
              onClick={handleCopy}
              className="w-full max-w-md flex items-center justify-center gap-2"
              variant={copied ? "secondary" : "default"}
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyChar;
