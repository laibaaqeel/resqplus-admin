import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { AlertTriangle, Bell, Activity, Users } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Dashboard.css';
import api from '../api/axios';
import socket from '../socket';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const redIcon    = createIcon('#dc2626');
const greenIcon  = createIcon('#16a34a');
const yellowIcon = createIcon('#f59e0b');

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentAccidents, setRecentAccidents] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Fetch data on mount + every 30s
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Socket.IO real-time
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    socket.emit('join_room', user.id);

    socket.on('new_accident', (data) => {
      const accident = data.accident;

      // Add to feed instantly
      setRecentAccidents(prev => [accident, ...prev]);

      // Add to map
      setMapData(prev => [accident, ...prev]);

      // Update stats
      setStats(prev => prev ? {
        ...prev,
        activeEmergencies: prev.activeEmergencies + 1,
        accidentsToday: prev.accidentsToday + 1,
        totalAccidents: prev.totalAccidents + 1,
      } : prev);

      // Show popup alert
      setAlert(accident);
      setTimeout(() => setAlert(null), 6000);
    });

    return () => { socket.off('new_accident'); };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, accidentsRes, mapRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/accidents/recent'),
        api.get('/dashboard/map-data'),
      ]);
      setStats(statsRes.data);
      setRecentAccidents(accidentsRes.data);
      setMapData(mapRes.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    const diff = Math.floor((Date.now() - new Date(timestamp)) / 1000);
    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return new Date(timestamp).toLocaleDateString('en-PK');
  };

  const getMarkerIcon = (severity, status) => {
    if (status === 'resolved') return greenIcon;
    if (severity === 'extreme' || severity === 'high') return redIcon;
    return yellowIcon;
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'extreme': return '#7c3aed';
      case 'high':    return '#dc2626';
      case 'medium':  return '#f59e0b';
      default:        return '#16a34a';
    }
  };

  const resolvedCount = recentAccidents.filter(a => a.status === 'resolved').length;
  const resolutionRate = recentAccidents.length > 0
    ? Math.round((resolvedCount / recentAccidents.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#888' }}>
          <Activity size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Accidents Today',      value: stats?.accidentsToday ?? 0,      icon: AlertTriangle, color: '#dc2626' },
    { title: 'Active Emergencies',   value: stats?.activeEmergencies ?? 0,   icon: Activity,      color: '#f59e0b' },
    { title: 'Total Resolved',       value: stats?.totalResolved ?? 0,       icon: Bell,          color: '#16a34a' },
    { title: 'Available Paramedics', value: stats?.availableParamedics ?? 0, icon: Users,         color: '#2563eb' },
    { title: 'Total Accidents',      value: stats?.totalAccidents ?? 0,      icon: AlertTriangle, color: '#7c3aed' },
    { title: 'Total Paramedics',     value: stats?.totalParamedics ?? 0,     icon: Users,         color: '#0891b2' },
  ];

  return (
    <div className="dashboard">

      {/* Real-time Alert Popup */}
      {alert && (
        <div className="realtime-alert">
          <div className="alert-icon">🚨</div>
          <div className="alert-content">
            <p className="alert-title">NEW ACCIDENT DETECTED</p>
            <p className="alert-location">{alert.location}</p>
            <p className="alert-severity">Severity: {alert.severity?.toUpperCase()}</p>
          </div>
          <button className="alert-close" onClick={() => setAlert(null)}>×</button>
        </div>
      )}

      {/* Row 1 — Stats */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Row 2 — Resolution Rate */}
      <div className="resolution-banner">
        <div className="resolution-info">
          <span className="resolution-label">Resolution Rate</span>
          <span className="resolution-value">{resolutionRate}%</span>
        </div>
        <div className="resolution-bar-bg">
          <div
            className="resolution-bar-fill"
            style={{
              width: `${resolutionRate}%`,
              background: resolutionRate > 70 ? '#16a34a' : resolutionRate > 40 ? '#f59e0b' : '#dc2626'
            }}
          />
        </div>
        <div className="resolution-meta">
          {resolvedCount} resolved out of {recentAccidents.length} recent accidents
        </div>
      </div>

      {/* Row 3 — Main Grid */}
      <div className="dashboard-main">

        {/* Left — Map */}
        <div className="map-card">
          <div className="card-title-row">
            <h3>Live Accident Map — Lahore</h3>
            <div className="map-legend-inline">
              <span><span className="dot red"></span> Active/High</span>
              <span><span className="dot yellow"></span> Medium</span>
              <span><span className="dot green"></span> Resolved</span>
            </div>
          </div>
          <div className="map-container">
            <MapContainer
              center={[31.5204, 74.3587]}
              zoom={12}
              style={{ width: '100%', height: '100%', borderRadius: '8px' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapData.map((accident) => (
                <Marker
                  key={accident.id}
                  position={[parseFloat(accident.latitude), parseFloat(accident.longitude)]}
                  icon={getMarkerIcon(accident.severity, accident.status)}
                >
                  <Popup>
                    <div style={{ minWidth: 180 }}>
                      <strong style={{ color: getSeverityColor(accident.severity) }}>
                        {accident.severity?.toUpperCase()} SEVERITY
                      </strong>
                      <p style={{ margin: '6px 0 2px' }}>📍 {accident.location}</p>
                      <p style={{ margin: '2px 0' }}>Status: <strong>{accident.status}</strong></p>
                      <p style={{ margin: '2px 0', fontSize: 12, color: '#666' }}>
                        {new Date(accident.timestamp).toLocaleString('en-PK')}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Top Right — Feed */}
        <div className="feed-card">
          <h3>Live Accident Feed</h3>
          <div className="accident-feed">
            {recentAccidents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: '#aaa' }}>
                <AlertTriangle size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                <p>No recent accidents</p>
              </div>
            ) : (
              recentAccidents.map((accident) => (
                <div key={accident.id} className="accident-item">
                  <div className="accident-severity-bar" style={{ background: getSeverityColor(accident.severity) }} />
                  <div className="accident-icon">
                    <AlertTriangle size={14} color={getSeverityColor(accident.severity)} />
                  </div>
                  <div className="accident-details">
                    <p className="accident-location">{accident.location}</p>
                    <div className="accident-meta">
                      <span className="accident-time">{getTimeAgo(accident.timestamp)}</span>
                      <span className="accident-severity-tag" style={{ background: getSeverityColor(accident.severity) + '20', color: getSeverityColor(accident.severity) }}>
                        {accident.severity}
                      </span>
                    </div>
                  </div>
                  <span className={`accident-status ${accident.status?.toLowerCase()}`}>
                    {accident.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Right — 3 mini panels */}
        <div className="bottom-panels">
          <div className="dashboard-card">
            <h4>Accidents by Severity</h4>
            <div className="severity-breakdown">
              {['extreme', 'high', 'medium', 'low'].map(sev => {
                const count = recentAccidents.filter(a => a.severity === sev).length;
                const pct = recentAccidents.length > 0 ? (count / recentAccidents.length) * 100 : 0;
                return (
                  <div key={sev} className="severity-row">
                    <span className="severity-label">{sev.charAt(0).toUpperCase() + sev.slice(1)}</span>
                    <div className="severity-bar-bg">
                      <div className="severity-bar-fill" style={{ width: `${pct}%`, background: getSeverityColor(sev) }} />
                    </div>
                    <span className="severity-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dashboard-card">
            <h4>System Status</h4>
            <div className="system-status-list">
              <div className="system-status-item">
                <span className="status-dot green-dot"></span>
                <span>Backend Server</span>
                <span className="status-ok">Operational</span>
              </div>
              <div className="system-status-item">
                <span className="status-dot green-dot"></span>
                <span>Database</span>
                <span className="status-ok">Connected</span>
              </div>
              <div className="system-status-item">
                <span className="status-dot green-dot"></span>
                <span>YOLO Detection</span>
                <span className="status-ok">Active</span>
              </div>
              <div className="system-status-item">
                <span className="status-dot green-dot"></span>
                <span>Emergency Alerts</span>
                <span className="status-ok">Live</span>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <h4>Paramedic Overview</h4>
            <div className="paramedic-overview">
              <div className="paramedic-stat">
                <span className="p-stat-value" style={{ color: '#2563eb' }}>{stats?.totalParamedics ?? 0}</span>
                <span className="p-stat-label">Total</span>
              </div>
              <div className="paramedic-stat">
                <span className="p-stat-value" style={{ color: '#16a34a' }}>{stats?.availableParamedics ?? 0}</span>
                <span className="p-stat-label">Available</span>
              </div>
              <div className="paramedic-stat">
                <span className="p-stat-value" style={{ color: '#f59e0b' }}>
                  {(stats?.totalParamedics ?? 0) - (stats?.availableParamedics ?? 0)}
                </span>
                <span className="p-stat-label">On Duty</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;