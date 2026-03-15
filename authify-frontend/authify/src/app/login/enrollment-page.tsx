'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ShieldCheck, Fingerprint, Smartphone, CheckCircle2, ArrowRight, Key, Camera, User, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import MFAAuth from '@/components/mfa-auth';
import BiometricEnrollment from '@/components/biometric-enrollment';

export default function EnrollmentLoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, error, clearError, setSession } = useAuth();
  const { toast } = useToast();
  const [organizationId] = useState('default-org'); // Default organization for demo
  const [activeTab, setActiveTab] = useState('authenticate');
  const [userId, setUserId] = useState('');
  const [showEnrollment, setShowEnrollment] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error,
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const handleMFAAuthSuccess = (tokens: any, userData: any) => {
    toast({
      title: 'MFA Authentication Successful',
      description: 'Welcome back to Authify Console',
    });
    
    // Persist session in auth context for protected routes
    setSession(userData, tokens);
    
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  const handleMFAAuthError = (error: string) => {
    toast({
      variant: 'destructive',
      title: 'MFA Authentication Failed',
      description: error,
    });
  };

  const handleEnrollmentComplete = () => {
    toast({
      title: 'Enrollment Complete',
      description: 'You can now use multi-factor authentication',
    });
    setShowEnrollment(false);
    setActiveTab('authenticate');
  };

  const handleBackToLogin = () => {
    setShowEnrollment(false);
    setActiveTab('authenticate');
  };

  const handleStartEnrollment = (email: string) => {
    // Find user ID for enrollment
    const userMapping: { [key: string]: string } = {
      'admin@authify.com': '1',
      'user@test.com': '2',
      'analyzer@authify.com': '3'
    };
    
    const id = userMapping[email] || '';
    setUserId(id);
    
    if (id) {
      setShowEnrollment(true);
    } else {
      toast({
        variant: 'destructive',
        title: 'User Not Found',
        description: 'Please check your email address',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center gap-2 w-fit mx-auto">
            <div className="bg-primary p-1.5 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-primary">Authify</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight pt-4">Secure Authentication Portal</h1>
          <p className="text-muted-foreground">Multi-factor authentication with biometric security</p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Authentication */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="authenticate" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Authenticate
                </TabsTrigger>
                <TabsTrigger value="enroll" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Enroll Biometrics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="authenticate" className="space-y-6">
                {showEnrollment ? (
                  <BiometricEnrollment
                    userId={userId}
                    organizationId={organizationId}
                    onEnrollmentComplete={handleEnrollmentComplete}
                    onBackToLogin={handleBackToLogin}
                  />
                ) : (
                  <div className="space-y-6">
                    {/* Authentication Options */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          Multi-Factor Authentication
                        </CardTitle>
                        <CardDescription>
                          Choose your authentication method
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
                                onClick={() => {
                                  // Check if user has biometrics enrolled
                                  // For demo, we'll show enrollment prompt
                                  handleStartEnrollment('user@test.com');
                                }}>
                            <CardContent className="p-6 text-center">
                              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                <Fingerprint className="w-6 h-6 text-blue-600" />
                              </div>
                              <h3 className="font-semibold">Biometric MFA</h3>
                              <p className="text-sm text-muted-foreground mt-2">
                                Password + Face Recognition + Fingerprint
                              </p>
                              <Badge className="mt-2 bg-green-100 text-green-800">
                                Recommended
                              </Badge>
                            </CardContent>
                          </Card>

                          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
                                onClick={() => {
                                  // For demo, show enrollment prompt
                                  handleStartEnrollment('user@test.com');
                                }}>
                            <CardContent className="p-6 text-center">
                              <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                                <Key className="w-6 h-6 text-purple-600" />
                              </div>
                              <h3 className="font-semibold">Password + Face MFA</h3>
                              <p className="text-sm text-muted-foreground mt-2">
                                Password + Face Recognition
                              </p>
                              <Badge className="mt-2 bg-blue-100 text-blue-800">
                                Required
                              </Badge>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Don't have biometrics enrolled? Click above to enroll first
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* MFA Authentication Component */}
                    <MFAAuth
                      organizationId={organizationId}
                      onAuthSuccess={handleMFAAuthSuccess}
                      onAuthError={handleMFAAuthError}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="enroll" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Biometric Enrollment
                    </CardTitle>
                    <CardDescription>
                      Enroll your biometrics for secure authentication
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                        <Fingerprint className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold">Enroll Your Biometrics</h3>
                      <p className="text-muted-foreground">
                        To use multi-factor authentication, you need to enroll your biometric factors first
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Required for MFA:</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <Camera className="w-4 h-4 text-blue-600" />
                          <span>Face Recognition</span>
                          <Badge className="bg-red-100 text-red-800">Required</Badge>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Optional Enhancement:</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <Fingerprint className="w-4 h-4 text-green-600" />
                          <span>Fingerprint</span>
                          <Badge className="bg-green-100 text-green-800">Optional</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <Button 
                        onClick={() => {
                          handleStartEnrollment('user@test.com');
                          setActiveTab('authenticate');
                        }}
                        className="w-full"
                      >
                        Start Enrollment
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <BiometricEnrollment
                  userId={userId}
                  organizationId={organizationId}
                  onEnrollmentComplete={handleEnrollmentComplete}
                  onBackToLogin={handleBackToLogin}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Side - Security Info */}
          <div className="space-y-6">
            <Card className="border-none bg-primary p-6 text-white rounded-2xl shadow-2xl">
              <div className="space-y-4">
                <div className="bg-white/10 p-3 rounded-xl w-fit">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold">Multi-Factor Security</h2>
                <p className="text-sm opacity-90">
                  Enterprise-grade authentication with multiple independent factors
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { icon: <Key className="w-4 h-4" />, text: "Password authentication (Factor 1)" },
                  { icon: <Camera className="w-4 h-4" />, text: "Face recognition (Factor 2)" },
                  { icon: <Fingerprint className="w-4 h-4" />, text: "Fingerprint (Optional)" },
                  { icon: <Shield className="w-4 h-4" />, text: "AES-256-GCM encryption" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="text-white/60">{item.icon}</div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Users</CardTitle>
                <CardDescription>
                  Use these accounts for testing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { email: 'admin@authify.com', password: 'admin123456', role: 'Administrator' },
                  { email: 'user@test.com', password: 'user123456', role: 'Regular User' },
                  { email: 'analyzer@authify.com', password: 'analyzer123456', role: 'Security Analyzer' }
                ].map((user, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="font-medium">{user.email}</div>
                    <div className="text-sm text-muted-foreground">Password: {user.password}</div>
                    <div className="text-sm text-muted-foreground">Role: {user.role}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enrollment Status</CardTitle>
                <CardDescription>
                  Check your biometric enrollment status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter your email to check enrollment status
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      handleStartEnrollment('user@test.com');
                      setActiveTab('authenticate');
                      setShowEnrollment(true);
                    }}
                  >
                    Check Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">Need to secure your apps?</span>
            <Link href="/register" className="font-bold text-primary hover:underline flex items-center gap-1">
              Create Organization <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
