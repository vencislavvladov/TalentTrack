import React from 'react';
import { X, MapPin, Calendar, Users, DollarSign, Briefcase, Building, Clock, FileText } from 'lucide-react';
import { useJobs } from '../contexts/JobContext';
import { useApplications } from '../contexts/ApplicationContext';
import { formatDate, formatSalary } from '../utils/helpers';

interface JobDetailModalProps {
  jobId: string;
  onClose: () => void;
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({ jobId, onClose }) => {
  const { jobs } = useJobs();
  const { applications } = useApplications();

  const job = jobs.find(j => j.id === jobId);
  const jobApplications = applications.filter(app => app.jobId === jobId);

  if (!job) {
    return null;
  }

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

  const applicationsByStatus = {
    applied: jobApplications.filter(app => app.status === 'applied').length,
    screening: jobApplications.filter(app => app.status === 'screening').length,
    interview: jobApplications.filter(app => app.status === 'interview').length,
    offer: jobApplications.filter(app => app.status === 'offer').length,
    hired: jobApplications.filter(app => app.status === 'hired').length,
    rejected: jobApplications.filter(app => app.status === 'rejected').length,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{job.title}</h2>
              <p className="text-sm text-gray-600">{job.department} • {job.location}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Job Status and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Job Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Employment Type:</span>
                    <span className="text-sm text-gray-900 capitalize">{job.type.replace('-', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Department:</span>
                    <div className="flex items-center space-x-1">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{job.department}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Location:</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{job.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Posted Date:</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{formatDate(job.postedDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Salary Range:</span>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{formatSalary(job.salary.min, job.salary.max)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Application Statistics</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{jobApplications.length}</div>
                    <div className="text-sm text-gray-600">Total Applications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{applicationsByStatus.hired}</div>
                    <div className="text-sm text-gray-600">Hired</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{applicationsByStatus.interview}</div>
                    <div className="text-sm text-gray-600">In Interview</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{applicationsByStatus.offer}</div>
                    <div className="text-sm text-gray-600">Offers Extended</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Status Breakdown */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Application Pipeline</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-blue-600">{applicationsByStatus.applied}</div>
                <div className="text-xs text-blue-800">Applied</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-purple-600">{applicationsByStatus.screening}</div>
                <div className="text-xs text-purple-800">Screening</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-orange-600">{applicationsByStatus.interview}</div>
                <div className="text-xs text-orange-800">Interview</div>
              </div>
              <div className="bg-pink-50 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-pink-600">{applicationsByStatus.offer}</div>
                <div className="text-xs text-pink-800">Offer</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-green-600">{applicationsByStatus.hired}</div>
                <div className="text-xs text-green-800">Hired</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-red-600">{applicationsByStatus.rejected}</div>
                <div className="text-xs text-red-800">Rejected</div>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Job Description</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Requirements</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-2">
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recent Applications */}
          {jobApplications.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Applications</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {jobApplications.slice(0, 5).map((application) => (
                    <div key={application.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-xs">
                            {application.candidateName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{application.candidateName}</div>
                          <div className="text-xs text-gray-500">Applied {formatDate(application.appliedDate)}</div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        application.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                        application.status === 'screening' ? 'bg-purple-100 text-purple-800' :
                        application.status === 'interview' ? 'bg-orange-100 text-orange-800' :
                        application.status === 'offer' ? 'bg-pink-100 text-pink-800' :
                        application.status === 'hired' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                  ))}
                  {jobApplications.length > 5 && (
                    <div className="text-center">
                      <span className="text-sm text-gray-500">
                        And {jobApplications.length - 5} more applications...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
            Edit Job
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200">
            View Applications
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;