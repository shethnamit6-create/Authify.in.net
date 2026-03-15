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

export default function AdminPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      router.push('/console');
      return;
    }
  }, [user, router]);

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

  const stats = {
    totalUsers: 2,
    activeUsers: 2,
    failedLogins: 0,
    mfaEnabled: 1,
    securityAlerts: 0,
    activeSessions: 1
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">Please login to access the admin portal</p>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">You don't have admin privileges</p>
          <button 
            onClick={() => router.push('/console')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
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
              onClick={logout}
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
                  <div className="flex items-center mt-2 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    All good
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
                  <div className="flex items-center mt-2 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    No alerts
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
                  <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">LOGIN_SUCCESS</p>
                        <p className="text-xs text-muted-foreground">192.168.1.100 • Chrome/120.0.0.0</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">5 mins ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">USER_CREATED</p>
                        <p className="text-xs text-muted-foreground">192.168.1.101 • Firefox/119.0</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">15 mins ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">MFA_ENABLED</p>
                        <p className="text-xs text-muted-foreground">192.168.1.102 • Safari/537.36</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other sections - placeholder */}
          {activeSection !== 'dashboard' && (
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
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-accent/30 rounded-lg">
                    <h4 className="font-medium mb-2">Feature 1</h4>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </div>
                  <div className="p-4 bg-accent/30 rounded-lg">
                    <h4 className="font-medium mb-2">Feature 2</h4>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </div>
                  <div className="p-4 bg-accent/30 rounded-lg">
                    <h4 className="font-medium mb-2">Feature 3</h4>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
