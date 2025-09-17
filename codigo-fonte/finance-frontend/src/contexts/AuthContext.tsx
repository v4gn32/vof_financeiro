import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useSupabaseAuth } from '../hooks/useSupabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, signUp, signIn, signOut } = useSupabaseAuth();

  const login = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const register = async (email: string, password: string, name: string) => {
    const { error } = await signUp(email, password, name);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const logout = async () => {
    await signOut();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
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