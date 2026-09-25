import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { slotService } from '../services/slotService';
import { Layers, Plus, X, Save } from 'lucide-react';
import { SkeletonTable } from '../components/Skeleton';

export default function PubSlots() {
  const { currentUser } = useAuth();
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    slotName: '',
    floorPrice: ''
  });

  useEffect(() => {
    fetchSlots();
  }, [currentUser]);

  const fetchSlots = async () => {
    try {
      const data = await slotService.getSlotsByPublisher(currentUser.id);
      setSlots(data);
    } catch (err) {
      console.error("Failed to load slots", err);
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
      const newSlot = await slotService.createSlot({
        publisherId: currentUser.id,
        slotName: formData.slotName,
        floorPrice: Number(formData.floorPrice),
        fillRate: 0,
        revenueToday: 0,
        status: 'active'
      });
      setSlots(prev => [...prev, newSlot]);
      setIsModalOpen(false);
      setFormData({ slotName: '', floorPrice: '' });
    } catch (err) {
      console.error("Failed to create slot", err);
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
              <Layers className="text-accent" /> Ad Slot Management
            </h1>
            <p className="text-slate-400 mt-1">Manage your website's ad inventory and floor prices</p>
          </div>
          <button disabled className="bg-slate-700 text-slate-400 font-medium py-2 px-4 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Slot
          </button>
        </div>
        <SkeletonTable />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="text-accent" /> Ad Slot Management
          </h1>
          <p className="text-slate-400 mt-1">Manage your website's ad inventory and floor prices</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-accent hover:bg-accent-hover text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Slot
        </button>
      </div>

      <div className="bg-base-panel border border-slate-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/30 flex justify-between items-center">
          <h2 className="text-lg font-medium text-slate-200">Your Inventory</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-sm font-medium border-b border-slate-700">
                <th className="px-6 py-4">Slot Details</th>
                <th className="px-6 py-4 text-right">Floor Price</th>
                <th className="px-6 py-4 text-right">Fill Rate</th>
                <th className="px-6 py-4 text-right">Revenue Today</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {slots.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h2 className="text-xl font-medium text-slate-200">No slots found</h2>
                    <p className="text-slate-400 mt-2 mb-6">You haven't created any ad slots yet. Click below to add your first inventory space.</p>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="bg-accent hover:bg-accent-hover text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" /> Create your first ad slot
                    </button>
                  </td>
                </tr>
              ) : (
                slots.map(slot => {
                  const fillRatePercent = Math.round(slot.fillRate * 100);
                  return (
                    <tr key={slot.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-200">{slot.slotName}</span>
                          <span className="text-xs text-slate-500 font-mono mt-0.5">ID: {slot.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums text-slate-300">
                        ${slot.floorPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-slate-300 tabular-nums">{fillRatePercent}%</span>
                          <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${fillRatePercent > 70 ? 'bg-emerald-500' : 'bg-status-amber'}`} style={{ width: `${fillRatePercent}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums text-emerald-400 font-medium">
                        ${slot.revenueToday.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          slot.status === 'active' ? 'bg-status-green/10 text-status-green border-status-green/20' : 'bg-slate-700 text-slate-300 border-slate-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${slot.status === 'active' ? 'bg-status-green' : 'bg-slate-400'}`} />
                          {slot.status.toUpperCase()}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-base-panel border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-100">Create New Ad Slot</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="slotName">Slot Name</label>
                <input
                  id="slotName" name="slotName" type="text" required
                  value={formData.slotName} onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="e.g. Homepage Top Banner"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="floorPrice">Floor Price ($ CPM)</label>
                <input
                  id="floorPrice" name="floorPrice" type="number" step="0.01" min="0.01" required
                  value={formData.floorPrice} onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="0.50"
                />
                <p className="mt-1.5 text-xs text-slate-500">Minimum bid accepted for this slot.</p>
              </div>

              <div className="pt-4 border-t border-slate-700 flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent-hover text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Slot</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
