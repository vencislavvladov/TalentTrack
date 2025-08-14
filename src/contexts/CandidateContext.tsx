import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Candidate } from '../types';
import { supabase } from '../lib/supabase';

interface CandidateContextType {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  addCandidate: (candidate: Omit<Candidate, 'id' | 'joinDate' | 'lastActive' | 'applications'>) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  deleteCandidate: (id: string) => void;
  getCandidateById: (id: string) => Candidate | undefined;
  refreshCandidates: () => Promise<void>;
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
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load candidates from Supabase
  const refreshCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      // Transform Supabase data to match our Candidate interface
      const transformedCandidates: Candidate[] = (data || []).map(candidate => ({
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        location: candidate.location,
        experience: candidate.experience,
        skills: candidate.skills,
        resumeUrl: candidate.resume_url,
        linkedinUrl: candidate.linkedin_url,
        githubUrl: candidate.github_url,
        joinDate: candidate.join_date,
        lastActive: candidate.last_active,
        applications: [] // Will be populated separately
      }));

      setCandidates(transformedCandidates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
      console.error('Error loading candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load candidates on mount
  React.useEffect(() => {
    refreshCandidates();
  }, []);

  const addCandidate = (candidateData: Omit<Candidate, 'id' | 'joinDate' | 'lastActive' | 'applications'>) => {
    const insertCandidate = async () => {
      try {
        setError(null);
        
        const { data, error: supabaseError } = await supabase
          .from('candidates')
          .insert({
            name: candidateData.name,
            email: candidateData.email,
            phone: candidateData.phone,
            location: candidateData.location,
            experience: candidateData.experience,
            skills: candidateData.skills,
            resume_url: candidateData.resumeUrl,
            linkedin_url: candidateData.linkedinUrl,
            github_url: candidateData.githubUrl
          })
          .select()
          .single();

        if (supabaseError) throw supabaseError;

        // Add to local state
        const newCandidate: Candidate = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          location: data.location,
          experience: data.experience,
          skills: data.skills,
          resumeUrl: data.resume_url,
          linkedinUrl: data.linkedin_url,
          githubUrl: data.github_url,
          joinDate: data.join_date,
          lastActive: data.last_active,
          applications: []
        };

        setCandidates(prev => [newCandidate, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create candidate');
        console.error('Error creating candidate:', err);
      }
    };
    
    insertCandidate();
  };

  const updateCandidate = (id: string, updates: Partial<Candidate>) => {
    const updateCandidateInDb = async () => {
      try {
        setError(null);
        
        const { error: supabaseError } = await supabase
          .from('candidates')
          .update({
            name: updates.name,
            email: updates.email,
            phone: updates.phone,
            location: updates.location,
            experience: updates.experience,
            skills: updates.skills,
            resume_url: updates.resumeUrl,
            linkedin_url: updates.linkedinUrl,
            github_url: updates.githubUrl,
            last_active: new Date().toISOString().split('T')[0]
          })
          .eq('id', id);

        if (supabaseError) throw supabaseError;

        // Update local state
        setCandidates(prev => prev.map(candidate => 
          candidate.id === id ? { ...candidate, ...updates } : candidate
        ));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update candidate');
        console.error('Error updating candidate:', err);
      }
    };

    updateCandidateInDb();
  };

  const deleteCandidate = (id: string) => {
    const deleteCandidateFromDb = async () => {
      try {
        setError(null);
        
        const { error: supabaseError } = await supabase
          .from('candidates')
          .delete()
          .eq('id', id);

        if (supabaseError) throw supabaseError;

        // Update local state
        setCandidates(prev => prev.filter(candidate => candidate.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete candidate');
        console.error('Error deleting candidate:', err);
      }
    };

    deleteCandidateFromDb();
  };

  const getCandidateById = (id: string) => {
    return candidates.find(candidate => candidate.id === id);
  };

  return (
    <CandidateContext.Provider value={{
      candidates,
      loading,
      error,
      addCandidate,
      updateCandidate,
      deleteCandidate,
      getCandidateById,
      refreshCandidates
    }}>
      {children}
    </CandidateContext.Provider>
  );
};