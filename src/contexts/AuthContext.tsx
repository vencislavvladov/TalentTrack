import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Check authentication status on mount
  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Get user profile
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userProfile) {
          const user: User = {
            id: userProfile.id,
            email: userProfile.email,
            name: userProfile.name,
            role: userProfile.role,
            isActive: userProfile.is_active,
            createdAt: userProfile.created_at.split('T')[0],
            lastLogin: userProfile.last_login?.split('T')[0],
            avatar: userProfile.avatar
          };
          
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Get user profile
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userProfile) {
          const user: User = {
            id: userProfile.id,
            email: userProfile.email,
            name: userProfile.name,
            role: userProfile.role,
            isActive: userProfile.is_active,
            createdAt: userProfile.created_at.split('T')[0],
            lastLogin: userProfile.last_login?.split('T')[0],
            avatar: userProfile.avatar
          };
          
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'candidate'
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = () => {
    supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};