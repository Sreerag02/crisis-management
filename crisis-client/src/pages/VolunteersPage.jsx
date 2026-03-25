import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function VolunteersPage() {
  const [vols, setVols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [form, setForm] = useState({ name: '', skill: 'Medical', district: '', phone: '', status: 'Standby' });

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const data = await api.volunteers.getAll();
      setVols(data);
    } catch (error) {
      console.error('Failed to fetch volunteers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = vols.filter(v =>
    (skillFilter === 'all' || v.skill === skillFilter) &&
    (v.name.toLowerCase().includes(search.toLowerCase()) || v.district.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = async () => {
    if (!form.name || !form.district) return;
    try {
      const newVol = await api.volunteers.create(form);
      setVols([...vols, newVol]);
      setShowAdd(false);
      setForm({ name: '', skill: 'Medical', district: '', phone: '', status: 'Standby' });
    } catch (error) {
      console.error('Failed to register volunteer:', error);
    }
  };

  const toggleDeploy = async (id) => {
    const vol = vols.find(v => (v._id || v.id) === id);
    if (!vol) return;
    const newStatus = vol.status === 'Active' ? 'Deployed' : vol.status === 'Deployed' ? 'Active' : 'Active';

    try {
      const response = await fetch(`http://localhost:5000/api/volunteers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setVols(vols.map(v => (v._id || v.id) === id ? { ...v, status: newStatus } : v));
      }
    } catch (error) {
      console.error('Failed to update volunteer status:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.volunteers.delete(id);
      setVols(vols.filter(v => (v._id || v.id) !== id));
    } catch (error) {
      console.error('Failed to delete volunteer:', error);
    }
  };

  const statCounts = {
    Active: vols.filter(v => v.status === 'Active').length,
    Deployed: vols.filter(v => v.status === 'Deployed').length,
    Standby: vols.filter(v => v.status === 'Standby').length
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div className="page-title">Volunteer Management</div>
          <div className="page-subtitle">Verified volunteer registry with skill-based deployment</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>➕ Register Volunteer</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 16 }}>
        <div className="stat-card good"><div className="stat-label">Active</div><div className="stat-value">{statCounts.Active}</div></div>
        <div className="stat-card critical"><div className="stat-label">Deployed</div><div className="stat-value">{statCounts.Deployed}</div></div>
        <div className="stat-card info"><div className="stat-label">Standby</div><div className="stat-value">{statCounts.Standby}</div></div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div className="topbar-search" style={{ flex: 1, minWidth: 180 }}>
            <span>🔍</span>
            <input placeholder="Search by name or district…" value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', background: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 13, width: '100%' }} />
          </div>
          {['all', 'Medical', 'Rescue', 'Logistics'].map(s => (
            <button key={s} className={`btn ${skillFilter === s ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setSkillFilter(s)}>
              {s === 'all' ? 'All Skills' : s}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>Loading volunteers...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Volunteer</th><th>Skill</th><th>District</th><th>Phone</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v._id || v.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="vol-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{v.name ? v.name[0] : '?'}</div>
                      <span style={{ fontWeight: 600 }}>{v.name}</span>
                    </div>
                  </td>
                  <td><span className="tag">{v.skill}</span></td>
                  <td>{v.district}</td>
                  <td><span className="font-mono" style={{ fontSize: 12 }}>{v.phone}</span></td>
                  <td><span className={`badge badge-${v.status === 'Active' ? 'active' : v.status === 'Deployed' ? 'critical' : 'inactive'}`}>{v.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => toggleDeploy(v._id || v.id)}>
                        {v.status === 'Deployed' ? '↩ Recall' : '🚀 Deploy'}
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleDelete(v._id || v.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-light)' }}>No volunteers found.</div>}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Register New Volunteer</div>
              <button className="modal-close" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Skill Category</label>
                  <select className="form-control" value={form.skill} onChange={e => setForm({ ...form, skill: e.target.value })}>
                    <option>Medical</option><option>Rescue</option><option>Logistics</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">District</label>
                  <select className="form-control" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })}>
                    <option value="">Select District</option>
                    {['Thiruvananthapuram', 'Ernakulam', 'Thrissur', 'Kozhikode', 'Kannur', 'Palakkad', 'Malappuram', 'Kottayam', 'Kollam'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="alert-banner info">Phone-based OTP verification will be sent after registration.</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Register Volunteer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
