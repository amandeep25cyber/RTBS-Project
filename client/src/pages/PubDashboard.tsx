import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { slotService } from '../services/slotService';
import { analyticsService } from '../services/analyticsService';
import { Link } from 'react-router-dom';
import { SkeletonCard } from '../components/Skeleton';
import { LayoutDashboard, Layers, DollarSign, Activity } from 'lucide-react';

export default function PubDashboard() {
  const { currentUser } = useAuth();
  const [slots, setSlots] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userSlots, analyticsData] = await Promise.all([
          slotService.getSlotsByPublisher(currentUser.id),
          analyticsService.getPublisherAnalytics(currentUser.id)
        ]);
        setSlots(userSlots);
        setAnalytics(analyticsData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (currentUser?.id) {
      fetchData();
    }
  }, [currentUser]);

  if (isLoading || !analytics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <LayoutDashboard className="text-accent" /> Publisher Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Overview of your ad slots and revenue today</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const activeSlots = slots.filter(s => s.status === 'active').length;
  const totalRevenueToday = slots.reduce((sum, s) => sum + s.revenueToday, 0);
  
  // Use the most recent fill rate from analytics
  const currentFillRate = analytics.fillRateData[analytics.fillRateData.length - 1].fillRate * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <LayoutDashboard className="text-accent" /> Dashboard
        </h1>
        <p className="text-slate-400 mt-1">Overview of your inventory and monetization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-base-panel border border-slate-700 rounded-lg p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Active Ad Slots</p>
              <h3 className="text-2xl font-bold text-slate-200 tabular-nums">
                {activeSlots} <span className="text-sm font-normal text-slate-500">/ {slots.length} total</span>
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-base-panel border border-slate-700 rounded-lg p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Revenue Today</p>
              <h3 className="text-2xl font-bold text-slate-200 tabular-nums">
                ${totalRevenueToday.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-base-panel border border-slate-700 rounded-lg p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Average Fill Rate</p>
              <h3 className="text-2xl font-bold text-slate-200 tabular-nums">{currentFillRate.toFixed(1)}%</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-base-panel border border-slate-700 rounded-lg overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/30 flex justify-between items-center">
          <h2 className="text-lg font-medium text-slate-200">Recent Ad Slots</h2>
        </div>
        <div className="p-6">
          {slots.length === 0 ? (
            <div className="text-center py-8 flex flex-col items-center">
              <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-200 mb-2">No ad slots</h3>
              <p className="text-slate-400 mb-6">You don't have any ad slots yet. Create one to start monetizing your traffic.</p>
              <Link to="/publisher/slots" className="bg-accent hover:bg-accent-hover text-white font-medium py-2 px-6 rounded-lg transition-colors inline-block">
                Create Ad Slot
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {slots.slice(0, 3).map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-200">{s.slotName}</h4>
                    <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${s.status === 'active' ? 'bg-status-green' : 'bg-slate-500'}`} />
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </p>
                  </div>
                  <div className="flex items-center gap-8 text-right">
                    <div>
                      <p className="text-sm text-slate-400">Floor Price</p>
                      <p className="font-medium text-slate-200">${s.floorPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Revenue</p>
                      <p className="font-medium text-emerald-400">${s.revenueToday.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}