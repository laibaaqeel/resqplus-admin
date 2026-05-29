import React, { useState } from 'react';
import { Shield, Mail, Lock, LogIn } from 'lucide-react';
import './Login.css';
import api from '../api/axios';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (user.role !== 'admin') {
        setError('Access denied. Admin accounts only.');
        localStorage.clear();
        return;
      }
      onLogin(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="login-brand">
          <div className="brand-icon"><Shield size={20} color="white" /></div>
          <span className="brand-name">RESQ<span className="brand-plus">+</span></span>
        </div>

        <h2 className="login-title">Admin Sign In</h2>
        <p className="login-subtitle">Emergency Response Management System</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                placeholder="admin@resqplus.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="login-field">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="login-spinner" />
            ) : (
              <LogIn size={16} />
            )}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="login-footer">Authorized personnel only</p>
      </div>
    </div>
  );
}

export default Login;
