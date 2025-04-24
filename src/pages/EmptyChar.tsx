
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Characters } from 'lucide-react';
import EmptyCharacterTool from '@/components/EmptyCharacter';

const EmptyChar = () => {
  const navigate = useNavigate();

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
            <Characters className="h-8 w-8" />
            Empty Character Tool
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Need an invisible character? This tool provides a zero-width space character that can be used where regular spaces aren't accepted. Perfect for forms, messages, or any other situation where you need an empty but valid input.
          </p>
        </div>

        <EmptyCharacterTool />
      </div>
    </div>
  );
};

export default EmptyChar;
