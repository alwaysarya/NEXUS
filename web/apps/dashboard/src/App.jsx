import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ClustersPage from './components/ClustersPage';
import DeploymentsPage from './components/DeploymentsPage';
import SecurityPage from './components/SecurityPage';
import ObservabilityPage from './components/ObservabilityPage';
import OverviewPage from './components/OverviewPage';

function App() {
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
            <Route path="/deployments" element={<DeploymentsPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/observability" element={<ObservabilityPage />} />
            <Route path="*" element={<div className="p-6 text-gray-400">Page Under Construction</div>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App;
