import React, { useState, useMemo } from 'react';
import { Plus, Mail, Phone, MapPin, Calendar, ExternalLink, Github, Linkedin, Users, Eye, Edit, Download } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import CandidateForm from './CandidateForm';
import CandidateProfileModal from './CandidateProfileModal';
import { exportToCSV, ExportColumn, formatDateForExport } from '../utils/exportUtils';
import { useCandidates } from '../contexts/CandidateContext';
import { useApplications } from '../contexts/ApplicationContext';
import DynamicFilterBuilder, { FilterCondition } from './DynamicFilterBuilder';

interface CandidatesProps {
  filters?: {
    jobId?: string;
    jobTitle?: string;
  };
  onClearFilters?: () => void;
}

interface DenormalizedCandidate {
  candidateId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: number;
  skills: string[];
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  joinDate: string;
  lastActive: string;
  applicationCount: number;
  latestApplicationStatus: string;
  appliedJobs: string[];
}

const Candidates: React.FC<CandidatesProps> = ({ filters = {}, onClearFilters }) => {
  const { candidates } = useCandidates();
  const { applications } = useApplications();
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | undefined>(undefined);
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [sortBy, setSortBy] = useState<keyof DenormalizedCandidate>('joinDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Create denormalized data
  const denormalizedData = useMemo(() => {
    let candidatesToProcess = candidates;
    
    // Apply job filter if provided
    if (filters.jobId) {
      const jobApplications = applications.filter(app => app.jobId === filters.jobId);
      const candidateIds = jobApplications.map(app => app.candidateId);
      candidatesToProcess = candidates.filter(candidate => candidateIds.includes(candidate.id));
    }

    return candidatesToProcess.map(candidate => {
      const candidateApplications = applications.filter(app => app.candidateId === candidate.id);
      const latestApplication = candidateApplications.sort((a, b) => 
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      )[0];
      
      return {
        candidateId: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        location: candidate.location,
        experience: candidate.experience,
        skills: candidate.skills,
        resumeUrl: candidate.resumeUrl,
        linkedinUrl: candidate.linkedinUrl,
        githubUrl: candidate.githubUrl,
        joinDate: candidate.joinDate,
        lastActive: candidate.lastActive,
        applicationCount: candidateApplications.length,
        latestApplicationStatus: latestApplication?.status || 'none',
        appliedJobs: candidateApplications.map(app => app.jobTitle)
      } as DenormalizedCandidate;
    });
  }, [candidates, applications, filters.jobId]);

  // Apply dynamic filters
  const applyDynamicFilters = (data: DenormalizedCandidate[], conditions: FilterCondition[]) => {
    if (conditions.length === 0) return data;

    return data.filter(item => {
      let result = true;
      let currentLogicalOperator: 'AND' | 'OR' = 'AND';

      for (let i = 0; i < conditions.length; i++) {
        const condition = conditions[i];
        if (!condition.field || !condition.operator || !condition.value) continue;

        let conditionResult = false;
        const fieldValue = item[condition.field as keyof DenormalizedCandidate];
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

  const handleSort = (column: keyof DenormalizedCandidate) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleAddCandidate = () => {
    setEditingCandidate(undefined);
    setShowCandidateForm(true);
  };

  const handleEditCandidate = (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate) {
      setEditingCandidate(candidate);
      setShowCandidateForm(true);
    }
  };

  const handleSaveCandidate = () => {
    setShowCandidateForm(false);
    setEditingCandidate(undefined);
  };

  const handleViewProfile = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
  };

  const handleExport = () => {
    const exportColumns: ExportColumn[] = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'location', label: 'Location' },
      { key: 'experience', label: 'Experience (Years)' },
      { key: 'skills', label: 'Skills', format: (skills: string[]) => skills.join(', ') },
      { key: 'applicationCount', label: 'Applications' },
      { key: 'latestApplicationStatus', label: 'Latest Status' },
      { key: 'appliedJobs', label: 'Applied Jobs', format: (jobs: string[]) => jobs.join('; ') },
      { key: 'joinDate', label: 'Join Date', format: formatDateForExport },
      { key: 'lastActive', label: 'Last Active', format: formatDateForExport },
      { key: 'linkedinUrl', label: 'LinkedIn' },
      { key: 'githubUrl', label: 'GitHub' },
      { key: 'resumeUrl', label: 'Resume' }
    ];

    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(filteredData, exportColumns, `candidates-${timestamp}`);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'screening':
        return 'bg-purple-100 text-purple-800';
      case 'interview':
        return 'bg-orange-100 text-orange-800';
      case 'offer':
        return 'bg-pink-100 text-pink-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const SortableHeader: React.FC<{ column: keyof DenormalizedCandidate; children: React.ReactNode }> = ({ column, children }) => (
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
          <h1 className="text-2xl font-bold text-gray-900">
            {filters.jobId ? `Candidates for ${filters.jobTitle}` : 'Candidates'}
          </h1>
          <p className="text-gray-600 mt-1">
            {filters.jobId 
              ? `Showing candidates who applied for ${filters.jobTitle}` 
              : 'Manage your candidate database and talent pool'
            }
          </p>
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
            onClick={handleAddCandidate}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Active Job Filter */}
      {filters.jobId && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-blue-800">Active Filter:</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Job: {filters.jobTitle}
            </span>
          </div>
          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
          <div className="text-sm text-gray-600">Total Candidates</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {filteredData.filter(c => c.applicationCount > 0).length}
          </div>
          <div className="text-sm text-gray-600">Active Applicants</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(filteredData.reduce((sum, c) => sum + c.experience, 0) / filteredData.length || 0)}
          </div>
          <div className="text-sm text-gray-600">Avg. Experience</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">
            {filteredData.filter(c => c.linkedinUrl || c.githubUrl).length}
          </div>
          <div className="text-sm text-gray-600">With Profiles</div>
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
                <SortableHeader column="name">Candidate</SortableHeader>
                <SortableHeader column="location">Location</SortableHeader>
                <SortableHeader column="experience">Experience</SortableHeader>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                <SortableHeader column="applicationCount">Applications</SortableHeader>
                <SortableHeader column="latestApplicationStatus">Latest Status</SortableHeader>
                <SortableHeader column="joinDate">Join Date</SortableHeader>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Links</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((candidate) => (
                <tr key={candidate.candidateId} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                        <div className="text-sm text-gray-500">{candidate.email}</div>
                        <div className="flex items-center space-x-1 text-xs text-gray-400 mt-1">
                          <Phone className="h-3 w-3" />
                          <span>{candidate.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1 text-sm text-gray-900">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{candidate.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{candidate.experience} years</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{candidate.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{candidate.applicationCount}</div>
                    {candidate.appliedJobs.length > 0 && (
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {candidate.appliedJobs.slice(0, 2).join(', ')}
                        {candidate.appliedJobs.length > 2 && '...'}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {candidate.latestApplicationStatus !== 'none' && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(candidate.latestApplicationStatus)}`}>
                        {candidate.latestApplicationStatus.charAt(0).toUpperCase() + candidate.latestApplicationStatus.slice(1)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1 text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(candidate.joinDate)}</span>
                    </div>
                    <div className="text-xs text-gray-500">Active: {formatDate(candidate.lastActive)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {candidate.linkedinUrl && (
                        <a 
                          href={candidate.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors duration-200"
                          title="LinkedIn"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {candidate.githubUrl && (
                        <a 
                          href={candidate.githubUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-gray-800 rounded transition-colors duration-200"
                          title="GitHub"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {candidate.resumeUrl && (
                        <a 
                          href={candidate.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors duration-200"
                          title="Resume"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewProfile(candidate.candidateId)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                        title="View Profile"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditCandidate(candidate.candidateId)}
                        className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors duration-200"
                        title="Edit Profile"
                      >
                        <Edit className="h-4 w-4" />
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
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <button 
              onClick={handleAddCandidate}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Add New Candidate
            </button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-500 text-center">
        Showing {filteredData.length} of {denormalizedData.length} candidates
        {filterConditions.length > 0 && ` (${filterConditions.length} filter${filterConditions.length !== 1 ? 's' : ''} applied)`}
      </div>

      {/* Candidate Form Modal */}
      {showCandidateForm && (
        <CandidateForm
          onClose={() => {
            setShowCandidateForm(false);
            setEditingCandidate(undefined);
          }}
          onSave={handleSaveCandidate}
          editCandidate={editingCandidate}
        />
      )}

      {/* Candidate Profile Modal */}
      {selectedCandidateId && (
        <CandidateProfileModal
          candidateId={selectedCandidateId}
          onClose={() => setSelectedCandidateId(null)}
          onEdit={(candidate) => {
            setEditingCandidate(candidate);
            setShowCandidateForm(true);
            setSelectedCandidateId(null);
          }}
        />
      )}
    </div>
  );
};

export default Candidates;