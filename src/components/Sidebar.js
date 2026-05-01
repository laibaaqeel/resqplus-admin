import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, AlertTriangle, Settings, Shield, BarChart2, Camera } from 'lucide-react';
import './Sidebar.css';

function Sidebar() {
  const menuItems = [
    { path: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/organizations', icon: Building2,        label: 'Organizations' },
    { path: '/users',         icon: Users,            label: 'Users' },
    { path: '/accidents',     icon: AlertTriangle,    label: 'Accidents' },
    { path: '/cameras',       icon: Camera,           label: 'Cameras' },
    { path: '/reports',       icon: BarChart2,        label: 'Reports' },
    { path: '/settings',      icon: Settings,         label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Shield size={32} color="white" />
        <h2>RESQ+</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>RESQ+ v1.0</p>
        <p>Emergency Response System</p>
      </div>
    </div>
  );
}

export default Sidebar;