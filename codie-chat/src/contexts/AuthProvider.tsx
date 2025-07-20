import React, { useState, useEffect, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { authAPI } from '../services/api'
import { AuthContext, type AuthContextType } from './AuthContext'
import type { User } from '../types'

interface AuthProviderProps {
  children: ReactNode
}

// Constants for token storage
const TOKEN_KEY = 'codie_auth_token'
const TOKEN_EXPIRY_KEY = 'codie_token_expiry'

/**
 * Authentication provider component that manages user authentication state
 */

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize token from storage with expiry check
  const getStoredToken = useCallback((): string | null => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
      
      if (storedToken && expiry) {
        const expiryTime = parseInt(expiry, 10)
        if (Date.now() < expiryTime) {
          return storedToken
        }
        // Token expired, clean up
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(TOKEN_EXPIRY_KEY)
      }
    } catch (error) {
      // Handle storage errors (e.g., when localStorage is disabled)
      console.error('Failed to access localStorage:', error)
    }
    return null
  }, [])

  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(getStoredToken())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create mock user for development
  const createMockUser = useCallback((email?: string): User => ({
    id: '1',
    email: email || 'demo@codie.com',
    name: email ? email.split('@')[0] : 'Demo User',
    role: 'developer',
    created_at: new Date().toISOString()
  }), [])

  // Store token with expiry
  const storeToken = useCallback((newToken: string, expiryHours = 24) => {
    try {
      const expiryTime = Date.now() + (expiryHours * 60 * 60 * 1000)
      localStorage.setItem(TOKEN_KEY, newToken)
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())
      setToken(newToken)
    } catch (error) {
      console.error('Failed to store token:', error)
    }
  }, [])

  const clearToken = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(TOKEN_EXPIRY_KEY)
    } catch (error) {
      console.error('Failed to clear token:', error)
    }
    setToken(null)
  }, [])

  // Check if user is authenticated on app load
  useEffect(() => {
    let isMounted = true
    
    const checkAuth = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const { data, error: checkError } = await authAPI.verifyToken(token)
        
        if (!isMounted) return
        
        if (data) {
          setUser(data as User)
        } else {
          clearToken()
          if (checkError) {
            setError(checkError)
          }
        }
      } catch (error) {
        if (!isMounted) return
        
        // For development, if backend is not available, create a mock user
        if (import.meta.env.DEV) {
          setUser(createMockUser())
        } else {
          clearToken()
          setError('Authentication failed. Please login again.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    checkAuth()
    
    return () => {
      isMounted = false
    }
  }, [token, clearToken, createMockUser]);

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
