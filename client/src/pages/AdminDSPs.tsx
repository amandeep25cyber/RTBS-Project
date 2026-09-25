import { useState, useEffect } from 'react';
import { dspService } from '../services/dspService';
import { Server, Activity, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDSPs() {
  const [dsps, setDsps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDSPs = async () => {
      try {
        const data = await dspService.getDSPs();
        setDsps(data);
      } catch (err) {
        console.error("Failed to load DSPs", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDSPs();
  }, []);

  const chartData = dsps.map(dsp => ({
    name: dsp.name,
    winRate: Math.round((dsp.wins / dsp.totalBids) * 100) || 0,
    latency: dsp.avgLatencyMs
  }));

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p>Loading DSP performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Server className="text-accent" /> DSP Performance
        </h1>
        <p className="text-slate-400 mt-1">Monitor Demand-Side Platform health, win rates, and latency</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Win Rate Chart */}
        <div className="bg-base-panel border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-medium text-slate-200">Win Rate by DSP (%)</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                  {chartData.map((index) => (
                    <Cell key={`cell-${index}`} fill="var(--color-accent)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency Chart */}
        <div className="bg-base-panel border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-status-amber" />
            <h2 className="text-lg font-medium text-slate-200">Average Latency (ms)</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                  itemStyle={{ color: '#f59e0b' }}
                />
                <Bar dataKey="latency" radius={[4, 4, 0, 0]}>
                  {chartData.map((index) => (
                    <Cell key={`cell-${index}`} fill="var(--color-status-amber)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-base-panel border border-slate-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/30">
          <h2 className="text-lg font-medium text-slate-200">DSP Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-sm font-medium border-b border-slate-700">
                <th className="px-6 py-4">DSP Name</th>
                <th className="px-6 py-4 text-right">Status</th>
                <th className="px-6 py-4 text-right">Total Bids</th>
                <th className="px-6 py-4 text-right">Wins</th>
                <th className="px-6 py-4 text-right">Win Rate</th>
                <th className="px-6 py-4 text-right">Avg Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {dsps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No DSPs found.
                  </td>
                </tr>
              ) : (
                dsps.map(dsp => {
                  const winRate = Math.round((dsp.wins / dsp.totalBids) * 100) || 0;
                  return (
                    <tr key={dsp.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">{dsp.name}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          dsp.status === 'healthy' ? 'bg-status-green/10 text-status-green border-status-green/20' : 'bg-status-amber/10 text-status-amber border-status-amber/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dsp.status === 'healthy' ? 'bg-status-green' : 'bg-status-amber'}`} />
                          {dsp.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums text-slate-300">{dsp.totalBids.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right tabular-nums text-slate-300">{dsp.wins.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right tabular-nums">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-slate-300">{winRate}%</span>
                          <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-accent rounded-full" style={{ width: `${winRate}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums text-slate-300">
                        <span className={`flex items-center justify-end gap-1 ${dsp.avgLatencyMs > 50 ? 'text-status-amber' : ''}`}>
                          {dsp.avgLatencyMs}ms
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
