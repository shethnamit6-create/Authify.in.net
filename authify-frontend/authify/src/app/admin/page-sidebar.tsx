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
  ChevronDown,
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
  RefreshCw,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Ban,
  UserPlus,
  ShieldCheck,
  KeyRound,
  Fingerprint,
  Wifi,
  History,
  FileSearch,
  AlertTriangle as AlertIcon,
  Zap,
  Cpu,
  HardDrive,
  Cloud,
  Terminal,
  Code,
  Plug,
  Globe2,
  LockKeyhole,
  UserCog,
  Archive,
  DatabaseBackup,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AdminSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [expandedSections, setExpandedSections] = useState<string[]>(['dashboard', 'users', 'security']);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/console');
    }
  }, [user, router]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const sidebarSections = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      items: [
        { id: 'overview', label: 'System Overview', icon: Activity },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        { id: 'reports', label: 'Reports', icon: FileText }
      ]
    },
    {
      id: 'users',
      title: 'User Management',
      icon: Users,
      items: [
        { id: 'all-users', label: 'All Users', icon: Users },
        { id: 'add-user', label: 'Add User', icon: UserPlus },
        { id: 'user-roles', label: 'User Roles', icon: UserCog },
        { id: 'user-permissions', label: 'Permissions', icon: ShieldCheck }
      ]
    },
    {
      id: 'security',
      title: 'Security',
      icon: Shield,
      items: [
        { id: 'auth-settings', label: 'Authentication', icon: Lock },
        { id: 'mfa-settings', label: 'MFA Settings', icon: Fingerprint },
        { id: 'security-monitoring', label: 'Security Monitoring', icon: ShieldAlert },
        { id: 'threat-detection', label: 'Threat Detection', icon: AlertTriangle },
        { id: 'access-control', label: 'Access Control', icon: KeyRound }
      ]
    },
    {
      id: 'logs',
      title: 'Logs & Monitoring',
      icon: FileText,
      items: [
        { id: 'login-logs', label: 'Login Logs', icon: History },
        { id: 'activity-logs', label: 'Activity Logs', icon: Activity },
        { id: 'audit-logs', label: 'Audit Logs', icon: FileSearch },
        { id: 'security-logs', label: 'Security Logs', icon: Shield }
      ]
    },
    {
      id: 'sessions',
      title: 'Session Management',
      icon: Monitor,
      items: [
        { id: 'active-sessions', label: 'Active Sessions', icon: Wifi },
        { id: 'session-history', label: 'Session History', icon: Clock },
        { id: 'device-management', label: 'Device Management', icon: Smartphone }
      ]
    },
    {
      id: 'alerts',
      title: 'Alerts & Notifications',
      icon: Bell,
      items: [
        { id: 'security-alerts', label: 'Security Alerts', icon: AlertIcon },
        { id: 'system-alerts', label: 'System Alerts', icon: Zap },
        { id: 'notification-settings', label: 'Notification Settings', icon: Settings }
      ]
    },
    {
      id: 'api',
      title: 'API & Integration',
      icon: Code,
      items: [
        { id: 'api-keys', label: 'API Keys', icon: Key },
        { id: 'api-logs', label: 'API Logs', icon: Terminal },
        { id: 'integrations', label: 'Integrations', icon: Plug },
        { id: 'webhooks', label: 'Webhooks', icon: Globe2 }
      ]
    },
    {
      id: 'system',
      title: 'System Configuration',
      icon: Settings,
      items: [
        { id: 'general-settings', label: 'General Settings', icon: Settings },
        { id: 'performance', label: 'Performance', icon: Cpu },
        { id: 'storage', label: 'Storage', icon: HardDrive },
        { id: 'network', label: 'Network', icon: Globe }
      ]
    },
    {
      id: 'backup',
      title: 'Backup & Data',
      icon: DatabaseBackup,
      items: [
        { id: 'backup-settings', label: 'Backup Settings', icon: Settings },
        { id: 'data-backup', label: 'Data Backup', icon: Database },
        { id: 'data-restore', label: 'Data Restore', icon: Archive },
        { id: 'export-import', label: 'Export/Import', icon: Upload }
      ]
    }
  ];

  const stats = {
    totalUsers: 2,
    activeUsers: 2,
    failedLogins: 0,
    mfaEnabled: 1,
    securityAlerts: 0,
    activeSessions: 1,
    apiCalls: 1247,
    storageUsed: '2.3 GB',
    uptime: '99.9%'
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <Activity className="w-8 h-8 text-green-500" />
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
            </div>
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">System Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-accent/50 rounded-lg">
                  <h3 className="font-medium mb-2">System Health</h3>
                  <p className="text-sm text-muted-foreground">All systems operational</p>
                  <div className="mt-2 text-green-500 text-sm">✅ Healthy</div>
                </div>
                <div className="p-4 bg-accent/50 rounded-lg">
                  <h3 className="font-medium mb-2">API Performance</h3>
                  <p className="text-sm text-muted-foreground">{stats.apiCalls} calls today</p>
                  <div className="mt-2 text-blue-500 text-sm">⚡ Fast</div>
                </div>
                <div className="p-4 bg-accent/50 rounded-lg">
                  <h3 className="font-medium mb-2">Storage Usage</h3>
                  <p className="text-sm text-muted-foreground">{stats.storageUsed} used</p>
                  <div className="mt-2 text-purple-500 text-sm">💾 Normal</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'all-users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">All Users</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                  <Plus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border">
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
                    <tr className="hover:bg-accent/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                            <span className="text-primary-foreground text-sm font-semibold">AU</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">Admin User</div>
                            <div className="text-sm text-muted-foreground">admin@authify.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Admin
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          Enabled
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        2 hours ago
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-accent/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mr-3">
                            <span className="text-accent-foreground text-sm font-semibold">TU</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">Test User</div>
                            <div className="text-sm text-muted-foreground">user@test.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          User
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Disabled
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        1 day ago
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-card rounded-lg border border-border p-8">
            <div className="text-center">
              <div className="bg-accent/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 capitalize">
                {activeSection.replace('-', ' ')}
              </h3>
              <p className="text-muted-foreground mb-6">
                This section is under development. Full implementation coming soon.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
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
        );
    }
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
      <div className={`${sidebarOpen ? 'w-80' : 'w-20'} bg-card border-r border-border transition-all duration-300 flex flex-col`}>
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
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.includes(section.id);
            
            return (
              <div key={section.id} className="space-y-1">
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    activeSection.startsWith(section.id)
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="text-sm font-medium">{section.title}</span>}
                  </div>
                  {sidebarOpen && (
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  )}
                </button>
                
                {isExpanded && sidebarOpen && (
                  <div className="ml-8 space-y-1">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                            activeSection === item.id
                              ? 'bg-accent text-foreground border-l-2 border-primary'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                          }`}
                        >
                          <ItemIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
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
                  {activeSection === 'overview' && 'System overview and statistics'}
                  {activeSection === 'all-users' && 'Manage platform users'}
                  {activeSection === 'auth-settings' && 'Configure authentication policies'}
                  {activeSection === 'login-logs' && 'View login and activity logs'}
                  {activeSection === 'active-sessions' && 'Monitor user sessions'}
                  {activeSection === 'security-alerts' && 'System security insights'}
                  {activeSection === 'api-keys' && 'Manage API keys and integrations'}
                  {activeSection === 'general-settings' && 'Global platform settings'}
                  {activeSection === 'data-backup' && 'Data backup and management'}
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
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
