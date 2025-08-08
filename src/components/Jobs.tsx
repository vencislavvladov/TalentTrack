import React, { useState, useMemo } from 'react';
import { Plus, MapPin, Calendar, Users, Eye, Edit, Trash2, Briefcase, DollarSign, Download } from 'lucide-react';
import { formatDate, formatSalary } from '../utils/helpers';
import { Job } from '../types';
import JobForm from './JobForm';
import { exportToCSV, ExportColumn, formatDateForExport, formatSalaryRange } from '../utils/exportUtils';
import { useJobs } from '../contexts/JobContext';
import { useApplications } from '../contexts/ApplicationContext';
import DynamicFilterBuilder, { FilterCondition } from './DynamicFilterBuilder';

interface JobsProps {
  onNavigate?: (tab: string, filters?: any) => void;
}

interface DenormalizedJob {
  jobId: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: string;
  description: string;
  requirements: string[];
  salaryMin: number;
  salaryMax: number;
  postedDate: string;
  applicationCount: number;
}

const Jobs: React.FC<JobsProps> = ({ onNavigate }) => {
  const { jobs, updateJob, deleteJob } = useJobs();
  const { applications } = useApplications();
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | undefined>(undefined);
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [sortBy, setSortBy] = useState<keyof DenormalizedJob>('postedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Create denormalized data
  const denormalizedData = useMemo(() => {
    return jobs.map(job => {
      const jobApplications = applications.filter(app => app.jobId === job.id);
      
      return {
        jobId: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
        status: job.status,
        description: job.description,
        requirements: job.requirements,
        salaryMin: job.salary.min,
        salaryMax: job.salary.max,
        postedDate: job.postedDate,
        applicationCount: jobApplications.length
      } as DenormalizedJob;
    });
  }, [jobs, applications]);

  // Apply dynamic filters
  const applyDynamicFilters = (data: DenormalizedJob[], conditions: FilterCondition[]) => {
    if (conditions.length === 0) return data;

    return data.filter(item => {
      let result = true;
      let currentLogicalOperator: 'AND' | 'OR' = 'AND';

      for (let i = 0; i < conditions.length; i++) {
        const condition = conditions[i];
        if (!condition.field || !condition.operator || !condition.value) continue;

        let conditionResult = false;
        const fieldValue = item[condition.field as keyof DenormalizedJob];
        const conditionValue = condition.value;

        switch (condition.operator) {
          case 'equals':
            if (Array.isArray(fieldValue)) {
              conditionResult = fieldValue.includes(conditionValue as string);
            } else {
              conditionResult = String(fieldValue).toLowerCase() === String(conditionValue).toLowerCase();
            }
            break;
          case 'notEquals':
            if (Array.isArray(fieldValue)) {
              conditionResult = !fieldValue.includes(conditionValue as string);
            } else {
              conditionResult = String(fieldValue).toLowerCase() !== String(conditionValue).toLowerCase();
            }
            break;
          case 'contains':
            if (Array.isArray(fieldValue)) {
              if (Array.isArray(conditionValue)) {
                conditionResult = (conditionValue as string[]).some(val => fieldValue.includes(val));
              } else {
                conditionResult = fieldValue.some(val => val.toLowerCase().includes(String(conditionValue).toLowerCase()));
              }
            } else {
              conditionResult = String(fieldValue || '').toLowerCase().includes(String(conditionValue).toLowerCase());
            }
            break;
          case 'containsAll':
            if (Array.isArray(fieldValue) && Array.isArray(conditionValue)) {
              conditionResult = (conditionValue as string[]).every(val => fieldValue.includes(val));
            }
            break;
          case 'notContains':
            if (Array.isArray(fieldValue)) {
              if (Array.isArray(conditionValue)) {
                conditionResult = !(conditionValue as string[]).some(val => fieldValue.includes(val));
              } else {
                conditionResult = !fieldValue.some(val => val.toLowerCase().includes(String(conditionValue).toLowerCase()));
              }
            } else {
              conditionResult = !String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());
            }
            break;
          case 'startsWith':
            conditionResult = String(fieldValue).toLowerCase().startsWith(String(conditionValue).toLowerCase());
            break;
          case 'endsWith':
            conditionResult = String(fieldValue).toLowerCase().endsWith(String(conditionValue).toLowerCase());
            break;
          case 'greaterThan':
            conditionResult = Number(fieldValue) > Number(conditionValue);
            break;
          case 'lessThan':
            conditionResult = Number(fieldValue) < Number(conditionValue);
            break;
          case 'greaterThanOrEqual':
            conditionResult = Number(fieldValue) >= Number(conditionValue);
            break;
          case 'lessThanOrEqual':
            conditionResult = Number(fieldValue) <= Number(conditionValue);
            break;
          case 'after':
            conditionResult = new Date(String(fieldValue)) > new Date(String(conditionValue));
            break;
          case 'before':
            conditionResult = new Date(String(fieldValue)) < new Date(String(conditionValue));
            break;
        }

        if (i === 0) {
          result = conditionResult;
        } else {
          if (currentLogicalOperator === 'AND') {
            result = result && conditionResult;
          } else {
            result = result || conditionResult;
          }
        }

        if (i < conditions.length - 1) {
          currentLogicalOperator = conditions[i + 1].logicalOperator || 'AND';
        }
      }

      return result;
    });
  };

  // Apply filters and sorting
  const filteredData = useMemo(() => {
    let filtered = applyDynamicFilters(denormalizedData, filterConditions);

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
  }, [denormalizedData, filterConditions, sortBy, sortOrder]);

  const handleSort = (column: keyof DenormalizedJob) => {
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

  const handleEditJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setEditingJob(job);
      setShowJobForm(true);
    }
  };

  const handleSaveJob = (jobData: Omit<Job, 'id' | 'postedDate' | 'applicationCount'>) => {
    if (editingJob) {
      updateJob(editingJob.id, jobData);
    }
    setShowJobForm(false);
    setEditingJob(undefined);
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      deleteJob(jobId);
    }
  };

  const handleViewCandidates = (jobId: string, jobTitle: string) => {
    if (onNavigate) {
      onNavigate('candidates', {
        jobId: jobId,
        jobTitle: jobTitle
      });
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExport = () => {
    const exportColumns: ExportColumn[] = [
      { key: 'title', label: 'Job Title' },
      { key: 'department', label: 'Department' },
      { key: 'location', label: 'Location' },
      { key: 'type', label: 'Employment Type' },
      { key: 'status', label: 'Status' },
      { key: 'applicationCount', label: 'Applications' },
      { key: 'postedDate', label: 'Posted Date', format: formatDateForExport },
      { key: 'salaryMin', label: 'Salary Range', format: (value, item) => formatSalaryRange(item.salaryMin, item.salaryMax) },
      { key: 'description', label: 'Description' },
      { key: 'requirements', label: 'Requirements', format: (reqs: string[]) => reqs.join('; ') }
    ];

    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(filteredData, exportColumns, `jobs-${timestamp}`);
  };

  const SortableHeader: React.FC<{ column: keyof DenormalizedJob; children: React.ReactNode }> = ({ column, children }) => (
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
          <p className="text-gray-600 mt-1">Manage your job postings and track applications</p>
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
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
          <div className="text-sm text-gray-600">Total Jobs</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {filteredData.filter(j => j.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active Jobs</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {filteredData.filter(j => j.status === 'paused').length}
          </div>
          <div className="text-sm text-gray-600">Paused Jobs</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {filteredData.reduce((sum, j) => sum + j.applicationCount, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Applications</div>
        </div>
      </div>

      {/* Dynamic Filter Builder */}
      <DynamicFilterBuilder
        data={denormalizedData}
        onFiltersChange={setFilterConditions}
      />

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
                <SortableHeader column="applicationCount">Applications</SortableHeader>
                <SortableHeader column="postedDate">Posted Date</SortableHeader>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary Range</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((job) => (
                <tr key={job.jobId} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{job.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.department}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1 text-sm text-gray-900">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{job.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{job.type.replace('-', ' ')}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1 text-sm text-gray-900">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{job.applicationCount}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1 text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(job.postedDate)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1 text-sm text-gray-900">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleViewCandidates(job.jobId, job.title)}
                        className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors duration-200"
                        title="View Candidates"
                      >
                        <Users className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditJob(job.jobId)}
                        className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors duration-200"
                        title="Edit Job"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteJob(job.jobId)}
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
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <button 
              onClick={handleCreateJob}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Create New Job
            </button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-500 text-center">
        Showing {filteredData.length} of {denormalizedData.length} jobs
        {filterConditions.length > 0 && ` (${filterConditions.length} filter${filterConditions.length !== 1 ? 's' : ''} applied)`}
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
    </div>
  );
};

export default Jobs;