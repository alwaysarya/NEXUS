import { useState, useEffect } from 'react';
import { Activity, Box, Server, Shield, Layers, ChevronRight, Cloud, Globe, Boxes } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchRealMetrics, fetchAWSMetrics, fetchGCPMetrics, fetchAzureMetrics, fetchTrafficHistory } from '../services/api';

export default function OverviewPage() {
  const [metrics, setMetrics] = useState(null);
  const [aws, setAws] = useState(null);
  const [gcp, setGcp] = useState(null);
  const [azure, setAzure] = useState(null);
  const [trafficData, setTrafficData] = useState([]);
  
  const env = localStorage.getItem('nexus_env')?.toLowerCase() || 'production';
  const region = localStorage.getItem('nexus_region')?.split(' ')[0] || 'us-east-1';

  useEffect(() => {
    fetchRealMetrics(env, region).then(setMetrics).catch(console.error);
    fetchAWSMetrics().then(setAws).catch(console.error);
    fetchGCPMetrics().then(setGcp).catch(console.error);
    fetchAzureMetrics().then(setAzure).catch(console.error);
    fetchTrafficHistory().then(setTrafficData).catch(console.error);
  }, [env, region]);

  const getFriendlyOS = (os) => {
    if (!os) return '...';
    if (os.toLowerCase() === 'darwin') return 'macOS';
    if (os.toLowerCase() === 'linux') return 'Linux';
    return os;
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full w-full bg-background text-white">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview ({env.charAt(0).toUpperCase() + env.slice(1)} - {region})</h1>
        <p className="text-sm text-gray-400 mt-1">Global summary of your cloud infrastructure and services.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'CPU Usage', value: metrics ? `${metrics.cpu.usage.toFixed(1)}%` : '...', sub: `${metrics ? metrics.cpu.cores : '...'} cores`, icon: Box, color: 'text-blue-500' },
          { label: 'Memory Used', value: metrics ? `${(metrics.memory.used / (1024*1024*1024)).toFixed(1)} GB` : '...', sub: `${metrics ? (metrics.memory.usage_percent).toFixed(1) : '...'}%`, icon: Layers, color: 'text-purple-500' },
          { label: 'OS', value: metrics ? getFriendlyOS(metrics.host.os) : '...', sub: metrics ? metrics.host.platform : '...', icon: Server, color: 'text-green-500' },
          { label: 'Uptime', value: metrics ? `${(metrics.host.uptime / 3600).toFixed(1)} hrs` : '...', sub: 'System Uptime', icon: Shield, color: 'text-yellow-500' },
        ].map((m) => (
          <div key={m.label} className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between hover:border-gray-600 transition-colors">
            <div className="flex items-center justify-between text-sm text-gray-400"><span>{m.label}</span><m.icon size={18} className={m.color} /></div>
            <div className="mt-4"><div className="text-3xl font-bold text-white tracking-tight">{m.value}</div><div className="text-xs text-gray-500 mt-1 font-medium">{m.sub}</div></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between relative overflow-hidden hover:border-orange-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full -mr-4 -mt-4 transition-all"></div>
          <div className="flex items-center gap-3 mb-6 z-10">
            <div className="p-2.5 bg-orange-500/10 rounded-lg"><Cloud size={22} className="text-orange-500" /></div>
            <div><h3 className="text-white font-semibold">AWS Cloud</h3><p className="text-xs text-gray-500">Amazon Web Services</p></div>
          </div>
          <div className="flex items-end justify-between z-10">
            <div><div className="text-4xl font-bold text-white">{aws?.s3_buckets ?? '0'}</div><div className="text-xs text-gray-400 mt-1 font-medium">S3 Buckets</div></div>
            <span className="text-[10px] px-2.5 py-1 rounded-full border text-green-500 border-green-500/20 bg-green-500/10 font-semibold tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>Connected
            </span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between relative overflow-hidden hover:border-blue-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 transition-all"></div>
          <div className="flex items-center gap-3 mb-6 z-10">
            <div className="p-2.5 bg-blue-500/10 rounded-lg"><Globe size={22} className="text-blue-500" /></div>
            <div><h3 className="text-white font-semibold">Google Cloud</h3><p className="text-xs text-gray-500">GCP Platform</p></div>
          </div>
          <div className="flex items-end justify-between z-10">
            <div><div className="text-4xl font-bold text-white">0</div><div className="text-xs text-gray-400 mt-1 font-medium">Projects</div></div>
            <span className="text-[10px] px-2.5 py-1 rounded-full border text-red-500 border-red-500/20 bg-red-500/10 font-semibold tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Not Connected
            </span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between relative overflow-hidden hover:border-cyan-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full -mr-4 -mt-4 transition-all"></div>
          <div className="flex items-center gap-3 mb-6 z-10">
            <div className="p-2.5 bg-cyan-500/10 rounded-lg"><Boxes size={22} className="text-cyan-500" /></div>
            <div><h3 className="text-white font-semibold">Microsoft Azure</h3><p className="text-xs text-gray-500">Azure Cloud</p></div>
          </div>
          <div className="flex items-end justify-between z-10">
            <div><div className="text-4xl font-bold text-white">0</div><div className="text-xs text-gray-400 mt-1 font-medium">Virtual Machines</div></div>
            <span className="text-[10px] px-2.5 py-1 rounded-full border text-red-500 border-red-500/20 bg-red-500/10 font-semibold tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Not Connected
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold text-white">Global Traffic Overview</h3>
            <span className="text-xs text-gray-400 bg-background border border-border px-3 py-1.5 rounded-lg font-medium">Last 24 hours</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRecv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121216', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}
                  formatter={(value) => [`${(value / 1000000).toFixed(2)} MB`, '']}
                />
                <Area type="monotone" dataKey="recv" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRecv)" name="Received" />
                <Area type="monotone" dataKey="sent" stroke="#22c55e" strokeWidth={2} fillOpacity={0} name="Sent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold text-white">System Health</h3>
            <span className="text-xs text-green-500 flex items-center gap-1.5 bg-green-500/10 px-2.5 py-1 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Live
            </span>
          </div>
          
          <div className="flex-1 flex flex-col gap-5">
            {[
              { label: 'CPU Cores', val: metrics ? metrics.cpu.cores : '...', stat: 'Healthy', pct: 100 },
              { label: 'Memory', val: metrics ? `${(metrics.memory.usage_percent).toFixed(1)}%` : '...', stat: metrics && metrics.memory.usage_percent > 80 ? 'Degraded' : 'Healthy', pct: metrics ? metrics.memory.usage_percent : 0 },
              { label: 'Platform', val: metrics ? getFriendlyOS(metrics.host.os) : '...', stat: 'Healthy', pct: 100 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${item.stat === 'Healthy' ? 'bg-green-500' : 'bg-yellow-500'}`}></span><span className="text-sm text-gray-300 font-medium">{item.label}</span></div>
                  <div className="text-right"><span className="text-sm font-bold text-white">{item.val}</span></div>
                </div>
                <div className="w-full bg-background rounded-full h-1.5 mt-1 overflow-hidden border border-border">
                  <div className={`h-full ${item.stat === 'Healthy' ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${item.pct}%` }}></div>
                </div>
              </div>
            ))}

            <div className="mt-2 pt-4 border-t border-border">
              <div className="text-xs text-gray-500 mb-3 font-semibold tracking-wider uppercase">Cloud Providers</div>
              <div className="flex items-center justify-between mb-2 last:mb-0">
                <span className="text-sm text-gray-300">AWS</span>
                <span className="text-xs flex items-center gap-1.5 font-medium text-green-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Connected (limited)
                </span>
              </div>
              <div className="flex items-center justify-between mb-2 last:mb-0">
                <span className="text-sm text-gray-300">GCP</span>
                <span className="text-xs flex items-center gap-1.5 font-medium text-red-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Disconnected
                </span>
              </div>
              <div className="flex items-center justify-between mb-2 last:mb-0">
                <span className="text-sm text-gray-300">Azure</span>
                <span className="text-xs flex items-center gap-1.5 font-medium text-red-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Disconnected
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-sm font-semibold text-white">Recent Deployments</h3>
          <span className="text-xs text-primary cursor-pointer hover:text-primary/80 transition-colors flex items-center gap-1 font-medium">View All <ChevronRight size={14}/></span>
        </div>
        <div className="space-y-3">
          {[
            { id: 'a1b2c3d', msg: 'feat: added real dashboard logic', author: 'Aryan', time: 'Just now', status: 'Succeeded', env: 'Production' },
            { id: 'x9y8z7w', msg: 'fix: updated UI components', author: 'Aryan', time: '1 day ago', status: 'Succeeded', env: 'Production' },
            { id: 'm4n5o6p', msg: 'chore: initial setup', author: 'Aryan', time: '3 days ago', status: 'Succeeded', env: 'Staging' },
          ].map((dep) => (
            <div key={dep.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-background border border-border rounded-xl gap-3 hover:border-gray-600 transition-colors">
              <div className="flex items-center gap-4">
                <div className="text-sm font-bold text-white bg-surface border border-border px-2.5 py-1 rounded-md">{dep.id}</div>
                <div className="text-sm text-gray-300 font-medium">{dep.msg}</div>
              </div>
              <div className="flex items-center gap-6 text-xs text-gray-400 font-medium">
                <span className="bg-surface px-2 py-1 rounded-md border border-border">{dep.env}</span>
                <span>{dep.author}</span><span>{dep.time}</span>
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold ${dep.status === 'Succeeded' ? 'text-green-500 bg-green-500/10 border border-green-500/20' : 'text-primary bg-primary/10 border border-primary/20'}`}>
                  {dep.status === 'Succeeded' ? '✓' : <Activity size={12} className="animate-spin" />} {dep.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
