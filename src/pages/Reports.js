import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import './Reports.css';
import api from '../api/axios';

const SEVERITY_COLORS = {
  low: '#16a34a',
  medium: '#f59e0b',
  high: '#dc2626',
  extreme: '#7c3aed'
};

const STATUS_COLORS = {
  active: '#dc2626',
  resolved: '#16a34a',
  false_alarm: '#6b7280'
};

function Reports() {
  const [monthly, setMonthly] = useState([]);
  const [severity, setSeverity] = useState([]);
  const [status, setStatus] = useState([]);
  const [locations, setLocations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [m, sev, st, loc, sum] = await Promise.all([
        api.get('/reports/monthly'),
        api.get('/reports/severity'),
        api.get('/reports/status'),
        api.get('/reports/locations'),
        api.get('/reports/summary'),
      ]);
      setMonthly(m.data);
      setSeverity(sev.data);
      setStatus(st.data);
      setLocations(loc.data);
      setSummary(sum.data);
    } catch (err) {
      console.error('Reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="reports-page"><p>Loading reports...</p></div>;

  return (
    <div className="reports-page">

      {/* Summary Cards */}
      <div className="report-summary-grid">
        <div className="report-summary-card">
          <div className="rs-icon" style={{ background: '#fee2e2' }}>
            <AlertTriangle size={18} color="#dc2626" />
          </div>
          <div>
            <p className="rs-label">Total Accidents</p>
            <p className="rs-value">{summary?.total ?? 0}</p>
          </div>
        </div>
        <div className="report-summary-card">
          <div className="rs-icon" style={{ background: '#dcfce7' }}>
            <CheckCircle size={18} color="#16a34a" />
          </div>
          <div>
            <p className="rs-label">Total Resolved</p>
            <p className="rs-value">{summary?.resolved ?? 0}</p>
          </div>
        </div>
        <div className="report-summary-card">
          <div className="rs-icon" style={{ background: '#fef9c3' }}>
            <TrendingUp size={18} color="#ca8a04" />
          </div>
          <div>
            <p className="rs-label">Resolution Rate</p>
            <p className="rs-value">{summary?.resolutionRate ?? 0}%</p>
          </div>
        </div>
        <div className="report-summary-card">
          <div className="rs-icon" style={{ background: '#f3f4f6' }}>
            <XCircle size={18} color="#6b7280" />
          </div>
          <div>
            <p className="rs-label">False Alarms</p>
            <p className="rs-value">{summary?.falseAlarm ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Row 1 — Monthly + Severity */}
      <div className="reports-grid">
        <div className="report-card">
          <h3>Monthly Accident Trend</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={monthly} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="count" name="Accidents" fill="#C41E3A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="report-card">
          <h3>Accidents by Severity</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={severity.filter(s => s.count > 0)}
                dataKey="count"
                nameKey="severity"
                cx="50%"
                cy="50%"
                outerRadius={55}
                label={({ severity, count }) => `${severity}: ${count}`}
                labelLine={false}
              >
                {severity.map((entry) => (
                  <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 — Status + Locations */}
      <div className="reports-grid">
        <div className="report-card">
          <h3>Accidents by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={status.filter(s => s.count > 0)}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
              >
                {status.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Pie>
              <Legend
                iconSize={10}
                formatter={(value) => value.replace('_', ' ').toUpperCase()}
                wrapperStyle={{ fontSize: 11 }}
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="report-card">
          <h3>Top Accident Locations</h3>
          {locations.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: 20 }}>No data available</p>
          ) : (
            <div className="locations-list">
              {locations.map((loc, index) => {
                const max = locations[0]?.count || 1;
                const pct = (loc.count / max) * 100;
                return (
                  <div key={index} className="location-row">
                    <span className="location-rank">#{index + 1}</span>
                    <div className="location-info">
                      <div className="location-name-row">
                        <span className="location-name">{loc.location}</span>
                        <span className="location-count">{loc.count} accidents</span>
                      </div>
                      <div className="location-bar-bg">
                        <div
                          className="location-bar-fill"
                          style={{
                            width: `${pct}%`,
                            background: index === 0 ? '#dc2626' : index === 1 ? '#f59e0b' : '#3b82f6'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default Reports;