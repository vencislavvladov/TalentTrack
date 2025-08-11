import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Application } from '../types';
import { loadData, saveData } from '../utils/storage';

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
  const [applications, setApplications] = useState<Application[]>(() => {
    const data = loadData();
    return data.applications;
  });

  // Save to localStorage whenever applications change
  const saveApplications = (newApplications: Application[]) => {
    const data = loadData();
    data.applications = newApplications;
    saveData(data);
    setApplications(newApplications);
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load applications from Supabase
  const refreshApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('applications')
        .select(`
          *,
          jobs!inner(title),
          candidates!inner(name, email)
        `)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      // Transform Supabase data to match our Application interface
      const transformedApplications: Application[] = (data || []).map(app => ({
        id: app.id,
        jobId: app.job_id,
        jobTitle: app.jobs.title,
        candidateId: app.candidate_id,
        candidateName: app.candidates.name,
        candidateEmail: app.candidates.email,
        status: app.status,
        appliedDate: app.applied_date,
        lastUpdated: app.last_updated,
        resumeUrl: app.resume_url,
        coverLetter: app.cover_letter,
        notes: app.notes,
        stage: app.stage
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
            job_id: applicationData.jobId,
            candidate_id: applicationData.candidateId,
            status: applicationData.status,
            stage: getStageFromStatus(applicationData.status),
            resume_url: applicationData.resumeUrl,
            cover_letter: applicationData.coverLetter,
            notes: applicationData.notes || []
          })
          .select(`
            *,
            jobs!inner(title),
            candidates!inner(name, email)
          `)
          .single();

        if (supabaseError) throw supabaseError;

        // Add to local state
        const newApplication: Application = {
          id: data.id,
          jobId: data.job_id,
          jobTitle: data.jobs.title,
          candidateId: data.candidate_id,
          candidateName: data.candidates.name,
          candidateEmail: data.candidates.email,
          status: data.status,
          appliedDate: data.applied_date,
          lastUpdated: data.last_updated,
          resumeUrl: data.resume_url,
          coverLetter: data.cover_letter,
          notes: data.notes,
          stage: data.stage
        };

        setApplications(prev => [newApplication, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create application');
        console.error('Error creating application:', err);
      }
    };
    
    const newApplications = [newApplication, ...applications];
    saveApplications(newApplications);
  };

  const updateApplication = (id: string, updates: Partial<Application>) => {
    const updateApplicationInDb = async () => {
      try {
        setError(null);
        
        const { error: supabaseError } = await supabase
          .from('applications')
          .update({
            status: updates.status,
            stage: updates.status ? getStageFromStatus(updates.status) : undefined,
            resume_url: updates.resumeUrl,
            cover_letter: updates.coverLetter,
            notes: updates.notes,
            last_updated: new Date().toISOString().split('T')[0]
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

    );
    saveApplications(updatedApplications);
  };

  const updateApplicationStatus = (id: string, status: Application['status']) => {
    updateApplication(id, { status });
  };

  const addApplicationNote = (id: string, note: string) => {
    const updatedApplications = applications.map(app => 
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