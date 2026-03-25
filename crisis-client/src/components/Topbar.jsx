import React from 'react';
import { useApp } from '../context/AppCtx';
import { Icon } from './Icon';

export default function Topbar() {
  const { page, user } = useApp();

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

  return (
    <div className="topbar">
      <div className="topbar-title">{getPageTitle()}</div>
      <div className="topbar-spacer"></div>
      
      <div className="topbar-search">
        <Icon name="search" size={14}/>
        <input placeholder="Search records, alerts…"/>
      </div>

      <button className="topbar-btn">
        <Icon name="notif" size={16}/>
      </button>

      <button className="topbar-btn">
        <Icon name="settings" size={16}/>
      </button>

      <div className="section-divider" style={{height:24, width:1, margin:'0 8px', background:'var(--border)'}}></div>

      <div className="topbar-user">
        <div style={{textAlign:'right', marginRight:8}}>
          <div className="user-name">{user.name}</div>
          <div className="user-role">{user.role}</div>
        </div>
        <div className="user-avatar">{user.avatar}</div>
      </div>
    </div>
  );
}
