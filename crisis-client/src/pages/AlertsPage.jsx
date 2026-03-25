import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AlertsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({district:'', severity:'medium', title:'', message:''});
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.alerts.getAll();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const sevClass = s => ({critical:'badge-critical', high:'badge-high', medium:'badge-medium', low:'badge-low'}[s]);
  const sevLabel = s => ({critical:'RED / Critical', high:'Orange / High', medium:'Yellow / Medium', low:'Green / Low'}[s]);
  const filtered = filter==='all' ? alerts : alerts.filter(a=>a.severity===filter);

  const handleAdd = async () => {
    if (!form.district || !form.title) return;
    try {
      const newAlert = await api.alerts.create({
        ...form,
        time: new Date().toLocaleTimeString().slice(0, 5)
      });
      setAlerts([newAlert, ...alerts]);
      setShowAdd(false);
      setForm({district:'', severity:'medium', title:'', message:''});
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.alerts.delete(id);
      setAlerts(alerts.filter(a => (a._id || a.id) !== id));
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16}}>
        <div>
          <div className="page-title">Active Alerts</div>
          <div className="page-subtitle">District-level disaster alerts and notifications</div>
        </div>
        <button className="btn btn-danger" onClick={()=>setShowAdd(true)}>🚨 Issue New Alert</button>
      </div>

      <div className="tab-bar">
        {['all','critical','high','medium','low'].map(f=>(
          <div key={f} className={`tab ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>
            {f==='all'?'All Alerts':sevLabel(f)}
            <span style={{marginLeft:6, fontSize:11, opacity:0.7}}>({f==='all'?alerts.length:alerts.filter(a=>a.severity===f).length})</span>
          </div>
        ))}
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        {loading ? (
          <div style={{textAlign:'center', padding:40, color:'var(--text-light)'}}>Loading alerts...</div>
        ) : (
          <>
            {filtered.map(a=>(
              <div key={a._id || a.id} className="card" style={{borderLeft:`4px solid ${a.severity==='critical'?'var(--red)':a.severity==='high'?'var(--orange)':a.severity==='medium'?'var(--amber)':'var(--green)'}`}}>
                <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                      <span className={`badge ${sevClass(a.severity)}`}>{a.severity.toUpperCase()}</span>
                      <span className="tag">📍 {a.district}</span>
                      <span className="text-light text-sm font-mono">{a.time}</span>
                    </div>
                    <div style={{fontWeight:700, fontSize:15, color:'var(--navy)', marginBottom:6}}>{a.title}</div>
                    <div style={{fontSize:13, color:'var(--text-mid)', lineHeight:1.5}}>{a.message}</div>
                  </div>
                  <div style={{display:'flex', gap:8, flexShrink:0}}>
                    <button className="btn btn-outline btn-sm">📢 Broadcast</button>
                    <button className="btn btn-outline btn-sm" onClick={()=>handleResolve(a._id || a.id)}>Resolve</button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length===0 && <div style={{textAlign:'center', padding:40, color:'var(--text-light)'}}>No alerts for selected severity level.</div>}
          </>
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">🚨 Issue New Alert</div>
              <button className="modal-close" onClick={()=>setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert-banner warning">Alerts are broadcast to all registered citizens and volunteers in the selected district.</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">District</label>
                  <select className="form-control" value={form.district} onChange={e=>setForm({...form, district:e.target.value})}>
                    <option value="">Select District</option>
                    {['Thiruvananthapuram','Ernakulam','Thrissur','Kozhikode','Kannur','Palakkad','Malappuram','Kottayam','Kollam'].map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Severity Level</label>
                  <select className="form-control" value={form.severity} onChange={e=>setForm({...form, severity:e.target.value})}>
                    <option value="critical">🔴 RED – Critical</option>
                    <option value="high">🟠 ORANGE – High</option>
                    <option value="medium">🟡 YELLOW – Medium</option>
                    <option value="low">🟢 GREEN – Low</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Alert Title</label>
                <input className="form-control" placeholder="e.g. Red Alert – Heavy Rainfall" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Detailed Message</label>
                <textarea className="form-control" placeholder="Provide detailed information about the alert, what actions citizens should take…" value={form.message} onChange={e=>setForm({...form, message:e.target.value})}/>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleAdd}>🚨 Issue Alert</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
