import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function MetricCard({ title, value, subtitle, color = "#6366f1", showGraph = false }) {
  const data = [{ v: 40 }, { v: 30 }, { v: 45 }, { v: 50 }, { v: 40 }, { v: 60 }, { v: 55 }];
  
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between">
      <div className="text-sm text-gray-400 font-medium">{title}</div>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
        </div>
        {showGraph && (
          <div className="w-16 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
