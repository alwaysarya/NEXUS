import { DollarSign, TrendingDown, TrendingUp, CreditCard, PieChart as PieIcon, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const costTrendData = [
  { month: 'Jan', cost: 1200 }, { month: 'Feb', cost: 1100 }, { month: 'Mar', cost: 1400 },
  { month: 'Apr', cost: 1350 }, { month: 'May', cost: 1600 }, { month: 'Jun', cost: 1450 },
];

const serviceCostData = [
  { name: 'Compute (EC2/EKS)', cost: 650, color: '#3b82f6' },
  { name: 'Database (RDS)', cost: 400, color: '#8b5cf6' },
  { name: 'Storage (S3/EBS)', cost: 250, color: '#10b981' },
  { name: 'Networking', cost: 150, color: '#f59e0b' },
];

const usageData = [
  { name: 'EC2 Instances', usage: '12 instances', cost: '$450.00' },
  { name: 'EKS Cluster', usage: '1 cluster', cost: '$200.00' },
  { name: 'RDS (Postgres)', usage: '2 instances', cost: '$400.00' },
  { name: 'S3 Storage', usage: '5.8 TB', cost: '$150.00' },
  { name: 'EBS Volumes', usage: '1.2 TB', cost: '$100.00' },
  { name: 'Data Transfer', usage: '450 GB', cost: '$150.00' },
];

export default function CostPage() {
  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3"><DollarSign className="text-primary" size={24} /> Cost & Usage</h1>
          <p className="text-sm text-gray-400 mt-1">Monitor your cloud spending and resource utilization.</p>
        </div>
        <div className="flex gap-3">
          <select className="bg-surface border border-border text-gray-300 text-sm px-3 py-1.5 rounded focus:outline-none">
            <option>Last 6 Months</option>
            <option>This Month</option>
            <option>Last Month</option>
          </select>
          <button className="border border-border text-gray-300 text-sm px-3 py-1.5 rounded flex items-center gap-2 hover:bg-white/5"><Download size={14}/> Export CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Spend (MTD)', value: '$1,450.00', change: '+12.5%', icon: CreditCard, color: '#6366f1' },
          { label: 'Forecasted Spend', value: '$1,620.00', change: '+3.2%', icon: TrendingUp, color: '#f59e0b' },
          { label: 'Savings Plan', value: '$120.00', change: '-8.4%', icon: TrendingDown, color: '#22c55e' },
          { label: 'Active Resources', value: '48', change: '+4', icon: PieIcon, color: '#ec4899' },
        ].map((m) => (
          <div key={m.label} className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start text-sm text-gray-400">
              <div className="flex items-center gap-2"><m.icon size={16} style={{ color: m.color }}/> {m.label}</div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-white">{m.value}</div>
              <div className="text-xs mt-1" style={{ color: m.color }}>{m.change}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-surface border border-border rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-white">Cost Trend</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={costTrendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#121216', borderColor: '#27272a', fontSize: '12px' }} />
                <Area type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-white">Cost by Service</h3>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={serviceCostData} dataKey="cost" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} stroke="none">
                    {serviceCostData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#121216', borderColor: '#27272a', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-2 mt-4 text-xs">
              {serviceCostData.map(svc => (
                <div key={svc.name} className="flex justify-between items-center text-gray-400">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{backgroundColor: svc.color}}></span> {svc.name}</div>
                  <span className="text-white">${svc.cost}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-medium text-white">Resource Usage Breakdown</h3>
        </div>
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-xs text-gray-500 uppercase border-b border-border bg-background/50">
            <tr>
              <th className="px-4 py-3 font-medium">Resource Type</th>
              <th className="px-4 py-3 font-medium">Usage</th>
              <th className="px-4 py-3 font-medium text-right">Estimated Cost (MTD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {usageData.map((item) => (
              <tr key={item.name} className="hover:bg-white/5">
                <td className="px-4 py-3 text-white font-medium">{item.name}</td>
                <td className="px-4 py-3 text-gray-400">{item.usage}</td>
                <td className="px-4 py-3 text-right font-mono text-gray-200">{item.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
