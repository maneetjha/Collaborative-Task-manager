import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthResponse, LoginCredentials, RegisterCredentials } from '../types';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post<AuthResponse>('/api/users/login', credentials);
      const { token, user } = response.data;

      console.log('Login response:', { token, user }); // Debug log

      // Normalize user object - backend returns 'id' but we need '_id'
      const normalizedUser = {
        _id: (user as any).id || user._id || user.id,
        name: user.name,
        email: user.email,
      } as User;

      console.log('Normalized user:', normalizedUser); // Debug log

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));

      setToken(token);
      setUser(normalizedUser);

      console.log('State updated, isAuthenticated should be:', !!(token && normalizedUser)); // Debug log

      toast.success(`Welcome back, ${normalizedUser.name}!`);
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      await api.post('/api/users/register', credentials);
      toast.success('Registration successful! Please login.');
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

