import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import ResumeBuilder from './pages/ResumeBuilder';
import AnalysisHistory from './pages/AnalysisHistory';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
// const ProtectedRoute = ({ children }) => {
//   const { user, loading } = useAuth();
  
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
//       </div>
//     );
//   }
  
//   return user ? children : <Navigate to="/login" />;
// };

// // Admin Route Component
// const AdminRoute = ({ children }) => {
//   const { user, loading } = useAuth();
  
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
//       </div>
//     );
//   }
  
//   return user && user.role === 'admin' ? children : <Navigate to="/dashboard" />;
// };

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-900 text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  //  
                    <Dashboard />
                  //   
                } 
              />
              <Route 
                path="/analyzer" 
                element={
                   
                    <ResumeAnalyzer />
                    
                } 
              />
              <Route 
                path="/builder" 
                element={
                   
                    <ResumeBuilder />
                    
                } 
              />
              <Route 
                path="/history" 
                element={
                   
                    <AnalysisHistory />
                    
                } 
              />
              <Route 
                path="/profile" 
                element={
                   
                    <Profile />
                    
                } 
              />
              <Route 
                path="/admin" 
                element={
                    <AdminDashboard />
                } 
              />
            </Routes>
          </main>
          <Footer />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #374151',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
