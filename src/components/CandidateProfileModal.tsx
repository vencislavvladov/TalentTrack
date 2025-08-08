import React from 'react';
import { X, Mail, Phone, MapPin, Calendar, ExternalLink, Github, Linkedin, FileText, Briefcase, Edit } from 'lucide-react';
import { useCandidates } from '../contexts/CandidateContext';
import { useApplications } from '../contexts/ApplicationContext';
import { useJobs } from '../contexts/JobContext';
import { formatDate } from '../utils/helpers';
import StatusBadge from './common/StatusBadge';

interface CandidateProfileModalProps {
  candidateId: string;
  onClose: () => void;
  onEdit?: (candidate: Candidate) => void;
}

const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({ candidateId, onClose, onEdit }) => {
  const { getCandidateById } = useCandidates();
  const { applications } = useApplications();
  const { jobs } = useJobs();

  const candidate = getCandidateById(candidateId);
  const candidateApplications = applications.filter(app => app.candidateId === candidateId);

  if (!candidate) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-xl">
                {candidate.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{candidate.name}</h2>
              <p className="text-sm text-gray-600">{candidate.experience} years of experience</p>
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
          {/* Contact Information */}
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
                  <span className="text-sm text-gray-600">Joined {formatDate(candidate.joinDate)}</span>
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
                    className="flex items-center space-x-3 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span className="text-sm">LinkedIn Profile</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {candidate.githubUrl && (
                  <a 
                    href={candidate.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    <Github className="h-4 w-4" />
                    <span className="text-sm">GitHub Profile</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {candidate.resumeUrl && (
                  <a 
                    href={candidate.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">View Resume</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {!candidate.linkedinUrl && !candidate.githubUrl && !candidate.resumeUrl && (
                  <p className="text-sm text-gray-500 italic">No professional links available</p>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Application History */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Application History</h3>
            {candidateApplications.length > 0 ? (
              <div className="space-y-3">
                {candidateApplications.map((application) => {
                  const job = jobs.find(j => j.id === application.jobId);
                  return (
                    <div key={application.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-900">{application.jobTitle}</h4>
                            {job && (
                              <p className="text-sm text-gray-600">{job.department} • {job.location}</p>
                            )}
                          </div>
                        </div>
                        <StatusBadge status={application.status} />
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Applied: {formatDate(application.appliedDate)}</span>
                        <span>Last Updated: {formatDate(application.lastUpdated)}</span>
                      </div>
                      {application.notes.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            <strong>Latest Note:</strong> {application.notes[application.notes.length - 1]}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No applications found</p>
                <p className="text-sm text-gray-400">This candidate hasn't applied to any positions yet</p>
              </div>
            )}
          </div>

          {/* Activity Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Activity Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{candidateApplications.length}</div>
                <div className="text-sm text-gray-600">Total Applications</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {candidateApplications.filter(app => ['interview', 'offer', 'hired'].includes(app.status)).length}
                </div>
                <div className="text-sm text-gray-600">Advanced Stages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {candidateApplications.filter(app => app.status === 'hired').length}
                </div>
                <div className="text-sm text-gray-600">Hired</div>
              </div>
            </div>
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
          {onEdit && (
            <button 
              onClick={() => {
                onEdit(candidate);
                onClose();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          )}
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200">
            Send Message
          </button>
          <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200">
            Create Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfileModal;