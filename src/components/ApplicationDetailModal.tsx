import React from 'react';
import { X, Mail, Phone, MapPin, Calendar, ExternalLink, FileText, MessageSquare } from 'lucide-react';
import { useApplications } from '../contexts/ApplicationContext';
import { useCandidates } from '../contexts/CandidateContext';
import { useJobs } from '../contexts/JobContext';
import { formatDate } from '../utils/helpers';
import StatusBadge from './common/StatusBadge';
import ProgressBar from './common/ProgressBar';

interface ApplicationDetailModalProps {
  applicationId: string;
  onClose: () => void;
}

const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({ applicationId, onClose }) => {
  const { applications } = useApplications();
  const { getCandidateById } = useCandidates();
  const { jobs } = useJobs();

  const application = applications.find(app => app.id === applicationId);
  const candidate = application ? getCandidateById(application.candidateId) : null;
  const job = application ? jobs.find(j => j.id === application.jobId) : null;

  if (!application || !candidate) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {candidate.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{candidate.name}</h2>
              <p className="text-sm text-gray-600">{application.jobTitle}</p>
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
          {/* Application Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">Application Status</h3>
              <StatusBadge status={application.status} />
            </div>
            <ProgressBar 
              progress={(application.stage / 5) * 100} 
              color={application.status === 'rejected' ? 'red' : application.status === 'hired' ? 'green' : 'blue'}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Applied: {formatDate(application.appliedDate)}</span>
              <span>Last Updated: {formatDate(application.lastUpdated)}</span>
            </div>
          </div>

          {/* Candidate Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{candidate.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{candidate.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{candidate.location}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{candidate.experience} years experience</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Links</h3>
              <div className="space-y-3">
                {candidate.linkedinUrl && (
                  <a 
                    href={candidate.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-sm">LinkedIn Profile</span>
                  </a>
                )}
                {candidate.githubUrl && (
                  <a 
                    href={candidate.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-sm">GitHub Profile</span>
                  </a>
                )}
                {application.resumeUrl && (
                  <a 
                    href={application.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-blue-600 hover:text-blue-800"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">View Resume</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Cover Letter */}
          {application.coverLetter && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cover Letter</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
              </div>
            </div>
          )}

          {/* Job Details */}
          {job && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Position Details</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{job.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{job.department} • {job.location}</p>
                <p className="text-sm text-gray-700 mt-2">{job.description}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notes & Comments</h3>
            {application.notes.length > 0 ? (
              <div className="space-y-3">
                {application.notes.map((note, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Note #{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700">{note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No notes added yet</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailModal;