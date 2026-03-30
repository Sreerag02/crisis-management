import React from 'react';
import { useApp } from '../context/AppCtx';
import { Icon } from './Icon';

export default function Sidebar() {
  const { page, setPage, user } = useApp();

  const allNav = [
    { label:'Dashboard', key:'dashboard', icon:'dashboard', roles: ['admin', 'user', 'volunteer'] },
    { label:'Active Alerts', key:'alerts', icon:'alert', badge:'3', roles: ['admin', 'user', 'volunteer'] },
    { label:'Volunteers', key:'volunteers', icon:'volunteer', roles: ['admin'] },
    { label:'Shelters', key:'shelters', icon:'shelter', roles: ['admin', 'volunteer'] },
    { label:'Resources', key:'resource', icon:'resource', roles: ['admin', 'volunteer'] },
    { label:'Family Safety', key:'family', icon:'family', roles: ['user'] },
    { label:'Broadcasts', key:'broadcast', icon:'broadcast', badge:'2', roles: ['admin', 'volunteer'] },
    { label:'Risk Heatmap', key:'heatmap', icon:'heatmap', roles: ['admin', 'user', 'volunteer'] },
    { label:'SOS Center', key:'sos', icon:'sos', roles: ['user', 'volunteer'] },
  ];

  const filteredNav = allNav.filter(n => n.roles.includes(user?.role));

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <div className="brand-icon">🛡️</div>
          <div>
            <div className="brand-name">CrisisNet</div>
            <div className="brand-sub">INDIA · NDMA</div>
          </div>
        </div>
      </div>
      <div className="sidebar-section">
        <div className="sidebar-label">Navigation ({user?.role?.toUpperCase()})</div>
        {filteredNav.map(n => (
          <div key={n.key} className={`nav-item ${page===n.key?'active':''}`} onClick={()=>setPage(n.key)}>
            <span className="nav-icon"><Icon name={n.icon} size={15}/></span>
            <span>{n.label}</span>
            {n.badge && <span className="nav-badge">{n.badge}</span>}
          </div>
        ))}
      </div>
      <div className="sidebar-footer">
        <div className="alert-level">
          <div className="alert-level-label">Current Alert Level</div>
          <div className="alert-level-value">
            <span className="dot dot-red blink"></span>
            ORANGE ALERT
          </div>
        </div>
      </div>
    </div>
  );
}
