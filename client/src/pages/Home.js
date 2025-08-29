import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaRobot, 
  FaChartLine, 
  FaFileAlt, 
  FaShieldAlt, 
  FaRocket,
  FaCheckCircle
} from 'react-icons/fa';

const Home = () => {
  const features = [
    {
      icon: FaRobot,
      title: 'AI-Powered Analysis',
      description: 'Get instant feedback on your resume with advanced AI analysis that identifies strengths and areas for improvement.',
      color: 'text-blue-400'
    },
    {
      icon: FaChartLine,
      title: 'Smart Resume Builder',
      description: 'Create professional resumes with our intelligent builder that suggests optimal content and formatting.',
      color: 'text-green-400'
    },
    {
      icon: FaFileAlt,
      title: 'Career Insights',
      description: 'Access detailed analytics and personalized recommendations to enhance your career prospects.',
      color: 'text-purple-400'
    },
    {
      icon: FaShieldAlt,
      title: 'Privacy First',
      description: 'Your data security is our priority. We ensure your information is always protected and private.',
      color: 'text-red-400'
    }
  ];

  const benefits = [
    'ATS-optimized resume formatting',
    'Keyword matching for job descriptions',
    'Real-time scoring and feedback',
    'Professional templates and designs',
    'AI-powered content suggestions',
    'Export to multiple formats'
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold text-white mb-6"
            >
              Transform Your Career with
              <span className="text-green-400 block">Smart Resume AI</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Get instant AI-powered feedback to optimize your resume. Create professional resumes that stand out and get you noticed by top employers.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/dashboard"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <FaRocket />
                <span>Get Started Free</span>
              </Link>
             
            </motion.div>
          </div>
        </div>
        
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10"></div>
          {/* <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" ill="none" fill-rule="evenodd"fill="%239C92AC" fill-opacity="0.05" cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div> */}
        </div>
      </section>

      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose Smart Resume AI?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with industry best practices to help you create resumes that get results.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-700 rounded-lg p-6 text-center hover:bg-gray-600 transition-colors duration-200"
              >
                <feature.icon className={`mx-auto h-12 w-12 ${feature.color} mb-4`} />
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Everything You Need for Resume Success
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Our comprehensive platform provides all the tools and insights you need to create a resume that stands out in today's competitive job market.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <FaCheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-lg p-8"
            >
              <div className="text-center">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaRocket className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-gray-300 mb-6">
                  Join thousands of job seekers who have transformed their careers with Smart Resume AI.
                </p>
                <Link
                  to="/dashboard"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 inline-block"
                >
                  Start Your Journey
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Don't Let Your Resume Hold You Back
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Get the tools and insights you need to create a resume that opens doors to your dream career.
            </p>
            <Link
              to="/register"
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 inline-block"
            >
              Get Started Today
            </Link>
          </motion.div>
        </div>
      </section> */}


    </div>
  );
};

export default Home;
