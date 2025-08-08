import React, { useState, useMemo } from 'react';
import { Download, Eye, MessageSquare, Calendar, Mail, Phone, MapPin, Briefcase, User, Building, Clock, TrendingUp } from 'lucide-react';
import { useApplications } from '../contexts/ApplicationContext';
import { useCandidates } from '../contexts/CandidateContext';
import { useJobs } from '../contexts/JobContext';
import { formatDate, formatSalary } from '../utils/helpers';
import { exportToCSV, ExportColumn, formatDateForExport, formatSalaryRange } from '../utils/exportUtils';
import StatusBadge from './common/StatusBadge';
import ProgressBar from './common/ProgressBar';
import DynamicFilterBuilder, { FilterCondition } from './DynamicFilterBuilder';

interface DenormalizedApplication {
  applicationId: string;
  candidateId: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  candidateLocation: string;
  candidateExperience: number;
  candidateSkills: string[];
  jobTitle: string;
  jobDepartment: string;
  jobLocation: string;
  jobType: string;
  jobSalaryMin: number;
  jobSalaryMax: number;
  applicationStatus: string;
  applicationStage: number;
  appliedDate: string;
  lastUpdated: string;
  notes: string[];
}

const ApplicationsOverview: React.FC = () => {
  const { applications, updateApplicationStatus } = useApplications();
  const { candidates } = useCandidates();
  const { jobs } = useJobs();

  // Dynamic filter state
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [sortBy, setSortBy] = useState<keyof DenormalizedApplication>('appliedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Create denormalized data
  const denormalizedData = useMemo(() => {
    return applications.map(app => {
      const candidate = candidates.find(c => c.id === app.candidateId);
      const job = jobs.find(j => j.id === app.jobId);
      
      return {
        applicationId: app.id,
        candidateId: app.candidateId,
        jobId: app.jobId,
        candidateName: candidate?.name || app.candidateName,
        candidateEmail: candidate?.email || app.candidateEmail,
        candidatePhone: candidate?.phone || '',
        candidateLocation: candidate?.location || '',
        candidateExperience: candidate?.experience || 0,
        candidateSkills: candidate?.skills || [],
        jobTitle: job?.title || app.jobTitle,
        jobDepartment: job?.department || '',
        jobLocation: job?.location || '',
        jobType: job?.type || '',
        jobSalaryMin: job?.salary?.min || 0,
        jobSalaryMax: job?.salary?.max || 0,
        applicationStatus: app.status,
        applicationStage: app.stage,
        appliedDate: app.appliedDate,
        lastUpdated: app.lastUpdated,
        notes: app.notes
      } as DenormalizedApplication;
    });
  }, [applications, candidates, jobs]);

  // Apply dynamic filters
  const applyDynamicFilters = (data: DenormalizedApplication[], conditions: FilterCondition[]) => {
    if (conditions.length === 0) return data;

    return data.filter(item => {
      let result = true;
      let currentLogicalOperator: 'AND' | 'OR' = 'AND';

      for (let i = 0; i < conditions.length; i++) {
        const condition = conditions[i];
        if (!condition.field || !condition.operator || !condition.value) continue;

        let conditionResult = false;
        const fieldValue = item[condition.field as keyof DenormalizedApplication];
        const conditionValue = condition.value;

        // Apply the condition based on operator
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

        // Apply logical operator
        if (i === 0) {
          result = conditionResult;
        } else {
          if (currentLogicalOperator === 'AND') {
            result = result && conditionResult;
          } else {
            result = result || conditionResult;
          }
        }

        // Set next logical operator
        if (i < conditions.length - 1) {
          currentLogicalOperator = conditions[i + 1].logicalOperator || 'AND';
        }
      }

      return result;
    });
  };

  // Apply filters and sorting
  const filteredData = useMemo(() => {
    // Apply dynamic filters
    let filtered = applyDynamicFilters(denormalizedData, filterConditions);

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle different data types
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

  const handleSort = (column: keyof DenormalizedApplication) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    updateApplicationStatus(applicationId, newStatus as any);
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'rejected': return 'red';
      case 'hired': return 'green';
      default: return 'blue';
    }
  };

  const getProgressValue = (stage: number) => (stage / 5) * 100;

  const handleExport = () => {
    const exportColumns: ExportColumn[] = [
      { key: 'candidateName', label: 'Candidate Name' },
      { key: 'candidateEmail', label: 'Email' },
      { key: 'candidatePhone', label: 'Phone' },
      { key: 'candidateLocation', label: 'Location' },
      { key: 'candidateExperience', label: 'Experience (Years)' },
      { key: 'candidateSkills', label: 'Skills', format: (skills: string[]) => skills.join(', ') },
      { key: 'jobTitle', label: 'Job Title' },
      { key: 'jobDepartment', label: 'Department' },
      { key: 'jobLocation', label: 'Job Location' },
      { key: 'jobType', label: 'Job Type' },
      { key: 'jobSalaryMin', label: 'Salary Range', format: (_, item) => formatSalaryRange(item.jobSalaryMin, item.jobSalaryMax) },
      { key: 'applicationStatus', label: 'Status' },
      { key: 'applicationStage', label: 'Progress (%)', format: (stage: number) => `${((stage / 5) * 100).toFixed(0)}%` },
      { key: 'appliedDate', label: 'Applied Date', format: formatDateForExport },
      { key: 'lastUpdated', label: 'Last Updated', format: formatDateForExport },
      { key: 'notes', label: 'Notes Count', format: (notes: string[]) => notes.length.toString() }
    ];

    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(filteredData, exportColumns, `applications-overview-${timestamp}`);
  };

  const SortableHeader: React.FC<{ column: keyof DenormalizedApplication; children: React.ReactNode }> = ({ column, children }) => (
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
          <h1 className="text-2xl font-bold text-gray-900">Applications Overview</h1>
          <p className="text-gray-600 mt-1">Complete view of all applications with candidate and job details</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
          <div className="text-sm text-gray-600">Total Applications</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {filteredData.filter(d => d.applicationStatus === 'screening').length}
          </div>
          <div className="text-sm text-gray-600">In Screening</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">
            {filteredData.filter(d => d.applicationStatus === 'interview').length}
          </div>
          <div className="text-sm text-gray-600">In Interview</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {filteredData.filter(d => d.applicationStatus === 'offer').length}
          </div>
          <div className="text-sm text-gray-600">Offers Extended</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {filteredData.filter(d => d.applicationStatus === 'hired').length}
          </div>
          <div className="text-sm text-gray-600">Hired</div>
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
                <SortableHeader column="candidateName">Candidate</SortableHeader>
                <SortableHeader column="jobTitle">Position</SortableHeader>
                <SortableHeader column="jobDepartment">Department</SortableHeader>
                <SortableHeader column="candidateExperience">Experience</SortableHeader>
                <SortableHeader column="applicationStatus">Status</SortableHeader>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <SortableHeader column="appliedDate">Applied</SortableHeader>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.applicationId} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {item.candidateName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{item.candidateName}</div>
                        <div className="text-sm text-gray-500">{item.candidateEmail}</div>
                        <div className="flex items-center space-x-3 mt-1">
                          {item.candidatePhone && (
                            <div className="flex items-center space-x-1 text-xs text-gray-400">
                              <Phone className="h-3 w-3" />
                              <span>{item.candidatePhone}</span>
                            </div>
                          )}
                          {item.candidateLocation && (
                            <div className="flex items-center space-x-1 text-xs text-gray-400">
                              <MapPin className="h-3 w-3" />
                              <span>{item.candidateLocation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.jobTitle}</div>
                    <div className="text-sm text-gray-500">{item.jobLocation}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {item.jobType} • {formatSalary(item.jobSalaryMin, item.jobSalaryMax)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1 text-sm text-gray-900">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span>{item.jobDepartment}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.candidateExperience} years</div>
                    {item.candidateSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.candidateSkills.slice(0, 2).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                        {item.candidateSkills.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{item.candidateSkills.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <select
                      value={item.applicationStatus}
                      onChange={(e) => handleStatusChange(item.applicationId, e.target.value)}
                      className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="applied">Applied</option>
                      <option value="screening">Screening</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="w-24">
                      <ProgressBar 
                        progress={getProgressValue(item.applicationStage)} 
                        color={getProgressColor(item.applicationStatus)}
                        className="mb-1"
                      />
                      <div className="text-xs text-gray-500 text-center">
                        {getProgressValue(item.applicationStage).toFixed(0)}%
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(item.appliedDate)}</div>
                    <div className="text-xs text-gray-500">Updated: {formatDate(item.lastUpdated)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors duration-200">
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors duration-200">
                        <Calendar className="h-4 w-4" />
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
              <TrendingUp className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-500 text-center">
        Showing {filteredData.length} of {denormalizedData.length} applications
        {filterConditions.length > 0 && ` (${filterConditions.length} filter${filterConditions.length !== 1 ? 's' : ''} applied)`}
      </div>
    </div>
  );
};

export default ApplicationsOverview;