import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface UserContextType {
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
  getUsersByRole: (role: User['role']) => User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};

// Mock users data
const initialUsers: User[] = [
  {
    id: '1',
    email: 'admin@company.com',
    name: 'Admin User',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01',
    lastLogin: '2024-01-25'
  },
  {
    id: '2',
    email: 'recruiter@company.com',
    name: 'Jane Recruiter',
    role: 'recruiter',
    isActive: true,
    createdAt: '2024-01-02',
    lastLogin: '2024-01-24'
  },
  {
    id: '3',
    email: 'candidate@email.com',
    name: 'John Candidate',
    role: 'candidate',
    isActive: true,
    createdAt: '2024-01-03',
    lastLogin: '2024-01-23'
  },
  {
    id: '4',
    email: 'recruiter2@company.com',
    name: 'Mike Recruiter',
    role: 'recruiter',
    isActive: false,
    createdAt: '2024-01-04',
    lastLogin: '2024-01-20'
  },
  {
    id: '5',
    email: 'candidate2@email.com',
    name: 'Sarah Johnson',
    role: 'candidate',
    isActive: true,
    createdAt: '2024-01-05',
    lastLogin: '2024-01-22'
  }
];

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [newUser, ...prev]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updates } : user
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const getUserById = (id: string) => {
    return users.find(user => user.id === id);
  };

  const getUsersByRole = (role: User['role']) => {
    return users.filter(user => user.role === role);
  };

  return (
    <UserContext.Provider value={{
      users,
      addUser,
      updateUser,
      deleteUser,
      getUserById,
      getUsersByRole
    }}>
      {children}
    </UserContext.Provider>
  );
};