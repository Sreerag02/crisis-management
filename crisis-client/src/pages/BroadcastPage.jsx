import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';

export default function BroadcastPage() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({type:'Donation', title:'', district:'', urgent:false, message:''});

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const data = await api.broadcasts.getAll();
      setBroadcasts(data);
    } catch (error) {
      console.error('Failed to fetch broadcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.title) return;
    try {
      const newBroadcast = await api.broadcasts.create({
        ...form,
        time: new Date().toLocaleTimeString().slice(0, 5)
      });
      setBroadcasts([newBroadcast, ...broadcasts]);
      setShowAdd(false);
      setForm({type:'Donation', title:'', district:'', urgent:false, message:''});
    } catch (error) {
      console.error('Failed to create broadcast:', error);
    }
  };

  const handleArchive = async (id) => {
    try {
      await api.broadcasts.delete(id);
      setBroadcasts(broadcasts.filter(b => (b._id || b.id) !== id));
    } catch (error) {
      console.error('Failed to archive broadcast:', error);
    }
  };

  const modalFooter = (
    <>
      <button className="btn btn-outline" onClick={()=>setShowAdd(false)}>Cancel</button>
      <button className="btn btn-primary" onClick={handleAdd}>📢 Broadcast Now</button>
    </>
  );

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16}}>
        <div>
          <div className="page-title">Citizen Help & Donation Broadcast</div>
          <div className="page-subtitle">Geo-targeted broadcasts for emergency needs and volunteer calls</div>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowAdd(true)}>📢 New Broadcast</button>
      </div>

      <div className="alert-banner info" style={{marginBottom:16}}>
        <span>📡</span><div>Broadcasts are geo-targeted to citizens and volunteers within the selected district. Urgent broadcasts trigger push notifications and SMS.</div>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        {loading ? (
          <div style={{textAlign:'center', padding:40, color:'var(--text-light)'}}>Loading broadcasts...</div>
        ) : (
          <>
            {broadcasts.map(b=>(
              <div key={b._id || b.id} className="card">
                <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
                      <span className={`badge ${b.type==='Donation'?'badge-active':'badge-critical'}`}>{b.type}</span>
                      {b.urgent && <span className="badge badge-critical">🔴 URGENT</span>}
                      <span className="tag">📍 {b.district}</span>
                      <span className="font-mono text-light text-sm">{b.time}</span>
                    </div>
                    <div style={{fontWeight:600, fontSize:14, color:'var(--navy)', marginBottom:4}}>{b.title}</div>
                    <div style={{fontSize:13, color:'var(--text-mid)', lineHeight:1.5}}>{b.message}</div>
                  </div>
                  <div style={{display:'flex', gap:6}}>
                    <button className="btn btn-success btn-sm">✓ Respond</button>
                    <button className="btn btn-outline btn-sm" onClick={()=>handleArchive(b._id || b.id)}>Archive</button>
                  </div>
                </div>
              </div>
            ))}
            {broadcasts.length===0 && <div style={{textAlign:'center', padding:40, color:'var(--text-light)'}}>No active broadcasts.</div>}
          </>
        )}
      </div>

      {showAdd && (
        <Modal title="New Broadcast" onClose={()=>setShowAdd(false)} footer={modalFooter}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Broadcast Type</label>
              <select className="form-control" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
                <option>Donation</option><option>Volunteer</option><option>Information</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">District</label>
              <select className="form-control" value={form.district} onChange={e=>setForm({...form, district:e.target.value})}>
                <option value="">Select</option>
                {['Thiruvananthapuram','Ernakulam','Thrissur','Kozhikode','Kannur','Palakkad'].map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Broadcast Title</label>
            <input className="form-control" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Clear, actionable title"/>
          </div>
          <div className="form-group">
            <label className="form-label">Message Details</label>
            <textarea className="form-control" value={form.message} onChange={e=>setForm({...form, message:e.target.value})} placeholder="Provide specific details about the need, location, quantity required…"/>
          </div>
          <label style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, fontWeight:600}}>
            <input type="checkbox" checked={form.urgent} onChange={e=>setForm({...form, urgent:e.target.checked})}/>
            Mark as URGENT (triggers SMS + push notification)
          </label>
        </Modal>
      )}
    </div>
  );
}
