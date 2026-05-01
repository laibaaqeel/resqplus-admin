import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, AlertTriangle } from 'lucide-react';
import './Accidents.css';
import api from '../api/axios';

function Accidents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [accidents, setAccidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccidents();
  }, []);

  const fetchAccidents = async () => {
    try {
      const res = await api.get('/accidents');
      setAccidents(res.data);
    } catch (err) {
      setError('Failed to load accidents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/accidents/${id}/status`, { status: newStatus });
      setAccidents(accidents.map(a =>
        a.id === id ? { ...a, status: newStatus } : a
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const d = new Date(timestamp);
    return {
      date: d.toLocaleDateString('en-PK'),
      time: d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'extreme':
      case 'high':   return '#dc2626';
      case 'medium': return '#f59e0b';
      default:       return '#10b981';
    }
  };

  const filteredAccidents = accidents.filter(accident => {
    const matchesSearch =
      (accident.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(accident.id).includes(searchTerm);
    const matchesFilter =
      filterStatus === 'All' ||
      (accident.status || '').toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="accidents-page">
     

      <div className="filters-row">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by location or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={20} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="false_alarm">False Alarm</option>
          </select>
        </div>
      </div>

      {loading && <p style={{ color: '#aaa', padding: '20px' }}>Loading accidents...</p>}
      {error && <p style={{ color: '#ef4444', padding: '20px' }}>{error}</p>}

      <div className="accidents-list">
        {!loading && filteredAccidents.length === 0 && (
          <p style={{ color: '#aaa', padding: '20px' }}>No accidents found</p>
        )}

        {filteredAccidents.map((accident) => {
          const { date, time } = formatDateTime(accident.timestamp);
          return (
            <div key={accident.id} className="accident-card">
              <div className="accident-header">
                <div className="accident-id-section">
                  <AlertTriangle size={24} color={getSeverityColor(accident.severity)} />
                  <div>
                    <h3>ACC-{String(accident.id).padStart(3, '0')}</h3>
                    <span className={`severity-badge ${accident.severity?.toLowerCase()}`}>
                      {accident.severity} Severity
                    </span>
                  </div>
                </div>
                <span className={`status-pill ${accident.status?.toLowerCase()}`}>
                  {accident.status}
                </span>
              </div>

              <div className="accident-details">
                <div className="detail-item">
                  <MapPin size={16} />
                  <span>{accident.location || 'Unknown location'}</span>
                </div>
                <div className="detail-item">
                  <Clock size={16} />
                  <span>{date} at {time}</span>
                </div>
                {accident.description && (
                  <div className="detail-item">
                    <AlertTriangle size={16} />
                    <span>{accident.description}</span>
                  </div>
                )}
              </div>

              <div className="accident-footer">
                <div className="response-info">
                  <p className="response-label">Camera</p>
                  <p className="response-value">Camera #{accident.camera_id || 'N/A'}</p>
                </div>
                <div className="response-time">
                  <p className="response-label">Update Status</p>
                  <select
                    value={accident.status}
                    onChange={(e) => handleStatusUpdate(accident.id, e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                    <option value="false_alarm">False Alarm</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Accidents;