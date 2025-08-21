import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
const EmptyCharacter = () => {
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
    <div className="glass-card p-8">
      <div className="text-center space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Empty Character Tool</h3>
        <p className="text-gray-600">
          Click to copy an invisible empty character to your clipboard
        </p>
        <Button 
          onClick={handleCopy}
          className="flex items-center justify-center gap-2"
          variant="outline"
        >
          <Copy className="h-4 w-4" />
          Copy Empty Character
        </Button>
      </div>
    </div>
  );
};
export default EmptyCharacter;