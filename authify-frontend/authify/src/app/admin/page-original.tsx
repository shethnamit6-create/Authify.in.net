'use client';

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
  ChevronRight,
  TrendingUp,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  Smartphone,
  Mail,
  Server,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { API_BASE_URL } from '@/lib/api-base';

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

interface Session {
  id: string;
  userId: string;
  email: string;
  device: string;
  ip: string;
  location: string;
  lastActivity: string;
  isActive: boolean;
}

export default function AdminPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      router.push('/admin-login');
      return;
    }
    loadAdminData();
  }, [user, router]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      // Load users
      const accessToken = localStorage.getItem('accessToken');
      const usersResponse = await fetch(`${API_BASE_URL}/v1/dashboard/users`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        const items = usersData.data?.items || [];
        const mapped = items.map((item: any) => {
          const name = item.displayName || item.identifier || 'User';
          const parts = String(name).split(' ');
          const firstName = parts[0] || 'User';
          const lastName = parts.slice(1).join(' ') || '';
          return {
            id: item._id,
            email: item.identifier,
            firstName,
            lastName,
            role: 'admin',
            isActive: item.status === 'active',
            mfaEnabled: true,
            lastLogin: item.lastLoginAt,
            createdAt: item.registeredAt
          };
        });
        setUsers(mapped);
      }

      // Mock activity logs
      setActivityLogs([
        {
          id: '1',
          userId: 'user1',
          action: 'LOGIN_SUCCESS',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          ip: '192.168.1.100',
          userAgent: 'Chrome/120.0.0.0',
          status: 'success'
        },
        {
          id: '2',
          userId: 'user2',
          action: 'LOGIN_FAILED',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          ip: '192.168.1.101',
          userAgent: 'Firefox/119.0',
          status: 'failed'
        }
      ]);

      // Mock sessions
      setSessions([
        {
          id: '1',
          userId: 'user1',
          email: 'user@example.com',
          device: 'Chrome on Windows',
          ip: '192.168.1.100',
          location: 'New York, US',
          lastActivity: new Date().toISOString(),
          isActive: true
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
    activeSessions: sessions.filter(s => s.isActive).length
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-card border-r border-border transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-2 rounded-lg">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-foreground">Admin Portal</h1>
                <p className="text-xs text-muted-foreground">Authify Management</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === item.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-semibold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground capitalize">
                  {activeSection.replace('-', ' ')}
                </h1>
                <p className="text-sm text-muted-foreground">
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
            <div className="flex items-center space-x-4">
              <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
              </button>
              <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <div className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-primary" />
                    <span className="text-2xl font-bold text-foreground">{stats.totalUsers}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <div className="flex items-center mt-2 text-green-500 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +12% from last month
                  </div>
                </div>

                <div className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <UserCheck className="w-8 h-8 text-green-500" />
                    <span className="text-2xl font-bold text-foreground">{stats.activeUsers}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <div className="flex items-center mt-2 text-green-500 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +8% from last week
                  </div>
                </div>

                <div className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <UserX className="w-8 h-8 text-red-500" />
                    <span className="text-2xl font-bold text-foreground">{stats.failedLogins}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Failed Logins</p>
                  <div className="flex items-center mt-2 text-red-500 text-sm">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Requires attention
                  </div>
                </div>

                <div className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <Shield className="w-8 h-8 text-blue-500" />
                    <span className="text-2xl font-bold text-foreground">{stats.mfaEnabled}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">MFA Enabled</p>
                  <div className="flex items-center mt-2 text-blue-500 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Good coverage
                  </div>
                </div>

                <div className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                    <span className="text-2xl font-bold text-foreground">{stats.securityAlerts}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Security Alerts</p>
                  <div className="flex items-center mt-2 text-orange-500 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Review needed
                  </div>
                </div>

                <div className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <Monitor className="w-8 h-8 text-purple-500" />
                    <span className="text-2xl font-bold text-foreground">{stats.activeSessions}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                  <div className="flex items-center mt-2 text-purple-500 text-sm">
                    <Activity className="w-4 h-4 mr-1" />
                    Live tracking
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{log.action}</p>
                          <p className="text-xs text-muted-foreground">{log.ip} • {log.userAgent}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
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
            <div className="bg-card rounded-lg border border-border">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">User Management</h2>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    <Users className="w-4 h-4 inline mr-2" />
                    Add New User
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-accent/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">MFA</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-accent/30">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-primary-foreground font-semibold">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-foreground">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'analyzer' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.mfaEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-primary hover:text-primary/80">Edit</button>
                            <button className="text-destructive hover:text-destructive/80">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Other sections would be implemented similarly */}
          {activeSection !== 'dashboard' && activeSection !== 'users' && (
            <div className="bg-card rounded-lg border border-border p-8">
              <div className="text-center">
                <div className="bg-accent/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 capitalize">
                  {activeSection.replace('-', ' ')}
                </h3>
                <p className="text-muted-foreground">
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
