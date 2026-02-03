import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '@/services/api';

interface Customer {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    customer: Customer;
    token: string;
    userType: string;
  };
}

interface AuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('customerToken');
    const customerData = localStorage.getItem('customerData');
    
    if (token && customerData) {
      try {
        setCustomer(JSON.parse(customerData));
      } catch (error) {
        console.error('Error parsing customer data:', error);
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerData');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response: AuthResponse = await authAPI.login({ email, password });
      
      if (response.success) {
        const { customer: customerData, token } = response.data;
        
        localStorage.setItem('customerToken', token);
        localStorage.setItem('customerData', JSON.stringify(customerData));
        setCustomer(customerData);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    try {
      const response: AuthResponse = await authAPI.register({ name, email, password });
      
      if (response.success) {
        const { customer: customerData, token } = response.data;
        
        localStorage.setItem('customerToken', token);
        localStorage.setItem('customerData', JSON.stringify(customerData));
        setCustomer(customerData);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
    setCustomer(null);
    
    // Call logout API (optional, since we're using stateless JWT)
    authAPI.logout().catch(console.error);
  };

  const value: AuthContextType = {
    customer,
    isAuthenticated: !!customer,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};