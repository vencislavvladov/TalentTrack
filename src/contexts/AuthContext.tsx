import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Application } from '../types';
import { loadData, saveData } from '../utils/storage';

interface ApplicationContextType {
  applications: Application[];
  addApplication: (application: Omit<Application, 'id' | 'appliedDate' | 'lastUpdated' | 'stage'>) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  updateApplicationStatus: (id: string, status: Application['status']) => void;
  addApplicationNote: (id: string, note: string) => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
};

interface ApplicationProviderProps {
  children: ReactNode;
}

const getStageFromStatus = (status: Application['status']): number => {
  switch (status) {
    case 'applied': return 1;
    case 'screening': return 2;
    case 'interview': return 3;
    case 'offer': return 4;
    case 'hired': return 5;
    case 'rejected': return 0;
    default: return 1;
  }
};

export const ApplicationProvider: React.FC<ApplicationProviderProps> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>(() => {
    const data = loadData();
    return data.applications;
  });

  // Save to localStorage whenever applications change
  const saveApplications = (newApplications: Application[]) => {
    const data = loadData();
      const { data, error } = await supabase.auth.signUp({
                
        password,
        options: {
          data: {
            name,
            role: 'candidate'
          }
        }
      });
    };

    checkAuth();
  const addApplication = (applicationData: Omit<Application, 'id' | 'appliedDate' | 'lastUpdated' | 'stage'>) => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Get user profile
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
    const newApplication: Application = {
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
    supabase.auth.signOut();
    const newApplications = [newApplication, ...applications];
    saveApplications(newApplications);
  };

  const updateApplication = (id: string, updates: Partial<Application>) => {
    const updatedApplications = applications.map(app => 
      app.id === id 
        ? { 
            ...app, 
            ...updates, 
            lastUpdated: new Date().toISOString().split('T')[0],
            stage: updates.status ? getStageFromStatus(updates.status) : app.stage
          }
        : app
    );
    saveApplications(updatedApplications);
  };

  const updateApplicationStatus = (id: string, status: Application['status']) => {
    updateApplication(id, { status });
  };

  const addApplicationNote = (id: string, note: string) => {
    const updatedApplications = applications.map(app => 
      app.id === id 
        ? { 
            ...app, 
            notes: [...app.notes, note],
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        : app
    ));
  };

  const deleteApplication = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
  };

  return (
    <ApplicationContext.Provider value={{ 
      applications, 
      addApplication, 
      updateApplication, 
      deleteApplication, 
      updateApplicationStatus,
      addApplicationNote
    }}>
      {children}
    </ApplicationContext.Provider>
  );
};