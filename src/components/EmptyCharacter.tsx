
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
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Empty Character Tool</h2>
      <p className="text-muted-foreground mb-6">
        Click the button below to copy an invisible empty character to your clipboard.
        This character can be used where regular spaces are not accepted.
      </p>
      <Button 
        onClick={handleCopy}
        className="flex items-center gap-2"
      >
        <Copy className="h-4 w-4" />
        Copy to clipboard
      </Button>
    </div>
  );
};

export default EmptyCharacter;
