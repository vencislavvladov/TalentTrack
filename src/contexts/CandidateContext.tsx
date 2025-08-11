import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Application } from '../types';
import { supabase } from '../lib/supabase';

interface ApplicationContextType {
  applications: Application[];
  loading: boolean;
  error: string | null;
  addApplication: (application: Omit<Application, 'id' | 'appliedDate' | 'lastUpdated' | 'stage'>) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  updateApplicationStatus: (id: string, status: Application['status']) => void;
  addApplicationNote: (id: string, note: string) => void;
  refreshApplications: () => Promise<void>;
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
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load applications from Supabase
  const refreshApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      // Transform Supabase data to match our Application interface
      const transformedApplications: Application[] = (data || []).map(application => ({
        id: application.id,
        company: application.company,
        position: application.position,
        status: application.status,
        appliedDate: application.applied_date,
        lastUpdated: application.last_updated,
        stage: getStageFromStatus(application.status),
        notes: application.notes || []
      }));

      setApplications(transformedApplications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load applications on mount
  React.useEffect(() => {
    refreshApplications();
  }, []);

  const addApplication = (applicationData: Omit<Application, 'id' | 'appliedDate' | 'lastUpdated' | 'stage'>) => {
    const insertApplication = async () => {
      try {
        setError(null);
        
        const { data, error: supabaseError } = await supabase
          .from('applications')
          .insert({
            company: applicationData.company,
            position: applicationData.position,
            status: applicationData.status,
            applied_date: new Date().toISOString().split('T')[0],
            last_updated: new Date().toISOString().split('T')[0],
            notes: applicationData.notes || []
          })
          .select()
          .single();

        if (supabaseError) throw supabaseError;

        // Add to local state
        const newApplication: Application = {
          id: data.id,
          company: data.company,
          position: data.position,
          status: data.status,
          appliedDate: data.applied_date,
          lastUpdated: data.last_updated,
          stage: getStageFromStatus(data.status),
          notes: data.notes || []
        };

        setApplications(prev => [newApplication, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create application');
        console.error('Error creating application:', err);
      }
    };
    
    insertApplication();
  };

  const updateApplication = (id: string, updates: Partial<Application>) => {
    const updateApplicationInDb = async () => {
      try {
        setError(null);
        
        const { error: supabaseError } = await supabase
          .from('applications')
          .update({
            company: updates.company,
            position: updates.position,
            status: updates.status,
            last_updated: new Date().toISOString().split('T')[0],
            notes: updates.notes
          })
          .eq('id', id);

        if (supabaseError) throw supabaseError;

        // Update local state
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update application');
        console.error('Error updating application:', err);
      }
    };

    updateApplicationInDb();
  };

  const updateApplicationStatus = (id: string, status: Application['status']) => {
    updateApplication(id, { status });
  };

  const addApplicationNote = (id: string, note: string) => {
    const addNoteToDb = async () => {
      try {
        setError(null);
        
        const application = applications.find(app => app.id === id);
        if (!application) return;

        const updatedNotes = [...application.notes, note];
        
        const { error: supabaseError } = await supabase
          .from('applications')
          .update({
            notes: updatedNotes,
            last_updated: new Date().toISOString().split('T')[0]
          })
          .eq('id', id);

        if (supabaseError) throw supabaseError;

        // Update local state
        setApplications(prev => prev.map(app => 
          app.id === id 
            ? { 
                ...app, 
                notes: updatedNotes,
                lastUpdated: new Date().toISOString().split('T')[0]
              }
            : app
        ));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add note');
        console.error('Error adding note:', err);
      }
    };

    addNoteToDb();
  };

  const deleteApplication = (id: string) => {
    const deleteApplicationFromDb = async () => {
      try {
        setError(null);
        
        const { error: supabaseError } = await supabase
          .from('applications')
          .delete()
          .eq('id', id);

        if (supabaseError) throw supabaseError;

        // Update local state
        setApplications(prev => prev.filter(app => app.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete application');
        console.error('Error deleting application:', err);
      }
    };

    deleteApplicationFromDb();
  };

  return (
    <ApplicationContext.Provider value={{
      applications,
      loading,
      error,
      addApplication, 
      updateApplication, 
      deleteApplication, 
      updateApplicationStatus,
      addApplicationNote,
      refreshApplications
    }}>
      {children}
    </ApplicationContext.Provider>
  );
};