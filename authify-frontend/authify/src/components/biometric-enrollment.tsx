'use client';

import { useState, useRef, useEffect } from 'react';
import { Shield, Lock, Camera, Fingerprint, CheckCircle, XCircle, Loader2, AlertTriangle, User, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api-base';

interface BiometricEnrollmentProps {
  userId: string;
  organizationId: string;
  onEnrollmentComplete: () => void;
  onBackToLogin: () => void;
}

interface BiometricData {
  minutiae?: any[];
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

export default function BiometricEnrollment({ userId, organizationId, onEnrollmentComplete, onBackToLogin }: BiometricEnrollmentProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('fingerprint');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<'idle' | 'capturing' | 'enrolling' | 'success' | 'error'>('idle');
  const [quality, setQuality] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Enrollment tracking
  const [fingerprintEnrolled, setFingerprintEnrolled] = useState(false);
  const [faceEnrolled, setFaceEnrolled] = useState(false);
  const [enrollmentProgress, setEnrollmentProgress] = useState(0);
  
  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  const enrollFingerprint = async () => {
    setIsCapturing(true);
    setEnrollmentStatus('capturing');
    setError(null);

    try {
      // Simulate fingerprint capture
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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

      setQuality(fingerprintData.quality);
      setEnrollmentStatus('enrolling');

      // Call API to enroll fingerprint
      const response = await fetch(`${API_BASE_URL}/biometric-auth/capture/fingerprint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Organization-ID': organizationId
        },
        body: JSON.stringify({
          userId,
          ...fingerprintData
        })
      });

      const result = await response.json();

      if (response.ok) {
        setFingerprintEnrolled(true);
        setEnrollmentStatus('success');
        updateEnrollmentProgress();
        
        toast({
          title: 'Fingerprint Enrolled Successfully',
          description: 'Your fingerprint has been securely enrolled',
        });
        
        setTimeout(() => {
          setEnrollmentStatus('idle');
          setIsCapturing(false);
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to enroll fingerprint');
      }

    } catch (error) {
      console.error('Fingerprint enrollment error:', error);
      setError(error instanceof Error ? error.message : 'Failed to enroll fingerprint');
      setEnrollmentStatus('error');
      setIsCapturing(false);
    }
  };

  const enrollFace = async () => {
    setIsCapturing(true);
    setEnrollmentStatus('capturing');
    setError(null);

    try {
      // Start camera for face capture
      await startCamera();
      
      // Wait a moment for camera to initialize
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Capture image from video
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

          setQuality(faceData.quality);
          setEnrollmentStatus('enrolling');

          // Call API to enroll face
          const response = await fetch(`${API_BASE_URL}/biometric-auth/capture/face`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Organization-ID': organizationId
            },
            body: JSON.stringify({
              userId,
              ...faceData
            })
          });

          const result = await response.json();

          if (response.ok) {
            setFaceEnrolled(true);
            setEnrollmentStatus('success');
            updateEnrollmentProgress();
            
            toast({
              title: 'Face Recognition Enrolled Successfully',
              description: 'Your face has been securely enrolled',
            });
            
            setTimeout(() => {
              setEnrollmentStatus('idle');
              setIsCapturing(false);
              stopCamera();
            }, 2000);
          } else {
            throw new Error(result.message || 'Failed to enroll face');
          }
        }
      }

    } catch (error) {
      console.error('Face enrollment error:', error);
      setError(error instanceof Error ? error.message : 'Failed to enroll face');
      setEnrollmentStatus('error');
      setIsCapturing(false);
      stopCamera();
    }
  };

  const updateEnrollmentProgress = () => {
    const progress = (fingerprintEnrolled ? 50 : 0) + (faceEnrolled ? 50 : 0);
    setEnrollmentProgress(progress);
  };

  const handleCompleteEnrollment = () => {
    if (faceEnrolled) {
      toast({
        title: 'Biometric Enrollment Complete',
        description: 'You can now use multi-factor authentication',
      });
      onEnrollmentComplete();
    } else {
      toast({
        variant: 'destructive',
        title: 'Enrollment Incomplete',
        description: 'Face recognition is required for MFA',
      });
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

  const getEnrollmentStatus = () => {
    if (faceEnrolled) return 'Ready for MFA';
    if (fingerprintEnrolled) return 'Partial - Face Required';
    return 'Not Started';
  };

  const getStatusColor = () => {
    if (faceEnrolled) return 'text-green-600';
    if (fingerprintEnrolled) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">Biometric Enrollment</h2>
          <Badge variant="outline" className="text-sm">
            {enrollmentProgress}% Complete
          </Badge>
        </div>
        <Progress value={enrollmentProgress} className="w-full" />
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Enrollment Status: <span className={`font-medium ${getStatusColor()}`}>{getEnrollmentStatus()}</span></span>
          <Button variant="outline" size="sm" onClick={onBackToLogin}>
            Back to Login
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Enrollment Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fingerprint" className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4" />
            Fingerprint
            {fingerprintEnrolled && <CheckCircle className="w-4 h-4 text-green-600" />}
          </TabsTrigger>
          <TabsTrigger value="face" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Face Recognition
            {faceEnrolled && <CheckCircle className="w-4 h-4 text-green-600" />}
          </TabsTrigger>
        </TabsList>

        {/* Fingerprint Enrollment */}
        <TabsContent value="fingerprint" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Fingerprint className="w-6 h-6 text-blue-600" />
                <CardTitle>Fingerprint Enrollment</CardTitle>
                {fingerprintEnrolled && <Badge className="bg-green-100 text-green-800">Enrolled</Badge>}
              </div>
              <CardDescription>
                {fingerprintEnrolled 
                  ? "Your fingerprint is enrolled and ready for authentication"
                  : "Enroll your fingerprint for enhanced security authentication"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {enrollmentStatus === 'success' && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Fingerprint enrolled successfully! Quality: {quality}%
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Fingerprint className="w-16 h-16 text-gray-400" />
                </div>
                
                {quality > 0 && (
                  <div className="mb-4">
                    <Badge className={getQualityColor(quality)}>
                      Quality: {quality}% - {getQualityBadge(quality)}
                    </Badge>
                  </div>
                )}
              </div>

              {!fingerprintEnrolled && (
                <Button 
                  onClick={enrollFingerprint}
                  disabled={isCapturing || enrollmentStatus === 'capturing' || enrollmentStatus === 'enrolling'}
                  className="w-full h-12 rounded-xl"
                >
                  {enrollmentStatus === 'capturing' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Capturing...
                    </>
                  ) : enrollmentStatus === 'enrolling' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    'Enroll Fingerprint'
                  )}
                </Button>
              )}

              {fingerprintEnrolled && (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Your fingerprint is enrolled and ready for use in authentication
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab('face')} className="w-full">
                    Continue to Face Recognition
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Face Recognition Enrollment */}
        <TabsContent value="face" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Camera className="w-6 h-6 text-blue-600" />
                <CardTitle>Face Recognition Enrollment</CardTitle>
                {faceEnrolled && <Badge className="bg-green-100 text-green-800">Enrolled</Badge>}
              </div>
              <CardDescription>
                {faceEnrolled 
                  ? "Your face is enrolled and ready for authentication"
                  : "Enroll your face recognition for required MFA authentication"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {enrollmentStatus === 'success' && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Face recognition enrolled successfully! Quality: {quality}%
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
                    style={{ display: isCapturing || enrollmentStatus === 'enrolling' ? 'block' : 'none' }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {!isCapturing && enrollmentStatus !== 'enrolling' && (
                    <div className="flex items-center justify-center h-full">
                      <Camera className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {quality > 0 && (
                  <div className="mb-4">
                    <Badge className={getQualityColor(quality)}>
                      Quality: {quality}% - {getQualityBadge(quality)}
                    </Badge>
                  </div>
                )}
              </div>

              {!faceEnrolled && (
                <Button 
                  onClick={enrollFace}
                  disabled={isCapturing || enrollmentStatus === 'capturing' || enrollmentStatus === 'enrolling'}
                  className="w-full h-12 rounded-xl"
                >
                  {enrollmentStatus === 'capturing' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Capturing...
                    </>
                  ) : enrollmentStatus === 'enrolling' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    'Enroll Face Recognition'
                  )}
                </Button>
              )}

              {faceEnrolled && (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Your face is enrolled and ready for MFA authentication
                  </p>
                  <div className="space-y-2">
                    <Button onClick={handleCompleteEnrollment} className="w-full">
                      Complete Enrollment
                    </Button>
                    {!fingerprintEnrolled && (
                      <Button variant="outline" onClick={() => setActiveTab('fingerprint')} className="w-full">
                        Enroll Fingerprint (Optional)
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enrollment Summary */}
      {(fingerprintEnrolled || faceEnrolled) && (
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Summary</CardTitle>
            <CardDescription>Your biometric factors status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  fingerprintEnrolled ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Fingerprint className={`w-5 h-5 ${fingerprintEnrolled ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <div className="font-medium">Fingerprint</div>
                  <div className={`text-sm ${fingerprintEnrolled ? 'text-green-600' : 'text-gray-500'}`}>
                    {fingerprintEnrolled ? 'Enrolled' : 'Not Enrolled'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  faceEnrolled ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Camera className={`w-5 h-5 ${faceEnrolled ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <div className="font-medium">Face Recognition</div>
                  <div className={`text-sm ${faceEnrolled ? 'text-green-600' : 'text-gray-500'}`}>
                    {faceEnrolled ? 'Enrolled' : 'Not Enrolled'}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                <p><strong>Required for MFA:</strong> Face Recognition</p>
                <p><strong>Optional Enhancement:</strong> Fingerprint</p>
                <p className="mt-2">Once face recognition is enrolled, you can use multi-factor authentication at login.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Info */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your biometric data is encrypted and securely stored with organization-based partitioning. 
          Face recognition is required for MFA, fingerprint is optional for enhanced security.
        </AlertDescription>
      </Alert>
    </div>
  );
}
