
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, FilePlus } from 'lucide-react';

const Login = () => {
  const [password, setPassword] = useState('');
  const [selectedTab, setSelectedTab] = useState('autolabel');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTab === 'autolabel' && password === '1111') {
      navigate('/dashboard');
      return;
    } 
    
    if (selectedTab === 'merge' && password === '2222') {
      navigate('/merge');
      return;
    }
    
    toast.error('Incorrect password');
    setPassword('');
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
        </div>

        <Tabs 
          defaultValue="autolabel" 
          className="w-full" 
          onValueChange={(value) => {
            setSelectedTab(value);
            setPassword('');
          }}
        >
          <TabsList className="grid grid-cols-2 w-full mb-6 overflow-hidden rounded-xl border">
            <TabsTrigger 
              value="autolabel" 
              className="h-14 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200"
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="font-medium">PDF AutoLabel</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="merge" 
              className="h-14 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200"
            >
              <div className="flex items-center justify-center gap-2">
                <FilePlus className="h-5 w-5" />
                <span className="font-medium">Merge PDFs</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="autolabel" className="mt-2 space-y-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <FileText className="h-6 w-6" />
                PDF AutoLabel
              </h1>
              <p className="text-gray-600 text-center">
                Labelling uploaded PDF invoices in a structured and consistent format
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-6 space-y-3 flex flex-col items-center">
              <Input
                type="password"
                placeholder="Enter access code"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center w-[200px]"
                autoFocus
              />
              <Button type="submit" className="w-[200px]">
                Continue
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="merge" className="mt-2 space-y-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <FilePlus className="h-6 w-6" />
                Merge PDF Files
              </h1>
              <p className="text-gray-600 text-center">
                Combine PDFs in the order you want with the easiest PDF merger available
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-6 space-y-3 flex flex-col items-center">
              <Input
                type="password"
                placeholder="Enter access code"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center w-[200px]"
                autoFocus
              />
              <Button type="submit" className="w-[200px]">
                Continue
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
