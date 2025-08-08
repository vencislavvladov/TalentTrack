import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Users, 
  PlusCircle, 
  Settings, 
  Bell,
  Search,
  Menu,
  X,
  Shield,
  LogOut
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import Jobs from './components/Jobs';
import Applications from './components/Applications';
import ApplicationsOverview from './components/ApplicationsOverview';
import Candidates from './components/Candidates';
import ApplicationForm from './components/ApplicationForm';
import UserManagement from './components/UserManagement';
import AuthPage from './components/auth/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import { JobProvider } from './contexts/JobContext';
import { ApplicationProvider } from './contexts/ApplicationContext';
import { CandidateProvider } from './contexts/CandidateContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';

type Tab = 'dashboard' | 'jobs' | 'applications' | 'applications-overview' | 'candidates' | 'apply' | 'users';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [candidateFilters, setCandidateFilters] = useState<{
    jobId?: string;
    jobTitle?: string;
  }>({});

  // Define navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'recruiter'] },
      { id: 'jobs', label: 'Jobs', icon: Briefcase, roles: ['admin', 'recruiter'] },
      { id: 'applications', label: 'Applications', icon: FileText, roles: ['admin', 'recruiter'] },
      { id: 'applications-overview', label: 'Overview', icon: FileText, roles: ['admin', 'recruiter'] },
      { id: 'candidates', label: 'Candidates', icon: Users, roles: ['admin', 'recruiter'] },
      { id: 'apply', label: 'Apply Now', icon: PlusCircle, roles: ['candidate'] },
      { id: 'users', label: 'User Management', icon: Shield, roles: ['admin'] },
    ];

    return baseItems.filter(item => item.roles.includes(user?.role || 'candidate'));
  };

  const navigationItems = getNavigationItems();

  // Get available tabs for current user
  const availableTabs = navigationItems.map(item => item.id);
  
  // Redirect to appropriate default tab if current tab is not available
  React.useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      if (user?.role === 'candidate') {
        setActiveTab('apply');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [user?.role, activeTab, availableTabs]);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handleLogout = () => {
    logout();
  };

  const renderRoleBasedContent = () => {
    // Candidate view - only show job application
    if (user?.role === 'candidate') {
      return <ApplicationForm />;
    }

    // Admin and Recruiter views
    switch (activeTab) {
      case 'dashboard':
        return (
          <ProtectedRoute allowedRoles={['admin', 'recruiter']}>
            <Dashboard onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'jobs':
        return (
          <ProtectedRoute allowedRoles={['admin', 'recruiter']}>
            <Jobs onNavigate={handleNavigateWithFilters} />
          </ProtectedRoute>
        );
      case 'applications':
        return (
          <ProtectedRoute allowedRoles={['admin', 'recruiter']}>
            <Applications />
          </ProtectedRoute>
        );
      case 'applications-overview':
        return (
          <ProtectedRoute allowedRoles={['admin', 'recruiter']}>
            <ApplicationsOverview />
          </ProtectedRoute>
        );
      case 'candidates':
        return (
          <ProtectedRoute allowedRoles={['admin', 'recruiter']}>
            <Candidates 
              filters={candidateFilters} 
              onClearFilters={clearCandidateFilters} 
            />
          </ProtectedRoute>
        );
      case 'users':
        return (
          <ProtectedRoute requiredRole="admin">
            <UserManagement />
          </ProtectedRoute>
        );
      case 'apply':
        return <ApplicationForm />;
      default:
        return user?.role === 'candidate' ? <ApplicationForm /> : <Dashboard onNavigate={handleNavigate} />;
    }
  };

  const oldNavigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'applications-overview', label: 'Overview', icon: FileText },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'apply', label: 'Apply Now', icon: PlusCircle },
  ];

  const handleNavigate = (tab: string) => {
    setActiveTab(tab as Tab);
  };

  const handleNavigateWithFilters = (tab: string, filters?: any) => {
    setActiveTab(tab as Tab);
    if (tab === 'candidates' && filters) {
      setCandidateFilters(filters);
    }
  };

  const clearCandidateFilters = () => {
    setCandidateFilters({});
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hide for candidates */}
      {user?.role !== 'candidate' && (
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">TalentTrack</h1>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex flex-col h-full">
            {/* User Info */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 mt-8 px-4">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as Tab);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeTab === item.id
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Settings & Logout - Fixed at bottom */}
            <div className="p-4 border-t border-gray-200 mt-auto space-y-2">
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <Settings className="h-5 w-5" />
                <span className="font-medium">Settings</span>
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16">
          <div className="px-6 py-4 h-full">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center space-x-4">
                {user?.role !== 'candidate' && (
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                )}
                
                {user?.role === 'candidate' ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">TalentTrack</h1>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                    <Search className="h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="bg-transparent border-none outline-none text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <Bell className="h-5 w-5" />
                </button>
                
                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user?.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                  </div>
                  
                  {user?.role === 'candidate' && (
                    <button 
                      onClick={handleLogout}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Logout"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderRoleBasedContent()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <UserProvider>
        <JobProvider>
          <ApplicationProvider>
            <CandidateProvider>
              <AppContent />
            </CandidateProvider>
          </ApplicationProvider>
        </JobProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export default App;
