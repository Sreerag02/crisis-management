import React, { useState, useEffect } from 'react';
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

export default function FamilyPage() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    head: '',
    email: '',
    mobile: '',
    area: '',
    location: null,
    status: 'safe',
    members: []
  });

  const [newMember, setNewMember] = useState({ name: '', aadhaar: '', mobile: '', email: '', relation: 'Family' });

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

  const handleAddMember = () => {
    if (!newMember.name) return;
    setForm({ ...form, members: [...form.members, { ...newMember }] });
    setNewMember({ name: '', aadhaar: '', mobile: '', email: '', relation: 'Family' });
  };

  const handleRemoveMember = (index) => {
    setForm({ ...form, members: form.members.filter((_, i) => i !== index) });
  };

  const handleAdd = async () => {
    if (!form.head || !form.area) return;
    try {
      const newFamily = await api.families.create({
        ...form,
        location: form.location ? {
          type: 'Point',
          coordinates: [form.location[1], form.location[0]] // [lng, lat]
        } : undefined,
        totalMembers: form.members.length > 0 ? form.members.length : 1
      });
      setFamilies([...families, newFamily]);
      setShowAdd(false);
      setForm({ head: '', email: '', mobile: '', area: '', location: null, status: 'safe', members: [] });
    } catch (error) {
      console.error('Failed to register family:', error);
    }
  };

  const setStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/families/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setFamilies(families.map(f => (f._id || f.id) === id ? { ...f, status } : f));
      }
    } catch (error) {
      console.error('Failed to update family status:', error);
    }
  };

  const filtered = families.filter(f =>
    f.head.toLowerCase().includes(search.toLowerCase()) ||
    f.area.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    safe: families.filter(f => f.status === 'safe').length,
    assist: families.filter(f => f.status === 'assist').length,
    danger: families.filter(f => f.status === 'danger').length
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div className="page-title">Family Safety Tracker</div>
          <div className="page-subtitle">Register family members with location for emergency tracking</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>➕ Register Family</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 16 }}>
        <div className="stat-card good"><div className="stat-label">✓ Safe</div><div className="stat-value" style={{ color: 'var(--green)' }}>{counts.safe}</div></div>
        <div className="stat-card warning"><div className="stat-label">! Need Assistance</div><div className="stat-value" style={{ color: 'var(--orange)' }}>{counts.assist}</div></div>
        <div className="stat-card critical"><div className="stat-label">? Not Responding / Danger</div><div className="stat-value" style={{ color: 'var(--red)' }}>{counts.danger}</div></div>
      </div>

      {counts.danger > 0 && (
        <div className="alert-banner danger" style={{ marginBottom: 16 }}>
          <span>🚨</span><div><strong>{counts.danger} families</strong> marked as danger / not responding. Prioritize rescue to these households immediately.</div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="topbar-search" style={{ marginBottom: 0 }}>
          <span>🔍</span>
          <input placeholder="Search by family head or area…" value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', background: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 13, width: '100%' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>Loading families...</div>
        ) : (
          <>
            {filtered.map(f => (
              <div key={f._id || f.id} className="card" style={{ borderLeft: `4px solid ${f.status === 'safe' ? 'var(--green)' : f.status === 'assist' ? 'var(--orange)' : 'var(--red)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{f.head}</div>
                    <div className="text-sm text-light">
                      📍 {f.area} · 👨‍👩‍👧 {f.totalMembers || f.members?.length || f.members} members
                      {f.mobile && ` · 📞 ${f.mobile}`}
                    </div>
                    {f.members && f.members.length > 0 && (
                      <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-light)' }}>
                        {f.members.slice(0, 3).map((m, i) => (
                          <span key={i} style={{ marginRight: 8 }}>• {m.name}</span>
                        ))}
                        {f.members.length > 3 && `+${f.members.length - 3} more`}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['safe', 'assist', 'danger'].map(s => (
                      <button key={s} className={`btn btn-sm ${f.status === s ? (s === 'safe' ? 'btn-success' : s === 'assist' ? 'btn-warning' : 'btn-danger') : 'btn-outline'}`}
                        onClick={() => setStatus(f._id || f.id, s)}>
                        {s === 'safe' ? '✓ Safe' : s === 'assist' ? '! Assist' : '? Danger'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>No families found.</div>}
          </>
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <div className="modal-title">Register Family</div>
              <button className="modal-close" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Family Head Name</label>
                  <input className="form-control" value={form.head} onChange={e => setForm({ ...form, head: e.target.value })} placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email address" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input className="form-control" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="Mobile number" />
                </div>
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Area / Location Name</label>
                  <input className="form-control" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} placeholder="e.g. Kadavanthra, Ernakulam" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Home Location (Click on map to set)</label>
                <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '8px' }}>
                  <MapContainer center={[10.0159, 76.3419]} zoom={13} style={{ height: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker
                      position={form.location}
                      setPosition={(pos) => setForm({ ...form, location: pos })}
                    />
                  </MapContainer>
                </div>
                {form.location && (
                  <div className="text-sm" style={{ color: 'var(--green)' }}>
                    ✓ Location set: {form.location[0].toFixed(6)}, {form.location[1].toFixed(6)}
                  </div>
                )}
              </div>

              <div className="section-divider" />

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Family Members</div>
                
                <div className="form-row" style={{ marginBottom: 12 }}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">Name</label>
                    <input className="form-control" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} placeholder="Member name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Aadhaar</label>
                    <input className="form-control" value={newMember.aadhaar} onChange={e => setNewMember({ ...newMember, aadhaar: e.target.value })} placeholder="Aadhaar number" />
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Mobile</label>
                    <input className="form-control" value={newMember.mobile} onChange={e => setNewMember({ ...newMember, mobile: e.target.value })} placeholder="Mobile number" />
                  </div>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={newMember.email} onChange={e => setNewMember({ ...newMember, email: e.target.value })} placeholder="Email address" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Relation</label>
                    <select className="form-control" value={newMember.relation} onChange={e => setNewMember({ ...newMember, relation: e.target.value })}>
                      <option>Family</option>
                      <option>Spouse</option>
                      <option>Child</option>
                      <option>Parent</option>
                      <option>Sibling</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <button className="btn btn-outline btn-sm" onClick={handleAddMember} style={{ marginBottom: 12 }}>
                  ➕ Add Member
                </button>

                {form.members.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {form.members.map((member, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8f9fa', borderRadius: '6px', fontSize: 13 }}>
                        <div>
                          <strong>{member.name}</strong> - {member.relation}
                          {member.mobile && <span style={{ marginLeft: 8, color: 'var(--text-light)' }}>📞 {member.mobile}</span>}
                        </div>
                        <button className="btn btn-outline btn-sm" onClick={() => handleRemoveMember(index)}>✕ Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <div className="family-status-btns">
                  {[{ key: 'safe', icon: '✅', label: 'Safe' }, { key: 'assist', icon: '⚠️', label: 'Need Assist' }, { key: 'danger', icon: '🆘', label: 'Danger' }].map(s => (
                    <div key={s.key} className={`status-btn ${s.key} ${form.status === s.key ? 'selected' : ''}`} onClick={() => setForm({ ...form, status: s.key })}>
                      <span className="status-btn-icon">{s.icon}</span>
                      <span className="status-btn-label">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Register Family</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
