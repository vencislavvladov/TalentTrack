import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Candidate } from '../types';
import { mockCandidates } from '../data/mockData';

interface CandidateContextType {
  candidates: Candidate[];
  addCandidate: (candidate: Omit<Candidate, 'id' | 'joinDate' | 'lastActive'>) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  deleteCandidate: (id: string) => void;
  getCandidateById: (id: string) => Candidate | undefined;
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined);

export const useCandidates = () => {
  const context = useContext(CandidateContext);
  if (!context) {
    throw new Error('useCandidates must be used within a CandidateProvider');
  }
  return context;
};

interface CandidateProviderProps {
  children: ReactNode;
}

export const CandidateProvider: React.FC<CandidateProviderProps> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);

  const addCandidate = (candidateData: Omit<Candidate, 'id' | 'joinDate' | 'lastActive'>) => {
    const newCandidate: Candidate = {
      ...candidateData,
      id: Date.now().toString(),
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0]
    };
    setCandidates(prev => [newCandidate, ...prev]);
  };

  const updateCandidate = (id: string, updates: Partial<Candidate>) => {
    setCandidates(prev => prev.map(candidate => 
      candidate.id === id 
        ? { 
            ...candidate, 
            ...updates, 
            lastActive: new Date().toISOString().split('T')[0]
          }
        : candidate
    ));
  };

  const deleteCandidate = (id: string) => {
    setCandidates(prev => prev.filter(candidate => candidate.id !== id));
  };

  const getCandidateById = (id: string) => {
    return candidates.find(candidate => candidate.id === id);
  };

  return (
    <CandidateContext.Provider value={{ 
      candidates, 
      addCandidate, 
      updateCandidate, 
      deleteCandidate,
      getCandidateById
    }}>
      {children}
    </CandidateContext.Provider>
  );
};