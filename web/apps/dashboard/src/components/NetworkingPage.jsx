import { useState, useEffect } from 'react';
import { Network, Globe, Shield, Server, Activity } from 'lucide-react';
import { fetchNetworking } from '../services/api';

export default function NetworkingPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNetworking().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Network className="text-primary" size={24} /> Networking</h1>
          <p className="text-sm text-gray-400 mt-1">Manage ingress, egress, load balancers, and network policies.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-white">Ingress Endpoints</h3>
            <span className="text-xs text-gray-500">3 Active</span>
          </div>
          <div className="space-y-3">
            {loading ? <div className="text-gray-500 text-sm">Loading...</div> : data.map((ing) => (
              <div key={ing.name} className="bg-background border border-border rounded p-2 flex items-center justify-between">
                <div>
                  <div className="text-xs text-white flex items-center gap-2"><Globe size={12} className="text-primary"/> {ing.name}</div>
                  <div className="text-[10px] text-gray-500 mt-1">Type: {ing.type} | Target: {ing.target}</div>
                </div>
                <span className="text-[10px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">{ing.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-white">Load Balancers</h3>
            <span className="text-xs text-gray-500">2 Active</span>
          </div>
          <div className="space-y-3">
            {[
              { name: 'nginx-lb-01', ip: '10.0.1.45', traffic: '2.4 Gbps', status: 'Healthy' },
              { name: 'internal-lb', ip: '10.0.2.12', traffic: '800 Mbps', status: 'Healthy' },
            ].map((lb) => (
              <div key={lb.name} className="bg-background border border-border rounded p-2 flex items-center justify-between">
                <div>
                  <div className="text-xs text-white flex items-center gap-2"><Server size={12} className="text-blue-500"/> {lb.name}</div>
                  <div className="text-[10px] text-gray-500 mt-1">IP: {lb.ip} | Traffic: {lb.traffic}</div>
                </div>
                <span className="text-[10px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">{lb.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-white">Network Policies</h3>
            <span className="text-xs text-gray-500">12 Rules</span>
          </div>
          <div className="space-y-3">
            {[
              { name: 'allow-api-to-db', port: '5432', status: 'Enforced' },
              { name: 'deny-all-egress', port: 'Any', status: 'Enforced' },
              { name: 'allow-monitoring', port: '9090', status: 'Enforced' },
            ].map((pol) => (
              <div key={pol.name} className="bg-background border border-border rounded p-2 flex items-center justify-between">
                <div>
                  <div className="text-xs text-white flex items-center gap-2"><Shield size={12} className="text-orange-500"/> {pol.name}</div>
                  <div className="text-[10px] text-gray-500 mt-1">Port: {pol.port}</div>
                </div>
                <span className="text-[10px] text-gray-300 border border-border px-1.5 py-0.5 rounded">{pol.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4">
         <h3 className="text-sm font-medium text-white mb-4">Service Mesh Traffic</h3>
         <div className="h-64 bg-background border border-border rounded flex items-center justify-center text-gray-500 text-sm">
            [Service Mesh Traffic Graph Placeholder]
         </div>
      </div>
    </div>
  );
}
