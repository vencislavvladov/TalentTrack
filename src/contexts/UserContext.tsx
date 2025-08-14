import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface UserContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUsersByRole: (role: User['role']) => User[];
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load users from Supabase
  const refreshUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      // Transform Supabase data to match our User interface
      const transformedUsers: User[] = (data || []).map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at.split('T')[0],
        lastLogin: user.last_login?.split('T')[0],
        avatar: user.avatar
      }));

      setUsers(transformedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load users on mount
  React.useEffect(() => {
    refreshUsers();
  }, []);

  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => {
    const insertUser = async () => {
      try {
        setError(null);
        
        const { data, error: supabaseError } = await supabase
          .from('users')
          .insert({
            email: userData.email,
            name: userData.name,
            role: userData.role,
            is_active: userData.isActive,
            avatar: userData.avatar
          })
          .select()
          .single();

        if (supabaseError) throw supabaseError;

        // Add to local state
        const newUser: User = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          isActive: data.is_active,
          createdAt: data.created_at.split('T')[0],
          lastLogin: data.last_login?.split('T')[0],
          avatar: data.avatar
        };

        setUsers(prev => [newUser, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create user');
        console.error('Error creating user:', err);
      }
    };
    
    insertUser();
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    const updateUserInDb = async () => {
      try {
        setError(null);
        
        const { error: supabaseError } = await supabase
          .from('users')
          .update({
            email: updates.email,
            name: updates.name,
            role: updates.role,
            is_active: updates.isActive,
            avatar: updates.avatar
          })
          .eq('id', id);

        if (supabaseError) throw supabaseError;

        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === id ? { ...user, ...updates } : user
        ));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update user');
        console.error('Error updating user:', err);
      }
    };

    updateUserInDb();
  };

  const deleteUser = (id: string) => {
    const deleteUserFromDb = async () => {
      try {
        setError(null);
        
        const { error: supabaseError } = await supabase
          .from('users')
          .delete()
          .eq('id', id);

        if (supabaseError) throw supabaseError;

        // Update local state
        setUsers(prev => prev.filter(user => user.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete user');
        console.error('Error deleting user:', err);
      }
    };

    deleteUserFromDb();
  };

  const getUsersByRole = (role: User['role']) => {
    return users.filter(user => user.role === role);
  };

  return (
    <UserContext.Provider value={{
      users,
      loading,
      error,
      addUser,
      updateUser,
      deleteUser,
      getUsersByRole,
      refreshUsers
    }}>
      {children}
    </UserContext.Provider>
  );
};