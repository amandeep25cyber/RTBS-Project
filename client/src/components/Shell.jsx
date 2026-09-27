import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Shell.css';

export const Shell = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = {
    admin: [
      { to: "/admin/feed", label: "Live Auction Feed" },
      { to: "/admin/dsps", label: "Bidder Performance" },
      { to: "/admin/users", label: "User Management" },
      { to: "/admin/analytics", label: "Platform Analytics" },
      { to: "/admin/revenue", label: "Platform Revenue" },
      { to: "/admin/simulator", label: "Simulator Control" }
    ],
    advertiser: [
      { to: "/advertiser/dashboard", label: "Dashboard" },
      { to: "/advertiser/campaigns", label: "Campaigns" },
      { to: "/advertiser/analytics", label: "Analytics" },
      { to: "/advertiser/wallet", label: "Wallet" }
    ],
    publisher: [
      { to: "/publisher/dashboard", label: "Dashboard" },
      { to: "/publisher/slots", label: "Ad Slots" },
      { to: "/publisher/analytics", label: "Analytics" },
      { to: "/publisher/earnings", label: "Earnings" }
    ]
  };

  const links = user && navLinks[user.role] ? navLinks[user.role] : [];

  return (
    <div className="shell-container">
      <aside className="shell-sidebar">
        <div className="shell-brand">RTB Platform</div>
        <nav className="shell-nav">
          {links.map(link => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="shell-main">
        <header className="shell-header">
          <div className="header-title"></div>
          <div className="header-actions">
            <span className="user-name">{user?.name} ({user?.role})</span>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <div className="shell-content">
          {children}
        </div>
      </main>
    </div>
  );
};
