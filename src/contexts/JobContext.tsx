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
    data.applications = newApplications;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
    saveData(data);
    setApplications(newApplications);
  // Load jobs on mount
  React.useEffect(() => {
    refreshJobs();
  }, []);
  };

    const insertJob = async () => {
      try {
        setError(null);
        
        const { data, error: supabaseError } = await supabase
          .from('jobs')
          .insert({
            title: jobData.title,
            department: jobData.department,
            location: jobData.location,
            type: jobData.type,
            status: jobData.status,
            description: jobData.description,
            requirements: jobData.requirements,
            salary_min: jobData.salary.min,
            salary_max: jobData.salary.max
          })
          .select()
          .single();
      lastUpdated: new Date().toISOString().split('T')[0],
        if (supabaseError) throw supabaseError;
      stage: getStageFromStatus(applicationData.status),
        // Add to local state
        const newJob: Job = {
          id: data.id,
          title: data.title,
          department: data.department,
          location: data.location,
          type: data.type,
          status: data.status,
          description: data.description,
          requirements: data.requirements,
          salary: {
            min: data.salary_min,
            max: data.salary_max
          },
          postedDate: data.posted_date,
          applicationCount: 0
        };
      notes: applicationData.notes || []
        setJobs(prev => [newJob, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create job');
        console.error('Error creating job:', err);
      }
    };
    const newApplications = [newApplication, ...applications];
    saveApplications(newApplications);
  };
    insertJob();
        ? { 
            ...app, 
            ...updates, 
    saveApplications(updatedApplications);
  };

  const updateApplicationStatus = (id: string, status: Application['status']) => {
    updateApplication(id, { status });
  };

  const addApplicationNote = (id: string, note: string) => {
    const updatedApplications = applications.map(app => 
    const updateJobInDb = async () => {
      try {
        setError(null);
        
        const { error: supabaseError } = await supabase
          .from('jobs')
          .update({
            title: jobData.title,
            department: jobData.department,
            location: jobData.location,
            type: jobData.type,
            status: jobData.status,
            description: jobData.description,
            requirements: jobData.requirements,
            salary_min: jobData.salary.min,
            salary_max: jobData.salary.max
          })
          .eq('id', id);
        ? { 
        if (supabaseError) throw supabaseError;
            ...app, 
        // Update local state
        setJobs(prev => prev.map(job => 
          job.id === id 
            ? { ...job, ...jobData }
            : job
        ));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update job');
        console.error('Error updating job:', err);
      }
    };
            notes: [...app.notes, note],
    updateJobInDb();
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        : app
    const deleteJobFromDb = async () => {
      try {
        setError(null);
        
        const { error: supabaseError } = await supabase
          .from('jobs')
          .delete()
          .eq('id', id);

        if (supabaseError) throw supabaseError;
  const deleteApplication = (id: string) => {
        // Update local state
        setJobs(prev => prev.filter(job => job.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete job');
        console.error('Error deleting job:', err);
      }
    };
    setApplications(prev => prev.filter(app => app.id !== id));
    deleteJobFromDb();
  };

  return (
    <ApplicationContext.Provider value={{ 
      applications, 
      addApplication, 
      updateApplication, 
      deleteApplication, 
      updateApplicationStatus,
      addApplicationNote
    <JobContext.Provider value={{ 
      jobs, 
      loading, 
      error, 
      addJob, 
      updateJob, 
      deleteJob, 
      refreshJobs 
    }}>
      {children}
    </ApplicationContext.Provider>
  );
};