import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react';
import './Organizations.css';
import api from '../api/axios';

function Organizations() {
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '', type: 'Hospital', phone: '', email: '', address: ''
  });

  useEffect(() => { fetchOrganizations(); }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await api.get('/organizations');
      setOrganizations(res.data);
    } catch (err) {
      setError('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingOrg(null);
    setFormData({ name: '', type: 'Hospital', phone: '', email: '', address: '' });
    setShowModal(true);
  };

  const openEditModal = (org) => {
    setEditingOrg(org);
    setFormData({
      name: org.name, type: org.type || 'Hospital',
      phone: org.phone || '', email: org.email || '', address: org.address || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOrg) {
        const res = await api.put(`/organizations/${editingOrg.id}`, formData);
        setOrganizations(organizations.map(o => o.id === editingOrg.id ? res.data : o));
      } else {
        const res = await api.post('/organizations', formData);
        setOrganizations([...organizations, res.data]);
      }
      setShowModal(false);
      setEditingOrg(null);
      setFormData({ name: '', type: 'Hospital', phone: '', email: '', address: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save organization');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        await api.delete(`/organizations/${id}`);
        setOrganizations(organizations.filter(org => org.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete organization');
      }
    }
  };

  const filteredOrgs = organizations.filter(org =>
    (org.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (org.type || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="organizations-page">

      {/* Top Bar */}
      <div className="org-topbar">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          Add Organization
        </button>
      </div>

      {loading && <p style={{ color: '#aaa', padding: '20px' }}>Loading...</p>}
      {error && <p style={{ color: '#ef4444', padding: '20px' }}>{error}</p>}

      {/* Grid */}
      <div className="organizations-grid">
        {filteredOrgs.map((org) => (
          <div key={org.id} className="org-card">
            <div className="org-icon"><Building2 size={22} /></div>
            <div className="org-info">
              <h3>{org.name}</h3>
              <p className="org-type">{org.type}</p>
              <p className="org-contact">📞 {org.phone}</p>
              <p className="org-email">✉️ {org.email}</p>
              <p className="org-address">📍 {org.address}</p>
            </div>
            <div className="org-actions">
              <button className="btn-icon" title="Edit" onClick={() => openEditModal(org)}>
                <Edit size={16} />
              </button>
              <button className="btn-icon btn-danger" onClick={() => handleDelete(org.id)} title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {!loading && filteredOrgs.length === 0 && (
          <p style={{ color: '#aaa', padding: '20px' }}>No organizations found</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingOrg ? 'Edit Organization' : 'Add New Organization'}</h3>
              <button onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Organization Name</label>
                <input type="text" value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  <option>Hospital</option>
                  <option>Ambulance Service</option>
                  <option>Fire Department</option>
                  <option>Police</option>
                </select>
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input type="text" value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea value={formData.address} rows="2"
                  onChange={(e) => setFormData({...formData, address: e.target.value})} required />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingOrg ? 'Update Organization' : 'Add Organization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Organizations;