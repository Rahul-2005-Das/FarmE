import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, FarmerProfile, BuyerProfile, User } from '../types';
import { DEMO_FARMER, DEMO_BUYERS } from '../data/mockData';

interface AuthContextType {
  currentUser: User | FarmerProfile | BuyerProfile | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  loginWithDemoOtp: (mobile: string, otp: string, role: UserRole) => { success: boolean; error?: string };
  registerFarmer: (data: Partial<FarmerProfile>) => FarmerProfile;
  registerBuyer: (data: Partial<BuyerProfile>) => BuyerProfile;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  setQuickDemoFarmer: () => void;
  setQuickDemoBuyer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'krishok_bandhu_user';
const ROLE_STORAGE_KEY = 'krishok_bandhu_role';

const getSelectedLanguage = () => {
  const language = localStorage.getItem('krishok_bandhu_lang') || localStorage.getItem('language');
  return language === 'bn' || language === 'hi' ? language : 'en';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem(ROLE_STORAGE_KEY);
    return (savedRole as UserRole) || null;
  });

  const [currentUser, setCurrentUser] = useState<User | FarmerProfile | BuyerProfile | null>(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (currentRole) {
      localStorage.setItem(ROLE_STORAGE_KEY, currentRole);
    } else {
      localStorage.removeItem(ROLE_STORAGE_KEY);
    }
  }, [currentRole]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [currentUser]);

  const loginWithDemoOtp = (mobile: string, otp: string, role: UserRole) => {
    if (otp !== '123456') {
      return { success: false, error: 'auth.invalidOtpError' };
    }

    if (role === 'farmer') {
      const farmer: FarmerProfile = {
        ...DEMO_FARMER,
        mobile: mobile || DEMO_FARMER.mobile,
      };
      setCurrentUser(farmer);
      setCurrentRole('farmer');
      return { success: true };
    } else if (role === 'buyer') {
      const buyer: BuyerProfile = {
        ...DEMO_BUYERS[0],
        mobile: mobile || DEMO_BUYERS[0].mobile,
      };
      setCurrentUser(buyer);
      setCurrentRole('buyer');
      return { success: true };
    } else if (role === 'fleet') {
      setCurrentUser({
        id: 'fleet-001',
        name: 'Demo Fleet Driver',
        mobile: mobile || '9810000000',
        role: 'fleet',
        language: getSelectedLanguage(),
        createdAt: new Date().toISOString(),
      });
      setCurrentRole('fleet');
      return { success: true };
    } else if (role === 'admin') {
      const admin: User = {
        id: 'adm-001',
        name: 'Demo System Admin',
        mobile: '9800000000',
        role: 'admin',
        language: getSelectedLanguage(),
        createdAt: new Date().toISOString()
      };
      setCurrentUser(admin);
      setCurrentRole('admin');
      return { success: true };
    }

    return { success: false, error: 'Please select a role' };
  };

  const registerFarmer = (data: Partial<FarmerProfile>): FarmerProfile => {
    const newFarmer: FarmerProfile = {
      id: `f-${Date.now().toString().slice(-4)}`,
      name: data.name || 'Ramesh Mondal',
      mobile: data.mobile || '9830123456',
      role: 'farmer',
      language: getSelectedLanguage(),
      district: data.district || 'South 24 Parganas',
      village: data.village || 'Champahati',
      farmSizeAcres: data.farmSizeAcres || 2.5,
      primaryCrops: data.primaryCrops || ['Tomato', 'Potato'],
      kisanCreditCard: true,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCurrentUser(newFarmer);
    setCurrentRole('farmer');
    return newFarmer;
  };

  const registerBuyer = (data: Partial<BuyerProfile>): BuyerProfile => {
    const newBuyer: BuyerProfile = {
      id: `b-${Date.now().toString().slice(-4)}`,
      name: data.name || 'Verified Buyer',
      businessName: data.businessName || 'Kolkata Fresh Mart',
      buyerType: data.buyerType || 'Wholesaler',
      mobile: data.mobile || '9831987654',
      role: 'buyer',
      language: getSelectedLanguage(),
      district: data.district || 'Kolkata',
      address: data.address || 'Posta Wholesale Mandi, Kolkata',
      deliveryPreference: data.deliveryPreference || 'Central Hub Delivery',
      tradeLicenseNumber: 'WB/DEMO/2026/8812',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCurrentUser(newBuyer);
    setCurrentRole('buyer');
    return newBuyer;
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'farmer') {
      setCurrentUser(DEMO_FARMER);
    } else if (role === 'buyer') {
      setCurrentUser(DEMO_BUYERS[0]);
    } else if (role === 'fleet') {
      setCurrentUser({
        id: 'fleet-001',
        name: 'Demo Fleet Driver',
        mobile: '9810000000',
        role: 'fleet',
        language: getSelectedLanguage(),
        createdAt: '2026-01-01',
      });
    } else if (role === 'admin') {
      setCurrentUser({
        id: 'adm-001',
        name: 'Demo System Admin',
        mobile: '9800000000',
        role: 'admin',
        language: 'en',
        createdAt: '2026-01-01'
      });
    } else {
      setCurrentUser(null);
    }
  };

  const setQuickDemoFarmer = () => {
    setCurrentUser(DEMO_FARMER);
    setCurrentRole('farmer');
  };

  const setQuickDemoBuyer = () => {
    setCurrentUser(DEMO_BUYERS[0]);
    setCurrentRole('buyer');
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated: !!currentRole,
        loginWithDemoOtp,
        registerFarmer,
        registerBuyer,
        switchRole,
        logout,
        setQuickDemoFarmer,
        setQuickDemoBuyer
      }}
    >
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
