import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function SOSCenter() {
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myStatus, setMyStatus] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchSOS();
  }, []);

  const fetchSOS = async () => {
    try {
      setLoading(true);
      // We use the client SOS endpoint for listing for now, or if it's admin SOS alerts
      const data = await api.sos.getAll();
      setSosList(data);
    } catch (error) {
      console.error('Failed to fetch SOS alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendSOS = async () => {
    setSending(true);
    try {
      const newSOS = await api.sos.trigger({
        name: 'Citizen (You)',
        location: 'Current GPS Coordinates',
        type: 'SOS Signal',
        members: 1,
        time: new Date().toLocaleTimeString().slice(0, 5),
        status: 'pending'
      });
      setSosList([newSOS, ...sosList]);
      setMyStatus('sos_sent');
    } catch (error) {
      console.error('Failed to send SOS:', error);
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/sos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setSosList(sosList.map(s => (s._id || s.id) === id ? { ...s, status } : s));
      }
    } catch (error) {
      console.error('Failed to update SOS status:', error);
    }
  };

  return (
    <div>
      <div className="page-title">SOS Center</div>
      <div className="page-subtitle">Emergency SOS management and offline signal tracking</div>

      <div className="grid-2 mb-20">
        <div className="card" style={{textAlign:'center', padding:30}}>
          <div style={{marginBottom:16}}>
            <div style={{fontWeight:700, fontSize:16, marginBottom:6, color:'var(--navy)'}}>SEND EMERGENCY SOS</div>
            <div style={{fontSize:13, color:'var(--text-light)', marginBottom:20}}>Press the SOS button to alert nearest volunteers and authorities with your GPS location.</div>
            <div style={{display:'flex', justifyContent:'center', marginBottom:16}}>
              <button className="sos-btn" onClick={sendSOS} disabled={sending}>
                <span style={{fontSize:16, fontWeight:900}}>SOS</span>
                <span style={{fontSize:10}}>{sending?'SENDING…':'PRESS'}</span>
              </button>
            </div>
          </div>
          {myStatus==='sos_sent' && <div className="alert-banner danger"><span>🚨</span><div><strong>SOS Sent!</strong> Nearest volunteer has been notified. Stay calm and remain at your location.</div></div>}
          <div className="section-divider"/>
          <div style={{fontWeight:600, fontSize:13, marginBottom:10}}>Update Your Status</div>
          <div className="family-status-btns">
            {[{key:'safe', icon:'✅', label:'Safe'},{key:'assist', icon:'⚠️', label:'Need Help'},{key:'danger', icon:'🆘', label:'Emergency'}].map(s=>(
              <div key={s.key} className={`status-btn ${s.key} ${myStatus===s.key?'selected':''}`} onClick={()=>setMyStatus(s.key)}>
                <span className="status-btn-icon">{s.icon}</span>
                <span className="status-btn-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">🆘 Incoming SOS Requests</div></div>
          {loading ? (
            <div style={{textAlign:'center', padding:40, color:'var(--text-light)'}}>Loading requests...</div>
          ) : (
            <>
              {sosList.map(s=>(
                <div key={s._id || s.id} style={{padding:'10px 0', borderBottom:'1px solid var(--border)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <div>
                      <div style={{display:'flex', gap:6, alignItems:'center', marginBottom:4}}>
                        <span className={`badge ${s.status==='pending'?'badge-critical':s.status==='responded'?'badge-high':'badge-safe'}`}>{s.status.toUpperCase()}</span>
                        <span className="font-mono text-sm text-light">{s.time}</span>
                      </div>
                      <div style={{fontWeight:600, fontSize:13}}>{s.name} · {s.type}</div>
                      <div className="text-sm text-light">📍 {s.location}{s.members?` · 👥 ${s.members} members`:''}</div>
                    </div>
                    {s.status==='pending' && (
                      <button className="btn btn-danger btn-sm" onClick={()=>updateStatus(s._id || s.id, 'responded')}>Respond</button>
                    )}
                    {s.status==='responded' && (
                      <button className="btn btn-success btn-sm" onClick={()=>updateStatus(s._id || s.id, 'resolved')}>Resolve</button>
                    )}
                  </div>
                </div>
              ))}
              {sosList.length===0 && <div style={{textAlign:'center', padding:40, color:'var(--text-light)'}}>No incoming SOS requests.</div>}
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">📡 Offline SOS Functionality</div></div>
        <div className="grid-3">
          {[
            {icon:'📶', title:'SMS Fallback', desc:'SOS triggers SMS to local emergency number when internet is unavailable.'},
            {icon:'📻', title:'Local Broadcast', desc:'SMS alerts sent to nearest registered volunteers within 5km radius.'},
            {icon:'🗺️', title:'Last Known Location', desc:'GPS coordinates cached locally and transmitted when connectivity restores.'},
          ].map((f,i)=>(
            <div key={i} style={{padding:'14px', border:'1px solid var(--border)', borderRadius:6}}>
              <div style={{fontSize:24, marginBottom:8}}>{f.icon}</div>
              <div style={{fontWeight:700, fontSize:13, marginBottom:4}}>{f.title}</div>
              <div className="text-sm text-light">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
