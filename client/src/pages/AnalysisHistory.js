import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaSearch, FaFilter, FaEye, FaTrash, FaDownload, FaCalendar, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AnalysisHistory = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analyses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data);
      } else {
        toast.error('Failed to load analysis history');
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
      toast.error('Failed to load analysis history');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnalysis = async (analysisId) => {
    if (!window.confirm('Are you sure you want to delete this analysis?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analyses/${analysisId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Analysis deleted successfully');
        fetchAnalyses();
      } else {
        toast.error('Failed to delete analysis');
      }
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast.error('Failed to delete analysis');
    }
  };

  const filteredAnalyses = analyses
    .filter(analysis => {
      const matchesSearch = 
        analysis.resumeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.jobDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.analysisType?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterType === 'all' || analysis.analysisType === filterType;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'score':
          return (b.scores?.overall || 0) - (a.scores?.overall || 0);
        case 'name':
          return (a.resumeName || '').localeCompare(b.resumeName || '');
        default:
          return 0;
      }
    });

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const AnalysisCard = ({ analysis }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {analysis.resumeName || 'Resume Analysis'}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <FaCalendar className="mr-1" size={12} />
              {new Date(analysis.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <FaChartLine className="mr-1" size={12} />
              {analysis.analysisType === 'ai' ? 'AI Analysis' : 'Standard Analysis'}
            </div>
          </div>
          
          {analysis.jobDescription && (
            <p className="text-gray-700 text-sm mb-3 line-clamp-2">
              <span className="font-medium">Job:</span> {analysis.jobDescription}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedAnalysis(analysis)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <FaEye size={16} />
          </button>
          <button
            onClick={() => handleDeleteAnalysis(analysis._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <FaTrash size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className={`text-lg font-bold ${getScoreColor(analysis.scores?.overall)}`}>
            {analysis.scores?.overall || 'N/A'}%
          </div>
          <div className="text-xs text-gray-500">Overall</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${getScoreColor(analysis.scores?.ats)}`}>
            {analysis.scores?.ats || 'N/A'}%
          </div>
          <div className="text-xs text-gray-500">ATS Score</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${getScoreColor(analysis.scores?.keywordMatch)}`}>
            {analysis.scores?.keywordMatch || 'N/A'}%
          </div>
          <div className="text-xs text-gray-500">Keywords</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${getScoreColor(analysis.scores?.format)}`}>
            {analysis.scores?.format || 'N/A'}%
          </div>
          <div className="text-xs text-gray-500">Format</div>
        </div>
      </div>

      {analysis.keywordMatch && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {analysis.keywordMatch.matched?.slice(0, 5).map((keyword, index) => (
              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {keyword}
              </span>
            ))}
            {analysis.keywordMatch.missing?.slice(0, 3).map((keyword, index) => (
              <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                {keyword}
              </span>
            ))}
            {(analysis.keywordMatch.matched?.length > 5 || analysis.keywordMatch.missing?.length > 3) && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{((analysis.keywordMatch.matched?.length || 0) - 5) + ((analysis.keywordMatch.missing?.length || 0) - 3)} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link
          to={`/analyze?resumeId=${analysis.resumeId}`}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Re-analyze →
        </Link>
        <button className="flex items-center text-gray-600 hover:text-gray-700 text-sm">
          <FaDownload className="mr-1" size={12} />
          Export
        </button>
      </div>
    </motion.div>
  );

  const AnalysisModal = ({ analysis, onClose }) => {
    if (!analysis) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Analysis Details</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Resume Information</h3>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Name:</span> {analysis.resumeName || 'N/A'}
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Analysis Type:</span> {analysis.analysisType === 'ai' ? 'AI Analysis' : 'Standard Analysis'}
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Date:</span> {new Date(analysis.createdAt).toLocaleString()}
                </p>
                {analysis.jobDescription && (
                  <p className="text-gray-600">
                    <span className="font-medium">Job Description:</span> {analysis.jobDescription}
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Scores</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Overall Score:</span>
                    <span className={`font-semibold ${getScoreColor(analysis.scores?.overall)}`}>
                      {analysis.scores?.overall || 'N/A'}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ATS Score:</span>
                    <span className={`font-semibold ${getScoreColor(analysis.scores?.ats)}`}>
                      {analysis.scores?.ats || 'N/A'}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Keyword Match:</span>
                    <span className={`font-semibold ${getScoreColor(analysis.scores?.keywordMatch)}`}>
                      {analysis.scores?.keywordMatch || 'N/A'}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Format Score:</span>
                    <span className={`font-semibold ${getScoreColor(analysis.scores?.format)}`}>
                      {analysis.scores?.format || 'N/A'}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {analysis.keywordMatch && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Keyword Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">Matched Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywordMatch.matched?.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywordMatch.missing?.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {analysis.suggestions && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Suggestions</h3>
                <div className="space-y-3">
                  {Object.entries(analysis.suggestions).map(([section, suggestions]) => (
                    <div key={section}>
                      <h4 className="font-medium text-gray-800 capitalize mb-1">{section}</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.aiAnalysis && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">AI Analysis</h3>
                <div className="space-y-4">
                  {analysis.aiAnalysis.strengths && (
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {analysis.aiAnalysis.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {analysis.aiAnalysis.weaknesses && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">Areas for Improvement</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {analysis.aiAnalysis.weaknesses.map((weakness, index) => (
                          <li key={index}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {analysis.aiAnalysis.recommendations && (
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">Recommendations</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {analysis.aiAnalysis.recommendations.map((recommendation, index) => (
                          <li key={index}>{recommendation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis History</h1>
          <p className="text-gray-600">
            Review your past resume analyses and track your progress
          </p>
        </motion.div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search analyses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="standard">Standard Analysis</option>
                <option value="ai">AI Analysis</option>
              </select>
            </div>
            
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
            
            <div className="text-right">
              <span className="text-sm text-gray-600">
                {filteredAnalyses.length} of {analyses.length} analyses
              </span>
            </div>
          </div>
        </div>

        {/* Analysis Cards */}
        {filteredAnalyses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAnalyses.map((analysis) => (
              <AnalysisCard key={analysis._id} analysis={analysis} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center"
          >
            <FaChartLine className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses found</h3>
            <p className="text-gray-600 mb-6">
              {analyses.length === 0 
                ? "You haven't analyzed any resumes yet. Start by uploading your first resume."
                : "No analyses match your current filters. Try adjusting your search criteria."
              }
            </p>
            {analyses.length === 0 && (
              <Link
                to="/analyze"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaChartLine className="mr-2" size={16} />
                Analyze Resume
              </Link>
            )}
          </motion.div>
        )}

        {/* Analysis Modal */}
        {selectedAnalysis && (
          <AnalysisModal
            analysis={selectedAnalysis}
            onClose={() => setSelectedAnalysis(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AnalysisHistory;

