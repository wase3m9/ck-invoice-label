import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FileText, KeyRound } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === '3333') {
      navigate('/empty-char');
    } else if (accessCode === '1234') {
      navigate('/dashboard');
    } else if (accessCode === '2222') {
      navigate('/merge');
    } else {
      setError('Invalid access code');
      toast.error('Invalid access code');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F2FCE2] via-[#FFDEE2] to-[#D3E4FD]">
      <div className="glass-card p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center justify-center gap-3">
            <KeyRound className="h-6 w-6" />
            Access Required
          </h1>
          <p className="text-gray-600 mt-2">Enter the access code to proceed.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="accessCode">Access Code</Label>
            <Input
              type="password"
              id="accessCode"
              placeholder="Enter access code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full">
            Access Dashboard
          </Button>
        </form>
        <div className="mt-6 text-center text-gray-500">
          <p className="text-sm">
            Available access codes:
          </p>
          <ul className="list-disc pl-5">
            <li><code className="text-primary">1234</code> - PDF AutoLabel</li>
            <li><code className="text-primary">2222</code> - Merge PDFs</li>
            <li><code className="text-primary">3333</code> - Empty Character Tool</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
