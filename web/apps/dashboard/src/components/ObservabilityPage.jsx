import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity, Plus, Pause, Play, Search, ChevronDown, Maximize2, Server, Database, Users, ArrowRight, AlertTriangle, ShieldAlert } from 'lucide-react';
import { fetchObservabilityMetrics, fetchTracesMetrics, fetchAlertsMetrics } from '../services/api';

export default function ObservabilityPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const [metrics, setMetrics] = useState(null);
  const [traces, setTraces] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (currentTab === 'overview' || currentTab === 'metrics') {
      fetchObservabilityMetrics().then(setMetrics).catch(console.error);
    } else if (currentTab === 'traces') {
      fetchTracesMetrics().then(setTraces).catch(console.error);
    } else if (currentTab === 'alerts') {
      fetchAlertsMetrics().then(setAlerts).catch(console.error);
    }
  }, [currentTab]);

  const cpuUsage = metrics ? metrics.cpu_usage.toFixed(1) : '0.0';
  const memUsage = metrics ? metrics.memory_usage.toFixed(1) : '0.0';
  const netRecv = metrics ? (metrics.network_recv / (1024*1024)).toFixed(2) : '0.00';

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
              { title: 'CPU Utilization', value: `${cpuUsage}%`, change: '-12.4%', color: '#22c55e' },
              { title: 'Memory Usage', value: `${memUsage}%`, change: '+3.8%', color: '#f97316' },
              { title: 'Network I/O', value: `${netRecv} MB`, change: '+18.7%', color: '#eab308' },
              { title: 'Request Rate', value: '148.7K req/s', change: '+6.1%', color: '#22c55e' },
            ].map((item) => (
              <div key={item.title} className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between">
                <div className="text-sm text-gray-400">{item.title}</div>
                <div className="mt-2 flex items-end justify-between">
                  <div className="text-2xl font-bold text-white">{item.value}</div>
                  <div className="text-xs flex items-center gap-1" style={{ color: item.color }}>{item.change} <Activity size={12}/></div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : currentTab === 'traces' ? (
        <div className="bg-surface border border-border rounded-xl flex flex-col">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="text-sm font-medium text-white">Distributed Traces (Real Processes)</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
               <div className="relative"><Search size={12} className="absolute left-2 top-1.5 text-gray-500"/><input placeholder="Search traces..." className="bg-background border border-border rounded pl-7 pr-2 py-1 w-48 text-xs outline-none"/></div>
            </div>
          </div>
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="text-gray-500 uppercase bg-background/50 border-b border-border">
              <tr>
                <th className="px-4 py-2 font-medium">Trace ID (PID)</th>
                <th className="px-4 py-2 font-medium">Service Name</th>
                <th className="px-4 py-2 font-medium">Duration</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {traces.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-4 text-gray-500">No traces found.</td></tr>
              ) : (
                traces.map((tr) => (
                  <tr key={tr.id} className="hover:bg-white/5">
                    <td className="px-4 py-2.5 text-primary font-mono">{tr.id}</td>
                    <td className="px-4 py-2.5 text-white">{tr.service}</td>
                    <td className="px-4 py-2.5">{tr.duration}</td>
                    <td className="px-4 py-2.5"><span className="px-1.5 py-0.5 rounded text-green-500 bg-green-500/10">{tr.status}</span></td>
                  </tr>
                ))
              )}
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
                <th className="px-4 py-2 font-medium">Message</th>
                <th className="px-4 py-2 font-medium">Time</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {alerts.map((alert, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="px-4 py-2.5 text-white font-medium">{alert.title}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded flex items-center gap-1 w-fit ${
                      alert.severity === 'Critical' ? 'text-red-500 bg-red-500/10' : 
                      alert.severity === 'High' ? 'text-orange-500 bg-orange-500/10' : 'text-green-500 bg-green-500/10'
                    }`}>
                      <ShieldAlert size={12}/> {alert.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-400">{alert.message}</td>
                  <td className="px-4 py-2.5 text-gray-500">{alert.time}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded border ${
                      alert.severity === 'Critical' ? 'text-red-500 border-red-500/20 bg-red-500/5' : 
                      alert.severity === 'High' ? 'text-orange-500 border-orange-500/20 bg-orange-500/5' : 'text-green-500 border-green-500/20 bg-green-500/5'
                    }`}>
                      Firing
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
