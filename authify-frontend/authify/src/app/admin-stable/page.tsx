'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, Settings, FileText, Lock, Bell, Key, Monitor, LogOut, Menu, X, TrendingUp, UserCheck, UserX, AlertTriangle, Activity, RefreshCw, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AdminStablePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user: authUser, logout } = useAuth();

  // Helper function to get current user
  const getCurrentUser = () => {
    if (authUser) return authUser;
    
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
    await logout();
    router.push('/admin-login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'auth', label: 'Authentication Settings', icon: Lock },
    { id: 'logs', label: 'Login & Activity Logs', icon: FileText },
    { id: 'sessions', label: 'Session Management', icon: Monitor },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'security', label: 'Security Monitoring', icon: Shield },
    { id: 'alerts', label: 'Alerts & Notifications', icon: Bell },
    { id: 'api', label: 'API & Integration', icon: Key },
    { id: 'system', label: 'System Configuration', icon: Settings },
  ];

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
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white truncate">Admin Portal</h1>
                <p className="text-xs text-gray-400 truncate">Authify Management</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
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
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
              </span>
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
                <p className="text-xs text-gray-400 truncate">Administrator</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                  {activeSection === 'sessions' && 'Monitor user sessions'}
                  {activeSection === 'audit' && 'Track administrative actions'}
                  {activeSection === 'security' && 'System security insights'}
                  {activeSection === 'alerts' && 'Security alerts and notifications'}
                  {activeSection === 'api' && 'Manage API keys and integrations'}
                  {activeSection === 'system' && 'Global platform settings'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-blue-500" />
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <p className="text-sm text-gray-400">Total Users</p>
                  <div className="flex items-center mt-2 text-green-500 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +12% from last month
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <UserCheck className="w-8 h-8 text-green-500" />
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <p className="text-sm text-gray-400">Active Users</p>
                  <div className="flex items-center mt-2 text-green-500 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +8% from last week
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <UserX className="w-8 h-8 text-red-500" />
                    <span className="text-2xl font-bold text-white">0</span>
                  </div>
                  <p className="text-sm text-gray-400">Failed Logins</p>
                  <div className="flex items-center mt-2 text-green-500 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    All good
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <Shield className="w-8 h-8 text-blue-500" />
                    <span className="text-2xl font-bold text-white">0</span>
                  </div>
                  <p className="text-sm text-gray-400">MFA Enabled</p>
                  <div className="flex items-center mt-2 text-blue-500 text-sm">
                    <Activity className="w-4 h-4 mr-1" />
                    Setup needed
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                    <span className="text-2xl font-bold text-white">0</span>
                  </div>
                  <p className="text-sm text-gray-400">Security Alerts</p>
                  <div className="flex items-center mt-2 text-green-500 text-sm">
                    <Activity className="w-4 h-4 mr-1" />
                    All clear
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <Monitor className="w-8 h-8 text-purple-500" />
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <p className="text-sm text-gray-400">Active Sessions</p>
                  <div className="flex items-center mt-2 text-purple-500 text-sm">
                    <Activity className="w-4 h-4 mr-1" />
                    Live tracking
                  </div>
                </div>
              </div>

              {/* Welcome Section */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Welcome to Admin Portal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-medium text-white mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      <button className="w-full text-left px-4 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                        <Users className="w-4 h-4 inline mr-2" />
                        Manage Users
                      </button>
                      <button className="w-full text-left px-4 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                        <Settings className="w-4 h-4 inline mr-2" />
                        System Settings
                      </button>
                      <button className="w-full text-left px-4 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                        <FileText className="w-4 h-4 inline mr-2" />
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
            </div>
          )}

          {/* Other Sections */}
          {activeSection !== 'dashboard' && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
              <div className="text-center">
                <div className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-gray-400" />
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


