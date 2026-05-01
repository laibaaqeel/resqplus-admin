import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Camera, MapPin, Activity } from 'lucide-react';
import './Cameras.css';
import api from '../api/axios';

function Cameras() {
  const [showModal, setShowModal] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '', location: '', latitude: '', longitude: '', fps: 30, status: 'active'
  });

  useEffect(() => { fetchCameras(); }, []);

  const fetchCameras = async () => {
    try {
      const res = await api.get('/cameras');
      setCameras(res.data);
    } catch (err) {
      setError('Failed to load cameras');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCamera(null);
    setFormData({ name: '', location: '', latitude: '', longitude: '', fps: 30, status: 'active' });
    setShowModal(true);
  };

  const openEditModal = (camera) => {
    setEditingCamera(camera);
    setFormData({
      name: camera.name || '',
      location: camera.location || '',
      latitude: camera.latitude || '',
      longitude: camera.longitude || '',
      fps: camera.fps || 30,
      status: camera.status || 'active'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCamera) {
        await api.put(`/cameras/${editingCamera.id}`, formData);
await fetchCameras(); // refresh full list from DB
      } else {
        await api.post('/cameras', formData);
await fetchCameras(); // refresh full list from DB
      }
      setShowModal(false);
      setEditingCamera(null);
      setFormData({ name: '', location: '', latitude: '', longitude: '', fps: 30, status: 'active' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save camera');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this camera?')) {
      try {
        await api.delete(`/cameras/${id}`);
        setCameras(cameras.filter(c => c.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete camera');
      }
    }
  };

  const filteredCameras = cameras.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="cameras-page">

      {/* Top Bar */}
      <div className="cameras-topbar">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search cameras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Add Camera
        </button>
      </div>

      {/* Stats Row */}
      <div className="camera-stats">
        <div className="cam-stat-card">
          <Camera size={20} color="#2563eb" />
          <div>
            <p className="cam-stat-value">{cameras.length}</p>
            <p className="cam-stat-label">Total Cameras</p>
          </div>
        </div>
        <div className="cam-stat-card">
          <Activity size={20} color="#16a34a" />
          <div>
            <p className="cam-stat-value">{cameras.filter(c => c.status === 'active').length}</p>
            <p className="cam-stat-label">Active</p>
          </div>
        </div>
        <div className="cam-stat-card">
          <Activity size={20} color="#dc2626" />
          <div>
            <p className="cam-stat-value">{cameras.filter(c => c.status !== 'active').length}</p>
            <p className="cam-stat-label">Inactive</p>
          </div>
        </div>
        <div className="cam-stat-card">
          <MapPin size={20} color="#f59e0b" />
          <div>
            <p className="cam-stat-value">{cameras.filter(c => c.latitude).length}</p>
            <p className="cam-stat-label">With GPS</p>
          </div>
        </div>
      </div>

      {loading && <p style={{ color: '#aaa', padding: '20px' }}>Loading cameras...</p>}
      {error && <p style={{ color: '#ef4444', padding: '20px' }}>{error}</p>}

      {/* Grid */}
      <div className="cameras-grid">
        {filteredCameras.map((camera) => (
          <div key={camera.id} className="camera-card">
            <div className="camera-card-header">
              <div className="camera-icon">
                <Camera size={20} />
              </div>
              <span className={`cam-status-badge ${camera.status === 'active' ? 'active' : 'inactive'}`}>
                {camera.status}
              </span>
            </div>
            <div className="camera-card-body">
              <h3>{camera.name}</h3>
              <div className="cam-detail">
                <MapPin size={13} color="#888" />
                <span>{camera.location || 'No location'}</span>
              </div>
              <div className="cam-detail">
                <Activity size={13} color="#888" />
                <span>{camera.fps} FPS</span>
              </div>
              {camera.latitude && (
                <div className="cam-detail">
                  <span style={{ fontSize: 11, color: '#aaa' }}>
                    📍 {parseFloat(camera.latitude).toFixed(4)}, {parseFloat(camera.longitude).toFixed(4)}
                  </span>
                </div>
              )}
            </div>
            <div className="camera-card-footer">
              <button className="btn-icon" onClick={() => openEditModal(camera)} title="Edit">
                <Edit size={15} />
              </button>
              <button className="btn-icon btn-danger" onClick={() => handleDelete(camera.id)} title="Delete">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {!loading && filteredCameras.length === 0 && (
          <div className="empty-state">
            <Camera size={40} style={{ opacity: 0.2, marginBottom: 8 }} />
            <p>No cameras found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCamera ? 'Edit Camera' : 'Add New Camera'}</h3>
              <button onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Camera Name</label>
                <input type="text" value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Latitude</label>
                  <input type="number" step="any" value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input type="number" step="any" value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>FPS</label>
                  <input type="number" value={formData.fps}
                    onChange={(e) => setFormData({...formData, fps: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingCamera ? 'Update Camera' : 'Add Camera'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cameras;