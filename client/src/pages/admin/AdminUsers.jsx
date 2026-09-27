import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import './Admin.css';

const ROLE_COLORS = {
  admin:      { bg: 'rgba(239,68,68,0.15)',  color: '#fca5a5' },
  advertiser: { bg: 'rgba(59,130,246,0.15)', color: '#93c5fd' },
  publisher:  { bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7' },
};

export const AdminUsers = () => {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null); // userId being toggled
  const [filter, setFilter] = useState('all'); // all | advertiser | publisher | admin

  useEffect(() => {
    userService.getAll().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const handleToggle = async (user) => {
    const nextStatus = user.status === 'blocked' ? 'active' : 'blocked';
    setToggling(user.id);
    try {
      await userService.setStatus(user.id, nextStatus);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
    } finally {
      setToggling(null);
    }
  };

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);

  const counts = {
    all:        users.length,
    advertiser: users.filter(u => u.role === 'advertiser').length,
    publisher:  users.filter(u => u.role === 'publisher').length,
    admin:      users.filter(u => u.role === 'admin').length,
  };

  return (
    <div className="admin-page">
      <h1 className="page-title">User Management</h1>
      <p className="page-sub">View and manage advertiser and publisher accounts.</p>

      {/* Filter tabs */}
      <div className="filter-tabs" role="tablist" aria-label="Filter users by role">
        {['all', 'advertiser', 'publisher', 'admin'].map(tab => (
          <button
            key={tab}
            id={`filter-tab-${tab}`}
            role="tab"
            aria-selected={filter === tab}
            className={`filter-tab ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className="tab-count">{counts[tab]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">Loading…</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table" aria-label="Users table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Extra info</th>
                <th>Balance / Earnings</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px' }}>
                    No users found.
                  </td>
                </tr>
              )}
              {filtered.map(user => {
                const rc = ROLE_COLORS[user.role] || {};
                const isBlocked = user.status === 'blocked';
                return (
                  <tr key={user.id} className={isBlocked ? 'row-blocked' : ''}>
                    <td className="td-bold">{user.name}</td>
                    <td className="mono text-dim">{user.email}</td>
                    <td>
                      <span className="role-pill" style={{ background: rc.bg, color: rc.color }}>
                        {user.role}
                      </span>
                    </td>
                    <td className="text-dim" style={{ fontSize: '0.82rem' }}>
                      {user.role === 'advertiser' && user.companyName ? `${user.companyName} · ${user.industry}` : ''}
                      {user.role === 'publisher'  && user.websiteName ? `${user.websiteName} · ${user.websiteUrl}` : ''}
                      {user.role === 'admin' ? 'Platform admin' : ''}
                    </td>
                    <td className="mono">
                      {user.role === 'advertiser' && user.walletBalance != null
                        ? `₹${(user.walletBalance / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        : ''}
                      {user.role === 'publisher' && user.earningsBalance != null
                        ? `₹${(user.earningsBalance / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        : ''}
                    </td>
                    <td>
                      <span className={`badge ${isBlocked ? 'badge-nobid' : 'badge-win'}`}>
                        {(user.status || 'active').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {user.role !== 'admin' && (
                        <button
                          id={`toggle-user-${user.id}`}
                          className={`action-btn ${isBlocked ? 'action-unblock' : 'action-block'}`}
                          onClick={() => handleToggle(user)}
                          disabled={toggling === user.id}
                          aria-label={isBlocked ? `Unblock ${user.name}` : `Block ${user.name}`}
                        >
                          {toggling === user.id ? '…' : isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
