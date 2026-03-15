'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Settings, 
  FileText, 
  Monitor, 
  Lock,
  Bell,
  Database,
  Key,
  AlertTriangle,
  Activity,
  LogOut,
  Menu,
  X,
  TrendingUp,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  mfaEnabled: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  status: 'success' | 'failed';
}

export default function AdminPortalFixed() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user: authUser, logout } = useAuth();

  // Helper function to get current user from auth context or localStorage
  const getCurrentUser = () => {
    if (authUser) return authUser;
    
    const userStr = (typeof window !== 'undefined' ? localStorage.getItem('user') : null);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Invalid user data in localStorage:', error);
        return null;
      }
    }
    return null;
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    // Check if user is admin
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/admin-login');
      return;
    }
    
    loadAdminData();
  }, [currentUser, router]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      // Mock data for now
      setUsers([
        {
          id: '1',
          email: 'admin@authify.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isActive: true,
          mfaEnabled: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          email: 'john.doe@test.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          isActive: true,
          mfaEnabled: false,
          createdAt: new Date().toISOString()
        }
      ]);

      setActivityLogs([
        {
          id: '1',
          userId: '1',
          action: 'LOGIN_SUCCESS',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          ip: '192.168.1.100',
          userAgent: 'Chrome/120.0.0.0',
          status: 'success'
        },
        {
          id: '2',
          userId: '2',
          action: 'LOGIN_FAILED',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          ip: '192.168.1.101',
          userAgent: 'Firefox/119.0',
          status: 'failed'
        }
      ]);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/admin-login');
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    failedLogins: activityLogs.filter(log => log.status === 'failed').length,
    mfaEnabled: users.filter(u => u.mfaEnabled).length,
    securityAlerts: 3,
    activeSessions: 1
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
    { id: 'backup', label: 'Backup & Data', icon: Database }
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
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-800 border-r border-gray-700 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out`}>
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
                      ? 'bg-blue-600 text-white shadow-lg' 
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
                  {activeSection === 'backup' && 'Data backup and management'}
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
                    <span className="text-2xl font-bold text-white">{stats.totalUsers}</span>
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
                    <span className="text-2xl font-bold text-white">{stats.activeUsers}</span>
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
                    <span className="text-2xl font-bold text-white">{stats.failedLogins}</span>
                  </div>
                  <p className="text-sm text-gray-400">Failed Logins</p>
                  <div className="flex items-center mt-2 text-red-500 text-sm">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Requires attention
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <Shield className="w-8 h-8 text-blue-500" />
                    <span className="text-2xl font-bold text-white">{stats.mfaEnabled}</span>
                  </div>
                  <p className="text-sm text-gray-400">MFA Enabled</p>
                  <div className="flex items-center mt-2 text-blue-500 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Good coverage
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                    <span className="text-2xl font-bold text-white">{stats.securityAlerts}</span>
                  </div>
                  <p className="text-sm text-gray-400">Security Alerts</p>
                  <div className="flex items-center mt-2 text-orange-500 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Review needed
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <Monitor className="w-8 h-8 text-purple-500" />
                    <span className="text-2xl font-bold text-white">{stats.activeSessions}</span>
                  </div>
                  <p className="text-sm text-gray-400">Active Sessions</p>
                  <div className="flex items-center mt-2 text-purple-500 text-sm">
                    <Activity className="w-4 h-4 mr-1" />
                    Live tracking
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-white">{log.action}</p>
                          <p className="text-xs text-gray-400">{log.ip} • {log.userAgent}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* User Management Section */}
          {activeSection === 'users' && (
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">User Management</h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Users className="w-4 h-4 inline mr-2" />
                    Add New User
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">MFA</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-red-900 text-red-200' :
                            user.role === 'analyzer' ? 'bg-yellow-900 text-yellow-200' :
                            'bg-blue-900 text-blue-200'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive ? 'bg-green-900 text-green-200' : 'bg-gray-700 text-gray-300'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.mfaEnabled ? 'bg-green-900 text-green-200' : 'bg-gray-700 text-gray-300'
                          }`}>
                            {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-400 hover:text-blue-300">Edit</button>
                            <button className="text-red-400 hover:text-red-300">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Other sections */}
          {activeSection !== 'dashboard' && activeSection !== 'users' && (
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


