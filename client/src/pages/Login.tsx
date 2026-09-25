import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      const user = await login(email, password);
      toast.success('Successfully signed in');
      if (user.role === 'admin') navigate('/admin/feed');
      else if (user.role === 'advertiser') navigate('/advertiser/dashboard');
      else if (user.role === 'publisher') navigate('/publisher/dashboard');
    } catch (err) {
      toast.error('Invalid email or password');
      // Error is handled by context and displayed below
    }
  };

  return (
    <div className="min-h-screen bg-base-darker flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-base-panel rounded-xl shadow-xl border border-slate-700 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 bg-accent/20 text-accent rounded-lg flex items-center justify-center">
              <LogIn className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">RTB Platform</h1>
          </div>
          
          <h2 className="text-xl font-semibold text-slate-200 mb-6 text-center">Sign in to your account</h2>

          {error && (
            <div className="mb-6 p-4 bg-status-red/10 border border-status-red/20 rounded-lg flex items-start gap-3 text-status-red">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="name@company.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent hover:bg-accent-hover text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent hover:text-accent-hover font-medium">
              Sign up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}