'use client';

import { useState, useRef, useEffect } from 'react';
import { Fingerprint, Camera, Shield, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { API_BASE_URL } from '@/lib/api-base';

interface BiometricAuthProps {
  userId: string;
  organizationId: string;
  onAuthSuccess: (biometricType: 'fingerprint' | 'face') => void;
  onAuthError: (error: string) => void;
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

export default function BiometricAuth({ userId, organizationId, onAuthSuccess, onAuthError }: BiometricAuthProps) {
  const [activeMethod, setActiveMethod] = useState<'fingerprint' | 'face' | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'capturing' | 'verifying' | 'success' | 'error'>('idle');
  const [quality, setQuality] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  
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

  const captureFingerprint = async () => {
    setIsCapturing(true);
    setCaptureStatus('capturing');
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

      // Call API to capture fingerprint
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
        setCaptureStatus('success');
        setTimeout(() => {
          setCaptureStatus('idle');
          setIsCapturing(false);
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to capture fingerprint');
      }

    } catch (error) {
      console.error('Fingerprint capture error:', error);
      setError(error instanceof Error ? error.message : 'Failed to capture fingerprint');
      setCaptureStatus('error');
      setIsCapturing(false);
    }
  };

  const captureFace = async () => {
    setIsCapturing(true);
    setCaptureStatus('capturing');
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

          // Call API to capture face
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
            setCaptureStatus('success');
            setTimeout(() => {
              setCaptureStatus('idle');
              setIsCapturing(false);
              stopCamera();
            }, 2000);
          } else {
            throw new Error(result.message || 'Failed to capture face');
          }
        }
      }

    } catch (error) {
      console.error('Face capture error:', error);
      setError(error instanceof Error ? error.message : 'Failed to capture face');
      setCaptureStatus('error');
      setIsCapturing(false);
      stopCamera();
    }
  };

  const verifyFingerprint = async () => {
    setIsVerifying(true);
    setCaptureStatus('verifying');
    setError(null);
    setMatchScore(null);

    try {
      // Simulate fingerprint verification
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate mock fingerprint data for verification
      const fingerprintData: BiometricData = {
        minutiae: generateMockMinutiae(),
        quality: Math.floor(Math.random() * 30) + 70,
        imageData: 'mock-fingerprint-verify-data',
        deviceInfo: {
          deviceId: 'fingerprint-scanner-001',
          deviceType: 'fingerprint',
          manufacturer: 'Authify',
          model: 'FP-2000'
        }
      };

      // Call API to verify fingerprint
      const response = await fetch(`${API_BASE_URL}/biometric-auth/verify/fingerprint`, {
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
        setMatchScore(result.data.matchScore);
        setCaptureStatus('success');
        onAuthSuccess('fingerprint');
      } else {
        throw new Error(result.message || 'Fingerprint verification failed');
      }

    } catch (error) {
      console.error('Fingerprint verification error:', error);
      setError(error instanceof Error ? error.message : 'Fingerprint verification failed');
      setCaptureStatus('error');
      onAuthError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyFace = async () => {
    setIsVerifying(true);
    setCaptureStatus('verifying');
    setError(null);
    setMatchScore(null);

    try {
      // Start camera for face verification
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
          
          // Generate mock face data for verification
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

          // Call API to verify face
          const response = await fetch(`${API_BASE_URL}/biometric-auth/verify/face`, {
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
            setMatchScore(result.data.matchScore);
            setCaptureStatus('success');
            onAuthSuccess('face');
          } else {
            throw new Error(result.message || 'Face verification failed');
          }
        }
      }

    } catch (error) {
      console.error('Face verification error:', error);
      setError(error instanceof Error ? error.message : 'Face verification failed');
      setCaptureStatus('error');
      onAuthError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
      stopCamera();
    }
  };

  // Mock data generators for demo
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

  return (
    <div className="space-y-6">
      {/* Biometric Method Selection */}
      {!activeMethod && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
                onClick={() => setActiveMethod('fingerprint')}>
            <CardHeader className="text-center">
              <Fingerprint className="w-12 h-12 mx-auto mb-2 text-blue-600" />
              <CardTitle>Fingerprint</CardTitle>
              <CardDescription>Use your fingerprint for secure authentication</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
                onClick={() => setActiveMethod('face')}>
            <CardHeader className="text-center">
              <Camera className="w-12 h-12 mx-auto mb-2 text-blue-600" />
              <CardTitle>Face Recognition</CardTitle>
              <CardDescription>Use your face for secure authentication</CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Fingerprint Authentication */}
      {activeMethod === 'fingerprint' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-6 h-6 text-blue-600" />
                <CardTitle>Fingerprint Authentication</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveMethod(null)}>
                Back
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {captureStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {isVerifying ? 'Authentication successful!' : 'Fingerprint captured successfully!'}
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

              {matchScore !== null && (
                <div className="mb-4">
                  <Badge className="text-green-600">
                    Match Score: {(matchScore * 100).toFixed(1)}%
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              {!isVerifying ? (
                <Button 
                  onClick={captureFingerprint}
                  disabled={isCapturing || captureStatus === 'capturing'}
                  className="flex-1"
                >
                  {isCapturing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Capturing...
                    </>
                  ) : (
                    'Capture Fingerprint'
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={verifyFingerprint}
                  disabled={captureStatus === 'verifying'}
                  className="flex-1"
                >
                  {captureStatus === 'verifying' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Fingerprint'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Face Recognition Authentication */}
      {activeMethod === 'face' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-6 h-6 text-blue-600" />
                <CardTitle>Face Recognition</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveMethod(null)}>
                Back
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {captureStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {isVerifying ? 'Authentication successful!' : 'Face captured successfully!'}
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
                  style={{ display: isCapturing || isVerifying ? 'block' : 'none' }}
                />
                <canvas ref={canvasRef} className="hidden" />
                {!isCapturing && !isVerifying && (
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

              {matchScore !== null && (
                <div className="mb-4">
                  <Badge className="text-green-600">
                    Match Score: {(matchScore * 100).toFixed(1)}%
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              {!isVerifying ? (
                <Button 
                  onClick={captureFace}
                  disabled={isCapturing || captureStatus === 'capturing'}
                  className="flex-1"
                >
                  {isCapturing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Capturing...
                    </>
                  ) : (
                    'Capture Face'
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={verifyFace}
                  disabled={captureStatus === 'verifying'}
                  className="flex-1"
                >
                  {captureStatus === 'verifying' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Face'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Info */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your biometric data is encrypted and securely stored. Organization-based partitioning ensures your data is isolated and never shared between organizations.
        </AlertDescription>
      </Alert>
    </div>
  );
}
