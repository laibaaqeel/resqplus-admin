import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Organizations from './pages/Organizations';
import Users from './pages/Users';
import Accidents from './pages/Accidents';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import './App.css';
import Reports from './pages/Reports';
import Cameras from './pages/Cameras';
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // ← Auto-login on page refresh if token exists
    return !!localStorage.getItem('token');
  });

  const [user, setUser] = useState(() => {
    // ← Restore user info on page refresh
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    // ← Now receives user from Login component
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.clear(); // ← Clear token + user on logout
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
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
              <Navbar onLogout={handleLogout} user={user} /> {/* ← pass user to Navbar */}
              <div className="content-area">
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
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;