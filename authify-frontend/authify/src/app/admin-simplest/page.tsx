'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSimplestPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = (typeof window !== 'undefined' ? localStorage.getItem('user') : null);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/admin-login');
      return;
    }
    setIsLoading(false);
  }, [currentUser, router]);

  const handleLogout = async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/admin-login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <span className="w-5 h-5 text-white font-bold">A</span>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-white">Admin Portal</h1>
                <p className="text-xs text-gray-400">Authify Management</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <div className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', color: 'bg-blue-500' },
              { id: 'users', label: 'User Management', color: 'bg-green-500' },
              { id: 'roles', label: 'Roles & Permissions', color: 'bg-purple-500' },
              { id: 'auth', label: 'Authentication Settings', color: 'bg-orange-500' },
              { id: 'logs', label: 'Login & Activity Logs', color: 'bg-red-500' },
              { id: 'settings', label: 'System Settings', color: 'bg-gray-500' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  activeSection === item.id 
                    ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <div className={`w-5 h-5 ${item.color} rounded`} />
                {sidebarOpen && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
                <p className="text-xs text-gray-400 truncate">Administrator</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Logout"
            >
              <span className="w-4 h-4 text-white">X</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="w-5 h-5 text-white">{sidebarOpen ? 'X' : '☰'}</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                </h1>
                <p className="text-sm text-gray-400">
                  {activeSection === 'dashboard' && 'System overview and statistics'}
                  {activeSection === 'users' && 'Manage platform users'}
                  {activeSection === 'roles' && 'Control access levels and permissions'}
                  {activeSection === 'auth' && 'Configure authentication policies'}
                  {activeSection === 'logs' && 'View login and activity logs'}
                  {activeSection === 'settings' && 'System configuration and settings'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Welcome to Admin Portal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-medium text-white mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      <button className="w-full text-left px-4 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                        <span className="w-4 h-4 inline-block bg-green-500 rounded mr-2"></span>
                        Manage Users
                      </button>
                      <button className="w-full text-left px-4 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                        <span className="w-4 h-4 inline-block bg-blue-500 rounded mr-2"></span>
                        System Settings
                      </button>
                      <button className="w-full text-left px-4 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                        <span className="w-4 h-4 inline-block bg-orange-500 rounded mr-2"></span>
                        View Logs
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium text-white mb-3">System Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Backend API</span>
                        <span className="text-green-400">● Online</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Database</span>
                        <span className="text-green-400">● Connected</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Authentication</span>
                        <span className="text-green-400">● Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-8 h-8 bg-blue-500 rounded"></span>
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <p className="text-sm text-gray-400">Total Users</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AD</span>
                    </div>
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <p className="text-sm text-gray-400">Active Admins</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <span className="text-2xl font-bold text-white">0</span>
                  </div>
                  <p className="text-sm text-gray-400">Security Alerts</p>
                </div>
              </div>
            </div>
          )}

          {/* Other Sections */}
          {activeSection !== 'dashboard' && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
              <div className="text-center">
                <div className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="w-8 h-8 text-gray-400">⚙</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                </h3>
                <p className="text-gray-400">
                  This section is under development. Full implementation coming soon.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


