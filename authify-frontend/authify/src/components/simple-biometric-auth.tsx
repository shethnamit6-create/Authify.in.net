'use client';

import { useEffect, useState } from 'react';
import { Shield, Lock, Camera, CheckCircle, Loader2, AlertTriangle, Eye, EyeOff, UserPlus, LogIn, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api-base';

interface SimpleBiometricAuthProps {
  organizationId: string;
  onAuthSuccess: (tokens: any, user: any) => void;
  onAuthError: (error: string) => void;
  initialMode?: 'login' | 'signup';
}

export default function SimpleBiometricAuth({ organizationId, onAuthSuccess, onAuthError, initialMode = 'login' }: SimpleBiometricAuthProps) {
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<'idle' | 'ready' | 'verifying' | 'success' | 'error'>('idle');
  const [pendingTokens, setPendingTokens] = useState<any>(null);
  const [autoFaceTriggered, setAutoFaceTriggered] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  const [registerOptions, setRegisterOptions] = useState<any>(null);

  const readJson = async (response: Response) => {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text().catch(() => '');
      throw new Error(text || 'Invalid server response (expected JSON)');
    }
    return response.json();
  };
  const unwrapData = (payload: any) => (payload && payload.success && payload.data ? payload.data : payload);

  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const applicationId = process.env.NEXT_PUBLIC_APPLICATION_ID;

  const ensureConfig = () => {
    if (!apiKey || !clientId || !applicationId) {
      throw new Error('Missing API configuration. Set NEXT_PUBLIC_API_KEY, NEXT_PUBLIC_CLIENT_ID, NEXT_PUBLIC_APPLICATION_ID.');
    }
  };

  const base64urlToBuffer = (input: any) => {
    if (input instanceof ArrayBuffer) return input;
    if (ArrayBuffer.isView(input)) return input.buffer;
    if (Array.isArray(input)) return new Uint8Array(input).buffer;

    if (input && typeof input === 'object') {
      if (input.type === 'Buffer' && Array.isArray(input.data)) {
        return new Uint8Array(input.data).buffer;
      }
      const data = input.data || input.bytes;
      if (Array.isArray(data)) return new Uint8Array(data).buffer;
      if (typeof input.value === 'string') input = input.value;
      if (typeof input.base64url === 'string') input = input.base64url;
      if (typeof input.base64 === 'string') input = input.base64;
      if (typeof input.length === 'number' && input.length > 0) {
        try {
          return new Uint8Array(Array.from(input)).buffer;
        } catch (_) {
          // fall through to string handling
        }
      }
    }

    if (!input || typeof input !== 'string') {
      // Avoid crashing the UI on unexpected inputs
      return new Uint8Array().buffer;
    }

    const pad = '='.repeat((4 - (input.length % 4)) % 4);
    const base64 = (input + pad).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    const buffer = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) buffer[i] = raw.charCodeAt(i);
    return buffer.buffer;
  };

  const bufferToBase64url = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let str = '';
    bytes.forEach((b) => { str += String.fromCharCode(b); });
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  };

  const prepareCreationOptions = (options: any): PublicKeyCredentialCreationOptions => {
    if (!options?.challenge || !options?.user?.id) {
      throw new Error('Invalid registration options received.');
    }
    return {
      ...options,
      challenge: base64urlToBuffer(options.challenge),
      user: {
        ...options.user,
        id: base64urlToBuffer(options.user.id)
      },
      excludeCredentials: (options.excludeCredentials || []).map((cred: any) => ({
        ...cred,
        id: base64urlToBuffer(cred.id)
      }))
    };
  };

  const prepareRequestOptions = (options: any): PublicKeyCredentialRequestOptions => {
    if (!options?.challenge) {
      throw new Error('Invalid authentication options received.');
    }
    return {
      ...options,
      challenge: base64urlToBuffer(options.challenge),
      allowCredentials: (options.allowCredentials || []).map((cred: any) => ({
        ...cred,
        id: base64urlToBuffer(cred.id)
      }))
    };
  };

  const handleEmailPasswordSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      ensureConfig();

      if (authMode === 'signup') {
        if (!formData.firstName || !formData.lastName) {
          throw new Error('First name and last name are required');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }

        const response = await fetch(`${API_BASE_URL}/v1/register/options`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
            'x-client-id': clientId
          },
          body: JSON.stringify({
            identifier: formData.email,
            displayName: `${formData.firstName} ${formData.lastName}`.trim(),
            applicationId,
            password: formData.password,
            purpose: 'face'
          })
        });

        const result = await readJson(response);

        if (!response.ok) {
          throw new Error(result.error?.message || 'Registration failed');
        }

        setRegisterOptions(unwrapData(result));
        setCurrentStep(2);
        setDeviceStatus('ready');

        toast({
          title: 'Account Created',
          description: 'Please complete face verification',
        });
      } else {
        const response = await fetch(`${API_BASE_URL}/v1/auth/options`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
            'x-client-id': clientId
          },
          body: JSON.stringify({
            identifier: formData.email,
            applicationId,
            password: formData.password,
            purpose: 'face'
          })
        });

        const result = await readJson(response);

        if (!response.ok) {
          throw new Error(result.error?.message || 'Login failed');
        }

        setRegisterOptions(null);
        setCurrentStep(2);
        setDeviceStatus('ready');

        toast({
          title: 'Password Verified',
          description: 'Please complete face verification',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
      onAuthError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithPurpose = async (purpose: 'face' | 'fingerprint') => {
    ensureConfig();

    const optionsResponse = await fetch(`${API_BASE_URL}/v1/auth/options`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'x-client-id': clientId
      },
      body: JSON.stringify({
        identifier: formData.email,
        applicationId,
        password: formData.password,
        purpose
      })
    });

    const optionsResult = await readJson(optionsResponse);

    if (!optionsResponse.ok) {
      throw new Error(optionsResult.error?.message || 'Authentication options failed');
    }

    const options = prepareRequestOptions(unwrapData(optionsResult));
    const assertion = (await navigator.credentials.get({ publicKey: options })) as PublicKeyCredential;
    if (!assertion) throw new Error('Device verification was cancelled.');

    const assertionResponse = assertion.response as AuthenticatorAssertionResponse;
    const authenticationResponse = {
      id: assertion.id,
      rawId: bufferToBase64url(assertion.rawId),
      type: assertion.type,
      response: {
        clientDataJSON: bufferToBase64url(assertionResponse.clientDataJSON),
        authenticatorData: bufferToBase64url(assertionResponse.authenticatorData),
        signature: bufferToBase64url(assertionResponse.signature),
        userHandle: assertionResponse.userHandle ? bufferToBase64url(assertionResponse.userHandle) : null
      },
      clientExtensionResults: assertion.getClientExtensionResults?.() || {}
    };

    const verifyResponse = await fetch(`${API_BASE_URL}/v1/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'x-client-id': clientId
      },
      body: JSON.stringify({
        identifier: formData.email,
        applicationId,
        authenticationResponse,
        purpose
      })
    });

    const verifyResult = await readJson(verifyResponse);

    if (!verifyResponse.ok) {
      throw new Error(verifyResult.error?.message || 'Authentication failed');
    }

    return verifyResult.data.token as string;
  };

  const registerCredential = async (purpose: 'face' | 'fingerprint') => {
    ensureConfig();

    const response = await fetch(`${API_BASE_URL}/v1/register/options`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'x-client-id': clientId
      },
      body: JSON.stringify({
        identifier: formData.email,
        displayName: `${formData.firstName} ${formData.lastName}`.trim(),
        applicationId,
        password: formData.password,
        purpose
      })
    });

    const result = await readJson(response);

    if (!response.ok) {
      throw new Error(result.error?.message || 'Registration options failed');
    }

    const options = prepareCreationOptions(unwrapData(result));
    const credential = (await navigator.credentials.create({ publicKey: options })) as PublicKeyCredential;
    if (!credential) throw new Error('Device registration was cancelled.');

    const attestation = credential.response as AuthenticatorAttestationResponse;
    const registrationResponse = {
      id: credential.id,
      rawId: bufferToBase64url(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: bufferToBase64url(attestation.clientDataJSON),
        attestationObject: bufferToBase64url(attestation.attestationObject),
        transports: (attestation as any).getTransports?.() || []
      },
      clientExtensionResults: credential.getClientExtensionResults?.() || {}
    };

    const verifyResponse = await fetch(`${API_BASE_URL}/v1/register/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'x-client-id': clientId
      },
      body: JSON.stringify({
        identifier: formData.email,
        applicationId,
        registrationResponse,
        purpose
      })
    });

    const verifyResult = await readJson(verifyResponse);
    if (!verifyResponse.ok) {
      throw new Error(verifyResult.error?.message || 'Registration failed');
    }
  };

  const handleFaceStep = async () => {
    setIsLoading(true);
    setError(null);
    setDeviceStatus('verifying');

    try {
      ensureConfig();
      if (!('credentials' in navigator)) {
        throw new Error('WebAuthn is not supported in this browser.');
      }

      if (authMode === 'signup') {
        let optionsPayload = registerOptions;
        if (!optionsPayload) {
          const response = await fetch(`${API_BASE_URL}/v1/register/options`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': apiKey,
              'x-client-id': clientId
            },
            body: JSON.stringify({
              identifier: formData.email,
              displayName: `${formData.firstName} ${formData.lastName}`.trim(),
              applicationId,
              password: formData.password,
              purpose: 'face'
            })
          });
          optionsPayload = unwrapData(await readJson(response));
          if (!response.ok) {
            throw new Error(optionsPayload.error?.message || 'Registration options failed');
          }
          setRegisterOptions(optionsPayload);
        }

        const options = prepareCreationOptions(optionsPayload);
        const credential = (await navigator.credentials.create({ publicKey: options })) as PublicKeyCredential;
        if (!credential) throw new Error('Face registration was cancelled.');

        const attestation = credential.response as AuthenticatorAttestationResponse;
        const registrationResponse = {
          id: credential.id,
          rawId: bufferToBase64url(credential.rawId),
          type: credential.type,
          response: {
            clientDataJSON: bufferToBase64url(attestation.clientDataJSON),
            attestationObject: bufferToBase64url(attestation.attestationObject),
            transports: (attestation as any).getTransports?.() || []
          },
          clientExtensionResults: credential.getClientExtensionResults?.() || {}
        };

        const verifyResponse = await fetch(`${API_BASE_URL}/v1/register/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
            'x-client-id': clientId
          },
          body: JSON.stringify({
            identifier: formData.email,
            applicationId,
            registrationResponse,
            purpose: 'face'
          })
        });

        const verifyResult = await readJson(verifyResponse);
        if (!verifyResponse.ok) {
          throw new Error(verifyResult.error?.message || 'Face registration failed');
        }
      }

      const token = await authenticateWithPurpose('face');
      setPendingTokens({ accessToken: token, refreshToken: '' });
      setDeviceStatus('success');

      toast({
        title: 'Face Verified',
        description: 'Face verification completed successfully',
      });

      setCurrentStep(3);
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : 'Face verification failed';
      const message = rawMessage.includes('NotAllowedError')
        ? 'Verification was cancelled or timed out. Please try again.'
        : rawMessage.includes('NotSupportedError')
          ? 'WebAuthn is not supported in this browser. Please use Chrome or Edge.'
          : rawMessage.includes('SecurityError')
            ? 'This site is not allowed to request a passkey here. Please use http://localhost:3000.'
            : rawMessage;
      setError(message);
      setDeviceStatus('error');
      onAuthError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFingerprintStep = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (authMode === 'signup') {
        await registerCredential('fingerprint');
        toast({
          title: 'Fingerprint Registered',
          description: 'Optional fingerprint credential added',
        });
      } else {
        await authenticateWithPurpose('fingerprint');
        toast({
          title: 'Fingerprint Verified',
          description: 'Optional fingerprint verification completed',
        });
      }

      finishAuth();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fingerprint verification failed';
      setError(message);
      onAuthError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const finishAuth = () => {
    if (!pendingTokens) {
      onAuthError('Missing authentication token. Please retry.');
      return;
    }
    onAuthSuccess(pendingTokens, { email: formData.email, role: 'user' });
  };

  const getProgressPercentage = () => {
    return (currentStep / 3) * 100;
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: ''
    });
    setCurrentStep(1);
    setError(null);
    setDeviceStatus('idle');
    setRegisterOptions(null);
    setPendingTokens(null);
    setAutoFaceTriggered(false);
  };

  useEffect(() => {
    if (currentStep !== 2) return;
    if (autoFaceTriggered) return;
    if (isLoading) return;
    if (!formData.email || !formData.password) return;

    setAutoFaceTriggered(true);
    // Auto-trigger WebAuthn to reduce friction
    void handleFaceStep();
  }, [currentStep, autoFaceTriggered, isLoading, formData.email, formData.password]);

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-primary">
            {authMode === 'signup' ? 'Create Account' : 'Sign In'}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {authMode === 'signup'
            ? 'Register with password and device-bound authentication'
            : 'Sign in with password and device authentication'
          }
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Step {currentStep} of 3
          </span>
          <span className="text-muted-foreground">
            {currentStep === 1 ? 'Email & Password' : currentStep === 2 ? 'Face Verification' : 'Fingerprint (Optional)'}
          </span>
        </div>
        <Progress value={getProgressPercentage()} className="w-full" />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Email & Password Authentication
            </CardTitle>
            <CardDescription>
              {authMode === 'signup'
                ? 'Create your account with email and password'
                : 'Enter your credentials to continue'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {authMode === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-11 pr-10"
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

            {authMode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="h-11"
                />
              </div>
            )}

            <Button
              onClick={handleEmailPasswordSubmit}
              disabled={isLoading || !formData.email || !formData.password ||
                (authMode === 'signup' && (!formData.firstName || !formData.lastName || formData.password !== formData.confirmPassword))}
              className="w-full h-11"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {authMode === 'signup' ? 'Creating Account...' : 'Verifying...'}
                </>
              ) : (
                <>
                  {authMode === 'signup' ? (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Continue to Face Verification
                    </>
                  )}
                </>
              )}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => {
                  resetForm();
                  setAuthMode(authMode === 'signup' ? 'login' : 'signup');
                }}
                className="text-sm"
              >
                {authMode === 'signup'
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Face Verification
              <Badge variant="destructive">Required</Badge>
            </CardTitle>
            <CardDescription>
              {authMode === 'signup'
                ? 'Register a face-bound passkey'
                : 'Verify using your face-bound passkey'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {deviceStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Face verification successful!
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center">
              <div className="relative w-64 h-48 mx-auto mb-4 bg-gray-100 rounded-lg overflow-hidden">
                <div className="flex items-center justify-center h-full">
                  <Camera className="w-16 h-16 text-gray-400" />
                </div>
              </div>
            </div>

            <Button
              onClick={handleFaceStep}
              disabled={isLoading || deviceStatus === 'verifying'}
              className="w-full h-11"
            >
              {deviceStatus === 'verifying' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying Face...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  {authMode === 'signup' ? 'Register Face' : 'Verify Face'}
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Your device will prompt for FaceID/Windows Hello. Your biometric data never leaves your device.
            </p>

            <Button
              variant="outline"
              onClick={() => {
                setCurrentStep(1);
                setDeviceStatus('idle');
                setAutoFaceTriggered(false);
              }}
              className="w-full h-11"
            >
              Back
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5" />
              Fingerprint Verification
              <Badge variant="secondary">Optional</Badge>
            </CardTitle>
            <CardDescription>
              {authMode === 'signup'
                ? 'Add an optional fingerprint credential'
                : 'Optionally verify with fingerprint'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleFingerprintStep}
              disabled={isLoading}
              className="w-full h-11"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying Fingerprint...
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4 mr-2" />
                  {authMode === 'signup' ? 'Register Fingerprint (Optional)' : 'Verify Fingerprint (Optional)'}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={finishAuth}
              className="w-full h-11"
            >
              Skip Fingerprint
            </Button>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          {authMode === 'signup'
            ? 'Your device-bound credentials are securely stored. FaceID/TouchID stays on your device.'
            : 'This system uses passkeys and device-bound authentication. Biometrics never leave your device.'
          }
        </AlertDescription>
      </Alert>
    </div>
  );
}
