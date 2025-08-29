import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaChartLine, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaDownload,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

const AnalysisResults = ({ results }) => {
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  const { analysis } = results;
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Analysis Results</h2>
        
        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <ScoreCard
            title="ATS Score"
            score={analysis.ats_score}
            icon={FaChartLine}
          />
          <ScoreCard
            title="Keyword Match"
            score={analysis.keyword_match?.score || 0}
            icon={FaCheckCircle}
          />
          <ScoreCard
            title="Format Score"
            score={analysis.format_score}
            icon={FaCheckCircle}
          />
          <ScoreCard
            title="Section Score"
            score={analysis.section_score}
            icon={FaCheckCircle}
          />
        </div>

        {/* Overall Assessment */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Overall Assessment</h3>
          <div className="flex items-center space-x-2">
            <span className={`text-2xl font-bold ${getScoreColor(analysis.ats_score)}`}>
              {analysis.ats_score}
            </span>
            <span className="text-gray-300">/ 100</span>
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              analysis.ats_score >= 80 ? 'bg-green-500 bg-opacity-20 text-green-400' :
              analysis.ats_score >= 60 ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
              'bg-red-500 bg-opacity-20 text-red-400'
            }`}>
              {getScoreStatus(analysis.ats_score)}
            </span>
          </div>
        </div>
      </div>

      {/* Skills Analysis */}
      {analysis.keyword_match && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Skills Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <div>
              <h4 className="text-green-400 font-medium mb-3 flex items-center">
                <FaCheckCircle className="mr-2" />
                Matched Skills ({analysis.keyword_match.matched_skills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.keyword_match.matched_skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div>
              <h4 className="text-red-400 font-medium mb-3 flex items-center">
                <FaExclamationTriangle className="mr-2" />
                Missing Skills ({analysis.keyword_match.missing_skills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.keyword_match.missing_skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-500 bg-opacity-20 text-red-400 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Improvement Suggestions</h3>
        
        <div className="space-y-4">
          {analysis.contact_suggestions?.length > 0 && (
            <SuggestionSection
              title="Contact Information"
              suggestions={analysis.contact_suggestions}
              icon={FaCheckCircle}
              color="blue"
            />
          )}
          
          {analysis.summary_suggestions?.length > 0 && (
            <SuggestionSection
              title="Professional Summary"
              suggestions={analysis.summary_suggestions}
              icon={FaCheckCircle}
              color="green"
            />
          )}
          
          {analysis.skills_suggestions?.length > 0 && (
            <SuggestionSection
              title="Skills"
              suggestions={analysis.skills_suggestions}
              icon={FaCheckCircle}
              color="yellow"
            />
          )}
          
          {analysis.experience_suggestions?.length > 0 && (
            <SuggestionSection
              title="Work Experience"
              suggestions={analysis.experience_suggestions}
              icon={FaCheckCircle}
              color="purple"
            />
          )}
          
          {analysis.education_suggestions?.length > 0 && (
            <SuggestionSection
              title="Education"
              suggestions={analysis.education_suggestions}
              icon={FaCheckCircle}
              color="indigo"
            />
          )}
          
          {analysis.format_suggestions?.length > 0 && (
            <SuggestionSection
              title="Formatting"
              suggestions={analysis.format_suggestions}
              icon={FaCheckCircle}
              color="pink"
            />
          )}
        </div>
      </div>

      {/* AI Analysis (if available) */}
      {analysis.aiAnalysis && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">AI Analysis</h3>
            <button
              onClick={() => setShowFullAnalysis(!showFullAnalysis)}
              className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors duration-200"
            >
              {showFullAnalysis ? <FaEyeSlash /> : <FaEye />}
              <span>{showFullAnalysis ? 'Hide' : 'Show'} Full Analysis</span>
            </button>
          </div>
          
          {showFullAnalysis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gray-700 rounded-lg p-4"
            >
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans">
                  {analysis.aiAnalysis.fullResponse}
                </pre>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
            <FaDownload />
            <span>Download Report</span>
          </button>
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
            <FaChartLine />
            <span>View History</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ScoreCard = ({ title, score, icon: Icon }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 text-center">
      <Icon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
      <h4 className="text-sm font-medium text-gray-300 mb-1">{title}</h4>
      <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
        {score}
      </div>
      <div className="text-xs text-gray-400">/ 100</div>
    </div>
  );
};

const SuggestionSection = ({ title, suggestions, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
    indigo: 'text-indigo-400',
    pink: 'text-pink-400'
  };

  return (
    <div className="border-l-4 border-gray-600 pl-4">
      <h4 className={`font-medium mb-2 flex items-center ${colorClasses[color]}`}>
        <Icon className="mr-2" />
        {title}
      </h4>
      <ul className="space-y-1">
        {suggestions.map((suggestion, index) => (
          <li key={index} className="text-gray-300 text-sm flex items-start">
            <span className="text-green-400 mr-2 mt-1">•</span>
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AnalysisResults;
