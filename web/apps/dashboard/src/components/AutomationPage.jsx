import { Terminal, Play, RotateCw, Settings, Shield, Clock, CheckCircle2 } from 'lucide-react';

const scripts = [
  { id: 'SCR-001', name: 'Scale Cluster Nodes', desc: 'Auto-scale worker nodes based on CPU load', schedule: 'Every 5 min', status: 'Active', lastRun: '2 mins ago' },
  { id: 'SCR-002', name: 'Database Backup', desc: 'Snapshot RDS instance and store in S3', schedule: 'Daily at 02:00 AM', status: 'Active', lastRun: '6 hrs ago' },
  { id: 'SCR-003', name: 'Cleanup Old Logs', desc: 'Delete logs older than 30 days from CloudWatch', schedule: 'Weekly (Sun)', status: 'Paused', lastRun: '3 days ago' },
  { id: 'SCR-004', name: 'Rotate Secrets', desc: 'Rotate AWS IAM keys and API tokens', schedule: 'Every 30 days', status: 'Active', lastRun: '12 days ago' },
  { id: 'SCR-005', name: 'Security Patch Update', desc: 'Apply latest OS patches to all nodes', schedule: 'Monthly', status: 'Active', lastRun: '1 month ago' },
];

export default function AutomationPage() {
  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Terminal className="text-primary" size={24} /> Automation & Scripts</h1>
          <p className="text-sm text-gray-400 mt-1">Manage automated tasks, cron jobs, and infrastructure scripts.</p>
        </div>
        <div className="flex gap-3">
          <button className="border border-border text-gray-300 text-sm px-3 py-1.5 rounded hover:bg-white/5">View Logs</button>
          <button className="bg-primary text-white text-sm px-3 py-1.5 rounded flex items-center gap-2 hover:bg-primary/90"><Play size={14}/> Create Script</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Scripts', value: '12', icon: Terminal, color: 'text-blue-500' },
          { label: 'Active Jobs', value: '8', icon: Play, color: 'text-green-500' },
          { label: 'Paused Jobs', value: '4', icon: Clock, color: 'text-yellow-500' },
          { label: 'Success Rate', value: '99.2%', icon: CheckCircle2, color: 'text-green-500' },
        ].map((m) => (
          <div key={m.label} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">{m.label}</div>
              <div className="text-2xl font-bold text-white mt-1">{m.value}</div>
            </div>
            <m.icon size={24} className={m.color} />
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="text-sm font-medium text-white flex items-center gap-2"><Settings size={14} className="text-gray-400"/> Active Automation Scripts</h3>
        </div>
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-xs text-gray-500 uppercase border-b border-border bg-background/50">
            <tr>
              <th className="px-4 py-3 font-medium">Script ID</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Schedule</th>
              <th className="px-4 py-3 font-medium">Last Run</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {scripts.map((script) => (
              <tr key={script.id} className="hover:bg-white/5">
                <td className="px-4 py-3 text-gray-500 font-mono">{script.id}</td>
                <td className="px-4 py-3">
                  <div className="text-white font-medium">{script.name}</div>
                  <div className="text-gray-500 text-xs">{script.desc}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-gray-400"><Clock size={12}/> {script.schedule}</span>
                </td>
                <td className="px-4 py-3 text-gray-400">{script.lastRun}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded border flex items-center gap-1 w-fit ${script.status === 'Active' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5'}`}>
                    {script.status === 'Active' ? <CheckCircle2 size={12}/> : <Clock size={12}/>} {script.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                   <button className="text-gray-500 hover:text-white mr-3"><RotateCw size={14}/></button>
                   <button className="border border-border text-gray-300 px-2 py-1 rounded hover:bg-white/5">Run Now</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
