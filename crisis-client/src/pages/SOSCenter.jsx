import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { api } from '../services/api';
import { useApp } from '../context/AppCtx';

export default function SOSCenter() {
  const { user } = useApp();
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myStatus, setMyStatus] = useState(null);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null);
  const [showSOSForm, setShowSOSForm] = useState(false);
  const [sosForm, setSosForm] = useState({ name: '', mobile: '', aadhaar: '' });

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      if (user) {
        newSocket.emit('join_room', user.id);
      }
    });

    newSocket.on('emergency_sos', (data) => {
      alert(`EMERGENCY: ${data.name} needs help!`);
      fetchSOS();
    });

    fetchSOS();

    return () => newSocket.close();
  }, [user]);

  const fetchSOS = async () => {
    try {
      setLoading(true);
      const data = await api.sos.getAll();
      setSosList(data);
    } catch (error) {
      console.error('Failed to fetch SOS alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSOSClick = () => {
    // If user is logged in, proceed directly
    if (user) {
      sendSOS();
    } else {
      // Show form for anonymous users
      setShowSOSForm(true);
    }
  };

  const sendSOS = async (formData = null) => {
    setSending(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setSending(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const payload = {
          lat: latitude,
          lng: longitude,
          name: formData?.name || user?.name || 'Anonymous',
          mobile: formData?.mobile || user?.mobile || 'N/A',
          aadhaar: formData?.aadhaar || user?.aadhaar || 'N/A'
        };

        const response = await api.sos.trigger(payload);

        setMyStatus('sos_sent');
        setShowSOSForm(false);
        fetchSOS();
        alert('SOS sent successfully! Help is on the way.');
      } catch (error) {
        console.error('Failed to send SOS:', error);
        alert('Failed to send SOS. Please check your connection.');
      } finally {
        setSending(false);
      }
    }, (error) => {
      console.error('Geolocation error:', error);
      alert('Could not get your location. Please enable location services.');
      setSending(false);
    });
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

  const respondToSOS = async (id) => {
    if (!user) {
      alert('Please login as a volunteer to respond to SOS alerts');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/client/sos/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId: user.id || user._id,
          volunteerName: user.name,
          volunteerMobile: user.mobile
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSosList(sosList.map(s => (s._id || s.id) === id ? { ...s, status: 'responding', respondingVolunteer: user } : s));
        alert(`You're now responding to ${data.sos.name}. Please proceed to their location.`);
      }
    } catch (error) {
      console.error('Failed to respond to SOS:', error);
      alert('Failed to record response. Please try again.');
    }
  };

  return (
    <div>
      <div className="page-title">SOS Center ({user?.role?.toUpperCase() || 'GUEST'})</div>
      <div className="page-subtitle">Emergency SOS management and real-time alerts</div>

      <div className="grid-2 mb-20">
        <div className="card" style={{textAlign:'center', padding:30}}>
          <div style={{marginBottom:16}}>
            <div style={{fontWeight:700, fontSize:16, marginBottom:6, color:'var(--navy)'}}>SEND EMERGENCY SOS</div>
            <div style={{fontSize:13, color:'var(--text-light)', marginBottom:20}}>
              Press the SOS button to alert nearest volunteers and authorities with your GPS location.
              {!user && <div style={{marginTop: 8, color: 'var(--orange)'}}>⚠️ You'll be asked for contact details after clicking SOS.</div>}
            </div>
            <div style={{display:'flex', justifyContent:'center', marginBottom:16}}>
              <button className={`sos-btn ${sending ? 'pulse' : ''}`} onClick={handleSOSClick} disabled={sending}>
                <span style={{fontSize:16, fontWeight:900}}>SOS</span>
                <span style={{fontSize:10}}>{sending?'SENDING…':'PRESS'}</span>
              </button>
            </div>
          </div>
          {myStatus==='sos_sent' && (
            <div className="alert-banner danger">
              <span>🚨</span>
              <div><strong>SOS Sent!</strong> Nearest volunteer and admins have been notified. Stay calm and remain at your location.</div>
            </div>
          )}
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
          <div className="card-header"><div className="card-title">🆘 {user?.role === 'admin' ? 'All SOS Alerts' : 'Recent SOS Alerts'}</div></div>
          {loading ? (
            <div style={{textAlign:'center', padding:40, color:'var(--text-light)'}}>Loading requests...</div>
          ) : (
            <>
              {sosList.map(s=>(
                <div key={s._id || s.id} style={{padding:'10px 0', borderBottom:'1px solid var(--border)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <div style={{flex: 1}}>
                      <div style={{display:'flex', gap:6, alignItems:'center', marginBottom:4}}>
                        <span className={`badge ${s.status==='active'?'badge-critical':s.status==='responding'?'badge-warning':'badge-safe'}`}>
                          {s.status === 'responding' ? 'RESPONDING' : s.status.toUpperCase()}
                        </span>
                        <span className="font-mono text-sm text-light">{new Date(s.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div style={{fontWeight:600, fontSize:13}}>{s.name} · {s.mobile}</div>
                      <div className="text-sm text-light">📍 {s.location.coordinates[1].toFixed(4)}, {s.location.coordinates[0].toFixed(4)}</div>
                      {s.respondingVolunteer && (
                        <div className="text-sm" style={{color: 'var(--green)', marginTop: 4}}>
                          ✓ Being helped by: {s.respondingVolunteer.name || 'Volunteer'}
                        </div>
                      )}
                    </div>
                    <div style={{display:'flex', gap:6, flexDirection: 'column'}}>
                      {(user?.role === 'volunteer' || user?.role === 'admin') && s.status==='active' && (
                        <button className="btn btn-warning btn-sm" onClick={()=>respondToSOS(s._id)}>
                          🤝 I'm Responding
                        </button>
                      )}
                      {(user?.role === 'volunteer' || user?.role === 'admin') && s.status==='responding' && (
                        <button className="btn btn-success btn-sm" onClick={()=>updateStatus(s._id, 'resolved')}>
                          ✓ Mark Resolved
                        </button>
                      )}
                      {user?.role !== 'user' && s.status==='active' && (
                        <button className="btn btn-success btn-sm" onClick={()=>updateStatus(s._id, 'resolved')}>
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {sosList.length===0 && <div style={{textAlign:'center', padding:40, color:'var(--text-light)'}}>No active SOS requests.</div>}
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">📡 Real-time Response Network</div></div>
        <div className="grid-3">
          {[
            {icon:'🛰️', title:'GPS Tracking', desc:'High precision location capture for rescue teams.'},
            {icon:'🤝', title:'Volunteer Sync', desc:'Real-time notification to the nearest available volunteer.'},
            {icon:'📧', title:'Family Alerts', desc:'Automated email alerts to registered family members.'},
          ].map((f,i)=>(
            <div key={i} style={{padding:'14px', border:'1px solid var(--border)', borderRadius:6}}>
              <div style={{fontSize:24, marginBottom:8}}>{f.icon}</div>
              <div style={{fontWeight:700, fontSize:13, marginBottom:4}}>{f.title}</div>
              <div className="text-sm text-light">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SOS Form Modal for Anonymous Users */}
      {showSOSForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowSOSForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">🚨 Emergency SOS Details</div>
              <button className="modal-close" onClick={() => setShowSOSForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert-banner danger" style={{marginBottom: 16}}>
                <span>⚠️</span>
                <div>Please provide your details so rescuers can contact you.</div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input 
                  className="form-control" 
                  value={sosForm.name} 
                  onChange={e => setSosForm({...sosForm, name: e.target.value})}
                  placeholder="Your name"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input 
                  className="form-control" 
                  value={sosForm.mobile} 
                  onChange={e => setSosForm({...sosForm, mobile: e.target.value})}
                  placeholder="Your phone number"
                  type="tel"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Aadhaar Number (Optional)</label>
                <input 
                  className="form-control" 
                  value={sosForm.aadhaar} 
                  onChange={e => setSosForm({...sosForm, aadhaar: e.target.value})}
                  placeholder="Aadhaar number"
                />
              </div>

              <div className="alert-banner info">
                <span>ℹ️</span>
                <div>After submitting, we'll get your GPS location automatically. Please stay where you are for rescue.</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowSOSForm(false)}>Cancel</button>
              <button 
                className="btn btn-danger" 
                onClick={() => sendSOS(sosForm)}
                disabled={!sosForm.name || !sosForm.mobile || sending}
              >
                {sending ? 'Sending SOS...' : '🚨 Send SOS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
