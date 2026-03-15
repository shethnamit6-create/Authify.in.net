'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth-context';

export default function AdminLoginPage() {
  const router = useRouter();
  const getRedirect = () => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('redirect');
  };
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Use the auth context login method
      await login(formData);

      // Check if user is admin
      const userStr = (typeof window !== 'undefined' ? localStorage.getItem('user') : null);
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') {
          // Redirect to admin portal
          const redirect = getRedirect() || '/admin-fixed-final';
          router.push(redirect);
        } else {
          setError('Access denied. Admin privileges required.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 p-3 rounded-lg inline-flex mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400">Enter your admin credentials</p>
        </div>

        {/* Login Form */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Admin Login</CardTitle>
            <CardDescription className="text-gray-400">
              Simple username and password authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@authify.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                  <Lock className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert className="bg-red-900/20 border-red-800">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm mb-2">
                Not an admin?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Go to User Login
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


