import { useState, useEffect } from 'react';
import { DollarSign, TrendingDown, TrendingUp, CreditCard, PieChart as PieIcon, Download } from 'lucide-react';
import { fetchCost } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const costTrendData = [
  { month: 'Jan', cost: 1200 }, { month: 'Feb', cost: 1100 }, { month: 'Mar', cost: 1400 },
  { month: 'Apr', cost: 1350 }, { month: 'May', cost: 1600 }, { month: 'Jun', cost: 1450 },
];

const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export default function CostPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCost().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3"><DollarSign className="text-primary" size={24} /> Cost & Usage</h1>
          <p className="text-sm text-gray-400 mt-1">Monitor your cloud spending and resource utilization.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Spend (MTD)', value: `$${totalCost.toFixed(2)}`, change: '+12.5%', icon: CreditCard, color: '#6366f1' },
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

      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2 bg-surface border border-border rounded-xl p-4">
          <div className="flex justify-between items-center mb-4"><h3 className="text-sm font-medium text-white">Cost Trend</h3></div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={costTrendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs><linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                <XAxis dataKey="month" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#121216', borderColor: '#27272a', fontSize: '12px' }} />
                <Area type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4"><h3 className="text-sm font-medium text-white">Cost by Service</h3></div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="cost" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} stroke="none">
                    {data.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#121216', borderColor: '#27272a', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-2 mt-4 text-xs">
              {data.map((svc, i) => (
                <div key={svc.service} className="flex justify-between items-center text-gray-400">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{backgroundColor: colors[i % colors.length]}}></span> {svc.service}</div>
                  <span className="text-white">${svc.cost}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl flex flex-col">
        <div className="p-4 border-b border-border"><h3 className="text-sm font-medium text-white">Resource Usage Breakdown</h3></div>
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-xs text-gray-500 uppercase border-b border-border bg-background/50">
            <tr>
              <th className="px-4 py-3 font-medium">Resource Type</th>
              <th className="px-4 py-3 font-medium">Usage</th>
              <th className="px-4 py-3 font-medium text-right">Estimated Cost (MTD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? <tr><td colSpan="3" className="text-center py-4 text-gray-500">Loading...</td></tr> : data.map((item) => (
              <tr key={item.service} className="hover:bg-white/5">
                <td className="px-4 py-3 text-white font-medium">{item.service}</td>
                <td className="px-4 py-3 text-gray-400">{item.usage}</td>
                <td className="px-4 py-3 text-right font-mono text-gray-200">${item.cost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
