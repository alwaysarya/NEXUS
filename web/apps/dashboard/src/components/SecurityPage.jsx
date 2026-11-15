import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shield, AlertTriangle, ShieldAlert, Lock, Activity, MoreHorizontal, Users, Key } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { fetchSecurityMetrics } from '../services/api';

const threatData = [ { name: 'Critical', value: 2, color: '#ef4444' }, { name: 'High', value: 3, color: '#f97316' }, { name: 'Medium', value: 1, color: '#eab308' }, { name: 'Low', value: 1, color: '#6b7280' } ];
const threatAreaData = [ { time: '00:00', v: 2 }, { time: '04:00', v: 3 }, { time: '08:00', v: 5 }, { time: '12:00', v: 4 }, { time: '16:00', v: 7 }, { time: '20:00', v: 7 } ];
const accessData = [ { time: '00:00', success: 3000, failed: 200 }, { time: '04:00', success: 2000, failed: 150 }, { time: '08:00', success: 5000, failed: 800 }, { time: '12:00', success: 4000, failed: 600 }, { time: '16:00', success: 4500, failed: 700 }, { time: '20:00', success: 3500, failed: 400 } ];

export default function SecurityPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchSecurityMetrics().then(setMetrics).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Shield className="text-primary" size={24} /> Security Operations Center</h1>
          <p className="text-sm text-gray-400 mt-1">Real-time threat detection, access control, and security posture for NEXUS.</p>
        </div>
      </div>

      <div className="flex gap-6 border-b border-border text-sm text-gray-400">
        {['Overview', 'Threats', 'Identity', 'Policies', 'Audit', 'RBAC'].map((tab) => (
          <div key={tab} onClick={() => setSearchParams({ tab: tab.toLowerCase() })} className={`pb-2 cursor-pointer ${currentTab === tab.toLowerCase() ? 'text-white border-b-2 border-primary font-medium' : 'hover:text-white'}`}>
            {tab === 'RBAC' ? 'RBAC Matrix' : tab === 'Threats' ? 'Threats & Incidents' : tab === 'Identity' ? 'Identity & Access' : tab === 'Policies' ? 'Policies & Compliance' : tab === 'Audit' ? 'Audit Logs' : tab}
          </div>
        ))}
      </div>

      {currentTab === 'overview' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Hostname', value: metrics ? metrics.hostname : '...', change: '', icon: ShieldAlert, color: '#ef4444' },
              { label: 'OS', value: metrics ? metrics.os : '...', change: '', icon: AlertTriangle, color: '#f97316' },
              { label: 'Platform', value: metrics ? metrics.platform : '...', change: '', icon: Lock, color: '#ec4899' },
              { label: 'Uptime (hrs)', value: metrics ? (metrics.uptime / 3600).toFixed(1) : '...', change: '', icon: Shield, color: '#22c55e' },
            ].map((m) => (
              <div key={m.label} className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start text-sm text-gray-400">
                  <div className="flex items-center gap-2"><m.icon size={16} style={{ color: m.color }}/> {m.label}</div>
                  <Activity size={12} style={{ color: m.color }}/>
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <div className="text-2xl font-bold text-white truncate">{m.value}</div>
                  <div className="text-xs" style={{ color: m.color }}>{m.change}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-surface border border-border rounded-xl p-4 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-white">Threat Overview</h3>
                <MoreHorizontal size={16} className="text-gray-500"/>
              </div>
              <div className="flex items-center h-48">
                <div className="w-1/3 h-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={threatData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">{threatData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie></PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span className="text-2xl font-bold text-white">7</span><span className="text-[10px] text-gray-400">Active Threats</span></div>
                </div>
                <div className="w-2/3 h-full">
                   <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={threatAreaData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs><linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient></defs>
                      <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} /><YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ backgroundColor: '#121216', borderColor: '#27272a', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorThreat)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <h4 className="text-xs text-gray-400 mb-2">Access Activity</h4>
                  <div className="flex gap-4 text-[10px] text-gray-400 mb-2"><span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-sm"></span> Successful</span><span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-sm"></span> Failed</span></div>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={accessData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} /><YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} /><Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#121216', borderColor: '#27272a', fontSize: '12px' }} />
                        <Bar dataKey="success" stackId="a" fill="#22c55e" radius={[2, 2, 0, 0]} /><Bar dataKey="failed" stackId="a" fill="#ef4444" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2"><h4 className="text-xs text-gray-400">Geographic Sign-ins</h4><span className="text-[10px] text-green-500 flex items-center gap-1"><span className="w-1 h-1 bg-green-500 rounded-full"></span> Live</span></div>
                  <div className="h-32 bg-background rounded border border-border flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#52525b 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                    <div className="z-10 text-gray-500 text-xs">[World Map]</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4 flex flex-col">
              <div className="flex justify-between items-center mb-4"><h3 className="text-sm font-medium text-white">Priority Incidents</h3><span className="text-xs text-primary cursor-pointer hover:underline">View All</span></div>
              <div className="space-y-4 flex-1">
                {[
                  { title: 'Suspicious Admin Login', time: '2 min ago', type: 'Critical', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
                  { title: 'Unauthorized API Access', time: '8 min ago', type: 'High', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
                  { title: 'Data Exfiltration Attempt', time: '13 min ago', type: 'High', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
                  { title: 'Policy Violation', time: '17 min ago', type: 'Medium', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
                ].map((inc) => (
                  <div key={inc.title} className="flex items-start justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div className="flex gap-3">
                      <div className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center ${inc.color}`}><AlertTriangle size={12} /></div>
                      <div><div className="text-sm text-gray-200 font-medium">{inc.title}</div><div className="text-[10px] text-gray-500 mt-1">{inc.time}</div></div>
                    </div>
                    <button className="text-xs border border-border px-2 py-1 rounded text-gray-300 hover:bg-white/5">Investigate</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {currentTab !== 'overview' && (
        <div className="bg-surface border border-border rounded-xl p-10 flex flex-col items-center justify-center text-gray-500 h-64">
          <Shield size={32} className="mb-4 text-gray-600"/>
          <h2 className="text-lg text-white font-medium mb-1">No {currentTab} Data</h2>
          <p className="text-sm">This section is currently empty.</p>
        </div>
      )}
    </div>
  );
}
