
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const [password, setPassword] = useState('');
  const [mergePassword, setMergePassword] = useState('');
  const navigate = useNavigate();

  const handleAutoLabelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1111') {
      navigate('/dashboard');
    } else {
      toast.error('Incorrect access code');
      setPassword('');
    }
  };

  const handleMergeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mergePassword === '2222') {
      navigate('/merge');
    } else {
      toast.error('Incorrect access code');
      setMergePassword('');
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
            PDF AutoLabel
          </h1>
          <p className="text-gray-600 text-center">
            Labelling uploaded PDF invoices in a structured and consistent format
          </p>
        </div>

        <Tabs defaultValue="autolabel" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="autolabel">AutoLabel</TabsTrigger>
            <TabsTrigger value="merge">Merge PDFs</TabsTrigger>
          </TabsList>
          <TabsContent value="autolabel">
            <form onSubmit={handleAutoLabelSubmit} className="mt-4 space-y-3 flex flex-col items-center">
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
          </TabsContent>
          <TabsContent value="merge">
            <div className="mt-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
                Merge PDF Files
              </h2>
              <p className="text-gray-600 text-center mb-4">
                Combine PDFs in the order you want with the easiest PDF merger available
              </p>
              <form onSubmit={handleMergeSubmit} className="space-y-3 flex flex-col items-center">
                <Input
                  type="password"
                  placeholder="Enter access code"
                  value={mergePassword}
                  onChange={(e) => setMergePassword(e.target.value)}
                  className="text-center w-[160px]"
                />
                <Button type="submit" className="w-[160px]">
                  Continue
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
