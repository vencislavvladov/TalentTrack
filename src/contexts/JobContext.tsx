import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Job } from '../types';
import { mockJobs } from '../data/mockData';

interface JobContextType {
  jobs: Job[];
  addJob: (job: Omit<Job, 'id' | 'postedDate' | 'applicationCount'>) => void;
  updateJob: (id: string, job: Omit<Job, 'id' | 'postedDate' | 'applicationCount'>) => void;
  deleteJob: (id: string) => void;
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
  const [jobs, setJobs] = useState<Job[]>(mockJobs);

  const addJob = (jobData: Omit<Job, 'id' | 'postedDate' | 'applicationCount'>) => {
    const newJob: Job = {
      ...jobData,
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // More unique ID
      postedDate: new Date().toISOString().split('T')[0],
      applicationCount: 0
    };
    
    console.log('Adding new job:', newJob); // Debug log
    setJobs(prev => {
      const updated = [newJob, ...prev];
      console.log('Updated jobs list:', updated); // Debug log
      return updated;
    });
  };

  const updateJob = (id: string, jobData: Omit<Job, 'id' | 'postedDate' | 'applicationCount'>) => {
    setJobs(prev => prev.map(job => 
      job.id === id 
        ? { ...job, ...jobData }
        : job
    ));
  };

  const deleteJob = (id: string) => {
    setJobs(prev => prev.filter(job => job.id !== id));
  };

  return (
    <JobContext.Provider value={{ jobs, addJob, updateJob, deleteJob }}>
      {children}
    </JobContext.Provider>
  );
};