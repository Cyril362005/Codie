import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../services/api';
import { AuthContext } from './AuthContext';

interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For development, if there's a token but no backend, create a mock user
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && token && !user) {
      const mockUser = {
        id: 1,
        email: 'demo@codie.com',
        username: 'demo_user',
        is_active: true,
        created_at: new Date().toISOString()
      };
      setUser(mockUser);
      setLoading(false);
    }
  }, [token, user]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const { data, error: checkError } = await authAPI.verifyToken(token);
          
          if (data) {
            setUser(data as User);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('token');
            setToken(null);
            if (checkError) {
              setError(checkError);
            }
          }
        } catch {
          console.error('Auth check failed:');
          // For development, if backend is not available, create a mock user
          if (process.env.NODE_ENV === 'development') {
            const mockUser = {
              id: 1,
              email: 'demo@codie.com',
              username: 'demo_user',
              is_active: true,
              created_at: new Date().toISOString()
            };
            setUser(mockUser);
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: loginError } = await authAPI.login({ email, password });

      if (data) {
        const accessToken = (data as { access_token: string }).access_token;
        localStorage.setItem('token', accessToken);
        setToken(accessToken);
        
        // Fetch user data
        const { data: userData } = await authAPI.verifyToken(accessToken);
        
        if (userData) {
          setUser(userData as User);
        }
        
        return true;
      } else {
        setError(loginError || 'Login failed');
        return false;
      }
    } catch {
      // For development, if backend is not available, allow login with any credentials
      if (process.env.NODE_ENV === 'development') {
        const mockToken = 'dev-token-' + Date.now();
        const mockUser = {
          id: 1,
          email: email,
          username: email.split('@')[0],
          is_active: true,
          created_at: new Date().toISOString()
        };
        localStorage.setItem('token', mockToken);
        setToken(mockToken);
        setUser(mockUser);
        return true;
      } else {
        setError('Network error. Please try again.');
        return false;
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: registerError } = await authAPI.register({ email, username, password });

      if (data) {
        // Registration successful, now login
        return await login(email, password);
      } else {
        setError(registerError || 'Registration failed');
        return false;
      }
    } catch {
      // For development, if backend is not available, allow registration with any credentials
      if (process.env.NODE_ENV === 'development') {
        return await login(email, password);
      } else {
        setError('Network error. Please try again.');
        return false;
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
