import { useState, useEffect } from 'react';
import { Box, Layers, Server, Activity, Search, Plus, Filter, MoreHorizontal, Play } from 'lucide-react';
import { fetchWorkloads } from '../services/api';

export default function WorkloadsPage() {
  const [workloads, setWorkloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkloads = async () => {
      try {
        const data = await fetchWorkloads();
        setWorkloads(data);
      } catch (error) {
        console.error("Failed to fetch workloads", error);
      } finally {
        setLoading(false);
      }
    };
    loadWorkloads();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Box className="text-primary" size={24} /> Workloads
          </h1>
          <p className="text-sm text-gray-400 mt-1">Manage and monitor your container workloads across all namespaces.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="border border-border text-gray-300 text-sm px-3 py-1.5 rounded flex items-center gap-2 hover:bg-white/5"><Play size={14}/> Start All</button>
          <button className="bg-primary text-white text-sm px-3 py-1.5 rounded flex items-center gap-2 hover:bg-primary/90"><Plus size={14}/> Create Workload</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Workloads', value: '36', icon: Layers, color: 'text-blue-500' },
          { label: 'Running Pods', value: '142', icon: Activity, color: 'text-green-500' },
          { label: 'Pending Pods', value: '6', icon: Server, color: 'text-yellow-500' },
          { label: 'Failed Pods', value: '0', icon: Box, color: 'text-red-500' },
        ].map((m) => (
          <div key={m.label} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">{m.label}</div>
              <div className="text-2xl font-bold text-white mt-1">{m.value}</div>
            </div>
            <m.icon size={24} className={m.color} />
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-surface border border-border rounded-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex gap-4 text-sm">
            <span className="text-white font-medium border-b-2 border-primary pb-4 -mb-4">All Workloads</span>
            <span className="text-gray-400 cursor-pointer hover:text-white">Deployments</span>
            <span className="text-gray-400 cursor-pointer hover:text-white">StatefulSets</span>
            <span className="text-gray-400 cursor-pointer hover:text-white">DaemonSets</span>
          </div>
        </div>

        <div className="p-4 flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
            <input type="text" placeholder="Search workloads..." className="bg-background border border-border rounded-md pl-9 pr-3 py-1.5 text-sm text-white w-64 focus:outline-none focus:border-primary" />
          </div>
          <button className="border border-border text-gray-300 text-sm px-3 py-1.5 rounded flex items-center gap-2 hover:bg-white/5"><Filter size={14}/> Filter</button>
          <select className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-gray-300 focus:outline-none"><option>All Namespaces</option><option>production</option><option>staging</option><option>kube-system</option></select>
        </div>

        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-xs text-gray-500 uppercase border-b border-border bg-background/50">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Namespace</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Replicas</th>
              <th className="px-4 py-3 font-medium">CPU</th>
              <th className="px-4 py-3 font-medium">Memory</th>
              <th className="px-4 py-3 font-medium">Age</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan="9" className="text-center py-4 text-gray-500">Loading workloads...</td></tr>
            ) : workloads.length === 0 ? (
              <tr><td colSpan="9" className="text-center py-4 text-gray-500">No workloads found.</td></tr>
            ) : (
              workloads.map((w, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-white font-medium">{w.name}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-white/5 border border-border px-2 py-0.5 rounded text-gray-300">{w.type}</span></td>
                  <td className="px-4 py-3 text-gray-400">{w.namespace}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 text-xs ${w.status === 'Running' ? 'text-green-500' : 'text-yellow-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${w.status === 'Running' ? 'bg-green-500' : 'bg-yellow-500'}`}></span> {w.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{w.replicas}</td>
                  <td className="px-4 py-3">{w.cpu}</td>
                  <td className="px-4 py-3">{w.memory}</td>
                  <td className="px-4 py-3">{w.age}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-gray-500 hover:text-white"><MoreHorizontal size={16}/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
