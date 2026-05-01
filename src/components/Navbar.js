import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, LogOut, User, ChevronDown, AlertTriangle, CheckCircle } from 'lucide-react';
import './Navbar.css';
import api from '../api/axios';
import socket from '../socket';

function Navbar({ onLogout, user }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const notifRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen for new accidents via socket
  useEffect(() => {
    socket.on('new_accident', (data) => {
      const newNotif = {
        id: Date.now(),
        message: `New accident at ${data.accident.location}`,
        is_read: false,
        created_at: new Date().toISOString(),
        accident_id: data.accident.id,
      };
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    return () => socket.off('new_accident');
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/users/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/users/notifications/mark-read');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const getTimeAgo = (timestamp) => {
    const diff = Math.floor((Date.now() - new Date(timestamp)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString('en-PK');
  };

  const getPageTitle = () => {
    switch(location.pathname) {
      case '/dashboard':     return { title: 'Dashboard Overview',        subtitle: 'Real-time system monitoring' };
      case '/organizations': return { title: 'Organizations Management',  subtitle: 'Manage emergency response organizations' };
      case '/users':         return { title: 'Users Management',          subtitle: 'Manage paramedic staff and administrators' };
      case '/accidents':     return { title: 'Accident History',          subtitle: 'View and manage accident reports' };
      case '/cameras':       return { title: 'Cameras Management',        subtitle: 'Manage CCTV cameras and detection points' };
      case '/reports':       return { title: 'Reports & Analytics',       subtitle: 'System performance and accident statistics' };
      case '/settings':      return { title: 'Settings',                  subtitle: 'Manage your account and system preferences' };
      default:               return { title: 'Dashboard Overview',        subtitle: 'Real-time system monitoring' };
    }
  };

  const pageInfo = getPageTitle();
  const userName = user?.name || JSON.parse(localStorage.getItem('user') || '{}')?.name || 'Admin User';

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1>{pageInfo.title}</h1>
        <p className="navbar-date">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="navbar-right">

        {/* Notification Bell */}
        <div className="notif-wrapper" ref={notifRef}>
          <button
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button className="mark-read-btn" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <CheckCircle size={24} style={{ opacity: 0.3 }} />
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notif) => (
                    <div key={notif.id} className={`notif-item ${!notif.is_read ? 'unread' : ''}`}>
                      <div className="notif-icon">
                        <AlertTriangle size={14} color="#dc2626" />
                      </div>
                      <div className="notif-content">
                        <p className="notif-message">{notif.message}</p>
                        <p className="notif-time">{getTimeAgo(notif.created_at)}</p>
                      </div>
                      {!notif.is_read && <div className="notif-dot" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="user-menu" ref={dropdownRef}>
          <button className="user-btn" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="user-avatar"><User size={18} /></div>
            <span>{userName}</span>
            <ChevronDown size={16} />
          </button>

          {showDropdown && (
            <div className="dropdown-menu">
              <button className="dropdown-item">
                <User size={16} /> Profile
              </button>
              <button className="dropdown-item" onClick={onLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;