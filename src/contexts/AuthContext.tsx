import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await authService.getUserById(firebaseUser.uid);
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    const result = await authService.signup(name, email, password);
    if (result.success && result.user) {
      setUser(result.user);
      return true;
    }
    return false;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await authService.login(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      return true;
    }
    return false;
  };

  const logout = async () => {
    const result = await authService.logout();
    if (result.success) {
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    const result = await authService.updateUserProfile(user.id, data);
    if (result.success) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
