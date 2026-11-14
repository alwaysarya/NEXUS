import { useSearchParams } from 'react-router-dom';
import { Activity, Plus, Pause, Play, Search, ChevronDown, Maximize2, Server, Database, Users, ArrowRight, AlertTriangle, ShieldAlert } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const metricData = [
  { time: '00', cpu: 40, mem: 60, net: 30, req: 100 },
  { time: '04', cpu: 50, mem: 65, net: 40, req: 120 },
  { time: '08', cpu: 45, mem: 62, net: 50, req: 150 },
  { time: '12', cpu: 55, mem: 70, net: 45, req: 180 },
  { time: '16', cpu: 42, mem: 67, net: 35, req: 148 },
  { time: '20', cpu: 48, mem: 68, net: 38, req: 160 },
];

const servicePerfData = [
  { time: '08:00', req: 50, lat: 200, err: 2 },
  { time: '09:00', req: 100, lat: 250, err: 1 },
  { time: '10:00', req: 120, lat: 220, err: 3 },
  { time: '11:00', req: 140, lat: 280, err: 5 },
  { time: '12:00', req: 160, lat: 240, err: 2 },
  { time: '13:00', req: 120, lat: 210, err: 1 },
  { time: '14:00', req: 148, lat: 250, err: 2 },
];

const logData = [
  { time: '14:02:17.334', lvl: 'INFO', color: 'text-blue-400 bg-blue-400/10', svc: '[api-gateway]', msg: 'Request completed', m: 'GET /v1/orders', st: '200', dur: '128 ms' },
  { time: '14:02:16.981', lvl: 'WARN', color: 'text-yellow-400 bg-yellow-400/10', svc: '[payment-service]', msg: 'Elevated response time', m: '241 ms', st: '(threshold: 200 ms)', dur: '' },
  { time: '14:02:16.447', lvl: 'ERROR', color: 'text-red-400 bg-red-400/10', svc: '[order-service]', msg: 'Failed to process order', m: 'order_id=ORD-78421', st: 'reason:timeout', dur: '' },
  { time: '14:02:15.903', lvl: 'INFO', color: 'text-blue-400 bg-blue-400/10', svc: '[auth-service]', msg: 'Token validated', m: 'user_id=usr_9f2a...', st: '12 ms', dur: '' },
  { time: '14:02:14.120', lvl: 'INFO', color: 'text-blue-400 bg-blue-400/10', svc: '[api-gateway]', msg: 'Request completed', m: 'POST /v1/users', st: '201', dur: '85 ms' },
];

const traceData = [
  { id: 'tr-8f2a9c', duration: '128ms', status: '200 OK', time: '14:02:17', service: 'api-gateway', path: '/v1/orders' },
  { id: 'tr-9b1d4e', duration: '342ms', status: '200 OK', time: '14:02:16', service: 'order-service', path: '/v1/orders/create' },
  { id: 'tr-3c8f1a', duration: '1.2s', status: '500 Error', time: '14:02:15', service: 'payment-service', path: '/v1/payments/process' },
  { id: 'tr-7e2b5c', duration: '85ms', status: '200 OK', time: '14:02:14', service: 'auth-service', path: '/v1/auth/verify' },
  { id: 'tr-1a9d3f', duration: '215ms', status: '200 OK', time: '14:02:12', service: 'api-gateway', path: '/v1/users' },
];

const alertData = [
  { id: 'alt-1', title: 'High CPU Utilization', severity: 'Critical', service: 'api-gateway', time: '14:05:00', status: 'Firing' },
  { id: 'alt-2', title: 'Elevated Error Rate', severity: 'High', service: 'order-service', time: '13:58:22', status: 'Firing' },
  { id: 'alt-3', title: 'Disk Space Low', severity: 'Medium', service: 'postgres-db', time: '12:30:00', status: 'Resolved' },
  { id: 'alt-4', title: 'Service Unreachable', severity: 'Critical', service: 'payment-service', time: '11:15:00', status: 'Resolved' },
];

