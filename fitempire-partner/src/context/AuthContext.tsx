import React, { createContext, useContext, useState } from 'react';
import { partnerApi } from '../api';

export type PartnerRole = 'OWNER' | 'FRONT_DESK' | 'TRAINER';

export interface PartnerUser {
  id?: string;
  userId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  gymName?: string;
}

interface AuthContextType {
  user: PartnerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: PartnerRole;
  setActiveRole: (role: PartnerRole) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PartnerUser | null>(() => {
    const saved = localStorage.getItem('fitempire_partner_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeRole, setActiveRoleState] = useState<PartnerRole>(() => {
    const savedRole = localStorage.getItem('fitempire_partner_active_role');
    return (savedRole as PartnerRole) || 'OWNER';
  });

  const setActiveRole = (role: PartnerRole) => {
    setActiveRoleState(role);
    localStorage.setItem('fitempire_partner_active_role', role);
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem('fitempire_partner_token');
    return !!token;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await partnerApi.login(email.trim(), password);
      const data = res.data?.data;
      const token = data?.accessToken;
      if (!token) {
        throw new Error('Authentication failed. No token received from server.');
      }

      const role: string = data?.role || data?.user?.role || '';
      if (!['GYM_PARTNER', 'GYM_OWNER', 'SUPER_ADMIN', 'ADMIN'].includes(role)) {
        throw new Error('Access denied. Only Gym Partners can log into this portal.');
      }

      const userData: PartnerUser = {
        id: data?.userId || data?.user?.id,
        userId: data?.userId || data?.user?.id,
        email: data?.email || email,
        firstName: data?.firstName || data?.user?.firstName || 'Gym Partner',
        lastName: data?.lastName || data?.user?.lastName || '',
        role: role,
        gymName: data?.gymName || data?.user?.gymName || 'FitEmpire Partner Gym',
      };

      localStorage.setItem('fitempire_partner_token', token);
      localStorage.setItem('fitempire_partner_user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('fitempire_partner_token');
    localStorage.removeItem('fitempire_partner_user');
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/welcome';
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, activeRole, setActiveRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
