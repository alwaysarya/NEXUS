import { useState, useEffect } from 'react';
import { Network, Activity, Globe, Server, ArrowUpRight, ArrowDownLeft, Wifi } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function NetworkingPage() {
  const [network, setNetwork] = useState(null);
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      fetch('http://127.0.0.1:8080/api/network-metrics')
        .then(res => res.json())
        .then(data => {
          setNetwork(data);
          
          // Only add to graph if we have valid speed
          if (data.speed_sent >= 0 && data.speed_recv >= 0) {
            setGraphData(prev => {
              const newData = [...prev, {
                time: new Date().toLocaleTimeString().split(' ')[0],
                sent: data.speed_sent,
                recv: data.speed_recv
              }];
              return newData.slice(-20); // Keep last 20 points
            });
          }
        })
        .catch(console.error);
    };

    fetchData();
    const interval = setInterval(fetchData, 2000); // 2 sec update
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024, sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTotal = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full w-full bg-background text-white overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Network size={24} className="text-primary"/> Networking</h1>
        <p className="text-sm text-gray-400 mt-1">Manage ingress, egress, load balancers, and network policies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-white flex items-center gap-2"><Wifi size={16}/> Network Interfaces</h3>
            <span className="text-xs text-green-500">Active</span>
          </div>
          <div className="space-y-3">
            {network?.interfaces?.map((iface, i) => (
              <div key={i} className="bg-background border border-border rounded-lg p-3 flex justify-between items-center">
                <div>
                  <div className="text-sm text-white font-medium">{iface.name}</div>
                  <div className="text-[10px] text-gray-500">{iface.type} • {iface.addrs}</div>
                </div>
                <span className="text-xs bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded">Active</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-white flex items-center gap-2"><Activity size={16}/> Network Traffic</h3>
            <span className="text-xs text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Live</span>
          </div>
          <div className="space-y-3">
            <div className="bg-background border border-border rounded-lg p-3 flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-gray-400"><ArrowUpRight size={14} className="text-blue-500"/> Data Sent</div>
              <span className="text-sm font-bold text-white">{formatTotal(network?.total_bytes_sent)}</span>
            </div>
            <div className="bg-background border border-border rounded-lg p-3 flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-gray-400"><ArrowDownLeft size={14} className="text-purple-500"/> Data Received</div>
              <span className="text-sm font-bold text-white">{formatTotal(network?.total_bytes_recv)}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-white flex items-center gap-2"><Globe size={16}/> Active Connections</h3>
            <span className="text-xs text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Live</span>
          </div>
          <div className="bg-background border border-border rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-400"><Server size={14}/> Total Connections</div>
            <span className="text-2xl font-bold text-white">{network?.active_connections || 0}</span>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 flex-1 min-h-[350px] flex flex-col">
        <h3 className="text-sm font-medium text-white mb-4">Service Mesh Traffic (Live Speed)</h3>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRecv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => formatBytes(value)} width={80}/>
              <Tooltip 
                contentStyle={{ backgroundColor: '#121216', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value) => [formatBytes(value), '']}
              />
              <Area type="monotone" dataKey="recv" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorRecv)" name="Received" />
              <Area type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSent)" name="Sent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
