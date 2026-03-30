import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api';
import { useApp } from '../context/AppCtx';
import Modal from './Modal';

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

export default function VolunteerRegisterModal({ onClose, onRegistered }) {
  const { user, setUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    skill: '',
    district: '',
    phone: user?.mobile || '',
    location: null
  });

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password || !form.skill || !form.district) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const registerData = {
        name: form.name,
        email: form.email,
        password: form.password,
        skill: form.skill,
        district: form.district,
        phone: form.phone
      };
      
      // Add location if provided
      if (form.location) {
        registerData.location = {
          lat: form.location[0],
          lng: form.location[1]
        };
      }

      const response = await api.volunteers.create(registerData);

      // Update user context with volunteer role
      const updatedUser = {
        ...user,
        role: 'volunteer',
        volunteerId: response._id
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      onRegistered();
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <button className="btn btn-outline" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Registering...' : 'Register as Volunteer'}
      </button>
    </>
  );

  return (
    <Modal title="🤝 Register as Volunteer" onClose={onClose} footer={footer}>
      {error && <div className="alert-banner danger" style={{ marginBottom: 16 }}>{error}</div>}
      
      <div className="alert-banner info" style={{ marginBottom: 16 }}>
        <span>ℹ️</span>
        <div>
          As a volunteer, you'll receive emergency alerts, can manage shelters and resources, 
          and help coordinate rescue operations. Your existing user access will be upgraded.
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input 
            className="form-control" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            placeholder="Your name"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input 
            type="email"
            className="form-control" 
            value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})} 
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Password *</label>
          <input 
            type="password"
            className="form-control" 
            value={form.password} 
            onChange={e => setForm({...form, password: e.target.value})} 
            placeholder="Create a password"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input 
            className="form-control" 
            value={form.phone} 
            onChange={e => setForm({...form, phone: e.target.value})} 
            placeholder="Mobile number"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Skill / Expertise *</label>
        <input 
          className="form-control" 
          value={form.skill} 
          onChange={e => setForm({...form, skill: e.target.value})} 
          placeholder="e.g. Medical, Rescue, Logistics, Counseling"
        />
      </div>

      <div className="form-group">
        <label className="form-label">District *</label>
        <select 
          className="form-control" 
          value={form.district} 
          onChange={e => setForm({...form, district: e.target.value})}
        >
          <option value="">Select your district</option>
          <option value="Thiruvananthapuram">Thiruvananthapuram</option>
          <option value="Ernakulam">Ernakulam</option>
          <option value="Thrissur">Thrissur</option>
          <option value="Kozhikode">Kozhikode</option>
          <option value="Kannur">Kannur</option>
          <option value="Palakkad">Palakkad</option>
          <option value="Kollam">Kollam</option>
          <option value="Pathanamthitta">Pathanamthitta</option>
          <option value="Alappuzha">Alappuzha</option>
          <option value="Kottayam">Kottayam</option>
          <option value="Idukki">Idukki</option>
          <option value="Malappuram">Malappuram</option>
          <option value="Wayanad">Wayanad</option>
          <option value="Kasaragod">Kasaragod</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Your Current Location (Optional - improves emergency response)</label>
        <div style={{ height: '250px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '8px' }}>
          <MapContainer center={[10.0159, 76.3419]} zoom={7} style={{ height: '100%' }}>
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
            💡 Click on the map to set your location. This helps us notify you about nearby emergencies.
          </div>
        )}
      </div>

      <div className="alert-banner warning" style={{ marginTop: 16 }}>
        <span>⚠️</span>
        <div>
          By registering as a volunteer, you agree to respond to emergency situations 
          and help those in need. Please ensure you can commit to this responsibility.
        </div>
      </div>
    </Modal>
  );
}
