import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Play, AlertCircle, User, DollarSign, Calendar, MessageSquare } from 'lucide-react';

const ProjectStatus = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [progressUpdate, setProgressUpdate] = useState({ progress: 0, progressNote: '' });
  const [updating, setUpdating] = useState(false);

  // Mock user role - replace with actual auth context
  useEffect(() => {
    // This would come from your auth context/localStorage
    const role = localStorage.getItem('userRole') || 'freelancer';
    setUserRole(role);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bids/project-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else if (response.status === 404) {
        setProjects([]);
      } else {
        throw new Error('Failed to fetch projects');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (bidId, progress, progressNote) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bids/progress/${bidId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ progress, progressNote })
      });

      if (response.ok) {
        const data = await response.json();
        // Update the specific project in the list
        setProjects(prev => prev.map(project => 
          project._id === bidId 
            ? { ...project, ...data.bid }
            : project
        ));
        setSelectedProject(null);
        setProgressUpdate({ progress: 0, progressNote: '' });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update progress');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const markAsCompleted = async (bidId) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bids/complete/${bidId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(prev => prev.map(project => 
          project._id === bidId 
            ? { ...project, ...data.bid }
            : project
        ));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark as completed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'not-started':
        return <Clock className="w-5 h-5 text-gray-500" />;
      case 'in-progress':
        return <Play className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-purple-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressColor = (progress) => {
    if (progress === 0) return 'bg-gray-200';
    if (progress < 50) return 'bg-red-200';
    if (progress < 80) return 'bg-yellow-200';
    return 'bg-green-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Project Status Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            {userRole === 'freelancer' 
              ? 'Track progress on your accepted projects' 
              : 'Monitor progress of your freelance projects'
            }
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Active Projects</h3>
            <p className="mt-2 text-gray-500">
              {userRole === 'freelancer' 
                ? "You don't have any accepted bids yet." 
                : "No freelancers are currently working on your projects."
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div key={project._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {project.job.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span>${project.amount}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(project.projectStatus)}
                    </div>
                  </div>

                  {/* Client/Freelancer Info */}
                  <div className="flex items-center mb-4">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {userRole === 'freelancer' 
                        ? `Client: ${project.job.clientId?.name || 'Unknown'}` 
                        : `Freelancer: ${project.freelancer?.name || 'Unknown'}`
                      }
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{project.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress || 0)}`}
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.projectStatus)}`}>
                      {project.projectStatus?.replace('-', ' ').toUpperCase() || 'NOT STARTED'}
                    </span>
                  </div>

                  {/* Progress Note */}
                  {project.progressNote && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <div className="flex items-start">
                        <MessageSquare className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                        <p className="text-sm text-gray-700">{project.progressNote}</p>
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="text-xs text-gray-500 mb-4">
                    {project.lastProgressUpdate && (
                      <div className="flex items-center mb-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>Last Updated: {formatDate(project.lastProgressUpdate)}</span>
                      </div>
                    )}
                    {project.completedDate && (
                      <div className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        <span>Completed: {formatDate(project.completedDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - Only for Freelancers */}
                  {userRole === 'freelancer' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setProgressUpdate({
                            progress: project.progress || 0,
                            progressNote: project.progressNote || ''
                          });
                        }}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                        disabled={updating}
                      >
                        Update Progress
                      </button>
                      {project.progress < 100 && (
                        <button
                          onClick={() => markAsCompleted(project._id)}
                          className="px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                          disabled={updating}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Progress Update Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Update Progress: {selectedProject.job.title}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress Percentage
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressUpdate.progress}
                  onChange={(e) => setProgressUpdate(prev => ({
                    ...prev,
                    progress: parseInt(e.target.value)
                  }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span className="font-medium">{progressUpdate.progress}%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress Note (Optional)
                </label>
                <textarea
                  value={progressUpdate.progressNote}
                  onChange={(e) => setProgressUpdate(prev => ({
                    ...prev,
                    progressNote: e.target.value
                  }))}
                  placeholder="Add a note about your progress..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setProgressUpdate({ progress: 0, progressNote: '' });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateProgress(
                    selectedProject._id,
                    progressUpdate.progress,
                    progressUpdate.progressNote
                  )}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Progress'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectStatus;