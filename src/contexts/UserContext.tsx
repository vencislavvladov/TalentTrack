import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from './AuthContext';

interface UserContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  getUsersByRole: (role: User['role']) => User[];
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: userData, error: supabaseError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      const transformedUsers: User[] = (userData || []).map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at?.split('T')[0],
        lastLogin: user.last_login?.split('T')[0],
        avatar: user.avatar
      }));

      setUsers(transformedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const getUsersByRole = (role: User['role']): User[] => {
    return users.filter(user => user.role === role);
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      
      const { data: newUserData, error: supabaseError } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          name: userData.name,
          role: userData.role,
          is_active: userData.isActive,
          avatar: userData.avatar
        })
        .select()
        .single();
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
    <UserContext.Provider value={{ 
      applications,
      loading,
      error,
      addApplication, 
      loading,
      error,
      updateApplication, 
      deleteApplication, 
      updateApplicationStatus,
      addApplicationNote,
      getUsersByRole,
      refreshUsers
    }}>
      {children}
    </ApplicationContext.Provider>
  );
};