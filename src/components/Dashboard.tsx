import React, { useState } from 'react';
import { Users, Briefcase, FileText, Calendar, TrendingUp, Clock, CheckCircle, UserCheck } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import StatusBadge from './common/StatusBadge';
import JobForm from './JobForm';
import { useJobs } from '../contexts/JobContext';
import { useApplications } from '../contexts/ApplicationContext';
import { useCandidates } from '../contexts/CandidateContext';

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { jobs } = useJobs();
  const { applications } = useApplications();
  const { candidates } = useCandidates();
  
  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(job => job.status === 'active').length,
    totalApplications: applications.length,
    newApplications: applications.filter(app => {
      const today = new Date();
      const appliedDate = new Date(app.appliedDate);
      const diffTime = Math.abs(today.getTime() - appliedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length,
    totalCandidates: candidates.length,
    interviewsScheduled: applications.filter(app => app.status === 'interview').length,
    hiredThisMonth: applications.filter(app => {
      const today = new Date();
      const appliedDate = new Date(app.appliedDate);
      return app.status === 'hired' && 
             appliedDate.getMonth() === today.getMonth() && 
             appliedDate.getFullYear() === today.getFullYear();
    }).length,
    averageTimeToHire: 18
  };
  
  const recentApplications = applications.slice(0, 5);
  const [showJobForm, setShowJobForm] = useState(false);

  const handlePostNewJob = () => {
    setShowJobForm(true);
  };

  const handleSaveJob = () => {
    setShowJobForm(false);
    
    // Optionally navigate to jobs page after creating
    if (onNavigate) {
      onNavigate('jobs');
    }
  };

  const handleReviewApplications = () => {
    if (onNavigate) {
      onNavigate('applications');
    }
  };

  const handleScheduleInterview = () => {
    if (onNavigate) {
      onNavigate('applications');
    }
  };

  const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    color: string;
    change?: string;
  }> = ({ title, value, icon, color, change }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your hiring.</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {formatDate(new Date().toISOString())}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs}
          icon={<Briefcase className="h-5 w-5 text-white" />}
          color="bg-blue-500"
          change="+2 this month"
        />
        <StatCard
          title="Active Applications"
          value={stats.totalApplications}
          icon={<FileText className="h-5 w-5 text-white" />}
          color="bg-green-500"
          change={`+${stats.newApplications} this week`}
        />
        <StatCard
          title="Total Candidates"
          value={stats.totalCandidates}
          icon={<Users className="h-5 w-5 text-white" />}
          color="bg-purple-500"
          change="+8 this week"
        />
        <StatCard
          title="Interviews Scheduled"
          value={stats.interviewsScheduled}
          icon={<Calendar className="h-5 w-5 text-white" />}
          color="bg-orange-500"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Hired This Month"
          value={stats.hiredThisMonth}
          icon={<UserCheck className="h-5 w-5 text-white" />}
          color="bg-emerald-500"
        />
        <StatCard
          title="Avg. Time to Hire"
          value={`${stats.averageTimeToHire} days`}
          icon={<Clock className="h-5 w-5 text-white" />}
          color="bg-indigo-500"
        />
        <StatCard
          title="New Applications"
          value={stats.newApplications}
          icon={<CheckCircle className="h-5 w-5 text-white" />}
          color="bg-teal-500"
        />
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
          <p className="text-sm text-gray-600 mt-1">Latest candidate applications across all positions</p>
        </div>
        <div className="p-6">
          {recentApplications.length > 0 ? (
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {application.candidateName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{application.candidateName}</p>
                      <p className="text-sm text-gray-600">{application.jobTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <StatusBadge status={application.status} />
                    <span className="text-sm text-gray-500">{formatDate(application.appliedDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No applications yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={handlePostNewJob}
            className="flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <Briefcase className="h-4 w-4" />
            <span>Post New Job</span>
          </button>
          <button 
            onClick={handleReviewApplications}
            className="flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            <FileText className="h-4 w-4" />
            <span>Review Applications</span>
          </button>
          <button 
            onClick={handleScheduleInterview}
            className="flex items-center justify-center space-x-2 bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors duration-200"
          >
            <Calendar className="h-4 w-4" />
            <span>Schedule Interview</span>
          </button>
        </div>
      </div>

      {/* Job Form Modal */}
      {showJobForm && (
        <JobForm
          onClose={() => setShowJobForm(false)}
          onSave={handleSaveJob}
        />
      )}
    </div>
  );
};

export default Dashboard;