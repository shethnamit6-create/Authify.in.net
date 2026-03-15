'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api-base';

export default function AdminLoginSimplePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      setMessage('🔄 Calling login API...');

      const response = await fetch(`${API_BASE_URL}/v1/company/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      setMessage(`🔄 API Response: ${response.status}`);

      if (response.ok && data.data?.token) {
        setMessage('✅ Login successful! Storing tokens...');

        // Store token in localStorage
        localStorage.setItem('accessToken', data.data.token);
        localStorage.setItem('user', JSON.stringify({ email: formData.email, role: 'admin', firstName: 'Admin', lastName: '' }));

        // Store token in cookies for middleware
        document.cookie = `accessToken=${data.data.token}; path=/; max-age=3600`;

        setMessage('✅ Tokens stored! Redirecting...');

        // Wait a moment then redirect
        setTimeout(() => {
          router.push('/admin');
        }, 1000);
      } else {
        setMessage(`❌ Login failed: ${data.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">Simple Admin Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 bg-gray-800 rounded text-sm">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

