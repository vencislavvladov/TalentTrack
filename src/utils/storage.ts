// Local storage utilities for data persistence

export interface StorageData {
  jobs: any[];
  applications: any[];
  candidates: any[];
  users: any[];
  lastUpdated: string;
}

const STORAGE_KEY = 'talenttrack_data';
const STORAGE_VERSION = '1.0';

// Initialize default data
const getDefaultData = (): StorageData => ({
  jobs: [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'full-time',
      status: 'active',
      description: 'We are looking for a skilled Senior Frontend Developer to join our dynamic team. You will be responsible for developing user interfaces for web applications using modern technologies.',
      requirements: ['React', 'TypeScript', 'CSS3', 'Node.js', '5+ years experience'],
      salary: { min: 120000, max: 180000 },
      postedDate: '2024-01-15',
      applicationCount: 0
    },
    {
      id: '2',
      title: 'Product Manager',
      department: 'Product',
      location: 'Remote',
      type: 'remote',
      status: 'active',
      description: 'Join our product team to drive the vision and strategy for our core platform. You will work closely with engineering and design teams to deliver exceptional user experiences.',
      requirements: ['Product Management', 'Agile', 'Data Analysis', 'User Research', '3+ years experience'],
      salary: { min: 110000, max: 160000 },
      postedDate: '2024-01-10',
      applicationCount: 0
    },
    {
      id: '3',
      title: 'UX Designer',
      department: 'Design',
      location: 'New York, NY',
      type: 'full-time',
      status: 'active',
      description: 'We are seeking a creative UX Designer to help us create intuitive and engaging user experiences. You will collaborate with cross-functional teams to design solutions that delight our users.',
      requirements: ['Figma', 'User Research', 'Prototyping', 'UI/UX Design', '2+ years experience'],
      salary: { min: 85000, max: 130000 },
      postedDate: '2024-01-08',
      applicationCount: 0
    },
    {
      id: '4',
      title: 'Backend Engineer',
      department: 'Engineering',
      location: 'Austin, TX',
      type: 'full-time',
      status: 'paused',
      description: 'Looking for a Backend Engineer to build and maintain our server-side applications. You will work with databases, APIs, and cloud infrastructure.',
      requirements: ['Python', 'Django', 'PostgreSQL', 'AWS', '3+ years experience'],
      salary: { min: 100000, max: 150000 },
      postedDate: '2024-01-05',
      applicationCount: 0
    }
  ],
  applications: [
    {
      id: '1',
      jobId: '1',
      jobTitle: 'Senior Frontend Developer',
      candidateId: '1',
      candidateName: 'Sarah Johnson',
      candidateEmail: 'sarah.johnson@email.com',
      status: 'interview',
      appliedDate: '2024-01-20',
      lastUpdated: '2024-01-22',
      resumeUrl: '#',
      coverLetter: 'I am excited to apply for the Senior Frontend Developer position...',
      notes: ['Technical interview scheduled for Jan 25', 'Strong React background'],
      stage: 3
    },
    {
      id: '2',
      jobId: '2',
      jobTitle: 'Product Manager',
      candidateId: '2',
      candidateName: 'Michael Chen',
      candidateEmail: 'michael.chen@email.com',
      status: 'screening',
      appliedDate: '2024-01-18',
      lastUpdated: '2024-01-21',
      resumeUrl: '#',
      coverLetter: 'With 5 years of product management experience...',
      notes: ['Phone screening completed', 'Good communication skills'],
      stage: 2
    },
    {
      id: '3',
      jobId: '3',
      jobTitle: 'UX Designer',
      candidateId: '3',
      candidateName: 'Emily Rodriguez',
      candidateEmail: 'emily.rodriguez@email.com',
      status: 'applied',
      appliedDate: '2024-01-22',
      lastUpdated: '2024-01-22',
      resumeUrl: '#',
      coverLetter: 'I am passionate about creating user-centered designs...',
      notes: [],
      stage: 1
    },
    {
      id: '4',
      jobId: '1',
      jobTitle: 'Senior Frontend Developer',
      candidateId: '4',
      candidateName: 'David Kim',
      candidateEmail: 'david.kim@email.com',
      status: 'offer',
      appliedDate: '2024-01-15',
      lastUpdated: '2024-01-23',
      resumeUrl: '#',
      coverLetter: 'I have been following your company for years...',
      notes: ['Excellent technical skills', 'Offer extended', 'Waiting for response'],
      stage: 4
    },
    {
      id: '5',
      jobId: '2',
      jobTitle: 'Product Manager',
      candidateId: '5',
      candidateName: 'Lisa Park',
      candidateEmail: 'lisa.park@email.com',
      status: 'hired',
      appliedDate: '2024-01-12',
      lastUpdated: '2024-01-24',
      resumeUrl: '#',
      coverLetter: 'I am thrilled to apply for the Product Manager role...',
      notes: ['Offer accepted', 'Start date: Feb 1'],
      stage: 5
    }
  ],
  candidates: [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      experience: 6,
      skills: ['React', 'TypeScript', 'JavaScript', 'CSS3', 'Node.js', 'GraphQL'],
      resumeUrl: '#',
      linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
      githubUrl: 'https://github.com/sarahjohnson',
      applications: ['1'],
      joinDate: '2024-01-20',
      lastActive: '2024-01-22'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 234-5678',
      location: 'Seattle, WA',
      experience: 5,
      skills: ['Product Management', 'Agile', 'Data Analysis', 'User Research', 'SQL'],
      resumeUrl: '#',
      linkedinUrl: 'https://linkedin.com/in/michaelchen',
      applications: ['2'],
      joinDate: '2024-01-18',
      lastActive: '2024-01-21'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '+1 (555) 345-6789',
      location: 'New York, NY',
      experience: 3,
      skills: ['Figma', 'Sketch', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
      resumeUrl: '#',
      linkedinUrl: 'https://linkedin.com/in/emilyrodriguez',
      applications: ['3'],
      joinDate: '2024-01-22',
      lastActive: '2024-01-22'
    },
    {
      id: '4',
      name: 'David Kim',
      email: 'david.kim@email.com',
      phone: '+1 (555) 456-7890',
      location: 'Los Angeles, CA',
      experience: 8,
      skills: ['React', 'Vue.js', 'JavaScript', 'Python', 'AWS', 'Docker'],
      resumeUrl: '#',
      linkedinUrl: 'https://linkedin.com/in/davidkim',
      githubUrl: 'https://github.com/davidkim',
      applications: ['4'],
      joinDate: '2024-01-15',
      lastActive: '2024-01-23'
    },
    {
      id: '5',
      name: 'Lisa Park',
      email: 'lisa.park@email.com',
      phone: '+1 (555) 567-8901',
      location: 'Chicago, IL',
      experience: 4,
      skills: ['Product Strategy', 'Market Research', 'Analytics', 'Roadmapping', 'Scrum'],
      resumeUrl: '#',
      linkedinUrl: 'https://linkedin.com/in/lisapark',
      applications: ['5'],
      joinDate: '2024-01-12',
      lastActive: '2024-01-24'
    }
  ],
  users: [
    {
      id: '1',
      email: 'admin@company.com',
      name: 'Admin User',
      role: 'admin',
      isActive: true,
      createdAt: '2024-01-01',
      lastLogin: '2024-01-25'
    },
    {
      id: '2',
      email: 'recruiter@company.com',
      name: 'Jane Recruiter',
      role: 'recruiter',
      isActive: true,
      createdAt: '2024-01-02',
      lastLogin: '2024-01-24'
    },
    {
      id: '3',
      email: 'candidate@email.com',
      name: 'John Candidate',
      role: 'candidate',
      isActive: true,
      createdAt: '2024-01-03',
      lastLogin: '2024-01-23'
    },
    {
      id: '4',
      email: 'recruiter2@company.com',
      name: 'Mike Recruiter',
      role: 'recruiter',
      isActive: false,
      createdAt: '2024-01-04',
      lastLogin: '2024-01-20'
    },
    {
      id: '5',
      email: 'candidate2@email.com',
      name: 'Sarah Johnson',
      role: 'candidate',
      isActive: true,
      createdAt: '2024-01-05',
      lastLogin: '2024-01-22'
    }
  ],
  lastUpdated: new Date().toISOString()
});

