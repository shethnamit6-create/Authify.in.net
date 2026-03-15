// Authify API Client
import { API_BASE_URL } from './api-base';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'analyzer';
  mfaEnabled: boolean;
  mfaMethods: string[];
  isActive: boolean;
  isEmailVerified: boolean;
}

export interface LoginResponse {
  message: string;
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  requiresMFA: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
  clientApplication?: string;
}

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  clearAccessToken() {
    this.accessToken = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      if (contentType.includes('application/json')) {
        const error = await response.json().catch(() => ({
          error: 'Network error',
          message: 'Failed to connect to server'
        }));
        throw new Error(error.message || 'Request failed');
      }
      const text = await response.text().catch(() => '');
      throw new Error(text || 'Request failed');
    }

    if (!contentType.includes('application/json')) {
      throw new Error('Invalid server response (expected JSON)');
    }

    return response.json();
  }

  // Authentication endpoints
  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await this.request<{ success: boolean; data: { token: string; companyId: string } }>(
      '/v1/company/register',
      {
        method: 'POST',
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`.trim(),
          email: data.email,
          password: data.password,
          plan: 'free'
        })
      }
    );

    const user: User = {
      id: response.data.companyId,
      email: data.email,
      firstName: data.firstName || 'Admin',
      lastName: data.lastName || '',
      role: 'admin',
      mfaEnabled: false,
      mfaMethods: [],
      isActive: true,
      isEmailVerified: true
    };

    const tokens = { accessToken: response.data.token, refreshToken: '' };
    this.setAccessToken(tokens.accessToken);

    return {
      message: 'Registered',
      user,
      tokens,
      requiresMFA: false
    };
  }

  async login(data: LoginData): Promise<LoginResponse> {
    const response = await this.request<{ success: boolean; data: { token: string; companyId: string } }>('/v1/company/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const user: User = {
      id: response.data.companyId,
      email: data.email,
      firstName: 'Admin',
      lastName: '',
      role: 'admin',
      mfaEnabled: false,
      mfaMethods: [],
      isActive: true,
      isEmailVerified: true
    };

    const tokens = { accessToken: response.data.token, refreshToken: '' };
    this.setAccessToken(tokens.accessToken);

    return {
      message: 'Logged in',
      user,
      tokens,
      requiresMFA: false
    };
  }

  async logout(): Promise<{ message: string }> {
    this.clearAccessToken();
    return { message: 'Logged out' };
  }

  async getProfile(): Promise<User> {
    throw new Error('Profile endpoint not available in Authify backend');
  }

  async updateProfile(data: Partial<User>): Promise<{ message: string; user: User }> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.request('/users/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async updateMFASettings(enabled: boolean, methods?: string[]): Promise<{ message: string; mfaEnabled: boolean; mfaMethods: string[] }> {
    return this.request('/users/mfa', {
      method: 'PUT',
      body: JSON.stringify({ enabled, methods }),
    });
  }

  // Biometric endpoints
  async getBiometrics(): Promise<{ biometrics: any[] }> {
    return this.request('/biometrics/');
  }

  async enrollBiometric(data: FormData): Promise<{ message: string; biometric: any }> {
    const url = `${this.baseURL}/biometrics/enroll`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {},
      body: data,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Network error',
        message: 'Failed to enroll biometric'
      }));
      throw new Error(error.message || 'Biometric enrollment failed');
    }

    return response.json();
  }

  async verifyBiometric(data: FormData): Promise<{ message: string; verification: any }> {
    const url = `${this.baseURL}/biometrics/verify`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {},
      body: data,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Network error',
        message: 'Failed to verify biometric'
      }));
      throw new Error(error.message || 'Biometric verification failed');
    }

    return response.json();
  }

  // Portal integration endpoints
  async createPortalSession(clientId: string, redirectUri: string, state?: string): Promise<{ message: string; portalSession: any }> {
    return this.request('/portal/session', {
      method: 'POST',
      body: JSON.stringify({ clientId, redirectUri, state }),
    });
  }

  async exchangeAuthorizationCode(code: string, sessionId: string, portalToken: string): Promise<{ message: string; tokens: any; user: any }> {
    return this.request('/portal/callback', {
      method: 'POST',
      body: JSON.stringify({ sessionId, portalToken, authorizationCode: code }),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request('/health', {
      method: 'GET',
    });
  }

  // Test endpoint
  async testApi(): Promise<{ message: string; routes: string[] }> {
    return this.request('/test', {
      method: 'GET',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
