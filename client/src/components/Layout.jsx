import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LayoutDashboard, Megaphone, Server, Users, Settings, LogOut, BarChart3, User, Search, Layers } from 'lucide-react';

export default function Layout() {
  const { role, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = {
    admin: [
      { path: '/admin/feed', name: 'Live Auction Feed', icon: Activity },
      { path: '/admin/dsps', name: 'DSP Performance', icon: Server },
      { path: '/admin/users', name: 'User Management', icon: Users },
      { path: '/admin/analytics', name: 'Platform Analytics', icon: BarChart3 },
      { path: '/admin/simulator', name: 'Simulator Control', icon: Settings },
    ],
    advertiser: [
      { path: '/advertiser/dashboard', name: 'Dashboard', icon: LayoutDashboard },
      { path: '/advertiser/campaigns', name: 'Campaign Management', icon: Megaphone },
      { path: '/advertiser/analytics', name: 'Analytics', icon: BarChart3 },
    ],
    publisher: [
      { path: '/publisher/dashboard', name: 'Dashboard', icon: LayoutDashboard },
      { path: '/publisher/slots', name: 'Slot Management', icon: Layers },
      { path: '/publisher/analytics', name: 'Analytics', icon: BarChart3 },
    ]
  };

  const navLinks = role ? menuItems[role] : [];

  return (
    <div className="flex h-screen bg-base-darker text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-base-panel border-r border-slate-700 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-700">
          <span className="text-xl font-bold text-accent">RTB Platform</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-accent/10 text-accent font-medium' 
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400">
            <User className="w-5 h-5" />
            <div className="truncate">
              <p className="font-medium text-slate-200 truncate">{currentUser?.name}</p>
              <p className="text-xs truncate">{role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-base-panel border-b border-slate-700 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 text-slate-400 w-1/3">
            <Search className="w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-500 text-slate-200"
            />
          </div>
          <div className="flex items-center gap-4">
            <NavLink 
              to="/profile" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors ${isActive ? 'text-accent' : 'text-slate-400 hover:text-slate-200'}`
              }
            >
              Profile
            </NavLink>
            <button 
              onClick={handleLogout}
              className="text-sm font-medium text-slate-400 hover:text-slate-200 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
