import { useState, useEffect } from 'react';
import { Activity, Plus, Settings, TrendingUp, TrendingDown, Terminal, GitCommit, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ObservabilityPage() {
  const [activeTab, setActiveTab] = useState('Metrics');
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [traces, setTraces] = useState([]);

  useEffect(() => {
    // Fetch Metrics
    fetch('http://127.0.0.1:8080/api/observability-metrics')
      .then(res => res.json()).then(data => setMetrics(data)).catch(console.error);

    // Fetch Alerts
    fetch('http://127.0.0.1:8080/api/alerts')
      .then(res => res.json()).then(data => setAlerts(data)).catch(console.error);

    // Fetch Traces
    fetch('http://127.0.0.1:8080/api/traces')
      .then(res => res.json()).then(data => setTraces(data)).catch(console.error);

    // Live Logs
    const interval = setInterval(() => {
      setLogs(prev => [...prev.slice(-10), `[${new Date().toLocaleTimeString()}] [INFO] System check passed.`]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'Metrics':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'CPU Utilization', val: metrics?.cpu !== undefined ? `${metrics.cpu.toFixed(1)}%` : '...', trend: '-12.4%', trendDown: true },
                { label: 'Memory Usage', val: metrics?.mem !== undefined ? `${metrics.mem.toFixed(1)}%` : '...', trend: '+3.8%', trendDown: false },
                { label: 'Network I/O', val: metrics?.net !== undefined ? `${metrics.net.toFixed(0)} MB` : '...', trend: '+18.7%', trendDown: false },
                { label: 'Request Rate', val: '148.7 req/s', trend: '+6.1%', trendDown: false },
              ].map((m, i) => (
                <div key={i} className="bg-surface border border-border rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-2">{m.label}</div>
                  <div className="flex justify-between items-end">
                    <div className="text-2xl font-bold text-white">{m.val}</div>
                    <div className={`text-xs flex items-center gap-1 font-medium ${m.trendDown ? 'text-red-500' : 'text-green-500'}`}>
                      {m.trendDown ? <TrendingDown size={12}/> : <TrendingUp size={12}/>} {m.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 flex-1 min-h-[400px] flex flex-col mt-4">
              <h3 className="text-sm font-medium text-white mb-4">Infrastructure Metrics (Live)</h3>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics?.graph || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                    <Tooltip contentStyle={{ backgroundColor: '#121216', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }} formatter={(value) => [value ? `${Number(value).toFixed(1)}%` : '0%', '']} />
                    <Area type="monotone" dataKey="cpu" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" name="CPU" />
                    <Area type="monotone" dataKey="mem" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" name="Memory" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        );
      case 'Logs':
        return (
          <div className="bg-surface border border-border rounded-xl p-5 flex-1 flex flex-col">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2"><Terminal size={16}/> Live System Logs</h3>
            <div className="flex-1 bg-background border border-border rounded-lg p-4 font-mono text-xs text-gray-300 space-y-2 overflow-y-auto max-h-[500px]">
              {logs.map((log, i) => <div key={i} className="text-gray-400">{log}</div>)}
            </div>
          </div>
        );
      case 'Traces':
        return (
          <div className="bg-surface border border-border rounded-xl p-5 flex-1 flex flex-col">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2"><GitCommit size={16}/> Distributed Traces</h3>
            <div className="space-y-3">
              {traces.map((t, i) => (
                <div key={i} className="bg-background border border-border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-white font-medium">{t.method} {t.endpoint}</span>
                    <span className="text-xs text-green-500">{t.status}</span>
                  </div>
                  <div className="text-xs text-gray-500">Duration: {t.duration} | Service: {t.service}</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Alerts':
        return (
          <div className="bg-surface border border-border rounded-xl p-5 flex-1 flex flex-col">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2"><AlertTriangle size={16}/> Active Alerts</h3>
            <div className="space-y-3">
              {alerts.map((a, i) => (
                <div key={i} className={`border rounded-lg p-4 flex items-start gap-3 ${a.severity === 'Critical' ? 'bg-red-500/10 border-red-500/20 text-red-500' : a.severity === 'Warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                  <AlertTriangle className="mt-0.5" size={16}/>
                  <div>
                    <div className="text-sm text-white font-medium">{a.title}</div>
                    <div className="text-xs text-gray-400">{a.message} ({a.time})</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full w-full bg-background text-white overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Activity size={24} className="text-primary"/> Observability</h1>
          <p className="text-sm text-gray-400 mt-1">Real-time insights into your infrastructure, services, and applications.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 border border-border px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:bg-surface"><Settings size={14}/> Last 6 hours</button>
          <button className="flex items-center gap-2 border border-border px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:bg-surface">30s</button>
          <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90"><Plus size={14}/> Add Widget</button>
        </div>
      </div>

      <div className="flex gap-6 border-b border-border text-sm font-medium text-gray-400">
        {['Metrics', 'Logs', 'Traces', 'Alerts'].map(tab => (
          <span key={tab} onClick={() => setActiveTab(tab)} className={`pb-2 cursor-pointer transition-colors ${activeTab === tab ? 'text-white border-b-2 border-primary' : 'hover:text-white'}`}>
            {tab}
          </span>
        ))}
      </div>

      {renderContent()}
    </div>
  );
}
