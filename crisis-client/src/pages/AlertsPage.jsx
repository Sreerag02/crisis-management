import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppCtx';
import { api } from '../services/api';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';

// Map component to pick coordinates
function LocationPicker({ position, setPosition, radius }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return (
    <>
      <Marker position={position} />
      <Circle center={position} radius={radius} pathOptions={{ color: 'red' }} />
    </>
  );
}

export default function AlertsPage() {
  const { user } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    lat: 10.0159,
    lng: 76.3419,
    radius: 1000,
    district: 'Kochi'
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nearbyShelters, setNearbyShelters] = useState([]);
  const [showNearbyShelters, setShowNearbyShelters] = useState(false);

  const canIssueAlert = user?.role === 'admin';

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.alerts.getAll();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const sevClass = p => ({critical:'badge-critical', high:'badge-high', medium:'badge-medium', low:'badge-low'}[p || 'medium']);
  const sevLabel = p => ({critical:'RED / Critical', high:'Orange / High', medium:'Yellow / Medium', low:'Green / Low'}[p || 'medium']);
  
  const filtered = filter === 'all'
    ? alerts.filter(a => a.status !== 'resolved')
    : alerts.filter(a => (a.severity || a.priority || 'medium') === filter && a.status !== 'resolved');

  const handleAdd = async () => {
    if (!form.title || !form.description) return;
    try {
      const newAlert = await api.alerts.create({
        severity: form.priority,
        district: form.district,
        title: form.title,
        message: form.description,
        location: {
          lat: form.lat,
          lng: form.lng
        },
        radius: form.radius,
        isCrisis: true
      });
      setAlerts([newAlert, ...alerts]);
      setShowAdd(false);
      setForm({
        title: '',
        description: '',
        priority: 'medium',
        lat: 10.0159,
        lng: 76.3419,
        radius: 1000,
        district: 'Kochi'
      });
      
      // Fetch nearby shelters for the crisis location
      const shelters = await api.shelters.getNearby(form.lat, form.lng, form.radius + 5000);
      if (shelters.length > 0) {
        setNearbyShelters(shelters);
        setShowNearbyShelters(true);
      }
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.alerts.update(id, { status: 'resolved' });
      // Remove from local state
      setAlerts(alerts.filter(a => (a._id || a.id) !== id));
      // Also refresh from server to ensure consistency
      fetchAlerts();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16}}>
        <div>
          <div className="page-title">Active Crisis Alerts</div>
          <div className="page-subtitle">Location-based disaster alerts and hazard zones</div>
        </div>
        {canIssueAlert && (
          <button className="btn btn-danger" onClick={()=>setShowAdd(true)}>🚨 Issue New Alert</button>
        )}
      </div>

      <div className="tab-bar">
        {['all','critical','high','medium','low'].map(f=>(
          <div key={f} className={`tab ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>
            {f==='all'?'All Alerts':sevLabel(f)}
            <span style={{marginLeft:6, fontSize:11, opacity:0.7}}>({f==='all'?alerts.length:alerts.filter(a=>(a.severity || a.priority || 'medium')===f).length})</span>
          </div>
        ))}
      </div>

      {/* Nearby Shelters Section - Shows after creating a crisis alert */}
      {showNearbyShelters && nearbyShelters.length > 0 && (
        <div style={{marginBottom: 24, padding: '16px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
            <div>
              <div style={{fontSize:16, fontWeight:700, color:'var(--navy)'}}>🏠 Safe Shelters Near Crisis Location</div>
              <div style={{fontSize:13, color:'var(--text-light)'}}>Shelters within {Math.round((form.radius + 5000) / 1000)}km of the crisis zone</div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={()=>setShowNearbyShelters(false)}>Dismiss</button>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:12}}>
            {nearbyShelters.map(s=>{
              const pct = Math.round(s.occupied/s.capacity*100);
              const color = pct>=95?'var(--red)':pct>=80?'var(--orange)':'var(--green)';
              return (
                <div key={`shelter-${s._id || s.id}`} className="card" style={{borderLeft:`4px solid ${color}`, marginBottom:0}}>
                  <div style={{fontWeight:700, fontSize:14, color:'var(--navy)', marginBottom:6}}>{s.name}</div>
                  <div style={{display:'flex', gap:8, marginBottom:8, flexWrap:'wrap'}}>
                    <span className="tag" style={{fontSize:11}}>📍 {s.district}</span>
                    <span className="tag" style={{fontSize:11}}>{s.status}</span>
                  </div>
                  <div className="progress-bar" style={{marginBottom:6}}>
                    <div className="progress-fill" style={{width:pct+'%', background:color}}/>
                  </div>
                  <div style={{fontSize:12, color:'var(--text-light)'}}>{s.occupied}/{s.capacity} occupied ({pct}%)</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        {loading ? (
          <div style={{textAlign:'center', padding:40, color:'var(--text-light)'}}>Loading alerts...</div>
        ) : (
          <>
            {filtered.map(a=>{
              const severity = a.severity || a.priority || 'medium';
              const coords = a.location?.coordinates;
              return (
              <div key={a._id || a.id} className="card" style={{borderLeft:`4px solid ${severity==='critical'?'var(--red)':severity==='high'?'var(--orange)':severity==='medium'?'var(--amber)':'var(--green)'}`}}>
                <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                      <span className={`badge ${sevClass(severity)}`}>{severity.toUpperCase()}</span>
                      <span className="tag">📍 {coords && coords.length >= 2 ? `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}` : 'No Location'}</span>
                      <span className="tag">⭕ {a.radius || 1000}m</span>
                    </div>
                    <div style={{fontWeight:700, fontSize:15, color:'var(--navy)', marginBottom:6}}>{a.title}</div>
                    <div style={{fontSize:13, color:'var(--text-mid)', lineHeight:1.5}}>{a.message || a.description}</div>
                  </div>
                  <div style={{display:'flex', gap:8, flexShrink:0}}>
                    {canIssueAlert && (
                      <>
                        <button className="btn btn-outline btn-sm">📢 Broadcast</button>
                        <button className="btn btn-outline btn-sm" onClick={()=>handleResolve(a._id || a.id)}>Resolve</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )})}
            {filtered.length===0 && <div style={{textAlign:'center', padding:40, color:'var(--text-light)'}}>No active alerts for selected priority level.</div>}
          </>
        )}
      </div>

      {showAdd && canIssueAlert && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="modal" style={{maxWidth: '800px', width: '90%'}}>
            <div className="modal-header">
              <div className="modal-title">🚨 Issue New Location-Based Alert</div>
              <button className="modal-close" onClick={()=>setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body" style={{maxHeight: '70vh', overflowY: 'auto'}}>
              <div className="alert-banner warning">Alerts will appear on the Heatmap as hazard zones with the specified radius.</div>
              
              <div className="form-row">
                <div className="form-group" style={{flex: 2}}>
                  <label className="form-label">Alert Title</label>
                  <input className="form-control" placeholder="e.g. Flash Flood Warning" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label className="form-label">Priority</label>
                  <select className="form-control" value={form.priority} onChange={e=>setForm({...form, priority:e.target.value})}>
                    <option value="critical">🔴 Critical</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description</label>
                <textarea className="form-control" rows="3" placeholder="Instructions for citizens..." value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Impact Radius (meters)</label>
                  <input type="number" className="form-control" value={form.radius} onChange={e=>setForm({...form, radius: parseInt(e.target.value)})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Coordinates</label>
                  <div className="flex-center gap-8">
                    <input className="form-control" value={form.lat.toFixed(6)} readOnly />
                    <input className="form-control" value={form.lng.toFixed(6)} readOnly />
                  </div>
                </div>
              </div>

              <div style={{height: '300px', width: '100%', marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)'}}>
                <MapContainer center={[form.lat, form.lng]} zoom={13} style={{height: '100%'}}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker 
                    position={{lat: form.lat, lng: form.lng}} 
                    setPosition={(p) => setForm({...form, lat: p.lat, lng: p.lng})}
                    radius={form.radius}
                  />
                </MapContainer>
                <div className="text-xs text-light" style={{padding: '4px'}}>Click on the map to set alert center</div>
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
