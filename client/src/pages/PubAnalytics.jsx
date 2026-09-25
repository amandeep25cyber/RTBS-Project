import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/analyticsService';
import { BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function PubAnalytics() {
  const { currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analyticsData = await analyticsService.getPublisherAnalytics(currentUser.id);
        setData(analyticsData);
      } catch (err) {
        console.error("Failed to load publisher analytics", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (currentUser?.id) {
      fetchAnalytics();
    }
  }, [currentUser]);

  if (isLoading || !data) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p>Loading your analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="text-accent" /> Analytics
        </h1>
        <p className="text-slate-400 mt-1">Revenue and performance metrics for your ad slots over the last 24 hours</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Revenue Over Time */}
        <div className="bg-base-panel border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-medium text-slate-200 mb-6">Revenue Over Time</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenuePub" x1="0" y1="0" x2="0" y2="1">
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
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenuePub)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fill Rate */}
        <div className="bg-base-panel border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-medium text-slate-200 mb-6">Average Fill Rate</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.fillRateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFillRatePub" x1="0" y1="0" x2="0" y2="1">
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
                  formatter={(value) => [`${(value*100).toFixed(1)}%`, 'Fill Rate']}
                />
                <Area type="monotone" dataKey="fillRate" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorFillRatePub)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}