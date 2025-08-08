import React, { useState } from 'react';
import { Upload, FileText, Send, X, CheckCircle, UserPlus } from 'lucide-react';
import { useJobs } from '../contexts/JobContext';
import { useApplications } from '../contexts/ApplicationContext';
import { useCandidates } from '../contexts/CandidateContext';

interface ApplicationFormProps {
  isAdminMode?: boolean;
  onClose?: () => void;
  onSave?: () => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ 
  isAdminMode = false, 
  onClose, 
  onSave 
}) => {
  const { jobs } = useJobs();
  const { addApplication } = useApplications();
  const { addCandidate, candidates } = useCandidates();
  
  const [formData, setFormData] = useState({
    jobId: '',
    candidateId: isAdminMode ? '' : undefined,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    experience: '',
    coverLetter: '',
    linkedinUrl: '',
    githubUrl: '',
    skills: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [useExistingCandidate, setUseExistingCandidate] = useState(isAdminMode);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCandidateSelect = (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate) {
      setFormData(prev => ({
        ...prev,
        candidateId,
        firstName: candidate.name.split(' ')[0] || '',
        lastName: candidate.name.split(' ').slice(1).join(' ') || '',
        email: candidate.email,
        phone: candidate.phone,
        location: candidate.location,
        experience: candidate.experience.toString(),
        skills: candidate.skills.join(', '),
        linkedinUrl: candidate.linkedinUrl || '',
        githubUrl: candidate.githubUrl || ''
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const selectedJob = jobs.find(job => job.id === formData.jobId);
    const candidateName = `${formData.firstName} ${formData.lastName}`;
    
    // Check if candidate already exists
    let candidateId = formData.candidateId || candidates.find(c => c.email === formData.email)?.id;
    
    // If candidate doesn't exist, create new candidate
    if (!candidateId) {
      const newCandidateData = {
        name: candidateName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        experience: parseInt(formData.experience) || 0,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        resumeUrl: resumeFile ? `#resume-${Date.now()}` : undefined,
        linkedinUrl: formData.linkedinUrl || undefined,
        githubUrl: formData.githubUrl || undefined,
        applications: []
      };
      
      addCandidate(newCandidateData);
      candidateId = Date.now().toString(); // This would be the ID from addCandidate
    }
    
    // Create application
    const applicationData = {
      jobId: formData.jobId,
      jobTitle: selectedJob?.title || 'Unknown Position',
      candidateId: candidateId!,
      candidateName,
      candidateEmail: formData.email,
      status: 'applied' as const,
      resumeUrl: resumeFile ? `#resume-${Date.now()}` : undefined,
      coverLetter: formData.coverLetter,
      notes: []
    };
    
    addApplication(applicationData);
    
    setIsSubmitting(false);
    setIsSubmitted(true);

    if (isAdminMode && onSave) {
      onSave();
      return;
    }
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        jobId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        experience: '',
        coverLetter: '',
        linkedinUrl: '',
        githubUrl: '',
        skills: ''
      });
      setResumeFile(null);
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <div className={isAdminMode ? "" : "max-w-4xl mx-auto space-y-6"}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted Successfully!</h1>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for your interest in joining our team. We've received your application and will review it shortly.
          </p>
          <p className="text-sm text-gray-500">
            You'll receive an email confirmation shortly. We'll be in touch if your qualifications match our requirements.
          </p>
        </div>
      </div>
    );
  }

  const formContent = (
    <>
      {/* Job Selection */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Position</h2>
        <select
          name="jobId"
          value={formData.jobId}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
        >
          <option value="">Select a position</option>
          {jobs.filter(job => job.status === 'active').map(job => (
            <option key={job.id} value={job.id}>
              {job.title} - {job.department}
            </option>
          ))}
        </select>
      </div>

      {/* Candidate Selection (Admin Mode) */}
      {isAdminMode && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Candidate</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={useExistingCandidate}
                  onChange={() => setUseExistingCandidate(true)}
                  className="mr-2"
                />
                <span>Select existing candidate</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!useExistingCandidate}
                  onChange={() => setUseExistingCandidate(false)}
                  className="mr-2"
                />
                <span>Create new candidate</span>
              </label>
            </div>
            
            {useExistingCandidate && (
              <select
                value={formData.candidateId || ''}
                onChange={(e) => handleCandidateSelect(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              >
                <option value="">Select a candidate</option>
                {candidates.map(candidate => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name} - {candidate.email}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Personal Information */}
      {(!isAdminMode || !useExistingCandidate) && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                disabled={isAdminMode && useExistingCandidate}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                disabled={isAdminMode && useExistingCandidate}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isAdminMode && useExistingCandidate}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                disabled={isAdminMode && useExistingCandidate}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                disabled={isAdminMode && useExistingCandidate}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                min="0"
                max="50"
                required
                disabled={isAdminMode && useExistingCandidate}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Skills */}
      {(!isAdminMode || !useExistingCandidate) && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleInputChange}
            placeholder="e.g. React, TypeScript, Node.js, Python (comma separated)"
            disabled={isAdminMode && useExistingCandidate}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-100"
          />
          <p className="text-sm text-gray-500 mt-2">Separate skills with commas</p>
        </div>
      )}

      {/* Resume Upload */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Resume</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-200">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
            id="resume-upload"
          />
          <label htmlFor="resume-upload" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700">
                {resumeFile ? resumeFile.name : 'Click to upload resume'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PDF, DOC, or DOCX files up to 10MB
              </p>
            </div>
          </label>
          {resumeFile && (
            <div className="mt-4 flex items-center justify-center space-x-2">
              <FileText className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-600">File uploaded successfully</span>
              <button
                type="button"
                onClick={() => setResumeFile(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cover Letter */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Cover Letter</h2>
        <textarea
          name="coverLetter"
          value={formData.coverLetter}
          onChange={handleInputChange}
          rows={6}
          placeholder="Tell us why you're interested in this position and what makes you a great fit..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
        />
      </div>

      {/* Social Links */}
      {(!isAdminMode || !useExistingCandidate) && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Links (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/yourprofile"
                disabled={isAdminMode && useExistingCandidate}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Profile</label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleInputChange}
                placeholder="https://github.com/yourusername"
                disabled={isAdminMode && useExistingCandidate}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex justify-end space-x-4">
          {isAdminMode && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
            <span>{isSubmitting ? 'Submitting...' : (isAdminMode ? 'Create Application' : 'Submit Application')}</span>
          </button>
        </div>
      </div>
    </>
  );

  if (isAdminMode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Create Application</h1>
                <p className="text-sm text-gray-600">Assign a candidate to a position</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-8">
              {formContent}
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Submit Your Application</h1>
        <p className="text-gray-600 mt-2">Join our team and make an impact</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="space-y-8">
          {formContent}
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;