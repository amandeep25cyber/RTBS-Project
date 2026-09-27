import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { campaignService } from '../../services/campaignService';
import { analyticsService } from '../../services/analyticsService';
import '../admin/Admin.css';

const fmtRupees = (paise) =>
  `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export const AdvDashboard = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      campaignService.getByAdvertiser(user.id),
      analyticsService.getAdvertiserStats(user.id),
    ]).then(([camps, s]) => {
      setCampaigns(camps);
      setStats(s);
      setLoading(false);
    });
  }, [user.id]);

  if (loading) return <div className="admin-page"><div className="loading-state">Loading…</div></div>;

  const active   = campaigns.filter(c => c.status === 'active').length;
  const spentToday = campaigns.reduce((a, c) => a + (c.spentToday || 0), 0);
  const totalBudget = campaigns.reduce((a, c) => a + (c.dailyBudget || 0), 0);
  const avgWinRate = stats.length
    ? (stats.reduce((a, d) => a + parseFloat(d.winRate), 0) / stats.length * 100).toFixed(1)
    : '0.0';

  return (
    <div className="admin-page">
      <h1 className="page-title">Advertiser Dashboard</h1>
      <p className="page-sub">Welcome back, {user.name}. Here's your campaign summary.</p>

      <div className="cards-row">
        <div className="metric-card">
          <div className="metric-label">Active Campaigns</div>
          <div className="metric-value mono" style={{ color: 'var(--success-green)' }}>{active}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Spent Today</div>
          <div className="metric-value mono" style={{ fontSize: '1.3rem' }}>{fmtRupees(spentToday)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Daily Budget</div>
          <div className="metric-value mono" style={{ fontSize: '1.3rem' }}>{fmtRupees(totalBudget)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg Win Rate</div>
          <div className="metric-value mono">{avgWinRate}%</div>
        </div>
      </div>

      {/* Campaign mini list with budget bars */}
      {campaigns.length === 0 ? (
        <div className="stub-page" style={{ height: '180px' }}>
          <div className="stub-icon">📋</div>
          <div className="stub-label">No campaigns yet</div>
          <div className="stub-desc">Go to Campaigns to create your first one.</div>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table" aria-label="Campaign overview">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Status</th>
                <th>Spent Today</th>
                <th>Daily Budget</th>
                <th>Pacing</th>
                <th>Max Bid</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => {
                const pct = c.dailyBudget > 0 ? Math.min((c.spentToday / c.dailyBudget) * 100, 100) : 0;
                const barColor = pct >= 90 ? 'var(--error-red)' : pct >= 70 ? 'var(--warn-amber)' : 'var(--accent-live)';
                return (
                  <tr key={c.id}>
                    <td className="td-bold">{c.name}</td>
                    <td>
                      <span className={`badge ${c.status === 'active' ? 'badge-win' : 'badge-warn'}`}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="mono">{fmtRupees(c.spentToday || 0)}</td>
                    <td className="mono">{fmtRupees(c.dailyBudget)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="bar-track" style={{ width: '100px' }}>
                          <div className="bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                        </div>
                        <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="mono">{fmtRupees(c.maxBid)}</td>
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
