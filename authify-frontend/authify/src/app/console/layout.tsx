'use client';

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Shield, LayoutDashboard, History, Smartphone, FileCheck, Code2, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Shield className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Establishing secure session...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <Sidebar className="border-r border-sidebar-border">
          <SidebarHeader className="h-20 flex items-center px-6">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-white" />
              <span className="text-xl font-bold text-white tracking-tight">Authify</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-6 py-4 text-xs font-semibold uppercase tracking-wider opacity-50">Core</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Dashboard" className="h-12 px-6">
                    <Link href="/console">
                      <LayoutDashboard className="w-5 h-5" />
                      <span className="font-medium">Overview</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Audit Logs" className="h-12 px-6">
                    <Link href="/console/logs">
                      <History className="w-5 h-5" />
                      <span className="font-medium">Audit Logs</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Devices" className="h-12 px-6">
                    <Link href="/console/devices">
                      <Smartphone className="w-5 h-5" />
                      <span className="font-medium">Devices</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="px-6 py-4 text-xs font-semibold uppercase tracking-wider opacity-50">Security</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Compliance" className="h-12 px-6">
                    <Link href="/console/compliance">
                      <FileCheck className="w-5 h-5" />
                      <span className="font-medium">Compliance</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="API Access" className="h-12 px-6">
                    <Link href="/docs">
                      <Code2 className="w-5 h-5" />
                      <span className="font-medium">API Documentation</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto p-4 border-t border-sidebar-border space-y-2">
             <SidebarMenuButton asChild className="h-12 px-6">
              <Link href="#">
                <Settings className="w-5 h-5" />
                <span className="font-medium">Account Settings</span>
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton className="h-12 px-6 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </SidebarMenuButton>
          </div>
        </Sidebar>
        <SidebarInset className="flex-1 overflow-auto">
          <header className="h-20 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-4">
               <SidebarTrigger />
               <h2 className="text-xl font-semibold text-primary">Console</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user.firstName || user.email}</p>
                <p className="text-xs text-muted-foreground">Admin Access</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-accent border flex items-center justify-center font-bold text-primary uppercase">
                {user.email?.substring(0, 2) || 'AU'}
              </div>
            </div>
          </header>
          <main className="p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}