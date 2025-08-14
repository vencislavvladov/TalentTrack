import React, { useState, useMemo } from 'react';
import { Plus, Eye, Edit, Trash2, MapPin, Calendar, Users, DollarSign, Download, Search, Filter } from 'lucide-react';
import { formatDate, formatSalary, getStatusColor } from '../utils/helpers';
import JobForm from './JobForm';
import JobDetailModal from './JobDetailModal';
import { exportToCSV, ExportColumn, formatDateForExport, formatSalaryRange } from '../utils/exportUtils';
import { useJobs } from '../contexts/JobContext';
import { useApplications } from '../contexts/ApplicationContext';

const Jobs: React.FC<{ onNavigate?: (tab: string, filters?: any) => void }> = ({ onNavigate }) => {
  const { jobs, loading, error } = useJobs();
  const { applications } = useApplications();
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | undefined>(undefined);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<keyof Job>('postedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Calculate application counts for each job
  const jobsWithApplicationCounts = useMemo(() => {
    return jobs.map(job => ({
      ...job,
      applicationCount: applications.filter(app => app.jobId === job.id).length
    }));
  }, [jobs, applications]);

  // Get unique departments for filter
  const departments = useMemo(() => {
    return [...new Set(jobs.map(job => job.department))].sort();
  }, [jobs]);

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = jobsWithApplicationCounts.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || job.department === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [jobsWithApplicationCounts, searchTerm, statusFilter, departmentFilter, sortBy, sortOrder]);

  const handleSort = (column: keyof Job) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleCreateJob = () => {
    setEditingJob(undefined);
    setShowJobForm(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleSaveJob = () => {
    setShowJobForm(false);
    setEditingJob(undefined);
  };

  const handleViewApplications = (jobId: string, jobTitle: string) => {
    if (onNavigate) {
      onNavigate('candidates', { jobId, jobTitle });
    }
  };

  const handleExport = () => {
    const exportColumns: ExportColumn[] = [
      { key: 'title', label: 'Job Title' },
      { key: 'department', label: 'Department' },
      { key: 'location', label: 'Location' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status' },
      { key: 'salary', label: 'Salary Range', format: (salary: { min: number; max: number }) => formatSalaryRange(salary.min, salary.max) },
      { key: 'applicationCount', label: 'Applications' },
      { key: 'postedDate', label: 'Posted Date', format: formatDateForExport },
      { key: 'requirements', label: 'Requirements', format: (reqs: string[]) => reqs.join('; ') }
    ];

    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(filteredJobs, exportColumns, `jobs-${timestamp}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading jobs: {error}</p>
      </div>
    );
  }

  const SortableHeader: React.FC<{ column: keyof Job; children: React.ReactNode }> = ({ column, children }) => (
    <th 
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortBy === column && (
          <span className="text-blue-500">
            {sortOrder === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600 mt-1">Manage job postings and track applications</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={handleCreateJob}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Post Job</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{filteredJobs.length}</div>
          <div className="text-sm text-gray-600">Total Jobs</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {filteredJobs.filter(job => job.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active Jobs</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">
            {filteredJobs.reduce((sum, job) => sum + job.applicationCount, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Applications</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {departments.length}
          </div>
          <div className="text-sm text-gray-600">Departments</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search jobs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader column="title">Job Title</SortableHeader>
                <SortableHeader column="department">Department</SortableHeader>
                <SortableHeader column="location">Location</SortableHeader>
                <SortableHeader column="type">Type</SortableHeader>
                <SortableHeader column="status">Status</SortableHeader>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                <SortableHeader column="postedDate">Posted</SortableHeader>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{job.description}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{job.department}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1 text-sm text-gray-900">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{job.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {job.type.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1 text-sm text-gray-900">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span>{formatSalary(job.salary.min, job.salary.max)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewApplications(job.id, job.title)}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Users className="h-4 w-4" />
                      <span>{job.applicationCount}</span>
                    </button>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1 text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(job.postedDate)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setSelectedJobId(job.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditJob(job)}
                        className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors duration-200"
                        title="Edit Job"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                        title="Delete Job"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">Get started by posting your first job</p>
            <button 
              onClick={handleCreateJob}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Post New Job
            </button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-500 text-center">
        Showing {filteredJobs.length} of {jobs.length} jobs
      </div>

      {/* Job Form Modal */}
      {showJobForm && (
        <JobForm
          onClose={() => {
            setShowJobForm(false);
            setEditingJob(undefined);
          }}
          onSave={handleSaveJob}
          editJob={editingJob}
        />
      )}

      {/* Job Detail Modal */}
      {selectedJobId && (
        <JobDetailModal
          jobId={selectedJobId}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </div>
  );
};

export default Jobs;