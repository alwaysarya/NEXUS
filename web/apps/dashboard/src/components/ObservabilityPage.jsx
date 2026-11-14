import { Activity, Plus, Pause, Play, Search, ChevronDown, Maximize2, Copy, Download, Server, Database, Users, ArrowRight, Shield } from 'lucide-react';
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

export default function ObservabilityPage() {
  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full w-full">
      {/* Header */}
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

      {/* Top Metrics */}
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
              <div className="text-xs flex items-center gap-1" style={{ color: item.color }}>
                {item.change} <Activity size={12}/>
              </div>
            </div>
            <div className="h-8 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metricData}>
                  <Line type="monotone" dataKey={item.title === 'CPU Utilization' ? 'cpu' : item.title === 'Memory Usage' ? 'mem' : item.title === 'Network I/O' ? 'net' : 'req'} stroke={item.color} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Section: Service Performance & Topology */}
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

        {/* Service Topology */}
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

      {/* Bottom Section */}
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

      {/* Logs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-surface border border-border rounded-xl flex flex-col p-4">
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
            {[
              { time: '14:02:17.334', lvl: 'INFO', color: 'text-blue-400 bg-blue-400/10', svc: '[api-gateway]', msg: 'Request completed', m: 'GET /v1/orders', st: '200', dur: '128 ms' },
              { time: '14:02:16.981', lvl: 'WARN', color: 'text-yellow-400 bg-yellow-400/10', svc: '[payment-service]', msg: 'Elevated response time', m: '241 ms', st: '(threshold: 200 ms)', dur: '' },
              { time: '14:02:16.447', lvl: 'ERROR', color: 'text-red-400 bg-red-400/10', svc: '[order-service]', msg: 'Failed to process order', m: 'order_id=ORD-78421', st: 'reason:timeout', dur: '' },
              { time: '14:02:15.903', lvl: 'INFO', color: 'text-blue-400 bg-blue-400/10', svc: '[auth-service]', msg: 'Token validated', m: 'user_id=usr_9f2a...', st: '12 ms', dur: '' },
              { time: '14:02:14.120', lvl: 'INFO', color: 'text-blue-400 bg-blue-400/10', svc: '[api-gateway]', msg: 'Request completed', m: 'POST /v1/users', st: '201', dur: '85 ms' },
            ].map((log, i) => (
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
          <div className="mt-2 h-8 bg-background rounded flex items-center px-2 gap-1 relative overflow-hidden">
             <div className="flex-1 h-full flex items-center gap-0.5 opacity-50">
               {Array.from({length: 100}).map((_, i) => <div key={i} className="w-1 bg-primary rounded-full" style={{height: `${Math.random() * 80 + 20}%`}}></div>)}
             </div>
             <div className="absolute right-2 flex items-center gap-2 text-gray-500">
                <span className="text-[10px]">11:24:00 Nov 14, 2024</span>
                <div className="flex gap-1"><button className="border border-border p-0.5 rounded"><Maximize2 size={10}/></button><button className="border border-border p-0.5 rounded"><Search size={10}/></button></div>
             </div>
          </div>
        </div>

        <div className="col-span-1 bg-surface border border-border rounded-xl p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-white">Active Incidents</h3>
            <span className="text-xs text-primary cursor-pointer hover:underline">View All</span>
          </div>
          <div className="space-y-3 flex-1 text-xs">
             <div className="bg-background border border-border rounded p-3 flex gap-3">
                <div className="text-red-500 mt-0.5"><Activity size={16}/></div>
                <div className="flex-1">
                  <div className="text-gray-200 font-medium">Error rate spike in order-service</div>
                  <div className="text-[10px] text-gray-500 mt-1">Started 12:41 - Affecting 8% of requests</div>
                </div>
                <span className="text-red-500 bg-red-500/10 px-1.5 py-0.5 h-fit rounded text-[10px] border border-red-500/20">Ongoing</span>
             </div>
             <div className="bg-background border border-border rounded p-3 flex gap-3">
                <div className="text-yellow-500 mt-0.5"><Activity size={16}/></div>
                <div className="flex-1">
                  <div className="text-gray-200 font-medium">Elevated latency in payment-service</div>
                  <div className="text-[10px] text-gray-500 mt-1">Started 11:07 - p95 at 328 ms</div>
                </div>
                <span className="text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 h-fit rounded text-[10px] border border-yellow-500/20">Investigating</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
