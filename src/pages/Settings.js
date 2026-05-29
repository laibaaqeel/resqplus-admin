import React, { useState, useEffect } from 'react';
import { User, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import './Settings.css';
import api from '../api/axios';

function Settings() {
  const [profileData, setProfileData] = useState({ name: '', email: '', phone: '', role: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        const user = res.data;
        setProfileData({ name: user.name || '', email: user.email || '', phone: user.phone || '', role: user.role || '' });
      } catch (err) { console.error('Failed to load profile', err); }
    };
    fetchProfile();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await api.put('/auth/update-profile', { name: profileData.name, phone: profileData.phone });
      const saved = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...saved, name: profileData.name }));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setProfileLoading(false); }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwordData.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setPasswordLoading(true);
    try {
      await api.post('/auth/change-password', { current_password: passwordData.currentPassword, new_password: passwordData.newPassword });
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally { setPasswordLoading(false); }
  };

  return (
    <div className="settings-page">
      <div className="settings-grid">

        {/* Profile */}
        <div className="settings-card">
          <div className="card-header"><User size={18} /><h3>Profile Information</h3></div>
          <form onSubmit={handleProfileSave}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={profileData.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input type="text" value={profileData.role} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
            <button type="submit" className="btn-primary" disabled={profileLoading}>
              <Save size={16} />{profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="settings-card">
          <div className="card-header"><Lock size={18} /><h3>Change Password</h3></div>
          <form onSubmit={handlePasswordUpdate}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" placeholder="Enter current password" value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" placeholder="Enter new password" value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" placeholder="Confirm new password" value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} required />
            </div>
            <button type="submit" className="btn-primary" disabled={passwordLoading}>
              <Lock size={16} />{passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Settings;