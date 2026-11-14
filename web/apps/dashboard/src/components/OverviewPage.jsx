import { Activity, Box, Server, Shield, AlertTriangle, Layers, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const chartData = [
  { time: '00:00', req: 40, err: 2 }, { time: '04:00', req: 60, err: 4 },
  { time: '08:00', req: 80, err: 3 }, { time: '12:00', req: 100, err: 8 },
  { time: '16:00', req: 90, err: 5 }, { time: '20:00', req: 110, err: 2 },
];

export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full w-full">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Global summary of your cloud infrastructure and services.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Clusters', value: '4', sub: '1 Production', icon: Box, color: 'text-blue-500' },
          { label: 'Running Workloads', value: '148', sub: 'Across all clusters', icon: Layers, color: 'text-purple-500' },
          { label: 'Active Incidents', value: '2', sub: 'Requires attention', icon: AlertTriangle, color: 'text-red-500' },
          { label: 'Security Score', value: '96.8%', sub: 'Excellent standing', icon: Shield, color: 'text-green-500' },
        ].map((m) => (
          <div key={m.label} className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>{m.label}</span>
              <m.icon size={16} className={m.color} />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-white">{m.value}</div>
              <div className="text-xs text-gray-500 mt-1">{m.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-surface border border-border rounded-xl p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-white">Global Traffic Overview</h3>
            <span className="text-xs text-gray-400 border border-border px-2 py-1 rounded">Last 24 hours</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#121216', borderColor: '#27272a', fontSize: '12px' }} />
                <Area type="monotone" dataKey="req" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorReq)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-white">System Health</h3>
            <span className="text-xs text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Live</span>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-4">
            {[
              { name: 'API Gateway', status: 'Healthy', val: '99.99%' },
              { name: 'Database Cluster', status: 'Healthy', val: '99.95%' },
              { name: 'Auth Service', status: 'Healthy', val: '99.98%' },
              { name: 'Storage Nodes', status: 'Degraded', val: '98.50%' },
            ].map((sys) => (
              <div key={sys.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${sys.status === 'Healthy' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                  <span className="text-sm text-gray-300">{sys.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white">{sys.val}</div>
                  <div className={`text-[10px] ${sys.status === 'Healthy' ? 'text-green-500' : 'text-yellow-500'}`}>{sys.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Deployments */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-white">Recent Deployments</h3>
          <span className="text-xs text-primary cursor-pointer hover:underline flex items-center gap-1">View All <ChevronRight size={12}/></span>
        </div>
        <div className="space-y-3">
          {[
            { id: 'v2.8.4', msg: 'Improve API response time', author: 'Aman Verma', time: '2h ago', status: 'Deploying', env: 'Production' },
            { id: 'v2.8.3', msg: 'Add request caching', author: 'Rahul Singh', time: '1d ago', status: 'Succeeded', env: 'Production' },
            { id: 'v2.8.2', msg: 'Fix session timeout', author: 'Priya Sharma', time: '3d ago', status: 'Succeeded', env: 'Staging' },
          ].map((dep) => (
            <div key={dep.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-white">{dep.id}</div>
                <div className="text-sm text-gray-300">{dep.msg}</div>
              </div>
              <div className="flex items-center gap-6 text-xs text-gray-500">
                <span>{dep.env}</span>
                <span>{dep.author}</span>
                <span>{dep.time}</span>
                <span className={`flex items-center gap-1 ${dep.status === 'Succeeded' ? 'text-green-500' : 'text-primary'}`}>
                  {dep.status === 'Succeeded' ? '✓' : <Activity size={10}/>} {dep.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
