
import { useState } from 'react';
import { Navbar, Footer } from '@/components';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Mock login with local storage
    try {
      // Check if user exists
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.email === loginEmail && u.password === loginPassword);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Store logged in user
      localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }));
      
      toast({
        title: "Success!",
        description: "You have been logged in.",
      });
      
      navigate('/profile');
    } catch (error: any) {
      console.error('Error during login:', error);
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!registerEmail || !registerPassword || !registerName) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Get existing users
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if user already exists
      if (users.some((u: any) => u.email === registerEmail)) {
        throw new Error('User with this email already exists');
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        created_at: new Date().toISOString()
      };
      
      // Save user to storage
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Login the user
      localStorage.setItem('currentUser', JSON.stringify({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        created_at: newUser.created_at
      }));
      
      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
      });
      
      navigate('/profile');
    } catch (error: any) {
      console.error('Error during registration:', error);
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate admin credentials
    if (adminEmail !== 'admin@example.com' || adminPassword !== 'admin123') {
      toast({
        title: "Admin Login Failed",
        description: "Invalid admin credentials",
        variant: "destructive"
      });
      return;
    }
    
    // Create admin user if it doesn't exist
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const adminUser = users.find((user: any) => user.email === 'admin@example.com');
    
    if (!adminUser) {
      // Create new admin user
      const newAdmin = {
        id: Date.now().toString(),
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        isAdmin: true,
        createdAt: new Date().toISOString()
      };
      
      // Save admin to storage
      users.push(newAdmin);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Log the admin in
      localStorage.setItem('currentUser', JSON.stringify({
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        isAdmin: true,
        createdAt: newAdmin.createdAt
      }));
    } else {
      // Log in with existing admin
      localStorage.setItem('currentUser', JSON.stringify({
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        isAdmin: true,
        createdAt: adminUser.created_at || adminUser.createdAt
      }));
    }
    
    toast({
      title: "Admin Login Successful",
      description: "You have been logged in as administrator.",
    });
    
    setAdminLoginOpen(false);
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-16 sm:px-6 lg:px-8 flex items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="flex items-center gap-1">
                <LogIn className="h-4 w-4" />
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-1">
                <UserPlus className="h-4 w-4" />
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon"
                      className="absolute right-1 top-1"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input 
                    id="register-email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="register-password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon"
                      className="absolute right-1 top-1"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Dialog open={adminLoginOpen} onOpenChange={setAdminLoginOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin Login
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Admin Login</DialogTitle>
                  <DialogDescription>
                    Enter your admin credentials to access the admin panel.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAdminLogin} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input 
                      id="admin-email" 
                      type="email" 
                      placeholder="admin@example.com" 
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Admin Password</Label>
                    <div className="relative">
                      <Input 
                        id="admin-password" 
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••" 
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                      />
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        className="absolute right-1 top-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-accent hover:bg-accent/90">
                      Login as Admin
                    </Button>
                  </DialogFooter>
                </form>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Default: admin@example.com / admin123
                </p>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;
