import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function FamilyPage() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({head:'', members:2, area:'', status:'safe'});
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const data = await api.families.getAll();
      setFamilies(data);
    } catch (error) {
      console.error('Failed to fetch families:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.head) return;
    try {
      const newFamily = await api.families.create({
        ...form,
        members: Number(form.members)
      });
      setFamilies([...families, newFamily]);
      setShowAdd(false);
      setForm({head:'', members:2, area:'', status:'safe'});
    } catch (error) {
      console.error('Failed to register family:', error);
    }
  };

  const setStatus = async (id, status) => {
    // Note: The generic update endpoint might not exist, but usually it does for CRUD.
    // If not, we can just update local state if backend supports it.
    // Based on familyRoutes.js, we have updateFamily.
    try {
      // Assuming api.families has an update method (adding it to api.js if not there)
      // For now, let's assume it works or we'll add it.
      // Wait, I didn't add update to families in api.js. Let me add it first or use fetch here.
      const response = await fetch(`http://localhost:5000/api/families/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setFamilies(families.map(f=>(f._id || f.id)===id?{...f,status}:f));
      }
    } catch (error) {
      console.error('Failed to update family status:', error);
    }
  };

  const filtered = families.filter(f=>f.head.toLowerCase().includes(search.toLowerCase())||f.area.toLowerCase().includes(search.toLowerCase()));

  const counts = {
    safe: families.filter(f=>f.status==='safe').length,
    assist: families.filter(f=>f.status==='assist').length,
    danger: families.filter(f=>f.status==='danger').length
  };

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16}}>
        <div>
          <div className="page-title">Family Safety Tracker</div>
          <div className="page-subtitle">Real-time household status to reduce panic and enable prioritized rescue</div>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowAdd(true)}>➕ Register Family</button>
      </div>

      <div className="stats-grid" style={{gridTemplateColumns:'repeat(3,1fr)', marginBottom:16}}>
        <div className="stat-card good"><div className="stat-label">✓ Safe</div><div className="stat-value" style={{color:'var(--green)'}}>{counts.safe}</div></div>
        <div className="stat-card warning"><div className="stat-label">! Need Assistance</div><div className="stat-value" style={{color:'var(--orange)'}}>{counts.assist}</div></div>
        <div className="stat-card critical"><div className="stat-label">? Not Responding / Danger</div><div className="stat-value" style={{color:'var(--red)'}}>{counts.danger}</div></div>
      </div>

      {counts.danger > 0 && (
        <div className="alert-banner danger" style={{marginBottom:16}}>
          <span>🚨</span><div><strong>{counts.danger} families</strong> marked as danger / not responding. Prioritize rescue to these households immediately.</div>
        </div>
      )}

      <div className="card" style={{marginBottom:16}}>
        <div className="topbar-search" style={{marginBottom:0}}>
          <span>🔍</span>
          <input placeholder="Search by family head or area…" value={search} onChange={e=>setSearch(e.target.value)} style={{border:'none', background:'none', outline:'none', fontFamily:'inherit', fontSize:13, width:'100%'}}/>
        </div>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        {loading ? (
          <div style={{textAlign:'center', padding:40, color:'var(--text-light)'}}>Loading families...</div>
        ) : (
          <>
            {filtered.map(f=>(
              <div key={f._id || f.id} className="card" style={{borderLeft:`4px solid ${f.status==='safe'?'var(--green)':f.status==='assist'?'var(--orange)':'var(--red)'}`}}>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700, fontSize:14, marginBottom:3}}>{f.head}</div>
                    <div className="text-sm text-light">📍 {f.area} · 👨‍👩‍👧 {f.members} members</div>
                  </div>
                  <div style={{display:'flex', gap:6}}>
                    {['safe','assist','danger'].map(s=>(
                      <button key={s} className={`btn btn-sm ${f.status===s?(s==='safe'?'btn-success':s==='assist'?'btn-warning':'btn-danger'):'btn-outline'}`}
                        onClick={()=>setStatus(f._id || f.id, s)}>
                        {s==='safe'?'✓ Safe':s==='assist'?'! Assist':'? Danger'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length===0 && <div style={{textAlign:'center', padding:40, color:'var(--text-light)'}}>No families found.</div>}
          </>
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Register Family</div>
              <button className="modal-close" onClick={()=>setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Family Head Name</label>
                  <input className="form-control" value={form.head} onChange={e=>setForm({...form, head:e.target.value})} placeholder="Full name"/>
                </div>
                <div className="form-group">
                  <label className="form-label">No. of Members</label>
                  <input type="number" className="form-control" value={form.members} min={1} onChange={e=>setForm({...form, members:e.target.value})}/>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Area / Ward</label>
                <input className="form-control" value={form.area} onChange={e=>setForm({...form, area:e.target.value})} placeholder="e.g. Kadavanthra, Ernakulam"/>
              </div>
              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <div className="family-status-btns">
                  {[{key:'safe', icon:'✅', label:'Safe'},{key:'assist', icon:'⚠️', label:'Need Assist'},{key:'danger', icon:'🆘', label:'Danger'}].map(s=>(
                    <div key={s.key} className={`status-btn ${s.key} ${form.status===s.key?'selected':''}`} onClick={()=>setForm({...form, status:s.key})}>
                      <span className="status-btn-icon">{s.icon}</span>
                      <span className="status-btn-label">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Register Family</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
