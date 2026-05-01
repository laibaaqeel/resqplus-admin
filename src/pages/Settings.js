import React, { useState, useEffect } from 'react';
import { User, Bell, Lock, Globe, Save } from 'lucide-react';
import './Settings.css';
import api from '../api/axios';

function Settings() {
  const [profileData, setProfileData] = useState({ name: '', email: '', phone: '', role: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notifications, setNotifications] = useState({ email: true, sms: true, push: true, accidents: true, system: false });
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
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally { setProfileLoading(false); }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) { alert('Passwords do not match!'); return; }
    if (passwordData.newPassword.length < 6) { alert('Password must be at least 6 characters'); return; }
    setPasswordLoading(true);
    try {
      await api.post('/auth/change-password', { current_password: passwordData.currentPassword, new_password: passwordData.newPassword });
      alert('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update password');
    } finally { setPasswordLoading(false); }
  };

  const handleNotificationChange = (key) => setNotifications({ ...notifications, [key]: !notifications[key] });

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

        {/* Notifications */}
        <div className="settings-card">
          <div className="card-header"><Bell size={18} /><h3>Notification Preferences</h3></div>
          <div className="notification-options">
            {[
              { key: 'email', title: 'Email Notifications', desc: 'Receive alerts via email' },
              { key: 'sms', title: 'SMS Alerts', desc: 'Get SMS for critical incidents' },
              { key: 'push', title: 'Push Notifications', desc: 'Browser push notifications' },
              { key: 'accidents', title: 'Accident Alerts', desc: 'Notify on new accidents' },
              { key: 'system', title: 'System Updates', desc: 'Updates and maintenance alerts' },
            ].map(({ key, title, desc }) => (
              <div className="notification-item" key={key}>
                <div>
                  <p className="notification-title">{title}</p>
                  <p className="notification-desc">{desc}</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={notifications[key]} onChange={() => handleNotificationChange(key)} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            ))}
          </div>
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

        {/* System Preferences */}
        <div className="settings-card">
          <div className="card-header"><Globe size={18} /><h3>System Preferences</h3></div>
          <div className="form-group">
            <label>Language</label>
            <select defaultValue="en"><option value="en">English</option><option value="ur">Urdu</option></select>
          </div>
          <div className="form-group">
            <label>Time Zone</label>
            <select defaultValue="pkt">
              <option value="pkt">Pakistan Standard Time (PKT)</option>
              <option value="utc">UTC</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date Format</label>
            <select defaultValue="dd/mm/yyyy">
              <option value="dd/mm/yyyy">DD/MM/YYYY</option>
              <option value="mm/dd/yyyy">MM/DD/YYYY</option>
            </select>
          </div>
          <button className="btn-primary"><Save size={16} />Save Preferences</button>
        </div>

      </div>
    </div>
  );
}

export default Settings;