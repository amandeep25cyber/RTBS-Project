import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { campaignService } from '../services/campaignService';
import { analyticsService } from '../services/analyticsService';
import { Link } from 'react-router-dom';
import { SkeletonCard } from '../components/Skeleton';
import { LayoutDashboard, Megaphone, DollarSign, Target } from 'lucide-react';

export default function AdvDashboard() {
  const { currentUser } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [camps, analyticsData] = await Promise.all([
          campaignService.getCampaignsByAdvertiser(currentUser.id),
          analyticsService.getAdvertiserAnalytics(currentUser.id)
        ]);
        setCampaigns(camps);
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
            <LayoutDashboard className="text-accent" /> Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Overview of your campaigns and performance</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalSpentToday = campaigns.reduce((sum, c) => sum + c.spentToday, 0);
  const totalBudget = campaigns.reduce((sum, c) => sum + c.dailyBudget, 0);
  
  // Use the most recent win rate from analytics
  const currentWinRate = analytics.winRateData[analytics.winRateData.length - 1].winRate * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <LayoutDashboard className="text-accent" /> Dashboard
        </h1>
        <p className="text-slate-400 mt-1">Overview of your campaigns and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-base-panel border border-slate-700 rounded-lg p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Active Campaigns</p>
              <h3 className="text-2xl font-bold text-slate-200 tabular-nums">
                {activeCampaigns} <span className="text-sm font-normal text-slate-500">/ {campaigns.length} total</span>
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
              <p className="text-sm font-medium text-slate-400">Total Spent Today</p>
              <h3 className="text-2xl font-bold text-slate-200 tabular-nums">
                ${totalSpentToday.toLocaleString()}
              </h3>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Pacing</span>
              <span>{totalBudget > 0 ? Math.round((totalSpentToday / totalBudget) * 100) : 0}% of daily budget</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${totalSpentToday > totalBudget * 0.9 ? 'bg-status-amber' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, totalBudget > 0 ? (totalSpentToday / totalBudget) * 100 : 0)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-base-panel border border-slate-700 rounded-lg p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Average Win Rate</p>
              <h3 className="text-2xl font-bold text-slate-200 tabular-nums">{currentWinRate.toFixed(1)}%</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-base-panel border border-slate-700 rounded-lg overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/30 flex justify-between items-center">
          <h2 className="text-lg font-medium text-slate-200">Recent Campaigns</h2>
        </div>
        <div className="p-6">
          {campaigns.length === 0 ? (
            <div className="text-center py-8 flex flex-col items-center">
              <Megaphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-200 mb-2">No active campaigns</h3>
              <p className="text-slate-400 mb-6">You don't have any campaigns yet. Start running ads to see performance data here.</p>
              <Link to="/advertiser/campaigns" className="bg-accent hover:bg-accent-hover text-white font-medium py-2 px-6 rounded-lg transition-colors inline-block">
                Create Campaign
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.slice(0, 3).map(c => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-200">{c.name}</h4>
                    <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${c.status === 'active' ? 'bg-status-green' : 'bg-slate-500'}`} />
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Spent Today</p>
                    <p className="font-medium text-slate-200">${c.spentToday.toLocaleString()} <span className="text-xs text-slate-500 font-normal">/ ${c.dailyBudget.toLocaleString()}</span></p>
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