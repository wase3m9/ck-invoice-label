
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Login = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1111') {
      navigate('/dashboard');
    } else {
      toast.error('Incorrect password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <img
            src="/lovable-uploads/5574e1a3-6ab7-4e5b-aaf8-f74b255fe514.png"
            alt="CloudKeepers Logo"
            className="h-16 mb-8"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            PDF Invoice Label
          </h1>
          <p className="text-gray-600 text-center">
            Enter access code to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-3 flex flex-col items-center">
          <Input
            type="password"
            placeholder="Enter access code"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-center w-[160px]"
            autoFocus
          />
          <Button type="submit" className="w-[160px]">
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
