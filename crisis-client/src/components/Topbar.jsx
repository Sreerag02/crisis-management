import React from 'react';
import { useApp } from '../context/AppCtx';
import { Icon } from './Icon';

export default function Topbar() {
  const { page, user, logout } = useApp();

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Situation Overview',
      alerts: 'Active Alerts',
      volunteers: 'Volunteer Management',
      shelters: 'Shelter Management',
      resource: 'Resource Tracking',
      family: 'Family Safety Tracker',
      broadcast: 'Broadcast Center',
      heatmap: 'Risk Heatmap',
      sos: 'SOS Center'
    };
    return titles[page] || 'CrisisNet';
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div className="topbar">
      <div className="topbar-title">{getPageTitle()}</div>
      <div className="topbar-spacer"></div>

      <div className="topbar-search">
        <Icon name="search" size={14}/>
        <input placeholder="Search records, alerts…"/>
      </div>

      <button 
        className="btn btn-outline" 
        onClick={handleLogout}
        style={{
          marginRight: '16px',
          padding: '6px 12px',
          fontSize: '12px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          background: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <Icon name="logout" size={14} />
        Logout
      </button>

      <div className="topbar-user">
        <div style={{textAlign:'right', marginRight:8}}>
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{user?.role?.toUpperCase()}</div>
        </div>
        <div className="user-avatar">{user?.avatar}</div>
      </div>
    </div>
  );
}
