import React from 'react';
import './StatCard.css';

function StatCard({ title, value, icon: Icon, color, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-content">
        <div className="stat-info">
          <p className="stat-title">{title}</p>
          <h3 className="stat-value">{value}</h3>
          {trend && (
            <p className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        <div className="stat-icon" style={{ backgroundColor: color }}>
          <Icon size={18} color="white" />
        </div>
      </div>
    </div>
  );
}

export default StatCard;