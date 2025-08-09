import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, FilePlus, Copy, BarChart3 } from 'lucide-react';

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
    if (selectedTab === 'empty-char' && password === '3333') {
      navigate('/empty-char');
      return;
    }
    if (selectedTab === 'bank-statement' && password === '4444') {
      navigate('/bank-statement');
      return;
    }
    toast.error('Incorrect password');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <img src="/lovable-uploads/5574e1a3-6ab7-4e5b-aaf8-f74b255fe514.png" alt="CloudKeepers Logo" className="h-16 mb-8" />
        </div>

        <Tabs defaultValue="autolabel" className="w-full" onValueChange={value => {
          setSelectedTab(value);
          setPassword('');
        }}>
          <TabsList className="grid grid-cols-4 w-full mb-6 overflow rounded-xl border">
            <TabsTrigger value="autolabel" className="flex items-center justify-center gap-3 py-5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
              <FileText className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">PDF AutoLabel</span>
            </TabsTrigger>
            <TabsTrigger value="merge" className="flex items-center justify-center gap-3 py-5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
              <FilePlus className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Merge PDFs</span>
            </TabsTrigger>
            <TabsTrigger value="empty-char" className="flex items-center justify-center gap-3 py-5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
              <Copy className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Empty Character</span>
            </TabsTrigger>
            <TabsTrigger value="bank-statement" className="flex items-center justify-center gap-3 py-5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
              <BarChart3 className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Bank Statement</span>
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
            
            <form onSubmit={handleSubmit} className="mt-4 space-y-2 flex flex-col items-center">
              <Input type="password" placeholder="Enter access code" value={password} onChange={e => setPassword(e.target.value)} className="text-center w-[180px]" autoFocus />
              <Button type="submit" className="w-[180px] py-1 h-8">
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
            
            <form onSubmit={handleSubmit} className="mt-4 space-y-2 flex flex-col items-center">
              <Input type="password" placeholder="Enter access code" value={password} onChange={e => setPassword(e.target.value)} className="text-center w-[180px]" autoFocus />
              <Button type="submit" className="w-[180px] py-1 h-8">
                Continue
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="empty-char" className="mt-2 space-y-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <Copy className="h-6 w-6" />
                Empty Character Tool
              </h1>
              <p className="text-gray-600 text-center">
                Generate an invisible character that can be used where regular spaces are not accepted
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-4 space-y-2 flex flex-col items-center">
              <Input type="password" placeholder="Enter access code" value={password} onChange={e => setPassword(e.target.value)} className="text-center w-[180px]" autoFocus />
              <Button type="submit" className="w-[180px] py-1 h-8">
                Continue
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="bank-statement" className="mt-2 space-y-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Bank Statement Converter
              </h1>
              <p className="text-gray-600 text-center">
                Convert bank statement PDFs to structured Excel files
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-4 space-y-2 flex flex-col items-center">
              <Input type="password" placeholder="Enter access code" value={password} onChange={e => setPassword(e.target.value)} className="text-center w-[180px]" autoFocus />
              <Button type="submit" className="w-[180px] py-1 h-8">
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
