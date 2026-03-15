'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InsightsChart } from "@/components/dashboard/InsightsChart";
import { ShieldAlert, Zap, Users, Key, ArrowUpRight, CheckCircle2, X } from "lucide-react";
import { Button } from '@/components/ui/button';

function ConsoleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const isAuthenticated = true; // assuming this is defined somewhere in your code

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const setup = searchParams.get('setup');
    if (setup === 'complete') {
      setShowSuccessBanner(true);
      
      const timer = setTimeout(() => {
        setShowSuccessBanner(false);
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete('setup');
        const search = newParams.toString();
        router.replace(`/console${search ? `?${search}` : ''}`);
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  const handleDismissBanner = () => {
    setShowSuccessBanner(false);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('setup');
    const search = newParams.toString();
    router.replace(`/console${search ? `?${search}` : ''}`);
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {showSuccessBanner && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500 bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start justify-between shadow-sm">
          <div className="flex gap-4">
            <div className="bg-blue-500/10 p-2 rounded-full h-fit mt-0.5">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-blue-900 leading-none">Organization Created Successfully</h3>
              <p className="text-sm text-blue-800/80 leading-relaxed">
                Your Authify workspace is ready. You can now configure authentication, generate API keys, and onboard your team.
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-blue-400 hover:text-blue-600 hover:bg-blue-100/50 -mt-1 -mr-1"
            onClick={handleDismissBanner}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Organization Overview</h1>
          <p className="text-muted-foreground">Monitoring 3 active applications across 2 regions.</p>
        </div>
        <Badge variant="outline" className="px-4 py-1 text-sm border-primary text-primary bg-primary/5">
          <ShieldAlert className="w-4 h-4 mr-2" />
          Security Level: Optimal
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Authentications", value: "142.5k", trend: "+12.4%", icon: <Zap className="w-5 h-5 text-yellow-500" /> },
          { label: "Active Users", value: "12,842", trend: "+3.2%", icon: <Users className="w-5 h-5 text-blue-500" /> },
          { label: "Phishing Prevented", value: "482", trend: "+24.1%", icon: <ShieldAlert className="w-5 h-5 text-green-500" /> },
          { label: "Devices Bound", value: "31,204", trend: "+8.7%", icon: <Key className="w-5 h-5 text-primary" /> },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-md overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
               {stat.icon}
             </div>
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-xs uppercase tracking-wider">{stat.label}</CardDescription>
              <CardTitle className="text-3xl font-bold text-primary">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600 font-medium">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                {stat.trend} <span className="text-muted-foreground ml-1 font-normal">this month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-primary">Authentication Trends</CardTitle>
            <CardDescription>Login attempts vs. success rate over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <InsightsChart />
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-primary">Compliance Checklist</CardTitle>
            <CardDescription>Overall status: 94% compliant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: "SOC2 Audit Trail", status: "Enabled", checked: true },
              { label: "GDPR Data Processing", status: "Verified", checked: true },
              { label: "WebAuthn Enforcement", status: "Partial", checked: false },
              { label: "Adaptive Risk Scoring", status: "Enabled", checked: true },
              { label: "Multi-Region Redundancy", status: "Active", checked: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={item.checked ? "text-green-500" : "text-yellow-500"}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <Badge variant={item.checked ? "secondary" : "outline"} className="text-[10px] uppercase">
                  {item.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ConsolePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Key className="w-8 h-8 text-primary animate-pulse" />
        <p className="text-sm text-muted-foreground animate-pulse">Syncing organization data...</p>
      </div>
    }>
      <ConsoleContent />
    </Suspense>
  );
}