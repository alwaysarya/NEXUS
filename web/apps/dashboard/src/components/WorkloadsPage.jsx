import { useState, useEffect } from 'react';
import { Box, Activity, Play, Plus, Search, Filter, ChevronDown, Server, AlertCircle } from 'lucide-react';

export default function WorkloadsPage() {
  const [workloads, setWorkloads] = useState([]);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // Fetch real CPU metrics
    fetch('http://127.0.0.1:8080/api/real-metrics')
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(console.error);

    // Fetch workloads (currently returns [] but is connected to backend)
    fetch('http://127.0.0.1:8080/api/workloads')
      .then(res => res.json())
      .then(data => setWorkloads(data))
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 h-full w-full bg-background text-white overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Box size={24} className="text-primary"/> Workloads</h1>
          <p className="text-sm text-gray-400 mt-1">Manage and monitor your container workloads across all namespaces.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 border border-border px-4 py-2 rounded-lg text-sm hover:bg-surface transition-colors"><Play size={14}/> Start All</button>
          <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors"><Plus size={14}/> Create Workload</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5 flex justify-between items-center">
          <div><div className="text-xs text-gray-400 mb-1">Total Workloads</div><div className="text-2xl font-bold">{workloads.length}</div></div>
          <Box size={24} className="text-blue-500"/>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 flex justify-between items-center">
          <div><div className="text-xs text-gray-400 mb-1">Running Pods</div><div className="text-2xl font-bold">{workloads.filter(w => w.status === 'Running').length}</div></div>
          <Activity size={24} className="text-green-500"/>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 flex justify-between items-center">
          <div><div className="text-xs text-gray-400 mb-1">Pending Pods</div><div className="text-2xl font-bold">{workloads.filter(w => w.status === 'Pending').length}</div></div>
          <Server size={24} className="text-yellow-500"/>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 flex justify-between items-center">
          <div><div className="text-xs text-gray-400 mb-1">CPU Usage</div><div className="text-2xl font-bold text-white">{metrics ? `${metrics.cpu.usage.toFixed(1)}%` : '...'}</div></div>
          <Box size={24} className="text-red-500"/>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl flex-1 flex flex-col">
        <div className="flex border-b border-border px-4 pt-4 gap-6">
          <span className="text-sm font-medium text-white border-b-2 border-primary pb-3">All Workloads</span>
          <span className="text-sm font-medium text-gray-400 pb-3 cursor-pointer hover:text-white">Deployments</span>
          <span className="text-sm font-medium text-gray-400 pb-3 cursor-pointer hover:text-white">StatefulSets</span>
          <span className="text-sm font-medium text-gray-400 pb-3 cursor-pointer hover:text-white">DaemonSets</span>
        </div>
        
        <div className="p-4 flex gap-3 border-b border-border">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
            <input type="text" placeholder="Search workloads..." className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary"/>
          </div>
          <button className="flex items-center gap-2 border border-border px-4 py-2 rounded-md text-sm hover:bg-background transition-colors"><Filter size={14}/> Filter</button>
          <button className="flex items-center justify-between w-40 border border-border px-4 py-2 rounded-md text-sm hover:bg-background transition-colors">All Namespaces <ChevronDown size={14}/></button>
        </div>

        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-background border-b border-border text-gray-500 text-[11px]">
            <tr>
              <th className="px-4 py-3 font-medium">NAME</th>
              <th className="px-4 py-3 font-medium">TYPE</th>
              <th className="px-4 py-3 font-medium">NAMESPACE</th>
              <th className="px-4 py-3 font-medium">STATUS</th>
              <th className="px-4 py-3 font-medium">REPLICAS</th>
              <th className="px-4 py-3 font-medium">CPU</th>
              <th className="px-4 py-3 font-medium">MEMORY</th>
              <th className="px-4 py-3 font-medium">AGE</th>
              <th className="px-4 py-3 font-medium text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {workloads.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                  No workloads found.
                </td>
              </tr>
            ) : (
              workloads.map((w, i) => (
                <tr key={i} className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{w.name}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{w.type}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{w.namespace}</td>
                  <td className="px-4 py-3"><span className={`text-xs flex items-center gap-1.5 ${w.status === 'Running' ? 'text-green-500' : 'text-yellow-500'}`}><span className={`w-1.5 h-1.5 rounded-full ${w.status === 'Running' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>{w.status}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{w.replicas}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{w.cpu}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{w.memory}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{w.age}</td>
                  <td className="px-4 py-3 text-right text-xs text-primary cursor-pointer hover:underline">View</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
