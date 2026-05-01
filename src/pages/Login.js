import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import './Login.css';
import api from '../api/axios'; // ← import your axios instance

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });

      const { token, user } = response.data;

      // Save token & user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Block non-admins
      if (user.role !== 'admin') {
        setError('Access denied. Admin accounts only.');
        localStorage.clear();
        return;
      }

      onLogin(user); // pass user up to App.js

    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Shield size={48} color="white" />
          <h1>RESQ+</h1>
          <p>EMERGENCY RESPONSE SYSTEM</p>
        </div>

        <div className="login-body">
          <h2>ADMIN LOGIN</h2>
          <p className="login-subtitle">Enter your credentials to access the system</p>

          {/* Show error if login fails */}
          {error && (
            <div style={{
              background: '#ff000020',
              border: '1px solid #ff4444',
              color: '#ff4444',
              padding: '10px 14px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username/Email</label>
              <input
                type="text"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-footer">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot" className="forgot-password">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;