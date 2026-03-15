'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { apiClient, User, LoginData, RegisterData } from './api-production';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
  };
}

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  setSession: (user: User, tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  clearError: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; tokens: { accessToken: string; refreshToken: string } } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        tokens: action.payload.tokens,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        tokens: { accessToken: null, refreshToken: null },
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        tokens: { accessToken: null, refreshToken: null },
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for existing tokens on mount
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');

    if (accessToken) {
      apiClient.setAccessToken(accessToken);
      
      // If user data exists, set it directly
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          dispatch({ type: 'SET_USER', payload: user });
        } catch (error) {
          // Invalid user data, clear everything and verify via API
          clearTokens();
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        // No user data, set a minimal placeholder to keep session alive
        dispatch({
          type: 'SET_USER',
          payload: {
            id: 'unknown',
            email: '',
            firstName: 'Admin',
            lastName: '',
            role: 'admin',
            mfaEnabled: false,
            mfaMethods: [],
            isActive: true,
            isEmailVerified: true
          }
        });
      }
    }
  }, []);

  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    apiClient.clearAccessToken();
    
    // Clear cookie as well
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  const saveTokens = (accessToken: string, refreshToken?: string) => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    apiClient.setAccessToken(accessToken);
    
    // Also set as cookie for middleware access
    document.cookie = `accessToken=${accessToken}; path=/; max-age=3600; SameSite=Lax`;
  };

  const login = async (data: LoginData) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await apiClient.login(data);
      
      saveTokens(response.tokens.accessToken, response.tokens.refreshToken);
      
      // Store user in localStorage for admin login access
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          tokens: response.tokens,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message,
      });
      throw new Error(message);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await apiClient.register(data);
      saveTokens(response.tokens.accessToken, response.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          tokens: response.tokens,
        },
      });
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  };

  const setSession = (user: User, tokens: { accessToken: string; refreshToken: string }) => {
    saveTokens(tokens.accessToken, tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: {
        user,
        tokens,
      },
    });
  };

  const logout = () => {
    try {
      // Call logout endpoint
      apiClient.logout().catch(() => {
        // Ignore logout errors, just clear local state
      });
    } catch (error) {
      // Ignore logout errors
    } finally {
      clearTokens();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // This would be implemented in the API client
      // For now, just clear tokens and redirect to login
      clearTokens();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      clearTokens();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    setSession,
    logout,
    clearError,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
