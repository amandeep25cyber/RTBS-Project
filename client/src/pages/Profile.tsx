import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { toast } from 'react-hot-toast';
import { User, Mail, Shield, Save, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Mock updating profile
      const updates: any = { name: formData.name, email: formData.email };
      if (formData.newPassword) {
        updates.password = formData.newPassword;
      }
      
      await userService.updateProfile(currentUser.id, updates);
      
      toast.success('Profile updated successfully');
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      
      // Update context in real app, but for mock we just show success
    } catch (err) {
      toast.error('Failed to update profile');
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <User className="text-accent" /> Profile & Settings
        </h1>
        <p className="text-slate-400 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="bg-base-panel border border-slate-700 rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {message && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              message.type === 'error' ? 'bg-status-red/10 border border-status-red/20 text-status-red' : 'bg-status-green/10 border border-status-green/20 text-status-green'
            }`}>
              {message.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <div>
            <h2 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-400" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="name">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    id="name" name="name" type="text"
                    value={formData.name} onChange={handleInputChange} required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="email">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    id="email" name="email" type="email"
                    value={formData.email} onChange={handleInputChange} required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700">
            <h2 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-400" /> Change Password
            </h2>
            <p className="text-sm text-slate-400 mb-6">Leave blank if you don't want to change your password.</p>
            
            <div className="space-y-6">
              <div className="max-w-md">
                <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword" name="currentPassword" type="password"
                  value={formData.currentPassword} onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword" name="newPassword" type="password"
                    value={formData.newPassword} onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    id="confirmPassword" name="confirmPassword" type="password"
                    value={formData.confirmPassword} onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700 flex justify-between items-center mt-8">
            <button 
              type="button" 
              onClick={handleLogout}
              className="text-slate-400 hover:text-slate-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 border border-slate-700 hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-accent hover:bg-accent-hover text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
