export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  status: 'active' | 'paused' | 'closed';
  description: string;
  requirements: string[];
  salary: {
    min: number;
    max: number;
  };
  postedDate: string;
  applicationCount: number;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'hired';
  appliedDate: string;
  lastUpdated: string;
  resumeUrl?: string;
  coverLetter?: string;
  notes: string[];
  stage: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: number;
  skills: string[];
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  applications: string[];
  joinDate: string;
  lastActive: string;
}

export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  newApplications: number;
  totalCandidates: number;
  interviewsScheduled: number;
  hiredThisMonth: number;
  averageTimeToHire: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'recruiter' | 'candidate';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}