import React from 'react';
import { useApp } from './context/AppCtx';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import AlertsPage from './pages/AlertsPage';
import VolunteersPage from './pages/VolunteersPage';
import SheltersPage from './pages/SheltersPage';
import ResourcePage from './pages/ResourcePage';
import FamilyPage from './pages/FamilyPage';
import BroadcastPage from './pages/BroadcastPage';
import HeatmapPage from './pages/HeatmapPage';
import SOSCenter from './pages/SOSCenter';

function App() {
  const { page } = useApp();

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'alerts': return <AlertsPage />;
      case 'volunteers': return <VolunteersPage />;
      case 'shelters': return <SheltersPage />;
      case 'resource': return <ResourcePage />;
      case 'family': return <FamilyPage />;
      case 'broadcast': return <BroadcastPage />;
      case 'heatmap': return <HeatmapPage />;
      case 'sos': return <SOSCenter />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <div className="page-content">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default App;
