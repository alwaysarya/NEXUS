import { Database, HardDrive, Server, Activity, Plus, Download } from 'lucide-react';

export default function StoragePage() {
  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Database className="text-primary" size={24} /> Storage</h1>
          <p className="text-sm text-gray-400 mt-1">Manage persistent volumes, object storage, and backups.</p>
        </div>
        <div className="flex gap-3">
          <button className="border border-border text-gray-300 text-sm px-3 py-1.5 rounded hover:bg-white/5">Create Snapshot</button>
          <button className="bg-primary text-white text-sm px-3 py-1.5 rounded hover:bg-primary/90">+ Provision Volume</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Storage', value: '10.0 TiB', icon: HardDrive, color: 'text-blue-500' },
          { label: 'Used Storage', value: '5.81 TiB', icon: Database, color: 'text-purple-500' },
          { label: 'Persistent Volumes', value: '24', icon: Server, color: 'text-green-500' },
          { label: 'Backups', value: '12', icon: Activity, color: 'text-orange-500' },
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
          <h3 className="text-sm font-medium text-white">Persistent Volumes</h3>
          <button className="border border-border text-gray-300 text-sm px-3 py-1.5 rounded flex items-center gap-2 hover:bg-white/5"><Download size={14}/> Export</button>
        </div>
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-xs text-gray-500 uppercase border-b border-border bg-background/50">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Capacity</th>
              <th className="px-4 py-3 font-medium">Access Mode</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Storage Class</th>
              <th className="px-4 py-3 font-medium">Claim</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              { name: 'pvc-postgres-data', cap: '500 GiB', access: 'ReadWriteOnce', status: 'Bound', class: 'gp3', claim: 'postgres-db' },
              { name: 'pvc-redis-data', cap: '100 GiB', access: 'ReadWriteOnce', status: 'Bound', class: 'gp3', claim: 'redis-cache' },
              { name: 'pvc-prometheus-data', cap: '1 TiB', access: 'ReadWriteMany', status: 'Bound', class: 'efs', claim: 'prometheus' },
              { name: 'pvc-grafana-data', cap: '50 GiB', access: 'ReadWriteOnce', status: 'Bound', class: 'gp3', claim: 'grafana' },
            ].map((vol) => (
              <tr key={vol.name} className="hover:bg-white/5">
                <td className="px-4 py-3 text-white font-medium">{vol.name}</td>
                <td className="px-4 py-3">{vol.cap}</td>
                <td className="px-4 py-3">{vol.access}</td>
                <td className="px-4 py-3"><span className="text-xs text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">{vol.status}</span></td>
                <td className="px-4 py-3">{vol.class}</td>
                <td className="px-4 py-3 text-primary">{vol.claim}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
