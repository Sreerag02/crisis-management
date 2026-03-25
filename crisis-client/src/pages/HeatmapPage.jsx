import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function HeatmapPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  
  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const data = await api.issues.getAll();
      setIssues(data);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColor = (priority) => {
    if(priority === 'critical') return '#c0392b';
    if(priority === 'high') return '#e67e22';
    if(priority === 'medium') return '#f39c12';
    if(priority === 'low') return '#f1c40f';
    return '#27ae60';
  };

  // Generate a mock grid but highlight cells that have issues nearby
  // For a real app, this would be a real map (Leaflet/Google Maps)
  const mockGrid = Array.from({length:100}, (_,i)=>({
    id: i,
    val: Math.floor(Math.random()*40), // base risk
    district: ['Ernakulam','Thrissur','Kozhikode','TVM','Kannur'][Math.floor(Math.random()*5)]
  }));

  // Overlay issues on the grid (just for visualization purposes in this mock grid)
  issues.forEach((issue, idx) => {
    const gridIdx = (idx * 7) % 100; // deterministic pseudo-random
    mockGrid[gridIdx].issue = issue;
    mockGrid[gridIdx].val = issue.priority === 'critical' ? 95 : issue.priority === 'high' ? 75 : 55;
  });

  return (
    <div>
      <div className="page-title">Risk Heatmap</div>
      <div className="page-subtitle">Real-time flood risk and population density analysis</div>

      <div className="grid-main mb-20">
        <div className="card">
          <div className="card-header">
            <div className="card-title">🗺️ Interactive Risk Map</div>
            <div className="flex-center gap-8">
              <span className="text-sm text-light">Layer:</span>
              <select className="form-control" style={{width:140, padding:'4px 8px'}}>
                <option>Flood Risk</option>
                <option>Population</option>
                <option>SOS Density</option>
              </select>
            </div>
          </div>
          
          <div className="heatmap-grid">
            {loading ? (
              <div style={{textAlign:'center', padding:40}}>Loading map data...</div>
            ) : (
              mockGrid.map(g=>(
                <div key={g.id} className="heatmap-cell" 
                  style={{background: getColor(g.issue ? g.issue.priority : 'low'), opacity: selected && selected.id!==g.id ? 0.3 : 1}}
                  onClick={()=>setSelected(g)}
                  title={g.issue ? `Issue: ${g.issue.title}` : `Risk: ${g.val}% - ${g.district}`}
                />
              ))
            )}
          </div>

          <div style={{marginTop:20, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div className="flex-center gap-12">
              <div className="flex-center gap-4"><div className="dot" style={{background:'#c0392b'}}></div><span className="text-sm">Critical</span></div>
              <div className="flex-center gap-4"><div className="dot" style={{background:'#e67e22'}}></div><span className="text-sm">High</span></div>
              <div className="flex-center gap-4"><div className="dot" style={{background:'#f39c12'}}></div><span className="text-sm">Moderate</span></div>
              <div className="flex-center gap-4"><div className="dot" style={{background:'#27ae60'}}></div><span className="text-sm">Safe</span></div>
            </div>
            <div className="text-sm text-light">Last updated: {new Date().toLocaleTimeString()} · Satellite: INSAT-3DR</div>
          </div>
        </div>

        <div>
          <div className="card mb-16">
            <div className="card-header"><div className="card-title">📍 Selection Details</div></div>
            {selected ? (
              <div>
                <div style={{fontWeight:700, fontSize:16, marginBottom:4}}>{selected.issue ? selected.issue.title : `${selected.district} Sector ${selected.id}`}</div>
                <div className={`badge ${selected.val>60?'badge-critical':'badge-active'}`} style={{marginBottom:12}}>RISK LEVEL: {selected.val}%</div>
                
                {selected.issue && (
                  <div style={{marginBottom:12, fontSize:13, color:'var(--text-mid)'}}>
                    {selected.issue.description}
                  </div>
                )}

                <div style={{display:'flex', flexDirection:'column', gap:10}}>
                  <div className="flex-center justify-between">
                    <span className="text-sm text-light">Estimated Pop.</span>
                    <span className="fw-600">~1,240</span>
                  </div>
                  <div className="flex-center justify-between">
                    <span className="text-sm text-light">Elevation</span>
                    <span className="fw-600">2.4m AMSL</span>
                  </div>
                  <div className="flex-center justify-between">
                    <span className="text-sm text-light">Rainfall (24h)</span>
                    <span className="fw-600 text-red">142mm</span>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" style={{width:'100%', marginTop:16}}>Issue Sector Alert</button>
              </div>
            ) : (
              <div style={{textAlign:'center', padding:'20px 0', color:'var(--text-light)'}}>Click on a map sector to view details.</div>
            )}
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">⚠️ High Risk Issues</div></div>
            {issues.filter(i=>i.priority === 'critical' || i.priority === 'high').map(i=>(
              <div key={i._id} style={{padding:'8px 0', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:600, fontSize:13}}>{i.title}</div>
                  <div className="text-sm text-light">{i.priority.toUpperCase()} Priority</div>
                </div>
                <div style={{color: getColor(i.priority), fontWeight:700}}>{i.priority === 'critical' ? '95%' : '75%'}</div>
              </div>
            ))}
            {issues.length === 0 && <div className="text-sm text-light" style={{textAlign:'center', padding:10}}>No high risk issues reported.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
