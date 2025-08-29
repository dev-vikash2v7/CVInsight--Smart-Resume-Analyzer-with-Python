import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { 
  FaUpload, 
  FaFilePdf, 
  FaFileWord, 
  FaRobot, 
  FaChartBar,
  FaSpinner,
  FaDownload,
  FaEye
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import AnalysisResults from '../components/AnalysisResults';

const ResumeAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisType, setAnalysisType] = useState('standard');
  const [jobCategory, setJobCategory] = useState('Software Development');
  const [jobRole, setJobRole] = useState('Frontend Developer');
  const [customJobDescription, setCustomJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [showCustomJobDesc, setShowCustomJobDesc] = useState(false);

  const jobRoles = {
    'Software Development': {
      'Frontend Developer': 'Develops user-facing web applications',
      'Backend Developer': 'Develops server-side applications and APIs',
      'Full Stack Developer': 'Develops both frontend and backend applications'
    },
    'Data Science': {
      'Data Scientist': 'Analyzes data to extract insights and build models',
      'Data Analyst': 'Analyzes data to provide business insights'
    },
    'DevOps': {
      'DevOps Engineer': 'Manages infrastructure and deployment processes'
    }
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`File "${file.name}" uploaded successfully!`);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please upload a resume file first');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResults(null);

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      formData.append('jobRole', jobRole);
      formData.append('jobCategory', jobCategory);
      
      if (showCustomJobDesc && customJobDescription) {
        formData.append('jobDescription', customJobDescription);
      }

      const endpoint = analysisType === 'ai' ? '/api/analysis/ai' : '/api/analysis/standard';
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setAnalysisResults(response.data);
      toast.success('Analysis completed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      const message = error.response?.data?.error || 'Analysis failed. Please try again.';
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setAnalysisResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Resume Analyzer
          </h1>
          <p className="text-xl text-gray-300">
            Get instant AI-powered feedback to optimize your resume
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload and Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* File Upload */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Upload Resume</h2>
              
              {!selectedFile ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
                    isDragActive
                      ? 'border-green-500 bg-green-500 bg-opacity-10'
                      : 'border-gray-600 hover:border-green-500'
                  }`}
                >
                  <input {...getInputProps()} />
                  <FaUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg text-gray-300 mb-2">
                    {isDragActive ? 'Drop the file here' : 'Drag & drop your resume here'}
                  </p>
                  <p className="text-sm text-gray-400">
                    or click to select a file (PDF, DOCX, DOC)
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Max size: 10MB</p>
                </div>
              ) : (
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {selectedFile.type === 'application/pdf' ? (
                        <FaFilePdf className="h-8 w-8 text-red-500" />
                      ) : (
                        <FaFileWord className="h-8 w-8 text-blue-500" />
                      )}
                      <div>
                        <p className="text-white font-medium">{selectedFile.name}</p>
                        <p className="text-gray-400 text-sm">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleFileRemove}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Settings */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Analysis Settings</h2>
              
              {/* Analysis Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Analysis Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setAnalysisType('standard')}
                    className={`p-3 rounded-lg border-2 transition-colors duration-200 flex items-center justify-center space-x-2 ${
                      analysisType === 'standard'
                        ? 'border-green-500 bg-green-500 bg-opacity-20 text-green-400'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <FaChartBar className="w-5 h-5" />
                    <span>Standard</span>
                  </button>
                  <button
                    onClick={() => setAnalysisType('ai')}
                    className={`p-3 rounded-lg border-2 transition-colors duration-200 flex items-center justify-center space-x-2 ${
                      analysisType === 'ai'
                        ? 'border-green-500 bg-green-500 bg-opacity-20 text-green-400'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <FaRobot className="w-5 h-5" />
                    <span>AI Powered</span>
                  </button>
                </div>
              </div>

              {/* Job Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Category
                </label>
                <select
                  value={jobCategory}
                  onChange={(e) => {
                    setJobCategory(e.target.value);
                    setJobRole(Object.keys(jobRoles[e.target.value])[0]);
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {Object.keys(jobRoles).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Job Role */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Role
                </label>
                <select
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {Object.keys(jobRoles[jobCategory] || {}).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {jobRoles[jobCategory]?.[jobRole] && (
                  <p className="text-sm text-gray-400 mt-1">
                    {jobRoles[jobCategory][jobRole]}
                  </p>
                )}
              </div>

              {/* Custom Job Description */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Custom Job Description (Optional)
                  </label>
                  <button
                    onClick={() => setShowCustomJobDesc(!showCustomJobDesc)}
                    className="text-sm text-green-400 hover:text-green-300"
                  >
                    {showCustomJobDesc ? 'Hide' : 'Add'}
                  </button>
                </div>
                {showCustomJobDesc && (
                  <textarea
                    value={customJobDescription}
                    onChange={(e) => setCustomJobDescription(e.target.value)}
                    placeholder="Paste the job description here for more targeted analysis..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 h-32 resize-none"
                  />
                )}
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || isAnalyzing}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                  !selectedFile || isAnalyzing
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <FaSpinner className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <FaChartBar className="w-5 h-5" />
                    <span>Analyze Resume</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Right Column - Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {analysisResults ? (
              <AnalysisResults results={analysisResults} />
            ) : (
              <div className="bg-gray-800 rounded-lg p-6 h-full flex items-center justify-center">
                <div className="text-center">
                  <FaEye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-400">
                    Upload a resume and click analyze to see results here
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
