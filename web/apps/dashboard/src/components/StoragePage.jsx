import { useState, useEffect } from 'react';
import { Database, HardDrive, Server, Activity, Download } from 'lucide-react';
import { fetchStorageMetrics } from '../services/api';

export default function StoragePage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStorageMetrics().then(setMetrics).catch(console.error).finally(() => setLoading(false));
  }, []);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Database className="text-primary" size={24} /> Storage</h1>
          <p className="text-sm text-gray-400 mt-1">Manage persistent volumes, object storage, and backups.</p>
        </div>
      </div>

      {/* Summary Cards - Real Mac Disk Data */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Storage', value: metrics ? formatBytes(metrics.total) : '...', icon: HardDrive, color: 'text-blue-500' },
          { label: 'Used Storage', value: metrics ? formatBytes(metrics.used) : '...', icon: Database, color: 'text-purple-500' },
          { label: 'Free Storage', value: metrics ? formatBytes(metrics.free) : '...', icon: Server, color: 'text-green-500' },
          { label: 'Usage %', value: metrics ? `${metrics.used_percent.toFixed(1)}%` : '...', icon: Activity, color: 'text-orange-500' },
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

      {/* Volumes Table - Real Mac Volumes */}
      <div className="bg-surface border border-border rounded-xl flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="text-sm font-medium text-white">Mounted Volumes</h3>
          <button className="border border-border text-gray-300 text-sm px-3 py-1.5 rounded flex items-center gap-2 hover:bg-white/5"><Download size={14}/> Export</button>
        </div>
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-xs text-gray-500 uppercase border-b border-border bg-background/50">
            <tr>
              <th className="px-4 py-3 font-medium">Volume Path</th>
              <th className="px-4 py-3 font-medium">Capacity</th>
              <th className="px-4 py-3 font-medium">Used</th>
              <th className="px-4 py-3 font-medium">Free</th>
              <th className="px-4 py-3 font-medium">Usage %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? <tr><td colSpan="5" className="text-center py-4 text-gray-500">Loading...</td></tr> : metrics && metrics.volumes ? metrics.volumes.map((vol, i) => (
              <tr key={i} className="hover:bg-white/5">
                <td className="px-4 py-3 text-white font-medium">{vol.path}</td>
                <td className="px-4 py-3">{formatBytes(vol.total)}</td>
                <td className="px-4 py-3">{formatBytes(vol.used)}</td>
                <td className="px-4 py-3">{formatBytes(vol.free)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-border rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${vol.used_percent > 80 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${vol.used_percent}%`}}></div>
                    </div>
                    <span>{vol.used_percent.toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan="5" className="text-center py-4 text-gray-500">No volumes found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
