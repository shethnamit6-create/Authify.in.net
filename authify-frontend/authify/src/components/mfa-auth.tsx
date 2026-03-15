'use client';

import { useState, useRef, useEffect } from 'react';
import { Shield, Lock, Camera, Fingerprint, CheckCircle, XCircle, Loader2, AlertTriangle, Eye, EyeOff, Key, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api-base';

interface MFAAuthProps {
  organizationId: string;
  onAuthSuccess: (tokens: any, user: any) => void;
  onAuthError: (error: string) => void;
}

interface MFAStep {
  id: 'password' | 'face' | 'fingerprint' | 'complete';
  title: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  icon: React.ReactNode;
}

interface BiometricData {
  landmarks?: any[];
  quality: number;
  imageData: string;
  embedding?: number[];
  deviceInfo: {
    deviceId: string;
    deviceType: string;
    manufacturer: string;
    model: string;
  };
}

export default function MFAAuth({ organizationId, onAuthSuccess, onAuthError }: MFAAuthProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });

  // MFA session data
  const [mfaSession, setMfaSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState('');

  // Biometric states
  const [faceQuality, setFaceQuality] = useState(0);
  const [faceMatchScore, setFaceMatchScore] = useState<number | null>(null);
  const [fingerprintMatchScore, setFingerprintMatchScore] = useState<number | null>(null);
  const [biometricStatus, setBiometricStatus] = useState<'idle' | 'capturing' | 'verifying' | 'success' | 'error'>('idle');

  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // MFA steps configuration
  const mfaSteps: MFAStep[] = [
    {
      id: 'password',
      title: 'Password Authentication',
      description: 'Enter your password for the first factor',
      isRequired: true,
      isCompleted: false,
      icon: <Lock className="w-5 h-5" />
    },
    {
      id: 'face',
      title: 'Face Recognition',
      description: 'Face verification for the second factor (required)',
      isRequired: true,
      isCompleted: false,
      icon: <Camera className="w-5 h-5" />
    },
    {
      id: 'fingerprint',
      title: 'Fingerprint (Optional)',
      description: 'Enhanced security with fingerprint verification',
      isRequired: false,
      isCompleted: false,
      icon: <Fingerprint className="w-5 h-5" />
    },
    {
      id: 'complete',
      title: 'Authentication Complete',
      description: 'Multi-factor authentication successful',
      isRequired: false,
      isCompleted: false,
      icon: <CheckCircle className="w-5 h-5" />
    }
  ];

  useEffect(() => {
    return () => {
      // Cleanup camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Step 1: Password verification
  const handlePasswordVerification = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/mfa-auth/step1-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Organization-ID': organizationId
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMfaSession(result.data.mfaSession);
        setUser(result.data.user);
        mfaSteps[0].isCompleted = true;
        setCurrentStep(1);
        toast({
          title: 'Password Verified',
          description: 'Proceeding to face recognition',
        });
      } else {
        throw new Error(result.message || 'Password verification failed');
      }

    } catch (error) {
      console.error('Password verification error:', error);
      setError(error instanceof Error ? error.message : 'Password verification failed');
      onAuthError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Face recognition
  const handleFaceRecognition = async () => {
    setIsLoading(true);
    setError(null);
    setBiometricStatus('capturing');

    try {
      // Start camera
      await startCamera();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Capture face image
      if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          context.drawImage(videoRef.current, 0, 0);
          
          const imageData = canvasRef.current.toDataURL('image/jpeg');
          
          // Generate mock face data
          const faceData: BiometricData = {
            landmarks: generateMockLandmarks(),
            quality: Math.floor(Math.random() * 25) + 75, // 75-100 quality
            imageData: imageData,
            embedding: generateMockEmbedding(),
            deviceInfo: {
              deviceId: 'webcam-001',
              deviceType: 'webcam',
              manufacturer: 'Generic',
              model: 'HD Webcam'
            }
          };

          setFaceQuality(faceData.quality);
          setBiometricStatus('verifying');

          // Verify face
          const response = await fetch(`${API_BASE_URL}/mfa-auth/step2-face`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Organization-ID': organizationId
            },
            body: JSON.stringify({
              mfaToken: mfaSession.token,
              ...faceData
            })
          });

          const result = await response.json();

          if (response.ok) {
            setMfaSession(result.data.mfaSession);
            setFaceMatchScore(result.data.mfaSession.faceMatchScore);
            mfaSteps[1].isCompleted = true;
            setBiometricStatus('success');
            
            toast({
              title: 'Face Recognition Verified',
              description: `Match score: ${(result.data.mfaSession.faceMatchScore * 100).toFixed(1)}%`,
            });

            // Move to next step
            setTimeout(() => {
              setCurrentStep(2);
              setBiometricStatus('idle');
              stopCamera();
            }, 2000);
          } else {
            throw new Error(result.message || 'Face recognition failed');
          }
        }
      }

    } catch (error) {
      console.error('Face recognition error:', error);
      setError(error instanceof Error ? error.message : 'Face recognition failed');
      setBiometricStatus('error');
      onAuthError(error instanceof Error ? error.message : 'Verification failed');
      stopCamera();
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Fingerprint verification (optional)
  const handleFingerprintVerification = async () => {
    setIsLoading(true);
    setError(null);
    setBiometricStatus('capturing');

    try {
      // Generate mock fingerprint data
      const fingerprintData: BiometricData = {
        minutiae: generateMockMinutiae(),
        quality: Math.floor(Math.random() * 30) + 70, // 70-100 quality
        imageData: 'mock-fingerprint-image-data',
        deviceInfo: {
          deviceId: 'fingerprint-scanner-001',
          deviceType: 'fingerprint',
          manufacturer: 'Authify',
          model: 'FP-2000'
        }
      };

      setBiometricStatus('verifying');

      const response = await fetch(`${API_BASE_URL}/mfa-auth/step3-fingerprint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Organization-ID': organizationId
        },
        body: JSON.stringify({
          mfaToken: mfaSession.token,
          ...fingerprintData
        })
      });

      const result = await response.json();

      if (response.ok) {
        setFingerprintMatchScore(result.data.fingerprintMatchScore);
        
        if (result.data.fingerprintVerified) {
          mfaSteps[2].isCompleted = true;
          setBiometricStatus('success');
          
          toast({
            title: 'Fingerprint Verified',
            description: `Match score: ${(result.data.fingerprintMatchScore * 100).toFixed(1)}%`,
          });
        } else {
          setBiometricStatus('idle');
          toast({
            title: 'Fingerprint Not Enrolled',
            description: 'Proceeding without fingerprint verification',
          });
        }
      } else {
        throw new Error(result.message || 'Fingerprint verification failed');
      }

    } catch (error) {
      console.error('Fingerprint verification error:', error);
      setError(error instanceof Error ? error.message : 'Fingerprint verification failed');
      setBiometricStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Complete MFA authentication
  const handleCompleteMFA = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/mfa-auth/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Organization-ID': organizationId
        },
        body: JSON.stringify({
          mfaToken: mfaSession.token,
          fingerprintVerified: mfaSteps[2].isCompleted
        })
      });

      const result = await response.json();

      if (response.ok) {
        mfaSteps[3].isCompleted = true;
        setCurrentStep(3);
        
        toast({
          title: 'MFA Authentication Successful',
          description: 'Multi-factor authentication completed successfully',
        });

        onAuthSuccess(result.data.tokens, result.data.user);
      } else {
        throw new Error(result.message || 'MFA completion failed');
      }

    } catch (error) {
      console.error('MFA completion error:', error);
      setError(error instanceof Error ? error.message : 'MFA completion failed');
      onAuthError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Password recovery
  const handlePasswordRecovery = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/mfa-auth/recovery/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Organization-ID': organizationId
        },
        body: JSON.stringify({
          email: formData.email
        })
      });

      const result = await response.json();

      if (response.ok) {
        setRecoveryToken(result.data.recoveryToken || '');
        toast({
          title: 'Recovery Initiated',
          description: 'Please check your email for recovery instructions',
        });
      } else {
        throw new Error(result.message || 'Recovery initiation failed');
      }

    } catch (error) {
      console.error('Password recovery error:', error);
      setError(error instanceof Error ? error.message : 'Password recovery failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Complete password recovery
  const handleCompleteRecovery = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Capture face for MFA verification
      await startCamera();
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          context.drawImage(videoRef.current, 0, 0);
          
          const imageData = canvasRef.current.toDataURL('image/jpeg');
          
          const faceData: BiometricData = {
            landmarks: generateMockLandmarks(),
            quality: Math.floor(Math.random() * 25) + 75,
            imageData: imageData,
            embedding: generateMockEmbedding(),
            deviceInfo: {
              deviceId: 'webcam-001',
              deviceType: 'webcam',
              manufacturer: 'Generic',
              model: 'HD Webcam'
            }
          };

          const response = await fetch(`${API_BASE_URL}/mfa-auth/recovery/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Organization-ID': organizationId
            },
            body: JSON.stringify({
              recoveryToken: recoveryToken,
              newPassword: formData.newPassword,
              ...faceData
            })
          });

          const result = await response.json();

          if (response.ok) {
            toast({
              title: 'Password Reset Successful',
              description: 'Your password has been reset with MFA verification',
            });
            
            // Reset form and go back to login
            setRecoveryMode(false);
            setFormData({ ...formData, newPassword: '', confirmPassword: '' });
          } else {
            throw new Error(result.message || 'Password recovery failed');
          }
        }
      }

    } catch (error) {
      console.error('Password recovery completion error:', error);
      setError(error instanceof Error ? error.message : 'Password recovery failed');
    } finally {
      setIsLoading(false);
      stopCamera();
    }
  };

  // Mock data generators
  const generateMockMinutiae = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      type: ['ending', 'bifurcation'][Math.floor(Math.random() * 2)],
      angle: Math.random() * 360
    }));
  };

  const generateMockLandmarks = () => {
    return Array.from({ length: 68 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100
    }));
  };

  const generateMockEmbedding = () => {
    return Array.from({ length: 128 }, () => Math.random());
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 90) return 'text-green-600';
    if (quality >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBadge = (quality: number) => {
    if (quality >= 90) return 'Excellent';
    if (quality >= 75) return 'Good';
    return 'Poor';
  };

  const getProgressPercentage = () => {
    const completedSteps = mfaSteps.filter(step => step.isCompleted).length;
    const requiredSteps = mfaSteps.filter(step => step.isRequired).length;
    return (completedSteps / (mfaSteps.length - 1)) * 100; // Exclude complete step
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">Multi-Factor Authentication</h2>
          <Badge variant="outline" className="text-sm">
            {mfaSteps.filter(step => step.isCompleted).length}/{mfaSteps.length - 1} Completed
          </Badge>
        </div>
        <Progress value={getProgressPercentage()} className="w-full" />
        
        <div className="grid grid-cols-4 gap-2">
          {mfaSteps.slice(0, -1).map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col items-center p-3 rounded-lg border ${
                step.isCompleted 
                  ? 'border-green-500 bg-green-50' 
                  : index === currentStep 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.isCompleted 
                  ? 'bg-green-500 text-white' 
                  : index === currentStep 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
              }`}>
                {step.isCompleted ? <CheckCircle className="w-4 h-4" /> : step.icon}
              </div>
              <span className={`text-xs mt-1 text-center ${
                step.isCompleted 
                  ? 'text-green-700' 
                  : index === currentStep 
                    ? 'text-blue-700 font-medium' 
                    : 'text-gray-600'
              }`}>
                {step.title}
              </span>
              {step.isRequired && (
                <Badge variant="secondary" className="text-xs mt-1">
                  Required
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Password Verification */}
      {currentStep === 0 && !recoveryMode && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-6 h-6 text-blue-600" />
              <CardTitle>Step 1: Password Authentication</CardTitle>
            </div>
            <CardDescription>
              Enter your password for the first authentication factor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-12 rounded-xl pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handlePasswordVerification}
                disabled={isLoading || !formData.email || !formData.password}
                className="flex-1 h-12 rounded-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Password'
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setRecoveryMode(true)}
                className="h-12 rounded-xl"
              >
                <Mail className="w-4 h-4 mr-2" />
                Forgot Password
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Password Recovery */}
      {recoveryMode && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="w-6 h-6 text-blue-600" />
              <CardTitle>Password Recovery</CardTitle>
            </div>
            <CardDescription>
              Reset your password with MFA verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!recoveryToken ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recovery-email">Email Address</Label>
                  <Input
                    id="recovery-email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                <Button 
                  onClick={handlePasswordRecovery}
                  disabled={isLoading || !formData.email}
                  className="w-full h-12 rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Recovery Email...
                    </>
                  ) : (
                    'Send Recovery Email'
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setRecoveryMode(false)}
                  className="w-full h-12 rounded-xl"
                >
                  Back to Login
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                
                <div className="relative w-64 h-48 mx-auto mb-4 bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <Button 
                  onClick={handleCompleteRecovery}
                  disabled={isLoading || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword}
                  className="w-full h-12 rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password with Face Verification'
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setRecoveryMode(false)}
                  className="w-full h-12 rounded-xl"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Face Recognition */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Camera className="w-6 h-6 text-blue-600" />
              <CardTitle>Step 2: Face Recognition</CardTitle>
              <Badge variant="destructive">Required</Badge>
            </div>
            <CardDescription>
              Face verification for the second authentication factor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {biometricStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Face recognition verified successfully! Match score: {(faceMatchScore! * 100).toFixed(1)}%
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center">
              <div className="relative w-64 h-48 mx-auto mb-4 bg-gray-100 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ display: biometricStatus === 'capturing' || biometricStatus === 'verifying' ? 'block' : 'none' }}
                />
                <canvas ref={canvasRef} className="hidden" />
                {biometricStatus === 'idle' && (
                  <div className="flex items-center justify-center h-full">
                    <Camera className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {faceQuality > 0 && (
                <div className="mb-4">
                  <Badge className={getQualityColor(faceQuality)}>
                    Quality: {faceQuality}% - {getQualityBadge(faceQuality)}
                  </Badge>
                </div>
              )}
            </div>

            <Button 
              onClick={handleFaceRecognition}
              disabled={isLoading || biometricStatus === 'capturing' || biometricStatus === 'verifying'}
              className="w-full h-12 rounded-xl"
            >
              {biometricStatus === 'capturing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Capturing Face...
                </>
              ) : biometricStatus === 'verifying' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying Face...
                </>
              ) : (
                'Verify Face Recognition'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Fingerprint (Optional) */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Fingerprint className="w-6 h-6 text-blue-600" />
              <CardTitle>Step 3: Fingerprint (Optional)</CardTitle>
              <Badge variant="outline">Optional</Badge>
            </div>
            <CardDescription>
              Enhanced security with fingerprint verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {fingerprintMatchScore !== null && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Fingerprint verified successfully! Match score: {(fingerprintMatchScore * 100).toFixed(1)}%
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Fingerprint className="w-16 h-16 text-gray-400" />
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handleFingerprintVerification}
                disabled={isLoading || biometricStatus === 'capturing' || biometricStatus === 'verifying'}
                className="flex-1 h-12 rounded-xl"
              >
                {biometricStatus === 'capturing' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Capturing...
                  </>
                ) : biometricStatus === 'verifying' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Fingerprint'
                )}
              </Button>
              <Button 
                onClick={handleCompleteMFA}
                variant="outline"
                className="flex-1 h-12 rounded-xl"
              >
                Skip Fingerprint
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Fingerprint verification is optional for enhanced security. You can skip this step.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Complete */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <CardTitle>Authentication Complete</CardTitle>
            </div>
            <CardDescription>
              Multi-factor authentication completed successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-green-600">MFA Authentication Successful!</h3>
                <p className="text-muted-foreground mt-2">
                  Welcome back, {user?.firstName} {user?.lastName}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Password verified</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Face recognition verified</span>
                </div>
                {fingerprintMatchScore !== null && (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Fingerprint verified</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Info */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          This system uses Multi-Factor Authentication (MFA) with password + face recognition as required factors, and optional fingerprint for enhanced security.
        </AlertDescription>
      </Alert>
    </div>
  );
}
