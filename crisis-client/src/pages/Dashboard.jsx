import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useApp } from '../context/AppCtx';
import { api } from '../services/api';
import Heatmap from '../components/Heatmap';
import VolunteerRegisterModal from '../components/VolunteerRegisterModal';

export default function Dashboard() {
  const { setPage, user } = useApp();
  const [data, setData] = useState({
    alerts: [],
    shelters: [],
    volunteers: [],
    families: [],
    sos: [],
    broadcasts: []
  });
  const [loading, setLoading] = useState(true);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();

    const socket = io('http://localhost:5000');
    
    socket.on('new_sos_alert', (newSOS) => {
      console.log('New SOS received:', newSOS);
      setData(prev => ({
        ...prev,
        sos: [newSOS, ...prev.sos]
      }));
    });

    socket.on('crisis_alert', (alert) => {
      setData(prev => ({
        ...prev,
        alerts: [alert, ...prev.alerts]
      }));
    });

    return () => socket.close();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [alerts, shelters, volunteers, families, sos, broadcasts] = await Promise.all([
        api.alerts.getAll(),
        api.shelters.getAll(),
        api.volunteers.getAll(),
        api.families.getAll(),
        api.sos.getAll(),
        api.broadcasts.getAll()
      ]);
      setData({ alerts, shelters, volunteers, families, sos, broadcasts });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label:'Active Alerts', value: data.alerts.length, change:'Updated live', dir:'up', type:'critical' },
    { label:'Shelters Open', value: data.shelters.length, change: `${data.shelters.filter(s=>s.status==='Near Full').length || 0} near full`, dir:'up', type:'warning' },
    { label:'Volunteers Active', value: data.volunteers.filter(v=>v.status==='Active').length, change: `${data.volunteers.filter(v=>v.status==='Deployed').length || 0} deployed`, dir:'down', type:'good' },
    { label:'Families Tracked', value: data.families.length, change:'Total households', dir:'up', type:'info' },
    { label:'SOS Received', value: data.sos.length, change: `${data.sos.filter(s=>s.status==='active' || s.status==='pending').length} active`, dir:'down', type:'critical' },
    { label:'Broadcasts sent', value: data.broadcasts.length, change: 'Urgent calls', dir:'down', type:'good' },
  ];

  const activityFeed = data.alerts.slice(0, 3).map(a => ({
    time: a.time || new Date(a.createdAt).toLocaleTimeString() || 'recent',
    msg: `Alert: ${a.title} in ${a.district}`,
    type: 'alert'
  })).concat(data.sos.slice(0, 3).map(s => ({
    time: s.time || new Date(s.createdAt).toLocaleTimeString() || 'recent',
    msg: `SOS: Request from ${s.name} at ${s.location?.coordinates ? `${s.location.coordinates[1].toFixed(2)}, ${s.location.coordinates[0].toFixed(2)}` : 'Unknown'}`,
    type: 'sos'
  })));

  return (
    <div>
      <div className="page-title">Situation Overview ({user?.role?.toUpperCase()})</div>
      <div className="page-subtitle">Kerala Flood Response 2026 · Last updated: {new Date().toLocaleTimeString()}</div>

      {user?.role === 'user' && (
        <div className="alert-banner info" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span>🤝</span>
            <div><strong>Want to help?</strong> Register as a volunteer to manage shelters, resources, and respond to emergencies.</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowVolunteerModal(true)}>Register as Volunteer</button>
        </div>
      )}

      <div className="alert-banner danger">
        <span>🚨</span>
        <div><strong>ORANGE ALERT ACTIVE</strong> — Ernakulam, Thrissur districts on high alert. {data.sos.filter(s=>s.status==='active' || s.status==='pending').length} SOS pending. Ensure all shelters are staffed.</div>
      </div>

      <div className="stats-grid">
        {stats.map((s,i)=>(
          <div key={i} className={`stat-card ${s.type}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className={`stat-change ${s.dir}`}>{s.change}</div>
          </div>
        ))}
      </div>

      <div className="grid-main mb-20">
        <div>
          <div className="card mb-16">
            <div className="card-header">
              <div className="card-title">🗺️ Real-time Crisis Heatmap</div>
              <button className="btn btn-outline btn-sm" onClick={()=>setPage('heatmap')}>Full Heatmap</button>
            </div>
            <div style={{height: 280}}>
              <Heatmap height="280px" interactive={false} />
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <div className="card-title">📋 Shelter Capacity Overview</div>
            </div>
            {data.shelters.slice(0, 5).map(s => {
              const pct = Math.round(s.occupied/s.capacity*100);
              const color = pct>=95?'var(--red)':pct>=80?'var(--orange)':'var(--green)';
              return (
                <div key={s._id || s.id} className="shelter-row">
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4}}>
                    <span className="shelter-name">{s.name}</span>
                    <span className="shelter-pct" style={{color}}>{pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width:pct+'%', background:color}}/>
                  </div>
                  <div className="shelter-meta">{s.occupied} / {s.capacity} · {s.district}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="card mb-16">
            <div className="card-header">
              <div className="card-title">⚡ Live Activity</div>
              <span className="inline-flex"><span className="dot dot-green blink"></span><span className="text-sm text-light">Live</span></span>
            </div>
            <div style={{maxHeight:280, overflowY:'auto'}}>
              {activityFeed.map((a,i)=>(
                <div key={i} style={{padding:'8px 0', borderBottom:'1px solid var(--border)', display:'flex', gap:8}}>
                  <span className="font-mono text-light text-sm" style={{flexShrink:0}}>{a.time}</span>
                  <span style={{fontSize:12, color:'var(--text-mid)'}}>{a.msg}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card mb-16">
            <div className="card-header"><div className="card-title">👥 Quick Volunteer Status</div></div>
            {data.volunteers.slice(0,4).map(v=>(
              <div key={v._id || v.id} className="vol-card">
                <div className="vol-avatar">{v.name[0]}</div>
                <div style={{flex:1}}>
                  <div className="vol-name">{v.name}</div>
                  <div className="vol-meta">{v.skill} · {v.district}</div>
                </div>
                <span className={`badge badge-${v.status==='Active'?'active':v.status==='Deployed'?'critical':'inactive'}`}>{v.status}</span>
              </div>
            ))}
            <button className="btn btn-outline btn-sm" style={{width:'100%', marginTop:10}} onClick={()=>setPage('volunteers')}>View All Volunteers</button>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">📢 Urgent Broadcasts</div></div>
            {data.broadcasts.filter(b=>b.urgent).map(b=>(
              <div key={b._id || b.id} style={{padding:'8px 0', borderBottom:'1px solid var(--border)'}}>
                <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:3}}>
                  <span className="badge badge-critical">{b.type}</span>
                  <span style={{fontSize:11, color:'var(--text-light)', fontFamily:'IBM Plex Mono, monospace'}}>{b.time}</span>
                </div>
                <div style={{fontSize:12, fontWeight:600}}>{b.title}</div>
                <div style={{fontSize:11, color:'var(--text-light)'}}>{b.district}</div>
              </div>
            ))}
            <button className="btn btn-outline btn-sm" style={{width:'100%', marginTop:10}} onClick={()=>setPage('broadcast')}>View All Broadcasts</button>
          </div>
        </div>
      </div>

      {showVolunteerModal && (
        <VolunteerRegisterModal 
          onClose={() => setShowVolunteerModal(false)} 
          onRegistered={() => {
            setShowVolunteerModal(false);
            alert('Successfully registered as volunteer! Your access has been upgraded.');
          }} 
        />
      )}
    </div>
  );
}
