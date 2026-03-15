'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { API_BASE_URL } from '@/lib/api-base';

export default function TestLoginPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch(`${API_BASE_URL}/v1/company/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@acme.test',
          password: 'Password123!'
        })
      });

      const data = await response.json();

      if (response.ok && data.data?.token) {
        setResult(`✅ Login Successful!
Email: admin@acme.test
Token: ${data.data.token.substring(0, 20)}...

Token stored in localStorage and cookies.`);

        // Store token
        localStorage.setItem('accessToken', data.data.token);
        localStorage.setItem('user', JSON.stringify({ email: 'admin@acme.test', role: 'admin', firstName: 'Admin', lastName: '' }));
        document.cookie = `accessToken=${data.data.token}; path=/; max-age=3600`;
      } else {
        setResult(`❌ Login Failed: ${data.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testRedirect = () => {
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold text-center">Login Test Page</h1>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Test Admin Login</h2>

          <button
            onClick={testLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mb-4 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Login'}
          </button>

          {result && (
            <div className="bg-gray-700 p-4 rounded text-sm whitespace-pre-wrap">
              {result}
            </div>
          )}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">After Login</h2>
          <button
            onClick={testRedirect}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            Go to Admin Portal
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Debug Info</h2>
          <div className="text-sm space-y-2">
            <p>URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            <p>Local Storage Token: {typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : 'N/A'}</p>
            <p>Cookie Token: {typeof window !== 'undefined' ? document.cookie.includes('accessToken') : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

