import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api';
import { io } from 'socket.io-client';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const volunteerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const shelterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const sosIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function Heatmap({ height = '100%', interactive = true }) {
  const [locations, setLocations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center] = useState([10.0159, 76.3419]); // Default Kochi

  const fetchMapData = async () => {
    try {
      const data = await api.heatmap.getLocations();
      setLocations(data.points || []);
      // Only show active (non-resolved) alerts
      setAlerts((data.alerts || []).filter(a => a.status !== 'resolved'));

      const sosData = await api.sos.getAll();
      setSosAlerts(sosData.filter(s => s.status === 'active' || s.status === 'pending' || s.status === 'responding'));
    } catch (error) {
      console.error('Failed to fetch map data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();

    const socket = io('http://localhost:5000');
    
    socket.on('new_sos_alert', (newSOS) => {
      setSosAlerts(prev => [newSOS, ...prev]);
    });

    socket.on('status_updated', () => {
      fetchMapData();
    });

    return () => socket.close();
  }, []);

  if (loading) {
    return <div className="flex-center" style={{height, background:'#f8f9fa'}}>Loading Map...</div>;
  }

  return (
    <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer 
        center={center} 
        zoom={11} 
        style={{ height: '100%', width: '100%' }}
        dragging={interactive}
        scrollWheelZoom={interactive}
        zoomControl={interactive}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {Array.isArray(locations) && locations.map(loc => {
          let icon = userIcon;
          if (loc.type === 'volunteer') icon = volunteerIcon;
          if (loc.type === 'shelter') icon = shelterIcon;

          return (
            <Marker key={loc.id} position={[loc.location.lat, loc.location.lng]} icon={icon}>
              <Popup>
                <strong>{loc.name}</strong><br/>
                Type: {loc.type.toUpperCase()}<br/>
                Status: {loc.status}
                {loc.type === 'shelter' && (
                   <div>Capacity: {loc.occupied}/{loc.capacity}</div>
                )}
              </Popup>
            </Marker>
          );
        })}

        {Array.isArray(alerts) && alerts.map(alert => {
          const alertColor = alert.priority === 'critical' ? 'red' : alert.priority === 'high' ? 'orange' : alert.priority === 'medium' ? 'yellow' : 'green';
          return (
            <Circle
              key={`alert-${alert.id}`}
              center={[alert.location.lat, alert.location.lng]}
              radius={alert.radius || 1000}
              pathOptions={{ color: alertColor, fillColor: alertColor, fillOpacity: 0.2 }}
            >
              <Popup>
                <strong style={{ color: alertColor }}>🚨 {alert.title}</strong><br/>
                {alert.description}<br/>
                <small>Radius: {alert.radius || 1000}m | Priority: {alert.priority?.toUpperCase()}</small>
              </Popup>
            </Circle>
          );
        })}

        {Array.isArray(sosAlerts) && sosAlerts.map(sos => (
          <Marker key={sos._id} position={[sos.location.coordinates[1], sos.location.coordinates[0]]} icon={sosIcon}>
            <Popup>
              <strong style={{color: 'red'}}>🚨 SOS ALERT</strong><br/>
              Name: {sos.name}<br/>
              Phone: {sos.phoneNumber}<br/>
              Message: {sos.message}
            </Popup>
          </Marker>
        ))}

        {/* SOS Clusters / Heat indicators */}
        {Array.isArray(sosAlerts) && sosAlerts.map(sos => (
          <Circle
            key={`circle-${sos._id}`}
            center={[sos.location.coordinates[1], sos.location.coordinates[0]]}
            radius={1000}
            pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
