'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ShieldCheck, ArrowRight, Lock, KeyRound } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import SimpleBiometricAuth from '@/components/simple-biometric-auth';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, error, clearError, setSession, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error,
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const handleAuthSuccess = (tokens: any, userData: any) => {
    toast({
      title: 'Registration Successful',
      description: 'Your account is ready.',
    });

    setSession(userData, tokens);
    router.push('/dashboard');
  };

  const handleAuthError = (message: string) => {
    toast({
      variant: 'destructive',
      title: 'Registration Failed',
      description: message,
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Branding */}
        <div className="space-y-8">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="bg-primary p-1.5 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-primary">Authify</span>
          </Link>
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold text-primary tracking-tight leading-[1.1]">
              Create your user portal account
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Register with password and device-bound authentication for phishing-resistant access.
            </p>
          </div>
        </div>

        {/* Right Side: Registration Flow */}
        <div className="space-y-6">
          {isAuthenticated ? (
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-primary">You are already signed in</h2>
                  <p className="text-sm text-muted-foreground">Continue to the dashboard or sign out to switch accounts.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={() => router.push('/dashboard')} className="w-full sm:w-auto">
                    Go to Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => logout()} className="w-full sm:w-auto">
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <SimpleBiometricAuth
              organizationId="default-org"
              initialMode="signup"
              onAuthSuccess={handleAuthSuccess}
              onAuthError={handleAuthError}
            />
          )}

          <div className="pt-6 border-t flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Already have an account?</span>
              <Link href="/login" className="font-bold text-primary hover:underline flex items-center gap-1">
                Sign In <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Trust Panel */}
        <Card className="border-none bg-primary p-8 md:p-12 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden hidden lg:block">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10 space-y-8">
            <div className="bg-white/10 p-4 rounded-2xl w-fit">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold leading-tight">Secure Device Authentication</h2>
              <p className="text-lg opacity-90">Password + Passkey (on-device biometrics)</p>
              <ul className="space-y-4 pt-4">
                {[
                  { icon: <Lock className="w-4 h-4" />, text: 'Password authentication (Factor 1)' },
                  { icon: <KeyRound className="w-4 h-4" />, text: 'Passkey / Device authentication (Factor 2)' },
                  { icon: <Shield className="w-4 h-4" />, text: 'Public-key cryptography' },
                  { icon: <ShieldCheck className="w-4 h-4" />, text: 'Enterprise-grade security' }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium opacity-90">
                    <div className="text-white/60">{item.icon}</div>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-8 opacity-60 text-xs font-medium uppercase tracking-widest border-t border-white/10">
              Device-Bound Security
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
