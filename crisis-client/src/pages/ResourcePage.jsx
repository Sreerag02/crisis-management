import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppCtx';
import { api } from '../services/api';

export default function ResourcePage() {
  const { user } = useApp();
  const [resources, setResources] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showDispatch, setShowDispatch] = useState(null);
  const [form, setForm] = useState({type:'', location:'', total:0, available:0, unit:'units'});
  const [dispatchQty, setDispatchQty] = useState(10);

  const canManage = user?.role === 'admin' || user?.role === 'volunteer';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resData, shelterData] = await Promise.all([
        api.resources.getAll(),
        api.shelters.getAll()
      ]);
      setResources(resData);
      setShelters(shelterData);
    } catch (error) {
      console.error('Failed to fetch resources or shelters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.type) return;
    try {
      const newResource = await api.resources.create({
        ...form,
        total: Number(form.total),
        available: Number(form.available)
      });
      setResources([...resources, newResource]);
      setShowAdd(false);
      setForm({type:'', location:'', total:0, available:0, unit:'units'});
    } catch (error) {
      console.error('Failed to add resource:', error);
    }
  };

  const handleDispatch = async () => {
    if (!showDispatch) return;
    try {
      const newAvailable = Math.max(0, showDispatch.available - Number(dispatchQty));
      const response = await fetch(`http://localhost:5000/api/resources/${showDispatch._id || showDispatch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: newAvailable }),
      });
      if (response.ok) {
        setResources(resources.map(r => (r._id || r.id) === (showDispatch._id || showDispatch.id) ? { ...r, available: newAvailable } : r));
        setShowDispatch(null);
      }
    } catch (error) {
      console.error('Failed to dispatch resource:', error);
    }
  };

  const handleRestock = async (id, currentAvailable, total) => {
    try {
      const newAvailable = Math.min(total, currentAvailable + 50);
      const response = await fetch(`http://localhost:5000/api/resources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: newAvailable }),
      });
      if (response.ok) {
        setResources(resources.map(r => (r._id || r.id) === id ? { ...r, available: newAvailable } : r));
      }
    } catch (error) {
      console.error('Failed to restock resource:', error);
    }
  };

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16}}>
        <div>
          <div className="page-title">Resource & Equipment Tracking</div>
          <div className="page-subtitle">Geo-tagged resource inventory with smart allocation</div>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={()=>setShowAdd(true)}>➕ Add Resource</button>
        )}
      </div>

      <div className="grid-2">
        {loading ? (
          <div style={{textAlign:'center', padding:40, color:'var(--text-light)'}}>Loading resources...</div>
        ) : (
          <>
            {resources.map(r=>{
              const pct = Math.round(r.available/r.total*100);
              const color = pct<=20?'var(--red)':pct<=50?'var(--orange)':'var(--green)';
              return (
                <div key={r._id || r.id} className="card">
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                    <div style={{fontWeight:700, fontSize:14, color:'var(--navy)'}}>{r.type}</div>
                    <span style={{fontSize:13, fontWeight:700, color, fontFamily:'IBM Plex Mono, monospace'}}>{r.available} / {r.total}</span>
                  </div>
                  <div className="text-sm text-light" style={{marginBottom:8}}>📍 {r.location}</div>
                  <div className="progress-bar" style={{marginBottom:6}}>
                    <div className="progress-fill" style={{width:pct+'%', background:color}}/>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span className="text-sm text-light">{pct}% available · {r.unit}</span>
                    {canManage && (
                      <div style={{display:'flex', gap:6}}>
                        <button className="btn btn-warning btn-sm" onClick={()=>{setShowDispatch(r); setDispatchQty(Math.min(10, r.available));}}>Dispatch</button>
                        <button className="btn btn-success btn-sm" onClick={()=>handleRestock(r._id || r.id, r.available, r.total)}>+Restock</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {resources.length===0 && <div style={{textAlign:'center', padding:40, color:'var(--text-light)'}}>No resources found.</div>}
          </>
        )}
      </div>

      {showDispatch && canManage && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowDispatch(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Dispatch: {showDispatch.type}</div>
              <button className="modal-close" onClick={()=>setShowDispatch(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert-banner info">Available stock: <strong>{showDispatch.available} {showDispatch.unit}</strong></div>
              <div className="form-group">
                <label className="form-label">Destination Shelter</label>
                <select className="form-control">
                  {shelters.map(s=><option key={s._id || s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity to Dispatch</label>
                <input type="number" className="form-control" value={dispatchQty} min={1} max={showDispatch.available} onChange={e=>setDispatchQty(e.target.value)}/>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-control" placeholder="Additional dispatch notes…"/>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setShowDispatch(null)}>Cancel</button>
              <button className="btn btn-warning" onClick={handleDispatch}>🚀 Confirm Dispatch</button>
            </div>
          </div>
        </div>
      )}

      {showAdd && canManage && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Add New Resource</div>
              <button className="modal-close" onClick={()=>setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Resource Type</label>
                  <input className="form-control" value={form.type} onChange={e=>setForm({...form, type:e.target.value})} placeholder="e.g. Boats, Medical Kits"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select className="form-control" value={form.unit} onChange={e=>setForm({...form, unit:e.target.value})}>
                    <option>units</option><option>kits</option><option>packs</option><option>cans</option><option>liters</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Storage Location</label>
                <input className="form-control" value={form.location} onChange={e=>setForm({...form, location:e.target.value})} placeholder="e.g. District Warehouse"/>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Total Stock</label>
                  <input type="number" className="form-control" value={form.total} onChange={e=>setForm({...form, total:e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Available Now</label>
                  <input type="number" className="form-control" value={form.available} onChange={e=>setForm({...form, available:e.target.value})}/>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Resource</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
