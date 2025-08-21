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
  return;
};
export default EmptyCharacter;