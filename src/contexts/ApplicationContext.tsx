import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Application } from '../types';
import { mockApplications } from '../data/mockData';

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
  const [applications, setApplications] = useState<Application[]>(mockApplications);

  const addApplication = (applicationData: Omit<Application, 'id' | 'appliedDate' | 'lastUpdated' | 'stage'>) => {
    const newApplication: Application = {
      ...applicationData,
      id: Date.now().toString(),
      appliedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      stage: getStageFromStatus(applicationData.status),
      notes: applicationData.notes || []
    };
    setApplications(prev => [newApplication, ...prev]);
  };

  const updateApplication = (id: string, updates: Partial<Application>) => {
    setApplications(prev => prev.map(app => 
      app.id === id 
        ? { 
            ...app, 
            ...updates, 
            lastUpdated: new Date().toISOString().split('T')[0],
            stage: updates.status ? getStageFromStatus(updates.status) : app.stage
          }
        : app
    ));
  };

  const updateApplicationStatus = (id: string, status: Application['status']) => {
    updateApplication(id, { status });
  };

  const addApplicationNote = (id: string, note: string) => {
    setApplications(prev => prev.map(app => 
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