export default function ObservabilityPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Activity className="text-primary" size={24}/> Observability</h1>
          <p className="text-sm text-gray-400 mt-1">Real-time insights into your infrastructure, services, and applications.</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <button className="border border-border px-3 py-1.5 rounded bg-surface flex items-center gap-2 hover:bg-white/5"><ChevronDown size={14}/> Last 6 hours</button>
          <button className="border border-border px-3 py-1.5 rounded bg-surface flex items-center gap-2 hover:bg-white/5"><ChevronDown size={14}/> 30s</button>
          <button className="border border-border p-1.5 rounded hover:bg-white/5"><Pause size={16}/></button>
          <button className="bg-primary text-white px-3 py-1.5 rounded flex items-center gap-2 hover:bg-primary/90"><Plus size={14}/> Add Widget</button>
        </div>
      </div>

      <div className="flex gap-6 border-b border-border text-sm text-gray-400">
        {['Overview', 'Metrics', 'Logs', 'Traces', 'Alerts'].map((tab) => (
          <div key={tab} onClick={() => setSearchParams({ tab: tab.toLowerCase() })} className={`pb-2 cursor-pointer ${currentTab === tab.toLowerCase() ? 'text-white border-b-2 border-primary font-medium' : 'hover:text-white'}`}>
            {tab}
          </div>
        ))}
      </div>

      {currentTab === 'overview' || currentTab === 'metrics' ? (
        <>
          <div className="grid grid-cols-4 gap-4">
            {[
              { title: 'CPU Utilization', value: '42.8%', change: '-12.4%', color: '#22c55e' },
              { title: 'Memory Usage', value: '67.2%', change: '+3.8%', color: '#f97316' },
              { title: 'Network I/O', value: '3.46 Gbps', change: '+18.7%', color: '#eab308' },
              { title: 'Request Rate', value: '148.7K req/s', change: '+6.1%', color: '#22c55e' },
            ].map((item) => (
              <div key={item.title} className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between">
                <div className="text-sm text-gray-400">{item.title}</div>
                <div className="mt-2 flex items-end justify-between">
                  <div className="text-2xl font-bold text-white">{item.value}</div>
                  <div className="text-xs flex items-center gap-1" style={{ color: item.color }}>{item.change} <Activity size={12}/></div>
                </div>
                <div className="h-8 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metricData}><Line type="monotone" dataKey={item.title === 'CPU Utilization' ? 'cpu' : item.title === 'Memory Usage' ? 'mem' : item.title === 'Network I/O' ? 'net' : 'req'} stroke={item.color} strokeWidth={2} dot={false} /></LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>

          {currentTab === 'overview' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-surface border border-border rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-white">Service Performance</h3>
                    <div className="flex gap-2">
                      <button className="bg-primary/20 text-primary text-xs px-2 py-1 rounded">Requests</button>
                      <button className="text-gray-400 text-xs px-2 py-1 rounded hover:bg-white/5">Latency</button>
                      <button className="text-gray-400 text-xs px-2 py-1 rounded hover:bg-white/5">Errors</button>
                      <button className="text-gray-400 text-xs px-2 py-1 rounded hover:bg-white/5">Saturation</button>
                    </div>
                  </div>
                  <div className="h-64 relative">
                     <div className="absolute top-2 left-1/4 bg-background border border-border p-2 rounded shadow-lg z-10 text-xs">
                        <div className="text-gray-400 mb-1">Nov 14, 11:24</div>
                        <div className="flex items-center gap-2 text-purple-400"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Requests 162.4K req/s</div>
                        <div className="flex items-center gap-2 text-green-400"><span className="w-2 h-2 rounded-full bg-green-500"></span> Latency (p95) 128 ms</div>
                        <div className="flex items-center gap-2 text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Errors 0.18%</div>
                     </div>
                     <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={servicePerfData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#121216', borderColor: '#27272a', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="req" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorReq)" />
                        <Area type="monotone" dataKey="lat" stroke="#22c55e" strokeWidth={2} fillOpacity={0} />
                        <Area type="monotone" dataKey="err" stroke="#3b82f6" strokeWidth={2} fillOpacity={0} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-xl p-4 flex flex-col relative">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-white">Service Topology</h3>
                    <Maximize2 size={14} className="text-gray-500"/>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 relative">
                     <div className="flex items-center gap-8 w-full justify-center">
                        <div className="bg-background border border-border rounded px-2 py-1 text-xs text-gray-300 flex items-center gap-1"><Users size={12}/> Clients</div>
                        <div className="w-10 h-px bg-border"></div>
                        <div className="bg-surface border border-primary/50 rounded px-2 py-1 text-xs text-white flex items-center gap-1 shadow-[0_0_10px_rgba(99,102,241,0.2)]"><ArrowRight size={12}/> API Gateway</div>
                     </div>
                     <div className="h-8 w-px bg-border"></div>
                     <div className="w-[80%] h-px bg-border"></div>
                     <div className="flex justify-between w-[80%] relative">
                        {[
                          { name: 'Auth Service', stats: '12 pods • 4.2 ms' },
                          { name: 'Order Service', stats: '18 pods • 8.6 ms' },
                          { name: 'Payment Service', stats: '6 pods • 24.1 ms' },
                        ].map((svc, i) => (
                          <div key={svc.name} className="flex flex-col items-center relative">
                            <div className="h-8 w-px bg-border absolute -top-8"></div>
                            <div className="bg-surface border border-border rounded px-2 py-1 text-center z-10">
                               <div className="text-xs text-white flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{svc.name}</div>
                               <div className="text-[9px] text-gray-500">{svc.stats}</div>
                            </div>
                          </div>
                        ))}
                     </div>
                     <div className="w-[60%] h-px bg-border mt-8 relative">
                        <div className="absolute left-1/2 -top-4 h-4 w-px bg-border"></div>
                     </div>
                     <div className="bg-surface border border-border rounded px-2 py-1 text-xs text-white flex items-center gap-1 z-10"><Database size={12}/> Database</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 bg-surface border border-border rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-white">Latency Heatmap</h3>
                    <span className="text-xs text-gray-500">p95 Latency</span>
                  </div>
                  <div className="space-y-1">
                    {['api', 'auth', 'order', 'payment', 'inventory'].map((row) => (
                      <div key={row} className="flex items-center gap-1 text-xs">
                        <span className="w-12 text-gray-400">{row}</span>
                        <div className="flex-1 flex gap-1">
                          {[1, 2, 3, 4, 5, 6].map((col) => {
                            const isRed = (row === 'order' && col === 4) || (row === 'payment' && col === 5);
                            const isYellow = (row === 'auth' && col === 2) || (row === 'inventory' && col === 6);
                            return <div key={col} className={`h-4 flex-1 rounded-sm ${isRed ? 'bg-red-500' : isYellow ? 'bg-yellow-500' : 'bg-green-500/50'}`}></div>
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4 text-[10px] text-gray-500">
                    <span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span>
                    <div className="flex items-center gap-1 ml-auto"><span>≤ 500 ms</span><div className="w-16 h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded"></div><span>≤ 50 ms</span></div>
                  </div>
                </div>

                <div className="col-span-2 bg-surface border border-border rounded-xl p-4 flex flex-col gap-4">
                   <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-white">Incident Timeline</h3>
                      <div className="flex gap-2 text-xs text-gray-400">
                        <span className="border border-border px-2 py-0.5 rounded flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> 2 active</span>
                      </div>
                   </div>
                   <div className="h-16 relative bg-background rounded border border-border flex items-center px-2">
                      <div className="w-full h-1 bg-green-500/30 rounded relative">
                         <div className="absolute w-[20%] h-full bg-yellow-500/50" style={{left: '30%'}}></div>
                         <div className="absolute w-[10%] h-full bg-red-500/50" style={{left: '60%'}}></div>
                         
                         <div className="absolute -top-6 left-[30%] bg-surface border border-yellow-500/30 text-yellow-500 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1"><Activity size={10}/> Elevated latency</div>
                         <div className="absolute -top-6 left-[60%] bg-surface border border-red-500/30 text-red-500 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1"><Activity size={10}/> Error rate spike</div>
                      </div>
                      <div className="absolute bottom-1 w-full flex justify-between px-2 text-[9px] text-gray-600">
                        <span>08:00</span><span>09:00</span><span>10:00</span><span>11:00</span><span>12:00</span><span>13:00</span><span>14:00</span>
                      </div>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                     <div className="flex gap-4 text-gray-400">
                       <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Resolved</span>
                       <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Investigating</span>
                       <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Ongoing</span>
                     </div>
                   </div>
                </div>
              </div>
            </>
          )}

          {currentTab === 'metrics' && (
            <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Detailed Metrics</h3>
                <span className="text-xs text-gray-400 border border-border px-2 py-1 rounded">Last 15 min</span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-4">
                   <div className="flex justify-between text-sm text-gray-300"><span>CPU Utilization</span><span>42.8%</span></div>
                   <div className="w-full bg-border rounded-full h-3"><div className="bg-green-500 h-3 rounded-full" style={{width: '42.8%'}}></div></div>
                   
                   <div className="flex justify-between text-sm text-gray-300 mt-4"><span>Memory Usage</span><span>67.2%</span></div>
                   <div className="w-full bg-border rounded-full h-3"><div className="bg-purple-500 h-3 rounded-full" style={{width: '67.2%'}}></div></div>

                   <div className="flex justify-between text-sm text-gray-300 mt-4"><span>Disk I/O</span><span>12.4%</span></div>
                   <div className="w-full bg-border rounded-full h-3"><div className="bg-blue-500 h-3 rounded-full" style={{width: '12.4%'}}></div></div>
                 </div>
                 <div className="space-y-4">
                   <div className="flex justify-between text-sm text-gray-300"><span>Network I/O</span><span>3.46 Gbps</span></div>
                   <div className="w-full bg-border rounded-full h-3"><div className="bg-yellow-500 h-3 rounded-full" style={{width: '70%'}}></div></div>

                   <div className="flex justify-between text-sm text-gray-300 mt-4"><span>Requests/s</span><span>148.7K</span></div>
                   <div className="w-full bg-border rounded-full h-3"><div className="bg-primary h-3 rounded-full" style={{width: '60%'}}></div></div>

                   <div className="flex justify-between text-sm text-gray-300 mt-4"><span>Error Rate</span><span>0.18%</span></div>
                   <div className="w-full bg-border rounded-full h-3"><div className="bg-red-500 h-3 rounded-full" style={{width: '5%'}}></div></div>
                 </div>
              </div>
            </div>
          )}
        </>
      ) : currentTab === 'logs' ? (
        <div className="bg-surface border border-border rounded-xl flex flex-col p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white flex items-center gap-2"><Play size={12}/> Log Stream <span className="text-[10px] text-green-500 flex items-center gap-1 ml-2"><span className="w-1 h-1 bg-green-500 rounded-full"></span> Live</span> <span className="text-[10px] text-gray-500 ml-2">2.4K events/s</span></h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
               <button className="border border-border px-2 py-0.5 rounded flex items-center gap-1"><Pause size={10}/> Pause</button>
               <button className="bg-primary/20 text-primary px-2 py-0.5 rounded flex items-center gap-1"><Play size={10}/> Tail</button>
               <select className="bg-background border border-border rounded px-1 py-0.5 outline-none text-[10px]"><option>All Services</option></select>
               <select className="bg-background border border-border rounded px-1 py-0.5 outline-none text-[10px]"><option>All Levels</option></select>
               <div className="relative"><Search size={10} className="absolute left-1.5 top-1 text-gray-500"/><input className="bg-background border border-border rounded pl-5 pr-2 py-0.5 w-32 text-[10px] outline-none"/></div>
            </div>
          </div>
          <div className="font-mono text-[10px] space-y-1.5 flex-1">
            {logData.map((log, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-400 hover:bg-white/5 py-0.5 px-1 -mx-1 rounded">
                <span className="w-20 text-gray-500">{log.time}</span>
                <span className={`px-1.5 py-0.5 rounded w-12 text-center ${log.color}`}>{log.lvl}</span>
                <span className="w-28 truncate">{log.svc}</span>
                <span className="flex-1 truncate text-gray-300">{log.msg} <span className="text-gray-500">{log.m}</span></span>
                <span className="text-green-500">{log.st}</span>
                <span className="text-gray-500 w-12 text-right">{log.dur}</span>
              </div>
            ))}
          </div>
        </div>
      ) : currentTab === 'traces' ? (
        <div className="bg-surface border border-border rounded-xl flex flex-col">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="text-sm font-medium text-white">Distributed Traces</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
               <div className="relative"><Search size={12} className="absolute left-2 top-1.5 text-gray-500"/><input placeholder="Search traces..." className="bg-background border border-border rounded pl-7 pr-2 py-1 w-48 text-xs outline-none"/></div>
            </div>
          </div>
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="text-gray-500 uppercase bg-background/50 border-b border-border">
              <tr>
                <th className="px-4 py-2 font-medium">Trace ID</th>
                <th className="px-4 py-2 font-medium">Time</th>
                <th className="px-4 py-2 font-medium">Service</th>
                <th className="px-4 py-2 font-medium">Endpoint</th>
                <th className="px-4 py-2 font-medium">Duration</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {traceData.map((tr) => (
                <tr key={tr.id} className="hover:bg-white/5">
                  <td className="px-4 py-2.5 text-primary font-mono">{tr.id}</td>
                  <td className="px-4 py-2.5 text-gray-400">{tr.time}</td>
                  <td className="px-4 py-2.5 text-white">{tr.service}</td>
                  <td className="px-4 py-2.5 font-mono text-gray-400">{tr.path}</td>
                  <td className="px-4 py-2.5">{tr.duration}</td>
                  <td className="px-4 py-2.5"><span className={`px-1.5 py-0.5 rounded ${tr.status.includes('200') ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>{tr.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : currentTab === 'alerts' ? (
        <div className="bg-surface border border-border rounded-xl flex flex-col">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="text-sm font-medium text-white flex items-center gap-2"><AlertTriangle size={14} className="text-yellow-500"/> Active Alerts</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
               <select className="bg-background border border-border rounded px-2 py-1 outline-none"><option>All Severities</option></select>
            </div>
          </div>
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="text-gray-500 uppercase bg-background/50 border-b border-border">
              <tr>
                <th className="px-4 py-2 font-medium">Alert</th>
                <th className="px-4 py-2 font-medium">Severity</th>
                <th className="px-4 py-2 font-medium">Service</th>
                <th className="px-4 py-2 font-medium">Started At</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {alertData.map((alert) => (
                <tr key={alert.id} className="hover:bg-white/5">
                  <td className="px-4 py-2.5 text-white font-medium">{alert.title}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded flex items-center gap-1 w-fit ${
                      alert.severity === 'Critical' ? 'text-red-500 bg-red-500/10' : 
                      alert.severity === 'High' ? 'text-orange-500 bg-orange-500/10' : 'text-yellow-500 bg-yellow-500/10'
                    }`}>
                      <ShieldAlert size={12}/> {alert.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-400">{alert.service}</td>
                  <td className="px-4 py-2.5 text-gray-500">{alert.time}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded border ${alert.status === 'Firing' ? 'text-red-500 border-red-500/20 bg-red-500/5' : 'text-green-500 border-green-500/20 bg-green-500/5'}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                     <button className="border border-border text-gray-300 px-2 py-1 rounded hover:bg-white/5">Silence</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl p-10 flex flex-col items-center justify-center text-gray-500 h-64">
          <Activity size={32} className="mb-4 text-gray-600"/>
          <h2 className="text-lg text-white font-medium mb-1">No {currentTab} Data</h2>
          <p className="text-sm">This section is currently empty.</p>
        </div>
      )}
    </div>
  );
}
