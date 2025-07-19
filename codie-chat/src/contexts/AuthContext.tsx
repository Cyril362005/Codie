import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

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
          const response = await fetch('http://localhost:8003/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (err) {
          console.error('Auth check failed:', err);
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
      const response = await fetch('http://localhost:8003/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        
        // Fetch user data
        const userResponse = await fetch('http://localhost:8003/me', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }
        
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Login failed');
        return false;
      }
    } catch (err) {
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
      const response = await fetch('http://localhost:8003/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      if (response.ok) {
        // Registration successful, now login
        return await login(email, password);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Registration failed');
        return false;
      }
    } catch (err) {
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