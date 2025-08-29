import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaSave, FaEye, FaDownload, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ResumeBuilder = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      website: ''
    },
    summary: '',
    targetRole: '',
    targetCategory: '',
    education: [],
    experience: [],
    projects: [],
    skills: [],
    template: 'modern'
  });

  const [loading, setLoading] = useState(false);

  const templates = [
    { id: 'modern', name: 'Modern', description: 'Clean and professional' },
    { id: 'classic', name: 'Classic', description: 'Traditional and formal' },
    { id: 'creative', name: 'Creative', description: 'Unique and eye-catching' }
  ];

  const jobCategories = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 
    'Sales', 'Engineering', 'Design', 'Consulting', 'Other'
  ];

  const steps = [
    { id: 0, name: 'Personal Info', icon: '👤' },
    { id: 1, name: 'Summary & Target', icon: '🎯' },
    { id: 2, name: 'Education', icon: '🎓' },
    { id: 3, name: 'Experience', icon: '💼' },
    { id: 4, name: 'Projects', icon: '🚀' },
    { id: 5, name: 'Skills', icon: '⚡' },
    { id: 6, name: 'Template & Review', icon: '📄' }
  ];

  const handleInputChange = (section, field, value) => {
    setResumeData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section, index, field, value) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addArrayItem = (section) => {
    const defaultItems = {
      education: { institution: '', degree: '', field: '', graduationYear: '', gpa: '' },
      experience: { company: '', position: '', startDate: '', endDate: '', description: '' },
      projects: { name: '', description: '', technologies: '', link: '' },
      skills: { name: '', level: 'Intermediate' }
    };

    setResumeData(prev => ({
      ...prev,
      [section]: [...prev[section], defaultItems[section]]
    }));
  };

  const removeArrayItem = (section, index) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resumeData)
      });

      if (response.ok) {
        toast.success('Resume saved successfully!');
      } else {
        toast.error('Failed to save resume');
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input
            type="text"
            value={resumeData.personalInfo.firstName}
            onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input
            type="text"
            value={resumeData.personalInfo.lastName}
            onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={resumeData.personalInfo.email}
            onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={resumeData.personalInfo.phone}
            onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <textarea
            value={resumeData.personalInfo.address}
            onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
          <input
            type="url"
            value={resumeData.personalInfo.linkedin}
            onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <input
            type="url"
            value={resumeData.personalInfo.website}
            onChange={(e) => handleInputChange('personalInfo', 'website', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderSummaryTarget = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Summary & Target Role</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
        <textarea
          value={resumeData.summary}
          onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
          rows={4}
          placeholder="Write a compelling summary of your professional background, key skills, and career objectives..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Role</label>
          <input
            type="text"
            value={resumeData.targetRole}
            onChange={(e) => setResumeData(prev => ({ ...prev, targetRole: e.target.value }))}
            placeholder="e.g., Senior Software Engineer"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Category</label>
          <select
            value={resumeData.targetCategory}
            onChange={(e) => setResumeData(prev => ({ ...prev, targetCategory: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Category</option>
            {jobCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Education</h3>
        <button
          onClick={() => addArrayItem('education')}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="mr-2" size={14} />
          Add Education
        </button>
      </div>
      {resumeData.education.map((edu, index) => (
        <div key={index} className="bg-gray-50 p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Education #{index + 1}</h4>
            <button
              onClick={() => removeArrayItem('education', index)}
              className="text-red-600 hover:text-red-700"
            >
              <FaTrash size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study</label>
              <input
                type="text"
                value={edu.field}
                onChange={(e) => handleArrayChange('education', index, 'field', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Graduation Year</label>
              <input
                type="number"
                value={edu.graduationYear}
                onChange={(e) => handleArrayChange('education', index, 'graduationYear', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GPA (Optional)</label>
              <input
                type="text"
                value={edu.gpa}
                onChange={(e) => handleArrayChange('education', index, 'gpa', e.target.value)}
                placeholder="e.g., 3.8/4.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderExperience = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Work Experience</h3>
        <button
          onClick={() => addArrayItem('experience')}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="mr-2" size={14} />
          Add Experience
        </button>
      </div>
      {resumeData.experience.map((exp, index) => (
        <div key={index} className="bg-gray-50 p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Experience #{index + 1}</h4>
            <button
              onClick={() => removeArrayItem('experience', index)}
              className="text-red-600 hover:text-red-700"
            >
              <FaTrash size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => handleArrayChange('experience', index, 'company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <input
                type="text"
                value={exp.position}
                onChange={(e) => handleArrayChange('experience', index, 'position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="month"
                value={exp.startDate}
                onChange={(e) => handleArrayChange('experience', index, 'startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="month"
                value={exp.endDate}
                onChange={(e) => handleArrayChange('experience', index, 'endDate', e.target.value)}
                placeholder="Leave empty if current"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={exp.description}
                onChange={(e) => handleArrayChange('experience', index, 'description', e.target.value)}
                rows={3}
                placeholder="Describe your responsibilities and achievements..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Projects</h3>
        <button
          onClick={() => addArrayItem('projects')}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="mr-2" size={14} />
          Add Project
        </button>
      </div>
      {resumeData.projects.map((project, index) => (
        <div key={index} className="bg-gray-50 p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Project #{index + 1}</h4>
            <button
              onClick={() => removeArrayItem('projects', index)}
              className="text-red-600 hover:text-red-700"
            >
              <FaTrash size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
              <input
                type="text"
                value={project.name}
                onChange={(e) => handleArrayChange('projects', index, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Technologies</label>
              <input
                type="text"
                value={project.technologies}
                onChange={(e) => handleArrayChange('projects', index, 'technologies', e.target.value)}
                placeholder="e.g., React, Node.js, MongoDB"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Link</label>
              <input
                type="url"
                value={project.link}
                onChange={(e) => handleArrayChange('projects', index, 'link', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={project.description}
                onChange={(e) => handleArrayChange('projects', index, 'description', e.target.value)}
                rows={3}
                placeholder="Describe the project, your role, and key achievements..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Skills</h3>
        <button
          onClick={() => addArrayItem('skills')}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="mr-2" size={14} />
          Add Skill
        </button>
      </div>
      {resumeData.skills.map((skill, index) => (
        <div key={index} className="bg-gray-50 p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Skill #{index + 1}</h4>
            <button
              onClick={() => removeArrayItem('skills', index)}
              className="text-red-600 hover:text-red-700"
            >
              <FaTrash size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skill Name</label>
              <input
                type="text"
                value={skill.name}
                onChange={(e) => handleArrayChange('skills', index, 'name', e.target.value)}
                placeholder="e.g., JavaScript, Project Management"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Proficiency Level</label>
              <select
                value={skill.level}
                onChange={(e) => handleArrayChange('skills', index, 'level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTemplateReview = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Template & Review</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Choose Template</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map(template => (
            <div
              key={template.id}
              onClick={() => setResumeData(prev => ({ ...prev, template: template.id }))}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                resumeData.template === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <h4 className="font-medium text-gray-900">{template.name}</h4>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-4">Resume Preview</h4>
        <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {resumeData.personalInfo.firstName} {resumeData.personalInfo.lastName}
            </h2>
            <p className="text-gray-600">{resumeData.personalInfo.email}</p>
            <p className="text-gray-600">{resumeData.personalInfo.phone}</p>
          </div>
          
          {resumeData.summary && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
              <p className="text-gray-700">{resumeData.summary}</p>
            </div>
          )}
          
          {resumeData.targetRole && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Target Role</h3>
              <p className="text-gray-700">{resumeData.targetRole}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: return renderPersonalInfo();
      case 1: return renderSummaryTarget();
      case 2: return renderEducation();
      case 3: return renderExperience();
      case 4: return renderProjects();
      case 5: return renderSkills();
      case 6: return renderTemplateReview();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Builder</h1>
          <p className="text-gray-600">Create a professional resume step by step</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    activeStep >= step.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {activeStep > step.id ? (
                    <span className="text-sm">✓</span>
                  ) : (
                    <span className="text-sm">{step.icon}</span>
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  activeStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    activeStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border p-8 mb-8"
        >
          {renderStepContent()}
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex space-x-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <FaSave className="mr-2" size={16} />
              {loading ? 'Saving...' : 'Save Resume'}
            </button>
            
            {activeStep < steps.length - 1 ? (
              <button
                onClick={() => setActiveStep(prev => prev + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <FaDownload className="mr-2" size={16} />
                Download PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;

