import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { campaignService } from '../services/campaignService';
import { Megaphone, Plus, X, Save } from 'lucide-react';
import { SkeletonCard } from '../components/Skeleton';
import { toast } from 'react-hot-toast';

export default function AdvCampaigns() {
  const { currentUser } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    dailyBudget: '',
    maxBid: '',
    geo: 'IN',
    device: 'all',
    frequencyCap: '5'
  });

  useEffect(() => {
    fetchCampaigns();
  }, [currentUser]);

  const fetchCampaigns = async () => {
    try {
      const data = await campaignService.getCampaignsByAdvertiser(currentUser.id);
      setCampaigns(data);
    } catch (err) {
      console.error("Failed to load campaigns", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newCampaign = await campaignService.createCampaign({
        advertiserId: currentUser.id,
        name: formData.name,
        dailyBudget: Number(formData.dailyBudget),
        spentToday: 0,
        maxBid: Number(formData.maxBid),
        targeting: { geo: formData.geo, device: formData.device },
        frequencyCap: Number(formData.frequencyCap),
        status: 'active'
      });
      setCampaigns(prev => [...prev, newCampaign]);
      setIsModalOpen(false);
      setFormData({ name: '', dailyBudget: '', maxBid: '', geo: 'IN', device: 'all', frequencyCap: '5' });
      toast.success('Campaign created successfully!');
    } catch (err) {
      console.error("Failed to create campaign", err);
      toast.error('Failed to create campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 relative h-full">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Megaphone className="text-accent" /> Campaign Management
            </h1>
            <p className="text-slate-400 mt-1">Manage your budgets, targeting, and bidding</p>
          </div>
          <button disabled className="bg-slate-700 text-slate-400 font-medium py-2 px-4 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Megaphone className="text-accent" /> Campaign Management
          </h1>
          <p className="text-slate-400 mt-1">Manage your budgets, targeting, and bidding</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-accent hover:bg-accent-hover text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {campaigns.length === 0 ? (
          <div className="xl:col-span-2 bg-base-panel border border-slate-700 rounded-lg p-12 text-center flex flex-col items-center justify-center">
            <Megaphone className="w-16 h-16 text-slate-600 mb-4" />
            <h2 className="text-xl font-medium text-slate-200">No campaigns found</h2>
            <p className="text-slate-400 mt-2 max-w-md mb-6">You haven't created any campaigns yet. Click below to set up your first ad delivery strategy.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-accent hover:bg-accent-hover text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create your first campaign
            </button>
          </div>
        ) : (
          campaigns.map(camp => {
            const progress = camp.dailyBudget > 0 ? Math.min(100, Math.round((camp.spentToday / camp.dailyBudget) * 100)) : 0;
            return (
              <div key={camp.id} className="bg-base-panel border border-slate-700 rounded-lg p-6 hover:border-slate-500 transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200">{camp.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${
                        camp.status === 'active' ? 'bg-status-green/10 text-status-green border-status-green/20' : 'bg-slate-700 text-slate-300 border-slate-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${camp.status === 'active' ? 'bg-status-green' : 'bg-slate-400'}`} />
                        {camp.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">ID: {camp.id}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400 mb-1">Max Bid</p>
                    <p className="font-bold text-accent tabular-nums">${camp.maxBid.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Daily Budget Progress</span>
                    <span className="text-slate-200 font-medium tabular-nums">
                      ${camp.spentToday.toLocaleString()} / ${camp.dailyBudget.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${progress > 90 ? 'bg-status-amber' : 'bg-emerald-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-slate-700/50 pt-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Geo Targeting</p>
                    <p className="text-sm font-medium text-slate-300">{camp.targeting.geo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Device</p>
                    <p className="text-sm font-medium text-slate-300 capitalize">{camp.targeting.device}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Freq. Cap</p>
                    <p className="text-sm font-medium text-slate-300">{camp.frequencyCap}/day</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-base-panel border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-100">Create New Campaign</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="name">Campaign Name</label>
                <input
                  id="name" name="name" type="text" required
                  value={formData.name} onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="e.g. Summer Sale 2026"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="dailyBudget">Daily Budget ($)</label>
                  <input
                    id="dailyBudget" name="dailyBudget" type="number" min="1" required
                    value={formData.dailyBudget} onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="maxBid">Max Bid ($)</label>
                  <input
                    id="maxBid" name="maxBid" type="number" step="0.01" min="0.01" required
                    value={formData.maxBid} onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="geo">Geo Targeting</label>
                  <select
                    id="geo" name="geo" value={formData.geo} onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  >
                    <option value="US">US</option>
                    <option value="UK">UK</option>
                    <option value="IN">IN</option>
                    <option value="GLOBAL">Global</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="device">Device</label>
                  <select
                    id="device" name="device" value={formData.device} onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  >
                    <option value="all">All Devices</option>
                    <option value="mobile">Mobile Only</option>
                    <option value="desktop">Desktop Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="frequencyCap">Frequency Cap (impressions/day)</label>
                <input
                  id="frequencyCap" name="frequencyCap" type="number" min="1" required
                  value={formData.frequencyCap} onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
              
              <div className="pt-4 border-t border-slate-700 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent-hover text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Campaign</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}