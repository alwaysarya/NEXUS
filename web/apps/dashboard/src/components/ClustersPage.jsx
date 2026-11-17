import { useState, useEffect } from 'react';
import { Server, Activity, ChevronRight, X, Search, Download } from 'lucide-react';

export default function ClustersPage() {
  const [cluster, setCluster] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8080/api/clusters')
      .then(res => res.json())
      .then(data => setCluster(data))
      .catch(err => console.error("Error:", err));
  }, []);

  if (!cluster) return <div className="p-6 text-white">Loading real cluster data...</div>;

  return (
    <div className="flex h-full w-full bg-background text-white overflow-hidden">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto border-r border-border">
        <div className="p-6 flex flex-col gap-6">
          
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <span>Clusters</span> <ChevronRight size={14} /> <span>{cluster.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">{cluster.name}</h1>
                <span className="text-xs bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Healthy
                </span>
                <span className="text-xs bg-surface border border-border px-2 py-1 rounded-md">Production</span>
                <span className="text-xs bg-surface border border-border px-2 py-1 rounded-md">{cluster.version}</span>
              </div>
              <button className="text-sm flex items-center gap-2 text-gray-400 hover:text-white border border-border px-3 py-1.5 rounded-md">
                <Activity size={14} /> Last updated just now
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-2">Local Node Cluster • {cluster.region}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-border text-sm font-medium text-gray-400 overflow-x-auto">
            <span className="text-white border-b-2 border-primary pb-2 cursor-pointer whitespace-nowrap">Overview</span>
            <span className="hover:text-white pb-2 cursor-pointer whitespace-nowrap">Nodes</span>
            <span className="hover:text-white pb-2 cursor-pointer whitespace-nowrap">Pods</span>
            <span className="hover:text-white pb-2 cursor-pointer whitespace-nowrap">Workloads</span>
            <span className="hover:text-white pb-2 cursor-pointer whitespace-nowrap">Services</span>
            <span className="hover:text-white pb-2 cursor-pointer whitespace-nowrap">Networking</span>
            <span className="hover:text-white pb-2 cursor-pointer whitespace-nowrap">Storage</span>
            <span className="hover:text-white pb-2 cursor-pointer whitespace-nowrap">Events</span>
            <span className="hover:text-white pb-2 cursor-pointer whitespace-nowrap">Settings</span>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Cluster Health', val: 'Healthy', sub: 'All systems nominal' },
              { label: 'Nodes', val: cluster.nodes_count, sub: `${cluster.nodes_count} Ready • 0 NotReady` },
              { label: 'Pods', val: cluster.pods_count, sub: `Running on local` },
              { label: 'Workloads', val: cluster.workloads_count, sub: `Local workloads` },
              { label: 'CPU Usage', val: `${cluster.cpu_usage}%`, sub: `1 cores` },
              { label: 'Memory Usage', val: `${cluster.memory_usage}%`, sub: `Live Data` },
            ].map((s, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-2">{s.label}</div>
                <div className="text-2xl font-bold mb-1 text-white">{s.val}</div>
                <div className="text-[10px] text-gray-500">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Grid for Topology & Resource */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-4 flex flex-col relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-medium flex items-center gap-2">Cluster Topology <span className="text-[10px] bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded-full">Live</span></h3>
                <div className="flex gap-2 text-gray-400"><Search size={14}/><Activity size={14}/></div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] border border-dashed border-border rounded-lg bg-background/50 relative">
                <div className="bg-surface border border-primary/50 text-primary px-4 py-2 rounded-lg z-10 flex flex-col items-center">
                  <span className="font-bold text-sm">{cluster.name}</span>
                  <span className="text-[10px] text-gray-400">{cluster.nodes_count} Nodes</span>
                </div>
                <div className="w-px h-8 bg-border z-0"></div>
                <div className="flex gap-4 z-10">
                   <div className="bg-surface border border-border p-3 rounded-lg w-32 text-center">
                      <div className="text-xs font-bold mb-1">Local Zone</div>
                      <div className="text-[10px] text-gray-400 mb-2">{cluster.nodes_count} Nodes</div>
                      <div className="flex justify-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span></div>
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Resource Utilization</h3>
                <span className="text-xs text-gray-400 border border-border px-2 py-1 rounded">Live</span>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'CPU', val: cluster.cpu_usage, color: 'bg-blue-500' },
                  { label: 'Memory', val: cluster.memory_usage, color: 'bg-purple-500' },
                  { label: 'Storage', val: 58.1, color: 'bg-cyan-500' }
                ].map((r, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-300">{r.label}</span><span className="text-white font-medium">{r.val}%</span></div>
                    <div className="w-full bg-background rounded-full h-1.5 border border-border overflow-hidden">
                      <div className={`h-full ${r.color}`} style={{ width: `${r.val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nodes Table */}
          <div className="bg-surface border border-border rounded-xl">
            <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h3 className="font-medium">Nodes <span className="text-gray-500 text-sm ml-1">{cluster.nodes_count}</span></h3>
                <h3 className="font-medium text-gray-500">Pods <span className="text-sm ml-1">{cluster.pods_count}</span></h3>
                <h3 className="font-medium text-gray-500">Workloads <span className="text-sm ml-1">{cluster.workloads_count}</span></h3>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-xs flex items-center gap-1 border border-border px-3 py-1.5 rounded-md hover:bg-background"><Download size={12}/> Export</button>
                <button className="text-xs flex items-center gap-1 bg-primary/20 text-primary border border-primary/30 px-3 py-1.5 rounded-md hover:bg-primary/30">+ Add Node</button>
              </div>
            </div>
            <div className="p-4 border-b border-border flex gap-3">
               <input type="text" placeholder="Search nodes..." className="bg-background border border-border rounded-md px-3 py-1.5 text-xs w-64 focus:outline-none focus:border-primary" />
               <select className="bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:outline-none"><option>Status</option></select>
               <select className="bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:outline-none"><option>Zone</option></select>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-background border-b border-border text-gray-500 text-[11px]">
                <tr>
                  <th className="px-4 py-3 font-medium">NAME</th>
                  <th className="px-4 py-3 font-medium">STATUS</th>
                  <th className="px-4 py-3 font-medium">ZONE</th>
                  <th className="px-4 py-3 font-medium">INSTANCE TYPE</th>
                  <th className="px-4 py-3 font-medium">CPU</th>
                  <th className="px-4 py-3 font-medium">MEMORY</th>
                  <th className="px-4 py-3 font-medium">PODS</th>
                  <th className="px-4 py-3 font-medium">AGE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cluster.nodes.map(n => (
                  <tr key={n.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{n.hostname}</td>
                    <td className="px-4 py-3"><span className="text-green-500 flex items-center gap-1.5 text-xs"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{n.status}</span></td>
                    <td className="px-4 py-3 text-gray-400 text-xs">local-zone</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">mac-node</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{cluster.cpu_usage}%</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{cluster.memory_usage}%</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">-</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">4 mo</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-[400px] bg-surface flex flex-col hidden lg:flex">
        <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
          <div>
            <div className="text-xs text-gray-400 mb-1">Node Details:</div>
            <div className="font-mono text-sm text-white">{cluster.nodes[0]?.hostname || 'agent-node'}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Running</span>
              <span className="text-[10px] text-gray-400">4h 23m</span>
            </div>
          </div>
          <button className="text-gray-400 hover:text-white"><X size={18}/></button>
        </div>
        
        <div className="flex px-4 pt-4 border-b border-border gap-4 text-xs font-medium text-gray-400">
          <span className="text-white border-b-2 border-primary pb-2">Overview</span>
          <span>Logs</span>
          <span>Metrics</span>
          <span>Events</span>
          <span>YAML</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-white mb-3">Node Details</h4>
            <div className="space-y-2 text-xs">
              {['Namespace', 'Node', 'IP', 'Restart Policy', 'Restarts', 'QoS Class'].map((k, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-500">{k}</span>
                  <span className="text-gray-300">{k === 'Node' ? 'ip-10-0-1-23' : k === 'Restarts' ? '0' : 'production'}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-white mb-3">Resource Usage (Live)</h4>
            <div className="space-y-3">
              <div className="bg-background border border-border rounded-lg p-3">
                 <div className="flex justify-between items-center mb-2"><span className="text-xs text-gray-400 flex items-center gap-1"><Activity size={12}/> CPU</span><span className="text-xs font-bold">{cluster.cpu_usage}%</span></div>
                 <div className="w-full bg-surface rounded-full h-1"><div className="bg-blue-500 h-full rounded-full" style={{width: `${cluster.cpu_usage}%`}}></div></div>
              </div>
              <div className="bg-background border border-border rounded-lg p-3">
                 <div className="flex justify-between items-center mb-2"><span className="text-xs text-gray-400 flex items-center gap-1"><Server size={12}/> Memory</span><span className="text-xs font-bold">{cluster.memory_usage}%</span></div>
                 <div className="w-full bg-surface rounded-full h-1"><div className="bg-purple-500 h-full rounded-full" style={{width: `${cluster.memory_usage}%`}}></div></div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-white mb-3">Containers (1)</h4>
            <div className="bg-background border border-border rounded-lg p-3 flex justify-between items-center">
              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span><span className="text-xs">api</span></div>
              <span className="text-xs text-green-500">Running</span>
            </div>
          </div>

          <div>
             <div className="flex justify-between items-center mb-3">
               <h4 className="text-sm font-medium text-white">Recent Events</h4>
               <span className="text-xs text-primary cursor-pointer">See All</span>
             </div>
             <div className="space-y-3">
                {['Pulled container image', 'Created container', 'Started container'].map((ev, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1"></span>
                    <div><div className="text-xs text-gray-300">{ev}</div><div className="text-[10px] text-gray-500">4h 23m ago</div></div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
