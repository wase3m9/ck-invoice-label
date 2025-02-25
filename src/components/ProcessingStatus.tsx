
import { CircleOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export type ProcessingState = 'idle' | 'processing' | 'success' | 'error';

interface ProcessingStatusProps {
  state: ProcessingState;
  message?: string;
}

export const ProcessingStatus = ({ state }: ProcessingStatusProps) => {
  switch (state) {
    case 'idle':
      return <CircleOff className="h-5 w-5 text-gray-400" />;
    case 'processing':
      return <Loader2 className="h-5 w-5 text-accent animate-spin" />;
    case 'success':
      return <CheckCircle2 className="h-5 w-5 text-accent" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-destructive" />;
  }
};
