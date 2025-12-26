
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SystemMetrics } from '../types';

interface DashboardProps {
  metrics: SystemMetrics;
  history: SystemMetrics[];
}

export const Dashboard: React.FC<DashboardProps> = ({ metrics, history }) => {
  const chartData = useMemo(() => {
    return history.map((m, i) => ({
      name: i.toString(),
      cpu: m.cpu,
      memory: m.memory,
      network: m.network
    }));
  }, [history]);

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-y-auto">
      <div className="glass p-4 rounded-xl col-span-1 md:col-span-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">System Load (CPU/MEM)</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" hide />
              <YAxis domain={[0, 100]} stroke="#475569" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Area type="monotone" dataKey="cpu" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              <Area type="monotone" dataKey="memory" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass p-4 rounded-xl flex flex-col justify-center items-center">
        <div className="text-3xl font-mono text-emerald-400">{metrics.cpu}%</div>
        <div className="text-xs text-slate-400 mt-1 uppercase tracking-tighter">CPU Usage</div>
        <div className="w-full h-1 bg-slate-800 mt-4 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${metrics.cpu}%` }}></div>
        </div>
      </div>

      <div className="glass p-4 rounded-xl flex flex-col justify-center items-center">
        <div className="text-3xl font-mono text-blue-400">{metrics.memory}%</div>
        <div className="text-xs text-slate-400 mt-1 uppercase tracking-tighter">Memory Allocation</div>
        <div className="w-full h-1 bg-slate-800 mt-4 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${metrics.memory}%` }}></div>
        </div>
      </div>

      <div className="glass p-4 rounded-xl col-span-1 md:col-span-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Resource Insights</h3>
        <p className="text-sm text-slate-300 leading-relaxed italic">
          "System resources are operating within nominal parameters. AI Kernel suggests optimizing background daemon tasks to reduce thermal overhead."
        </p>
      </div>
    </div>
  );
};
