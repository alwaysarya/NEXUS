import { X, Activity, Box } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function PodPanel() {
  const cpuData = [{ v: 20 }, { v: 25 }, { v: 22 }, { v: 30 }, { v: 28 }];
  const memData = [{ v: 40 }, { v: 42 }, { v: 41 }, { v: 45 }, { v: 42 }];

  return (
    <div className="w-80 bg-surface border-l border-border h-full flex flex-col flex-shrink-0 overflow-y-auto">
      <div className="p-4 border-b border-border flex justify-between items-start sticky top-0 bg-surface z-10">
        <div>
          <div className="text-sm text-gray-400 mb-1">Pod:</div>
          <div className="text-white font-medium break-all text-sm">api-7f9d6c8b4f-xk2m9</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-green-500 flex items-center gap-1 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Running
            </span>
            <span className="text-xs text-gray-500">4h 23m</span>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white"><X size={18} /></button>
      </div>

      <div className="p-4 border-b border-border flex flex-wrap gap-2">
        <span className="text-[10px] bg-background border border-border text-gray-300 px-2 py-1 rounded">app: api</span>
        <span className="text-[10px] bg-background border border-border text-gray-300 px-2 py-1 rounded">tier: backend</span>
        <span className="text-[10px] bg-background border border-border text-gray-300 px-2 py-1 rounded">version: v2.4.1</span>
      </div>

      <div className="flex gap-3 px-4 border-b border-border text-xs text-gray-400 overflow-x-auto">
        <div className="py-2 text-white border-b-2 border-primary font-medium cursor-pointer whitespace-nowrap">Overview</div>
        <div className="py-2 cursor-pointer hover:text-white whitespace-nowrap">Logs</div>
        <div className="py-2 cursor-pointer hover:text-white whitespace-nowrap">Metrics</div>
        <div className="py-2 cursor-pointer hover:text-white whitespace-nowrap">Events</div>
        <div className="py-2 cursor-pointer hover:text-white whitespace-nowrap">YAML</div>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-white mb-3">Pod Details</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Namespace</span><span className="text-gray-300">production</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Node</span><span className="text-primary cursor-pointer hover:underline">ip-10-0-1-23</span></div>
            <div className="flex justify-between"><span className="text-gray-500">IP</span><span className="text-gray-300">10.0.12.48</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Restart Policy</span><span className="text-gray-300">Always</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Restarts</span><span className="text-gray-300">0</span></div>
            <div className="flex justify-between"><span className="text-gray-500">QoS Class</span><span className="text-gray-300">Burstable</span></div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-white mb-3">Resource Usage (Live)</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-background border border-border p-2 rounded">
              <div className="flex items-center gap-2 text-gray-400 text-xs"><Activity size={12}/> CPU</div>
              <div className="w-16 h-6"><ResponsiveContainer width="100%" height="100%"><LineChart data={cpuData}><Line type="monotone" dataKey="v" stroke="#22c55e" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div>
              <div className="text-right"><div className="text-white text-xs">28.4%</div><div className="text-[10px] text-gray-500">0.57 / 2 vCPU</div></div>
            </div>
            <div className="flex items-center justify-between bg-background border border-border p-2 rounded">
              <div className="flex items-center gap-2 text-gray-400 text-xs"><Box size={12}/> Memory</div>
              <div className="w-16 h-6"><ResponsiveContainer width="100%" height="100%"><LineChart data={memData}><Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div>
              <div className="text-right"><div className="text-white text-xs">412 MiB</div><div className="text-[10px] text-gray-500">41.2% of 1 GiB</div></div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-white mb-3">Containers (1)</h3>
          <div className="flex items-center justify-between bg-background border border-border p-2 rounded">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> api
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-green-500">Running</span>
              <button className="border border-border text-gray-300 px-2 py-1 rounded hover:bg-white/5">View</button>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-white">Recent Events</h3>
            <span className="text-xs text-primary cursor-pointer hover:underline">See All</span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></span>
              <div className="flex-1"><div className="text-gray-300">Pulled container image</div><div className="text-[10px] text-gray-500">4h 23m ago</div></div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></span>
              <div className="flex-1"><div className="text-gray-300">Created container</div><div className="text-[10px] text-gray-500">4h 23m ago</div></div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></span>
              <div className="flex-1"><div className="text-gray-300">Started container</div><div className="text-[10px] text-gray-500">4h 23m ago</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
