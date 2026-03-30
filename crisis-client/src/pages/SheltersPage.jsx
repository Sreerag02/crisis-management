import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppCtx';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} draggable={true} eventHandlers={{
    dragend: (e) => {
      setPosition([e.target.getLatLng().lat, e.target.getLatLng().lng]);
    }
  }} /> : null;
}

export default function SheltersPage() {
  const { user } = useApp();
  const [shelters, setShelters] = useState([]);
  const [nearbyShelters, setNearbyShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [form, setForm] = useState({
    name:'',
    district:'',
    capacity:100,
    occupied:0,
    status:'Available',
    facilities:[],
    location: null
  });

  const canManage = user?.role === 'admin' || user?.role === 'volunteer';

  useEffect(() => {
    fetchShelters();
    // Get user location for nearby shelters calculation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          fetchNearbyShelters(loc.lat, loc.lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Kochi if geolocation fails
          const defaultLoc = { lat: 10.0159, lng: 76.3419 };
          setUserLocation(defaultLoc);
          fetchNearbyShelters(defaultLoc.lat, defaultLoc.lng);
        }
      );
    }
  }, []);

  const fetchShelters = async () => {
    try {
      setLoading(true);
      const data = await api.shelters.getAll();
      setShelters(data);
    } catch (error) {
      console.error('Failed to fetch shelters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyShelters = async (lat, lng, radius = 10000) => {
    try {
      const data = await api.shelters.getNearby(lat, lng, radius);
      setNearbyShelters(data);
      if (data.length > 0) {
        setShowNearby(true);
      }
    } catch (error) {
      console.error('Failed to fetch nearby shelters:', error);
    }
  };

  const handleAdd = async () => {
    if (!form.name) return;
    try {
      const shelterData = {
        name: form.name,
        district: form.district,
        capacity: Number(form.capacity),
        occupied: Number(form.occupied),
        status: form.status,
        facilities: form.facilities
      };

      // Add location if provided
      if (form.location) {
        shelterData.location = {
          lat: form.location[0],
          lng: form.location[1]
        };
      }

      const newShelter = await api.shelters.create(shelterData);
      setShelters([...shelters, newShelter]);
      setShowAdd(false);
      setForm({name:'', district:'', capacity:100, occupied:0, status:'Available', facilities:[], location: null});
      // Refresh nearby shelters if we have location
      if (userLocation) {
        fetchNearbyShelters(userLocation.lat, userLocation.lng);
      }
    } catch (error) {
      console.error('Failed to add shelter:', error);
    }
  };

  const updateOccupancy = async (id, delta) => {
    const shelter = shelters.find(s => (s._id || s.id) === id);
    if (!shelter) return;

    const newOcc = Math.max(0, Math.min(shelter.capacity, shelter.occupied + delta));
    const pct = newOcc / shelter.capacity;
    const newStatus = pct >= 1 ? 'Full' : pct >= 0.85 ? 'Near Full' : 'Available';

    try {
      const response = await fetch(`http://localhost:5000/api/shelters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occupied: newOcc, status: newStatus }),
      });
      if (response.ok) {
        setShelters(shelters.map(s => (s._id || s.id) === id ? { ...s, occupied: newOcc, status: newStatus } : s));
        // Update nearby shelters list too
        setNearbyShelters(nearbyShelters.map(s => (s._id || s.id) === id ? { ...s, occupied: newOcc, status: newStatus } : s));
      }
    } catch (error) {
      console.error('Failed to update occupancy:', error);
    }
  };

  const handleRemove = async (id) => {
    try {
      await api.shelters.delete(id);
      setShelters(shelters.filter(s => (s._id || s.id) !== id));
      setNearbyShelters(nearbyShelters.filter(s => (s._id || s.id) !== id));
    } catch (error) {
      console.error('Failed to remove shelter:', error);
    }
  };

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16}}>
        <div>
          <div className="page-title">Shelter Management</div>
          <div className="page-subtitle">Real-time shelter capacity tracking and smart allocation</div>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={()=>setShowAdd(true)}>➕ Add Shelter</button>
        )}
      </div>

      {/* Nearby Shelters Section - Auto-calculated based on crisis location */}
      {showNearby && nearbyShelters.length > 0 && (
        <div style={{marginBottom: 24}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
            <div>
              <div style={{fontSize:16, fontWeight:700, color:'var(--navy)'}}>🏠 Nearby Safe Shelters</div>
              <div style={{fontSize:13, color:'var(--text-light)'}}>Automatically calculated based on your location (10km radius)</div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={()=>setShowNearby(false)}>Dismiss</button>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:12}}>
            {nearbyShelters.map(s=>{
              const pct = Math.round(s.occupied/s.capacity*100);
              const color = pct>=95?'var(--red)':pct>=80?'var(--orange)':'var(--green)';
              return (
                <div key={`nearby-${s._id || s.id}`} className="card" style={{borderLeft:`4px solid ${color}`}}>
                  <div style={{fontWeight:700, fontSize:14, color:'var(--navy)', marginBottom:6}}>{s.name}</div>
                  <div style={{display:'flex', gap:8, marginBottom:8, flexWrap:'wrap'}}>
                    <span className="tag" style={{fontSize:11}}>📍 {s.district}</span>
                    <span className="tag" style={{fontSize:11}}>{s.status}</span>
                  </div>
                  <div className="progress-bar" style={{marginBottom:6}}>
                    <div className="progress-fill" style={{width:pct+'%', background:color}}/>
                  </div>
                  <div style={{fontSize:12, color:'var(--text-light)'}}>{s.occupied}/{s.capacity} occupied ({pct}%)</div>
                  {s.facilities && s.facilities.length > 0 && (
                    <div style={{display:'flex', gap:4, flexWrap:'wrap', marginTop:6}}>
                      {s.facilities.slice(0, 3).map(f=><span key={f} className="tag" style={{fontSize:10, padding:'2px 6px'}}>✓ {f}</span>)}
                      {s.facilities.length > 3 && <span className="tag" style={{fontSize:10, padding:'2px 6px'}}>+{s.facilities.length - 3}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="stats-grid" style={{gridTemplateColumns:'repeat(3,1fr)', marginBottom:16}}>
        <div className="stat-card good"><div className="stat-label">Available</div><div className="stat-value">{shelters.filter(s=>s.status==='Available').length}</div></div>
        <div className="stat-card warning"><div className="stat-label">Near Full</div><div className="stat-value">{shelters.filter(s=>s.status==='Near Full').length}</div></div>
        <div className="stat-card critical"><div className="stat-label">Full</div><div className="stat-value">{shelters.filter(s=>s.status==='Full').length}</div></div>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        {loading ? (
          <div style={{textAlign:'center', padding:40, color:'var(--text-light)'}}>Loading shelters...</div>
        ) : (
          <>
            {shelters.map(s=>{
              const pct = Math.round(s.occupied/s.capacity*100);
              const color = pct>=95?'var(--red)':pct>=80?'var(--orange)':'var(--green)';
              return (
                <div key={s._id || s.id} className="card">
                  <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                        <span style={{fontWeight:700, fontSize:15, color:'var(--navy)'}}>{s.name}</span>
                        <span className={`badge ${s.status==='Full'?'badge-critical':s.status==='Near Full'?'badge-high':'badge-safe'}`}>{s.status}</span>
                      </div>
                      <div style={{display:'flex', gap:12, marginBottom:10, flexWrap:'wrap'}}>
                        <span className="text-light text-sm">📍 {s.district}</span>
                        <span className="text-sm font-mono"><strong>{s.occupied}</strong>/{s.capacity} occupied</span>
                        <span style={{fontSize:12, color}}>({pct}% full)</span>
                      </div>
                      <div className="progress-bar" style={{marginBottom:8}}>
                        <div className="progress-fill" style={{width:pct+'%', background:color}}/>
                      </div>
                      <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                        {s.facilities.map(f=><span key={f} className="tag" style={{fontSize:11}}>✓ {f}</span>)}
                      </div>
                    </div>
                    <div style={{display:'flex', flexDirection:'column', gap:6}}>
                      {canManage && (
                        <div style={{display:'flex', gap:6, marginBottom:6}}>
                          <button className="btn btn-outline btn-sm" onClick={()=>updateOccupancy(s._id || s.id, -10)}>−10</button>
                          <button className="btn btn-primary btn-sm" onClick={()=>updateOccupancy(s._id || s.id, 10)}>+10</button>
                        </div>
                      )}
                      {canManage && (
                        <button className="btn btn-outline btn-sm" onClick={()=>handleRemove(s._id || s.id)}>Remove</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {shelters.length===0 && <div style={{textAlign:'center', padding:40, color:'var(--text-light)'}}>No shelters found.</div>}
          </>
        )}
      </div>

      {showAdd && canManage && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Add New Shelter</div>
              <button className="modal-close" onClick={()=>setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Shelter Name / Location</label>
                <input className="form-control" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="e.g. Govt LP School, Ernakulam"/>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">District</label>
                  <select className="form-control" value={form.district} onChange={e=>setForm({...form, district:e.target.value})}>
                    <option value="">Select</option>
                    {['Thiruvananthapuram','Ernakulam','Thrissur','Kozhikode','Kannur','Palakkad'].map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Total Capacity</label>
                  <input type="number" className="form-control" value={form.capacity} onChange={e=>setForm({...form, capacity:e.target.value})}/>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Available Facilities (select all)</label>
                <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                  {['Food','Water','Medical','Sanitation','Power'].map(f=>(
                    <label key={f} style={{display:'flex', alignItems:'center', gap:4, cursor:'pointer', fontSize:13}}>
                      <input type="checkbox" checked={form.facilities.includes(f)} onChange={e=>{
                        setForm({...form, facilities: e.target.checked ? [...form.facilities,f] : form.facilities.filter(x=>x!==f)});
                      }}/>
                      {f}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Shelter Location (Click on map to set)</label>
                <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '8px' }}>
                  <MapContainer center={[10.0159, 76.3419]} zoom={9} style={{ height: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker
                      position={form.location}
                      setPosition={(pos) => setForm({ ...form, location: pos })}
                    />
                  </MapContainer>
                </div>
                {form.location ? (
                  <div className="text-sm" style={{ color: 'var(--green)' }}>
                    ✓ Location set: {form.location[0].toFixed(6)}, {form.location[1].toFixed(6)}
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setForm({...form, location: null})}
                      style={{ marginLeft: 12, fontSize: 11 }}
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-light">
                    💡 Click on the map to set shelter location. This helps people find the shelter during emergencies.
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Shelter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
