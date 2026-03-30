import React from 'react';
import Heatmap from '../components/Heatmap';

export default function HeatmapPage() {
  return (
    <div>
      <div className="page-title">Real-time Crisis Heatmap</div>
      <div className="page-subtitle">Visualizing family safety, shelters, and volunteer distribution</div>

      <div className="grid-main mb-20">
        <div className="card">
          <div className="card-header">
            <div className="card-title">🗺️ Interactive Leaflet Map</div>
            <div className="flex-center gap-12">
              <div className="flex-center gap-4"><div className="dot" style={{background:'orange'}}></div><span className="text-sm">Family</span></div>
              <div className="flex-center gap-4"><div className="dot" style={{background:'blue'}}></div><span className="text-sm">Shelter</span></div>
              <div className="flex-center gap-4"><div className="dot" style={{background:'green'}}></div><span className="text-sm">Volunteer</span></div>
              <div className="flex-center gap-4"><div className="dot" style={{background:'red'}}></div><span className="text-sm">SOS Alert</span></div>
            </div>
          </div>
          
          <div style={{ height: '600px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
            <Heatmap height="600px" interactive={true} />
          </div>
        </div>

        <div>
          <div className="card mb-16">
            <div className="card-header"><div className="card-title">📍 Map Legend</div></div>
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              <div className="flex-center gap-8">
                <div className="dot" style={{background:'orange'}}></div>
                <span className="text-sm">Family / User location</span>
              </div>
              <div className="flex-center gap-8">
                <div className="dot" style={{background:'blue'}}></div>
                <span className="text-sm">Active Relief Shelters</span>
              </div>
              <div className="flex-center gap-8">
                <div className="dot" style={{background:'green'}}></div>
                <span className="text-sm">Registered Volunteers</span>
              </div>
              <div className="flex-center gap-8">
                <div className="dot" style={{background:'red'}}></div>
                <span className="text-sm">Active SOS Requests</span>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header"><div className="card-title">🚨 Recent Activity</div></div>
            <div className="text-sm text-light" style={{padding:'8px 0'}}>
              Map updates automatically when new SOS alerts are received or volunteer statuses change.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
