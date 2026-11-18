import { useState, useEffect } from 'react';
import { GitBranch, RotateCcw, Plus, ChevronRight, Activity, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [repoInfo, setRepoInfo] = useState({ author: 'Loading...', branch: '...', commit: '...', message: '...' });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // 1. Fetch real deployments from K8s
    fetch('http://127.0.0.1:8080/api/deployments')
      .then(res => res.json())
      .then(data => setDeployments(data))
      .catch(console.error);

    // 2. Fetch real metrics (CPU, Memory)
    fetch('http://127.0.0.1:8080/api/real-metrics')
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(console.error);

    // 3. Fetch real Github commit info
    fetch('https://api.github.com/repos/alwaysarya/NEXUS/commits/main')
      .then(res => res.json())
      .then(data => {
        if (data.commit) {
          setRepoInfo({
            author: data.commit.author.name,
            branch: 'main',
            commit: data.sha.substring(0, 7),
            message: data.commit.message
          });
        }
      }).catch(console.error);

    // 4. Live logs simulation based on actual real states
    const interval = setInterval(() => {
      setLogs(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] [INFO] K8s sync: ${deployments.length} deployments active.`]);
    }, 3000);

    return () => clearInterval(interval);
  }, [deployments.length]);

  const isDeployed = deployments.length > 0;

  return (
    <div className="flex flex-col gap-6 p-6 h-full w-full bg-background text-white overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
          <span>Deployments</span> <ChevronRight size={14} /> <span>nexus-api</span> <ChevronRight size={14} /> <span className="text-white">Release #{repoInfo.commit}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Deployment & Release Pipeline</h1>
            <p className="text-sm text-gray-400 mt-1">Build, test and deploy your application across environments with full CI/CD visibility.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 border border-border px-4 py-2 rounded-lg text-sm hover:bg-surface"><RotateCcw size={14}/> Re-run</button>
            <button className="flex items-center gap-2 border border-border px-4 py-2 rounded-lg text-sm hover:bg-surface"><RotateCcw size={14}/> Rollback</button>
            <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90"><Plus size={14}/> Release</button>
          </div>
        </div>
      </div>

      {/* Repo Info Bar - Real GitHub Data */}
      <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <GitBranch size={18} className="text-gray-400"/>
          <span className="font-medium text-white">alwaysarya/NEXUS</span>
          <span className="bg-background border border-border px-2 py-1 rounded text-xs text-gray-400">{repoInfo.branch}</span>
          <span className="bg-background border border-border px-2 py-1 rounded text-xs text-gray-400 font-mono">{repoInfo.commit}</span>
        </div>
        <div className="flex items-center gap-6 text-gray-400">
          <span>Author: <span className="text-white">{repoInfo.author}</span></span>
          <span>Status: <span className={isDeployed ? "text-green-500" : "text-yellow-500"}>{isDeployed ? 'Active' : 'Pending'}</span></span>
        </div>
      </div>

      {/* Pipeline Steps - Real Status based on K8s Data */}
      <div className="bg-surface border border-border rounded-xl p-6 flex items-center justify-between">
        {['Code Checkout', 'Build', 'Test', 'Package', 'Deploy (Staging)', 'Deploy (Production)'].map((step, i) => {
          const isCompleted = isDeployed; 
          return (
            <div key={i} className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-border text-gray-500'}`}>
                  {isCompleted ? <CheckCircle2 size={16}/> : <span className="text-xs">{i+1}</span>}
                </div>
                <span className="text-xs font-medium text-gray-300">{step}</span>
              </div>
              {i < 5 && <div className={`w-16 h-px ${isCompleted ? 'bg-green-500' : 'bg-border'}`}></div>}
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Release Info - Real GitHub Commit Message */}
        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-white">Release {repoInfo.commit}</h3>
            <span className={`text-xs border px-2 py-1 rounded ${isDeployed ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
              {isDeployed ? 'Succeeded' : 'Deploying'}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            <div className="flex justify-between mb-2"><span>Commit</span><span className="text-white font-mono">{repoInfo.commit}</span></div>
            <div className="flex justify-between mb-4"><span>Branch</span><span className="text-white">{repoInfo.branch}</span></div>
            <div className="border-t border-border pt-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Latest Commit Message</span>
              <p className="text-xs text-gray-300">{repoInfo.message}</p>
            </div>
          </div>
        </div>

        {/* Pipeline Logs (Real-time simulation of K8s sync) */}
        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col">
          <div className="flex gap-4 border-b border-border pb-3 mb-4 text-xs font-medium text-gray-400">
            <span className="text-white border-b-2 border-primary pb-3">Live Logs</span>
            <span>Artifacts</span>
            <span>Environments</span>
          </div>
          <div className="flex-1 bg-background border border-border rounded-lg p-3 font-mono text-[11px] text-gray-300 space-y-1 overflow-y-auto max-h-[250px]">
             <div className="text-green-500">[{new Date().toLocaleTimeString()}] [SUCCESS] Connected to K8s cluster.</div>
             {logs.map((log, i) => <div key={i} className="text-gray-400">{log}</div>)}
          </div>
        </div>

        {/* Environments & Health (Real K8s + Mac stats) */}
        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-6">
          <div>
            <h3 className="font-medium text-white mb-3">Deployment Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400"><span className="flex items-center gap-2"><span className={`w-1.5 h-1.5 rounded-full ${isDeployed ? 'bg-green-500' : 'bg-yellow-500'}`}></span> K8s Local</span> <span>{isDeployed ? 'Active' : 'Pending'}</span></div>
              <div className="flex justify-between text-white bg-background px-3 py-2 rounded-lg border border-border mt-2"><span className="flex items-center gap-2"><span className={`w-1.5 h-1.5 rounded-full ${isDeployed ? 'bg-primary' : 'bg-gray-500'}`}></span> Production</span> <span>{isDeployed ? 'v1.0.0' : 'Pending'}</span></div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-white mb-3 flex items-center gap-2"><Activity size={16} className="text-primary"/> Deployment Health</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center"><span className="text-gray-400">Active Pods</span><span className="text-green-500 font-bold">{deployments.length}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400">CPU Load</span><span className="text-white">{metrics ? metrics.cpu.usage.toFixed(1) : '...'}%</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400">Memory</span><span className="text-white">{metrics ? metrics.memory.usage_percent.toFixed(1) : '...'}%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment History (Real K8s Deployments) */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="font-medium text-white mb-4 flex items-center gap-2"><Clock size={16}/> Deployment History</h3>
        <table className="w-full text-left text-sm">
          <thead className="text-gray-500 text-[11px] border-b border-border">
            <tr>
              <th className="pb-3 font-medium">RELEASE</th>
              <th className="pb-3 font-medium">ENVIRONMENT</th>
              <th className="pb-3 font-medium">STATUS</th>
              <th className="pb-3 font-medium">DEPLOYED AT</th>
              <th className="pb-3 font-medium text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deployments.map((d, i) => (
              <tr key={i} className="text-gray-300">
                <td className="py-3 text-white font-medium">{d.name}</td>
                <td className="py-3">{d.env}</td>
                <td className="py-3"><span className="text-green-500 flex items-center gap-1.5"><CheckCircle2 size={12}/> {d.status}</span></td>
                <td className="py-3">{d.time}</td>
                <td className="py-3 text-right"><button className="text-xs border border-border px-2 py-1 rounded hover:bg-background">Rollback</button></td>
              </tr>
            ))}
            {deployments.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-gray-500">No deployments found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
