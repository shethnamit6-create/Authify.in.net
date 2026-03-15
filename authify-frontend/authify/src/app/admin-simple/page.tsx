'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSimplePage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const accessToken = localStorage.getItem('accessToken');
      const userStr = (typeof window !== 'undefined' ? localStorage.getItem('user') : null);
      const cookieToken = document.cookie.includes('accessToken');

      console.log('Auth Check:', {
        accessToken: !!accessToken,
        userStr: !!userStr,
        cookieToken
      });

      if (!accessToken || !userStr) {
        console.log('No tokens found, redirecting to login');
        router.push('/admin-login-simple');
        return;
      }

      try {
        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
          console.log('User is not admin:', user.role);
          router.push('/admin-login-simple');
          return;
        }

        setUserInfo(user);
        console.log('✅ Admin user authenticated:', user);
      } catch (error) {
        console.error('Invalid user data:', error);
        router.push('/admin-login-simple');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/admin-login-simple');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Simple Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
        
        {userInfo && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Welcome, Admin!</h2>
            <div className="space-y-2">
              <p><strong>Name:</strong> {userInfo.firstName} {userInfo.lastName}</p>
              <p><strong>Email:</strong> {userInfo.email}</p>
              <p><strong>Role:</strong> {userInfo.role}</p>
              <p><strong>ID:</strong> {userInfo.id}</p>
              <p><strong>MFA Enabled:</strong> {userInfo.mfaEnabled ? 'Yes' : 'No'}</p>
            </div>
            
            <div className="mt-6 p-4 bg-green-900 rounded">
              <p className="text-green-300">✅ Authentication successful!</p>
              <p className="text-green-300">✅ Admin access granted!</p>
              <p className="text-green-300">✅ Dashboard loaded!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


