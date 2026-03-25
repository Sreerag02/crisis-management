import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppCtx';
import { api } from '../services/api';

export default function Dashboard() {
  const { setPage } = useApp();
  const [data, setData] = useState({
    alerts: [],
    shelters: [],
    volunteers: [],
    families: [],
    sos: [],
    broadcasts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
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
    { label:'Shelters Open', value: data.shelters.length, change: `${data.shelters.filter(s=>s.status==='Near Full').length} near full`, dir:'up', type:'warning' },
    { label:'Volunteers Active', value: data.volunteers.filter(v=>v.status==='Active').length, change: `${data.volunteers.filter(v=>v.status==='Deployed').length} deployed`, dir:'down', type:'good' },
    { label:'Families Tracked', value: data.families.length, change:'Total households', dir:'up', type:'info' },
    { label:'SOS Received', value: data.sos.length, change: `${data.sos.filter(s=>s.status==='pending').length} pending`, dir:'down', type:'critical' },
    { label:'Broadcasts sent', value: data.broadcasts.length, change: 'Urgent calls', dir:'down', type:'good' },
  ];

  const activityFeed = data.alerts.slice(0, 3).map(a => ({
    time: a.time || 'recent',
    msg: `Alert: ${a.title} in ${a.district}`,
    type: 'alert'
  })).concat(data.sos.slice(0, 3).map(s => ({
    time: s.time || 'recent',
    msg: `SOS: Request from ${s.name} at ${s.location}`,
    type: 'sos'
  })));

  return (
    <div>
      <div className="page-title">Situation Overview</div>
      <div className="page-subtitle">Kerala Flood Response 2026 · Last updated: {new Date().toLocaleTimeString()}</div>
      
      <div className="alert-banner danger">
        <span>🚨</span>
        <div><strong>ORANGE ALERT ACTIVE</strong> — Ernakulam, Thrissur districts on high alert. {data.sos.filter(s=>s.status==='pending').length} SOS pending. Ensure all shelters are staffed.</div>
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
              <div className="card-title">🗺️ District Status Map</div>
              <button className="btn btn-outline btn-sm" onClick={()=>setPage('heatmap')}>Full Heatmap</button>
            </div>
            <div className="map-container" style={{height:260}}>
              <svg width="100%" height="260" style={{background:'linear-gradient(135deg,#c8dcea,#a8c4d4)'}}>
                <rect x="80" y="30" width="120" height="80" rx="8" fill="#f39c12" opacity="0.7" stroke="white" strokeWidth="1.5"/>
                <text x="140" y="70" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Kannur</text>
                <text x="140" y="84" textAnchor="middle" fill="white" fontSize="10">ORANGE</text>
                
                <rect x="100" y="100" width="130" height="80" rx="8" fill="#e67e22" opacity="0.8" stroke="white" strokeWidth="1.5"/>
                <text x="165" y="140" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Kozhikode</text>
                <text x="165" y="154" textAnchor="middle" fill="white" fontSize="10">YELLOW</text>
                
                <rect x="110" y="170" width="130" height="80" rx="8" fill="#e74c3c" opacity="0.85" stroke="white" strokeWidth="2"/>
                <text x="175" y="210" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Thrissur</text>
                <text x="175" y="224" textAnchor="middle" fill="white" fontSize="10">ORANGE</text>
                
                <rect x="160" y="220" width="130" height="80" rx="8" fill="#c0392b" opacity="0.9" stroke="white" strokeWidth="2"/>
                <text x="225" y="260" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">Ernakulam</text>
                <text x="225" y="274" textAnchor="middle" fill="white" fontSize="10">RED ALERT</text>
                
                <rect x="150" y="295" width="120" height="70" rx="8" fill="#27ae60" opacity="0.7" stroke="white" strokeWidth="1.5"/>
                <text x="210" y="328" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">TVM</text>
                <text x="210" y="342" textAnchor="middle" fill="white" fontSize="10">GREEN</text>

                <circle cx="310" cy="50" r="6" fill="white" opacity="0.9"/>
                <text x="320" y="54" fill="white" fontSize="10">Red 🔴</text>
                <circle cx="310" cy="68" r="6" fill="#e74c3c" opacity="0.9"/>
                <text x="320" y="72" fill="white" fontSize="10">Orange</text>
                <circle cx="310" cy="86" r="6" fill="#f39c12" opacity="0.9"/>
                <text x="320" y="90" fill="white" fontSize="10">Yellow</text>
                <circle cx="310" cy="104" r="6" fill="#27ae60" opacity="0.9"/>
                <text x="320" y="108" fill="white" fontSize="10">Safe</text>
              </svg>
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
    </div>
  );
}
