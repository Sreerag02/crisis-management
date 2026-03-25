import React from 'react';
import { useApp } from '../context/AppCtx';
import { Icon } from './Icon';

export default function Sidebar() {
  const { page, setPage } = useApp();
  
  const nav = [
    { label:'Dashboard', key:'dashboard', icon:'dashboard' },
    { label:'Active Alerts', key:'alerts', icon:'alert', badge:'3' },
    { label:'Volunteers', key:'volunteers', icon:'volunteer' },
    { label:'Shelters', key:'shelters', icon:'shelter' },
    { label:'Resources', key:'resource', icon:'resource' },
    { label:'Family Safety', key:'family', icon:'family' },
    { label:'Broadcasts', key:'broadcast', icon:'broadcast', badge:'2' },
    { label:'Risk Heatmap', key:'heatmap', icon:'heatmap' },
    { label:'SOS Center', key:'sos', icon:'sos' },
  ];

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
        <div className="sidebar-label">Navigation</div>
        {nav.map(n => (
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
