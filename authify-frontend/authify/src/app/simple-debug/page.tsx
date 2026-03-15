'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { API_BASE_URL } from '@/lib/api-base';

export default function SimpleDebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDirectAPI = async () => {
    addLog('Testing direct API call...');
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
      addLog(`API Response Status: ${response.status}`);
      addLog(`API Response: ${JSON.stringify(data, null, 2)}`);

      if (response.ok && data.data?.token) {
        addLog('✅ Admin login successful via direct API');

        // Store token
        localStorage.setItem('accessToken', data.data.token);
        localStorage.setItem('user', JSON.stringify({ email: 'admin@acme.test', role: 'admin', firstName: 'Admin', lastName: '' }));
        document.cookie = `accessToken=${data.data.token}; path=/; max-age=3600`;

        addLog('✅ Token stored in localStorage and cookies');
      } else {
        addLog('❌ Login failed');
      }
    } catch (error) {
      addLog(`❌ API Error: ${error.message}`);
    }
  };

  const testRedirect = () => {
    addLog('Testing redirect to admin...');
    window.location.href = '/admin';
  };

  const testAuthContext = async () => {
    addLog('Testing auth context...');
    try {
      // Try to import and use auth context
      const { useAuth } = await import('@/lib/auth-context');
      addLog('✅ Auth context imported');

      // This would only work in a React component with AuthProvider
      addLog('⚠️  Auth context test needs React environment');
    } catch (error) {
      addLog(`❌ Auth context error: ${error.message}`);
    }
  };

  const checkStorage = () => {
    addLog('Checking storage...');
    addLog(`Access token in localStorage: ${!!localStorage.getItem('accessToken')}`);
    addLog(`User data in localStorage: ${!!(typeof window !== 'undefined' ? localStorage.getItem('user') : null)}`);
    addLog(`Access token in cookies: ${document.cookie.includes('accessToken')}`);

    const userStr = (typeof window !== 'undefined' ? localStorage.getItem('user') : null);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        addLog(`User role: ${user.role}`);
        addLog(`User email: ${user.email}`);
      } catch (error) {
        addLog('❌ Invalid user data in localStorage');
      }
    }
  };

  const clearStorage = () => {
    addLog('Clearing all storage...');
    localStorage.clear();
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    addLog('✅ Storage cleared');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Simple Debug Page</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <button
              onClick={testDirectAPI}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Test Direct API Login
            </button>

            <button
              onClick={testRedirect}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
            >
              Test Redirect to Admin
            </button>

            <button
              onClick={testAuthContext}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
            >
              Test Auth Context
            </button>
          </div>

          <div className="space-y-4">
            <button
              onClick={checkStorage}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded"
            >
              Check Storage
            </button>

            <button
              onClick={clearStorage}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
            >
              Clear Storage
            </button>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Debug Logs</h2>
          <div className="bg-black p-4 rounded font-mono text-sm h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Click buttons above to test.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={log.includes('✅') ? 'text-green-400' : log.includes('❌') ? 'text-red-400' : log.includes('⚠️') ? 'text-yellow-400' : 'text-gray-300'}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Manual Test Instructions</h2>
          <div className="text-sm space-y-2">
            <p>1. Click "Test Direct API Login" first</p>
            <p>2. If successful, click "Check Storage"</p>
            <p>3. If tokens are stored, click "Test Redirect to Admin"</p>
            <p>4. If redirect works, the issue is in auth context</p>
            <p>5. If redirect fails, the issue is in middleware</p>
          </div>
        </div>
      </div>
    </div>
  );
}


