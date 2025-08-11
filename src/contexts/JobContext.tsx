import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Job } from '../types';
import { loadData, saveData } from '../utils/storage';

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
  const [jobs, setJobs] = useState<Job[]>(() => {
    const data = loadData();
    return data.jobs;
  });

  // Save to localStorage whenever jobs change
  const saveJobs = (newJobs: Job[]) => {
    const data = loadData();
    data.jobs = newJobs;
    saveData(data);
    setJobs(newJobs);
  };

  const addJob = (jobData: Omit<Job, 'id' | 'postedDate' | 'applicationCount'>) => {
    const newJob: Job = {
      ...jobData,
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // More unique ID
      postedDate: new Date().toISOString().split('T')[0],
      applicationCount: 0
    };
    
    console.log('Adding new job:', newJob); // Debug log
    const newJobs = [newJob, ...jobs];
    saveJobs(newJobs);
    console.log('Updated jobs list:', newJobs); // Debug log
  };

  const updateJob = (id: string, jobData: Omit<Job, 'id' | 'postedDate' | 'applicationCount'>) => {
    const updatedJobs = jobs.map(job => 
      job.id === id 
        ? { ...job, ...jobData }
        : job
    );
    saveJobs(updatedJobs);
  };

  const deleteJob = (id: string) => {
    const filteredJobs = jobs.filter(job => job.id !== id);
    saveJobs(filteredJobs);
  };

  return (
    <JobContext.Provider value={{ jobs, addJob, updateJob, deleteJob }}>
      {children}
    </JobContext.Provider>
  );
};