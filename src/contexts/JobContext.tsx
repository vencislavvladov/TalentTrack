import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  status: 'active' | 'paused' | 'closed';
  description: string;
  requirements: string[];
  salaryMin: number;
  salaryMax: number;
  postedDate: string;
  createdAt?: string;
  updatedAt?: string;
}

interface JobContextType {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  addJob: (job: Omit<Job, 'id' | 'postedDate' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  refreshJobs: () => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};

interface JobProviderProps {
  children: ReactNode;
}

export const JobProvider: React.FC<JobProviderProps> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      const transformedJobs: Job[] = (data || []).map(job => ({
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
        status: job.status,
        description: job.description,
        requirements: job.requirements,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        postedDate: job.posted_date,
        createdAt: job.created_at,
        updatedAt: job.updated_at
      }));

      setJobs(transformedJobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshJobs();
  }, []);

  const addJob = async (jobData: Omit<Job, 'id' | 'postedDate' | 'createdAt' | 'updatedAt'>) => {
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
          salary_min: jobData.salaryMin,
          salary_max: jobData.salaryMax
        })
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      const newJob: Job = {
        id: data.id,
        title: data.title,
        department: data.department,
        location: data.location,
        type: data.type,
        status: data.status,
        description: data.description,
        requirements: data.requirements,
        salaryMin: data.salary_min,
        salaryMax: data.salary_max,
        postedDate: data.posted_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setJobs(prev => [newJob, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
      console.error('Error creating job:', err);
      throw err;
    }
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    try {
      setError(null);
      
      const { error: supabaseError } = await supabase
        .from('jobs')
        .update({
          title: updates.title,
          department: updates.department,
          location: updates.location,
          type: updates.type,
          status: updates.status,
          description: updates.description,
          requirements: updates.requirements,
          salary_min: updates.salaryMin,
          salary_max: updates.salaryMax
        })
        .eq('id', id);

      if (supabaseError) throw supabaseError;

      setJobs(prev => prev.map(job => 
        job.id === id ? { ...job, ...updates } : job
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update job');
      console.error('Error updating job:', err);
      throw err;
    }
  };

  const deleteJob = async (id: string) => {
    try {
      setError(null);
      
      const { error: supabaseError } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;

      setJobs(prev => prev.filter(job => job.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
      console.error('Error deleting job:', err);
      throw err;
    }
  };

  return (
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
    </JobContext.Provider>
  );
};