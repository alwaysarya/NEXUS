import { useState, useEffect } from 'react';
import { Terminal, Play, RotateCw, Settings, Clock, CheckCircle2 } from 'lucide-react';
import { fetchAutomation } from '../services/api';

export default function AutomationPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAutomation().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

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
            {loading ? <tr><td colSpan="6" className="text-center py-4 text-gray-500">Loading...</td></tr> : data.map((script) => (
              <tr key={script.id} className="hover:bg-white/5">
                <td className="px-4 py-3 text-gray-500 font-mono">{script.id}</td>
                <td className="px-4 py-3">
                  <div className="text-white font-medium">{script.name}</div>
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