// Load data from localStorage
export const loadData = (): StorageData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const defaultData = getDefaultData();
      saveData(defaultData);
      return defaultData;
    }

    const parsed = JSON.parse(stored);
    
    // Check if we have all required properties
    if (!parsed.jobs || !parsed.applications || !parsed.candidates || !parsed.users) {
      console.warn('Incomplete data in localStorage, resetting to defaults');
      const defaultData = getDefaultData();
      saveData(defaultData);
      return defaultData;
    }

    return parsed;
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    const defaultData = getDefaultData();
    saveData(defaultData);
    return defaultData;
  }
};

// Save data to localStorage
export const saveData = (data: StorageData): void => {
  try {
    const dataToSave = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
};

// Clear all data
export const clearData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing data from localStorage:', error);
  }
};

// Export data for backup
export const exportData = (): string => {
  const data = loadData();
  return JSON.stringify(data, null, 2);
};

// Import data from backup
export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    if (data.jobs && data.applications && data.candidates && data.users) {
      saveData(data);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Get storage info
export const getStorageInfo = () => {
  const data = loadData();
  return {
    version: STORAGE_VERSION,
    lastUpdated: data.lastUpdated,
    jobsCount: data.jobs.length,
    applicationsCount: data.applications.length,
    candidatesCount: data.candidates.length,
    usersCount: data.users.length
  };
};