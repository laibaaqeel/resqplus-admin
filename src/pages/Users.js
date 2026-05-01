import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User, Mail, Phone } from 'lucide-react';
import './Users.css';
import api from '../api/axios';

function Users() {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    role: 'paramedic', org_id: '', vehicle_type: 'ambulance'
  });

  useEffect(() => { fetchUsers(); fetchOrganizations(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const res = await api.get('/organizations');
      setOrganizations(res.data);
    } catch (err) {
      console.error('Failed to load organizations', err);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', phone: '', role: 'paramedic', org_id: '', vehicle_type: 'ambulance' });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '', email: user.email || '', password: '',
      phone: user.phone || '', role: user.role || 'paramedic',
      org_id: user.org_id || '', vehicle_type: user.vehicle_type || 'ambulance'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await api.put(`/users/${editingUser.id}`, updateData);
        await fetchUsers();
      } else {
        await api.post('/auth/register', formData);
        await fetchUsers();
      }
      setShowModal(false);
      setEditingUser(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        setUsers(users.filter(u => u.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleStatusToggle = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/users/${user.id}/status`, { status: newStatus });
      setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filteredUsers = users.filter(user =>
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="users-page">

      {/* Top Bar */}
      <div className="users-topbar">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Add User
        </button>
      </div>

      {loading && <p style={{ color: '#aaa', padding: '20px' }}>Loading users...</p>}
      {error && <p style={{ color: '#ef4444', padding: '20px' }}>{error}</p>}

      {/* Table */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Organization</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar"><User size={16} /></div>
                    <p className="user-name">{user.name}</p>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <p><Mail size={12} /> {user.email}</p>
                    <p><Phone size={12} /> {user.phone || 'N/A'}</p>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${(user.role || '').toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.Organization?.name || 'N/A'}</td>
                <td>
                  <span
                    className={`status-badge ${(user.status || '').toLowerCase()}`}
                    onClick={() => handleStatusToggle(user)}
                    style={{ cursor: 'pointer' }}
                    title="Click to toggle"
                  >
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn-icon" onClick={() => openEditModal(user)}><Edit size={14} /></button>
                    <button className="btn-icon btn-danger" onClick={() => handleDelete(user.id)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredUsers.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: '#aaa', padding: '20px' }}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>{editingUser ? 'New Password (leave blank to keep)' : 'Password'}</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!editingUser} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="paramedic">Paramedic</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Organization</label>
                <select value={formData.org_id} onChange={(e) => setFormData({...formData, org_id: e.target.value})}>
                  <option value="">-- Select Organization --</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Vehicle Type</label>
                <select value={formData.vehicle_type} onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}>
                  <option value="ambulance">Ambulance</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="car">Car</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingUser ? 'Update User' : 'Add User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;