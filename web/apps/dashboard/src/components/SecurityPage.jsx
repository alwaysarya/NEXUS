import { Shield, AlertTriangle, ShieldAlert, Lock, Activity, CheckCircle2, MoreHorizontal, RefreshCw, XCircle, Search } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from 'recharts';

const threatData = [
  { name: 'Critical', value: 2, color: '#ef4444' },
  { name: 'High', value: 3, color: '#f97316' },
  { name: 'Medium', value: 1, color: '#eab308' },
  { name: 'Low', value: 1, color: '#6b7280' },
];

const threatAreaData = [
  { time: '00:00', v: 2 }, { time: '04:00', v: 3 }, { time: '08:00', v: 5 },
  { time: '12:00', v: 4 }, { time: '16:00', v: 7 }, { time: '20:00', v: 7 },
];

const accessData = [
  { time: '00:00', success: 3000, failed: 200 },
  { time: '04:00', success: 2000, failed: 150 },
  { time: '08:00', success: 5000, failed: 800 },
  { time: '12:00', success: 4000, failed: 600 },
  { time: '16:00', success: 4500, failed: 700 },
  { time: '20:00', success: 3500, failed: 400 },
];

export default function SecurityPage() {
  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="text-primary" size={24} /> Security Operations Center
          </h1>
          <p className="text-sm text-gray-400 mt-1">Real-time threat detection, access control, and security posture for NEXUS.</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2 border border-border px-3 py-1.5 rounded bg-surface cursor-pointer">
            <span className="text-gray-300">Last 24 Hours</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span>Auto-refresh</span>
            <div className="w-6 h-3 bg-primary rounded-full relative"><div className="absolute right-0.5 top-0.5 w-2 h-2 bg-white rounded-full"></div></div>
          </div>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Threats', value: '7', change: '+2', icon: ShieldAlert, color: '#ef4444' },
          { label: 'Security Incidents', value: '18', change: '+5', icon: AlertTriangle, color: '#f97316' },
          { label: 'Blocked Access', value: '142', change: '+28', icon: Lock, color: '#ec4899' },
          { label: 'Security Posture', value: '96.8%', change: '+0.6%', icon: Shield, color: '#22c55e' },
        ].map((m) => (
          <div key={m.label} className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start text-sm text-gray-400">
              <div className="flex items-center gap-2"><m.icon size={16} style={{ color: m.color }}/> {m.label}</div>
              <div className="w-16 h-6 flex items-center justify-center"> <Activity size={12} style={{ color: m.color }}/> </div>
            </div>
            <div className="mt-2 flex items-end justify-between">
              <div className="text-2xl font-bold text-white">{m.value}</div>
              <div className="text-xs" style={{ color: m.color }}>{m.change}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-surface border border-border rounded-xl p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-white">Threat Overview</h3>
            <MoreHorizontal size={16} className="text-gray-500"/>
          </div>
          <div className="flex items-center h-48">
            <div className="w-1/3 h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={threatData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                    {threatData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-white">7</span>
                <span className="text-[10px] text-gray-400">Active Threats</span>
              </div>
            </div>
            <div className="w-2/3 h-full">
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={threatAreaData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#121216', borderColor: '#27272a', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorThreat)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <h4 className="text-xs text-gray-400 mb-2">Access Activity</h4>
              <div className="flex gap-4 text-[10px] text-gray-400 mb-2">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-sm"></span> Successful</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-sm"></span> Failed</span>
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accessData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#121216', borderColor: '#27272a', fontSize: '12px' }} />
                    <Bar dataKey="success" stackId="a" fill="#22c55e" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="failed" stackId="a" fill="#ef4444" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs text-gray-400">Geographic Sign-ins</h4>
                <span className="text-[10px] text-green-500 flex items-center gap-1"><span className="w-1 h-1 bg-green-500 rounded-full"></span> Live</span>
              </div>
              <div className="h-32 bg-background rounded border border-border flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#52525b 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                <div className="z-10 text-gray-500 text-xs">[World Map]</div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Incidents */}
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-white">Priority Incidents</h3>
            <span className="text-xs text-primary cursor-pointer hover:underline">View All</span>
          </div>
          <div className="space-y-4 flex-1">
            {[
              { title: 'Suspicious Admin Login', time: '2 min ago', type: 'Critical', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
              { title: 'Unauthorized API Access', time: '8 min ago', type: 'High', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
              { title: 'Data Exfiltration Attempt', time: '13 min ago', type: 'High', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
              { title: 'Policy Violation', time: '17 min ago', type: 'Medium', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
            ].map((inc) => (
              <div key={inc.title} className="flex items-start justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div className="flex gap-3">
                  <div className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center ${inc.color}`}>
                    <AlertTriangle size={12} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-200 font-medium">{inc.title}</div>
                    <div className="text-[10px] text-gray-500 mt-1">{inc.time}</div>
                  </div>
                </div>
                <button className="text-xs border border-border px-2 py-1 rounded text-gray-300 hover:bg-white/5">Investigate</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-3 gap-4">
        {/* RBAC Matrix */}
        <div className="col-span-1 bg-surface border border-border rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-white">RBAC - Role Matrix</h3>
            <span className="text-xs text-primary cursor-pointer hover:underline">Manage Roles →</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="text-gray-500">
              <tr>
                <th className="font-medium pb-2">Role</th>
                <th className="font-medium pb-2">Compute</th>
                <th className="font-medium pb-2">Storage</th>
                <th className="font-medium pb-2">Network</th>
                <th className="font-medium pb-2">Security</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {['Platform Admin', 'Cluster Admin', 'DevOps', 'Developer', 'Viewer'].map(role => (
                <tr key={role} className="border-t border-border/50">
                  <td className="py-2 flex items-center gap-2"><Shield size={10} className="text-gray-500"/> {role}</td>
                  <td className="py-2 text-green-500">✓</td>
                  <td className="py-2 text-green-500">✓</td>
                  <td className="py-2 text-green-500">✓</td>
                  <td className="py-2 text-green-500">✓</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Auth Timeline */}
        <div className="col-span-1 bg-surface border border-border rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-white">Authentication Timeline</h3>
            <span className="text-[10px] text-green-500 flex items-center gap-1"><span className="w-1 h-1 bg-green-500 rounded-full"></span> Live</span>
          </div>
          <div className="space-y-4 relative before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-border">
            {[
              { time: '20:14', text: 'Successful login - admin@nexus.io', color: 'bg-green-500' },
              { time: '19:58', text: 'Failed login - user@external.com', color: 'bg-red-500' },
              { time: '19:47', text: 'Successful login - devops@nexus.io', color: 'bg-green-500' },
              { time: '19:32', text: 'MFA challenge - ops@nexus.io', color: 'bg-yellow-500' },
            ].map((event, i) => (
              <div key={i} className="flex gap-3 relative z-10 text-xs">
                <div className={`w-2.5 h-2.5 rounded-full mt-0.5 ${event.color} border-2 border-surface`}></div>
                <div>
                  <div className="text-gray-300">{event.text}</div>
                  <div className="text-[10px] text-gray-500">{event.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance */}
        <div className="col-span-1 bg-surface border border-border rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-white">Policy Compliance</h3>
            <MoreHorizontal size={16} className="text-gray-500"/>
          </div>
          <div className="flex items-center justify-around h-40">
            {[
              { label: 'Access Policies', value: 98.4, color: '#22c55e' },
              { label: 'Security Policies', value: 97.1, color: '#22c55e' },
              { label: 'GDPR/SOC2', value: 92.6, color: '#eab308' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="#27272a" strokeWidth="4" fill="none" />
                    <circle cx="32" cy="32" r="28" stroke={item.color} strokeWidth="4" fill="none" strokeDasharray="176" strokeDashoffset={176 - (176 * item.value) / 100} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{item.value}%</div>
                </div>
                <div className="text-[10px] text-gray-400 mt-2 text-center">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-surface border border-border rounded-xl flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="text-sm font-medium text-white">Audit Event Stream <span className="text-xs text-gray-500 font-normal ml-2">Real-time security and access events</span></h3>
          <div className="flex gap-2">
            <select className="bg-background border border-border rounded px-2 py-1 text-xs text-gray-300 outline-none"><option>All Events</option></select>
            <button className="border border-border px-3 py-1 rounded text-xs text-gray-300 hover:bg-white/5">View Full Log →</button>
          </div>
        </div>
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="text-gray-500 uppercase bg-background/50 border-b border-border">
            <tr>
              <th className="px-4 py-2 font-medium">Time</th>
              <th className="px-4 py-2 font-medium">Event</th>
              <th className="px-4 py-2 font-medium">Actor</th>
              <th className="px-4 py-2 font-medium">Resource</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              { time: '20:15:04', event: 'Role updated (DevOps → Cluster Admin)', actor: 'admin@nexus.io', res: 'rbac/role', status: 'Success', color: 'text-green-500' },
              { time: '20:12:47', event: 'Policy modified (network-ingress)', actor: 'secops@nexus.io', res: 'policy/network', status: 'Success', color: 'text-green-500' },
              { time: '20:07:29', event: 'Access denied (unauthorized scope)', actor: 'user@external.com', res: 'api/v1/clusters', status: 'Blocked', color: 'text-red-500' },
              { time: '20:03:11', event: 'Resource deleted (test-pod)', actor: 'dev@nexus.io', res: 'k8s/pod', status: 'Success', color: 'text-green-500' },
              { time: '19:58:36', event: 'Multiple failed login attempts (5)', actor: 'user@external.com', res: 'auth/login', status: 'Blocked', color: 'text-red-500' },
            ].map((log, i) => (
              <tr key={i} className="hover:bg-white/5">
                <td className="px-4 py-2.5 text-gray-500">{log.time}</td>
                <td className="px-4 py-2.5 text-gray-200 flex items-center gap-2">
                  {log.status === 'Blocked' ? <XCircle size={12} className="text-red-500"/> : <CheckCircle2 size={12} className="text-green-500"/>} {log.event}
                </td>
                <td className="px-4 py-2.5">{log.actor}</td>
                <td className="px-4 py-2.5 font-mono text-gray-400">{log.res}</td>
                <td className="px-4 py-2.5"><span className={`${log.color} bg-background px-2 py-0.5 rounded border border-border`}>{log.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
