import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import './App.css';

// Lazy load all pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Organizations = lazy(() => import('./pages/Organizations'));
const Users = lazy(() => import('./pages/Users'));
const Accidents = lazy(() => import('./pages/Accidents'));
const Cameras = lazy(() => import('./pages/Cameras'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

// Loading spinner shown during page transitions
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <div style={{
      width: '40px', height: '40px',
      border: '3px solid #f0f0f0',
      borderTop: '3px solid #C41E3A',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          success: { duration: 3000, style: { fontSize: 13, fontFamily: 'Inter, sans-serif' } },
          error:   { duration: 4000, style: { fontSize: 13, fontFamily: 'Inter, sans-serif' } },
        }}
      />
      <div className="App">
        {!isAuthenticated ? (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        ) : (
          <div className="dashboard-layout">
            <Sidebar />
            <div className="main-content">
              <Navbar onLogout={handleLogout} user={user} />
              <div className="content-area">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/organizations" element={<Organizations />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/accidents" element={<Accidents />} />
                    <Route path="/cameras" element={<Cameras />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </Suspense>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;