import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import { BarChart3, TrendingUp, Clock, Target } from 'lucide-react';
import { AreaChart, Area, ComposedChart, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { SkeletonChart } from '../components/Skeleton';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analyticsData = await analyticsService.getPlatformAnalytics();
        setData(analyticsData);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="text-accent" /> Platform Analytics
          </h1>
          <p className="text-slate-400 mt-1">Platform-wide metrics for the last 24 hours</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2"><SkeletonChart /></div>
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  // Calculate some summary metrics from the last hour of data
  const latestSpend = data.spendData[data.spendData.length - 1].spend;
  const latestWinRate = data.winRateData[data.winRateData.length - 1].winRate * 100;
  const latestLatency = data.latencyData[data.latencyData.length - 1].p95;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="text-accent" /> Platform Analytics
        </h1>
        <p className="text-slate-400 mt-1">Platform-wide metrics for the last 24 hours</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-base-panel border border-slate-700 rounded-lg p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Current Spend Rate (Hourly)</p>
              <h3 className="text-2xl font-bold text-slate-200 tabular-nums">${latestSpend.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="bg-base-panel border border-slate-700 rounded-lg p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Current Win Rate</p>
              <h3 className="text-2xl font-bold text-slate-200 tabular-nums">{latestWinRate.toFixed(1)}%</h3>
            </div>
          </div>
        </div>
        <div className="bg-base-panel border border-slate-700 rounded-lg p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-status-amber/10 text-status-amber flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">p95 Latency</p>
              <h3 className="text-2xl font-bold text-slate-200 tabular-nums">{latestLatency}ms</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Total Spend Over Time */}
        <div className="bg-base-panel border border-slate-700 rounded-lg p-6 lg:col-span-2">
          <h2 className="text-lg font-medium text-slate-200 mb-6">Total Spend (24h)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.spendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                  itemStyle={{ color: '#10b981' }}
                  formatter={(value, name) => [`$${value}`, name === 'spend' ? 'Actual Spend' : 'Ideal Pacing']}
                />
                <Area type="monotone" dataKey="spend" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" name="spend" />
                <Line type="monotone" dataKey="idealSpend" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="idealSpend" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency Percentiles */}
        <div className="bg-base-panel border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-medium text-slate-200 mb-6">Latency Percentiles (ms)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.latencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                  cursor={{ fill: '#334155', opacity: 0.2 }}
                />
                <Bar dataKey="p50" fill="#3b82f6" name="p50" radius={[2, 2, 0, 0]} />
                <Bar dataKey="p95" fill="#f59e0b" name="p95" radius={[2, 2, 0, 0]} />
                <Bar dataKey="p99" fill="#ef4444" name="p99" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-base-panel border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-medium text-slate-200 mb-6">Average Win Rate</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.winRateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWinRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} domain={[0, 1]} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                  itemStyle={{ color: '#3b82f6' }}
                  formatter={(value) => [`${(value*100).toFixed(1)}%`, 'Win Rate']}
                />
                <Area type="monotone" dataKey="winRate" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorWinRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}