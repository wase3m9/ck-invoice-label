
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileBadge } from 'lucide-react';
import { toast } from 'sonner';

const EmptyChar = () => {
  const emptyChar = '\u200B'; // Zero-width space character

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(emptyChar);
      toast.success('Empty character copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <FileBadge className="mx-auto h-12 w-12 text-primary mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Empty Character Tool</h2>
          <p className="text-gray-600 mb-6">
            Click the button below to copy an invisible empty character to your clipboard.
            This character can be used where regular spaces are not accepted.
          </p>
        </div>
        <Button 
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2"
        >
          <FileBadge className="h-4 w-4" />
          Copy to clipboard
        </Button>
      </div>
    </div>
  );
};

export default EmptyChar;
