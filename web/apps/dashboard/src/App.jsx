import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ClustersPage from './components/ClustersPage';
import DeploymentsPage from './components/DeploymentsPage';
import SecurityPage from './components/SecurityPage';
import ObservabilityPage from './components/ObservabilityPage';
import OverviewPage from './components/OverviewPage';
import WorkloadsPage from './components/WorkloadsPage';
import NetworkingPage from './components/NetworkingPage';
import StoragePage from './components/StoragePage';
import CostPage from './components/CostPage';
import AutomationPage from './components/AutomationPage';
import LoginPage from './components/LoginPage';

function App() {
  const token = localStorage.getItem('nexus_token');

  if (!token) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-background text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/clusters" element={<ClustersPage />} />
            <Route path="/workloads" element={<WorkloadsPage />} />
            <Route path="/deployments" element={<DeploymentsPage />} />
            <Route path="/networking" element={<NetworkingPage />} />
            <Route path="/storage" element={<StoragePage />} />
            <Route path="/observability" element={<ObservabilityPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/cost" element={<CostPage />} />
            <Route path="/automation" element={<AutomationPage />} />
            <Route path="*" element={<div className="p-6 text-gray-400">Page Under Construction</div>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App;
