import { useState, useEffect } from 'react';
import { ChevronRight, RefreshCw, MoreHorizontal, ZoomIn, ZoomOut, Plus, Download, Network, Server } from 'lucide-react';
import MetricCard from './ui/MetricCard';
import PodPanel from './ui/PodPanel';
import { fetchNodes } from '../services/api';

export default function ClustersPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNodes = async () => {
      try {
        const data = await fetchNodes();
        setNodes(data);
      } catch (error) {
        console.error("Failed to fetch nodes", error);
      } finally {
        setLoading(false);
      }
    };
    loadNodes();
  }, []);

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <span className="cursor-pointer hover:text-white">Clusters</span>
              <ChevronRight size={14} />
              <span className="text-white">prod-eks-01</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">prod-eks-01</h1>
              <span className="bg-green-500/10 text-green-500 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Healthy
              </span>
              <span className="bg-surface border border-border text-gray-300 text-xs px-2 py-0.5 rounded">Production</span>
              <span className="bg-surface border border-border text-gray-300 text-xs px-2 py-0.5 rounded">Kubernetes v1.30.4</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">Elastic Kubernetes Service (EKS) • us-east-1 • Created 4 mo ago</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2"><RefreshCw size={14} /> Last updated 10s ago</div>
            <button className="border border-border p-1.5 rounded hover:bg-surface"><MoreHorizontal size={16} /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-border text-sm text-gray-400">
          {['Overview', 'Nodes', 'Pods', 'Workloads', 'Services', 'Networking', 'Storage', 'Events', 'Settings'].map((tab) => (
            <div 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`pb-2 cursor-pointer ${activeTab === tab ? 'text-white border-b-2 border-primary font-medium' : 'hover:text-white'}`}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'Overview' ? (
          <>
            <div className="grid grid-cols-6 gap-4">
              <MetricCard title="Cluster Health" value="Healthy" subtitle="All systems nominal" color="#22c55e" />
              <MetricCard title="Nodes" value="12" subtitle="11 Ready • 1 NotReady" />
              <MetricCard title="Pods" value="148" subtitle="142 Running • 6 Pending" />
              <MetricCard title="Workloads" value="36" subtitle="28 Deployments • 8 StatefulSets" />
              <MetricCard title="CPU Usage" value="42.8%" subtitle="314 / 736 vCPU" showGraph={true} color="#22c55e" />
              <MetricCard title="Memory Usage" value="67.2%" subtitle="1.27 / 1.89 TiB" showGraph={true} color="#8b5cf6" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 bg-surface border border-border rounded-xl p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-white">Cluster Topology <span className="text-xs text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded ml-2">Live</span></h3>
                  <div className="flex gap-2 text-gray-400">
                    <button className="border border-border p-1 rounded"><ZoomIn size={14}/></button>
                    <button className="border border-border p-1 rounded"><ZoomOut size={14}/></button>
                  </div>
                </div>
                <div className="flex-1 bg-background/50 border border-border rounded-lg flex flex-col items-center justify-center relative overflow-hidden py-6">
                  <div className="bg-surface border border-primary/50 px-4 py-2 rounded-lg flex items-center gap-2 z-10 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    <Network size={16} className="text-primary" />
                    <div>
                      <div className="text-xs text-white font-medium">prod-eks-01</div>
                      <div className="text-[10px] text-gray-400">12 Nodes • 148 Pods</div>
                    </div>
                  </div>
                  <div className="h-6 w-px bg-border"></div>
                  <div className="w-[60%] h-px bg-border"></div>
                  <div className="flex justify-between w-[60%] relative">
                    {['us-east-1a', 'us-east-1b', 'us-east-1c'].map((zone, i) => (
                      <div key={zone} className="flex flex-col items-center relative">
                        <div className="h-6 w-px bg-border absolute -top-6"></div>
                        <div className="bg-surface border border-border px-3 py-1.5 rounded flex items-center gap-2 z-10">
                          <Server size={14} className="text-gray-400" />
                          <div>
                            <div className="text-xs text-gray-200">{zone}</div>
                            <div className="text-[10px] text-gray-500">{i === 0 ? '4 Nodes • 52 Pods' : i === 1 ? '4 Nodes • 48 Pods' : '4 Nodes • 48 Pods'}</div>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-2">
                          {[1,2,3,4].map(n => <div key={n} className={`w-1.5 h-1.5 rounded-full ${i===1 && n===3 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-surface border border-border rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-white">Resource Utilization</h3>
                  <span className="text-xs text-gray-400 border border-border px-2 py-1 rounded">Last 15 min</span>
                </div>
                <div className="space-y-4">
                  {[{l:'CPU', v:42.8}, {l:'Memory', v:67.2}, {l:'Storage', v:58.1}].map((item) => (
                    <div key={item.l}>
                      <div className="flex justify-between text-xs text-gray-400 mb-1"><span>{item.l}</span><span>{item.v}%</span></div>
                      <div className="w-full bg-border rounded-full h-2"><div className="bg-primary h-2 rounded-full" style={{ width: `${item.v}%` }}></div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-surface border border-border rounded-xl p-10 flex items-center justify-center text-gray-500">
            Content for {activeTab} tab goes here...
          </div>
        )}

        {/* Nodes Table */}
        {(activeTab === 'Overview' || activeTab === 'Nodes') && (
          <div className="bg-surface border border-border rounded-xl flex flex-col mt-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex gap-4 text-sm">
                <span className="text-white font-medium border-b-2 border-primary pb-4 -mb-4">Nodes <span className="text-gray-500 text-xs">12</span></span>
                <span className="text-gray-400 cursor-pointer hover:text-white">Pods <span className="text-gray-500 text-xs">148</span></span>
                <span className="text-gray-400 cursor-pointer hover:text-white">Workloads <span className="text-gray-500 text-xs">36</span></span>
              </div>
              <div className="flex gap-2">
                <button className="border border-border text-gray-300 text-sm px-3 py-1.5 rounded flex items-center gap-2 hover:bg-white/5"><Download size={14}/> Export</button>
                <button className="bg-primary text-white text-sm px-3 py-1.5 rounded flex items-center gap-2 hover:bg-primary/90"><Plus size={14}/> Add Node</button>
              </div>
            </div>
            <div className="p-4 flex gap-2">
              <input type="text" placeholder="Search nodes..." className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-white w-64 focus:outline-none focus:border-primary" />
              <select className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-gray-300 focus:outline-none"><option>Status</option></select>
              <select className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-gray-300 focus:outline-none"><option>Zone</option></select>
              <select className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-gray-300 focus:outline-none"><option>Instance Type</option></select>
            </div>
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs text-gray-500 uppercase border-b border-border bg-background/50">
                <tr>
                  {['Name', 'Status', 'Zone', 'Instance Type', 'CPU', 'Memory', 'Pods', 'Age'].map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan="8" className="text-center py-4 text-gray-500">Loading...</td></tr>
                ) : nodes.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-4 text-gray-500">No nodes found.</td></tr>
                ) : (
                  nodes.map((node, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="px-4 py-2.5 text-white">{node.name}</td>
                      <td className="px-4 py-2.5">
                        <span className={`flex items-center gap-1.5 text-xs ${node.status === 'Ready' ? 'text-green-500' : 'text-yellow-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${node.status === 'Ready' ? 'bg-green-500' : 'bg-yellow-500'}`}></span> {node.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">{node.zone}</td>
                      <td className="px-4 py-2.5">{node.instanceType}</td>
                      <td className="px-4 py-2.5">{node.cpu}%</td>
                      <td className="px-4 py-2.5">{node.memory}%</td>
                      <td className="px-4 py-2.5">{node.pods}</td>
                      <td className="px-4 py-2.5">{node.age}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <PodPanel />
    </div>
  );
}
