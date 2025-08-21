import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, FilePlus, Copy, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTab, setSelectedTab] = useState('autolabel');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { error } = authMode === 'signin' 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        toast.error(error.message);
        return;
      }

      if (authMode === 'signin') {
        // Navigate based on selected tab
        if (selectedTab === 'autolabel') {
          navigate('/dashboard');
        } else if (selectedTab === 'merge') {
          navigate('/merge');
        } else if (selectedTab === 'empty-char') {
          navigate('/empty-char');
        }
      } else {
        toast.success('Please check your email to confirm your account');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <img src="/lovable-uploads/5574e1a3-6ab7-4e5b-aaf8-f74b255fe514.png" alt="CloudKeepers Logo" className="h-16 mb-8" />
        </div>

        <Tabs defaultValue="autolabel" className="w-full" onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-3 w-full mb-6 h-auto rounded-xl border bg-muted mx-0 my-0 py-0 px-px">
            <TabsTrigger value="autolabel" className="flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-2 py-3 px-2 text-xs lg:text-sm data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium text-center">PDF AutoLabel</span>
            </TabsTrigger>
            <TabsTrigger value="merge" className="flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-2 py-3 px-2 text-xs lg:text-sm data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
              <FilePlus className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium text-center">Merge PDFs</span>
            </TabsTrigger>
            <TabsTrigger value="empty-char" className="flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-2 py-3 px-2 text-xs lg:text-sm data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
              <Copy className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium text-center">Empty Character</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Tab Contents */}
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
          </TabsContent>
        </Tabs>

        {/* Auth Form */}
        <div className="space-y-4">
          <Tabs defaultValue="signin" onValueChange={(value) => setAuthMode(value as 'signin' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">
                {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;