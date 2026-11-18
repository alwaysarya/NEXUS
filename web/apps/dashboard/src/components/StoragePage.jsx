import { useState, useEffect } from 'react';
import { Database, HardDrive, Download } from 'lucide-react';

export default function StoragePage() {
  const [storage, setStorage] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8080/api/storage-metrics')
      .then(res => res.json())
      .then(data => setStorage(data))
      .catch(console.error);
  }, []);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full w-full bg-background text-white overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Database size={24} className="text-primary"/> Storage</h1>
          <p className="text-sm text-gray-400 mt-1">Manage persistent volumes, object storage, and backups.</p>
        </div>
        <button className="flex items-center gap-2 border border-border px-4 py-2 rounded-lg text-sm hover:bg-surface transition-colors"><Download size={14}/> Export</button>
      </div>

      {/* Top Cards - Correct Keys Match */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Storage', val: formatBytes(storage?.total), icon: HardDrive },
          { label: 'Used Storage', val: formatBytes(storage?.used), icon: Database },
          { label: 'Free Storage', val: formatBytes(storage?.free), icon: HardDrive },
          { label: 'Usage %', val: storage?.used_percent ? `${storage.used_percent.toFixed(1)}%` : '...', icon: Database },
        ].map((s, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-5 flex justify-between items-center">
            <div><div className="text-xs text-gray-400 mb-1">{s.label}</div><div className="text-2xl font-bold">{s.val}</div></div>
            <s.icon size={24} className="text-primary"/>
          </div>
        ))}
      </div>

      {/* Table - Correct Keys Match */}
      <div className="bg-surface border border-border rounded-xl">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="font-medium">Mounted Volumes</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-background border-b border-border text-gray-500 text-[11px]">
            <tr>
              <th className="px-4 py-3 font-medium">VOLUME PATH</th>
              <th className="px-4 py-3 font-medium">CAPACITY</th>
              <th className="px-4 py-3 font-medium">USED</th>
              <th className="px-4 py-3 font-medium">FREE</th>
              <th className="px-4 py-3 font-medium">USAGE %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {storage?.volumes && storage.volumes.length > 0 ? storage.volumes.map((v, i) => (
              <tr key={i} className="hover:bg-background/50 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{v.path || 'N/A'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{formatBytes(v.total)}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{formatBytes(v.used)}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{formatBytes(v.free)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-background rounded-full h-1.5 overflow-hidden border border-border">
                      <div className={`h-full ${(v.used_percent || 0) > 80 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${v.used_percent || 0}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-400">{(v.used_percent || 0).toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="py-6 text-center text-gray-500">No volumes found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
