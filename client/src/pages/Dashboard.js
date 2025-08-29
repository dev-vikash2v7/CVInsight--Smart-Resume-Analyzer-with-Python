import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaPlus, FaChartLine, FaHistory, FaUser, FaFileAlt, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalAnalyses: 0,
    averageScore: 0,
    recentAnalyses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Analyze Resume',
      description: 'Upload and analyze your resume',
      icon: <FaChartLine className="text-blue-500" size={24} />,
      link: '/analyze',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      title: 'Build Resume',
      description: 'Create a new professional resume',
      icon: <FaPlus className="text-green-500" size={24} />,
      link: '/builder',
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      title: 'View History',
      description: 'Check your analysis history',
      icon: <FaHistory className="text-purple-500" size={24} />,
      link: '/history',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    },
    {
      title: 'Profile Settings',
      description: 'Manage your account settings',
      icon: <FaUser className="text-orange-500" size={24} />,
      link: '/profile',
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
    }
  ];

  const RecentAnalysisCard = ({ analysis }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <FaFileAlt className="text-gray-400" />
          <span className="font-medium text-sm text-gray-700">
            {analysis.resumeName || 'Resume Analysis'}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(analysis.createdAt).toLocaleDateString()}
        </span>
      </div>
      
      <div className="flex items-center space-x-4 mb-3">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">
            {analysis.scores?.overall || analysis.scores?.ats || 'N/A'}
          </div>
          <div className="text-xs text-gray-500">Score</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {analysis.analysisType === 'ai' ? 'AI' : 'Standard'}
          </div>
          <div className="text-xs text-gray-500">Type</div>
        </div>
      </div>
      
      <div className="text-xs text-gray-600 line-clamp-2">
        {analysis.jobDescription ? 
          `Job: ${analysis.jobDescription.substring(0, 50)}...` : 
          'General analysis'
        }
      </div>
    </motion.div>
  );

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
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to optimize your resume and land your dream job?
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaFileAlt className="text-blue-600" size={20} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Resumes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalResumes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaChartLine className="text-green-600" size={20} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAnalyses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaStar className="text-purple-600" size={20} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageScore ? `${stats.averageScore.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FaHistory className="text-orange-600" size={20} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.recentAnalyses?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`block p-6 rounded-lg border-2 transition-all duration-200 ${action.color}`}
              >
                <div className="flex items-center space-x-3">
                  {action.icon}
                  <div>
                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Analyses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Analyses</h2>
            <Link
              to="/history"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          
          {stats.recentAnalyses && stats.recentAnalyses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.recentAnalyses.slice(0, 6).map((analysis, index) => (
                <RecentAnalysisCard key={analysis._id || index} analysis={analysis} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <FaChartLine className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
              <p className="text-gray-600 mb-4">
                Start by analyzing your first resume to see your results here.
              </p>
              <Link
                to="/analyze"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="mr-2" size={16} />
                Analyze Resume
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

