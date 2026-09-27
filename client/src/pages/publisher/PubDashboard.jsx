import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { slotService } from '../../services/slotService';
import { analyticsService } from '../../services/analyticsService';
import '../admin/Admin.css';
import '../advertiser/Advertiser.css';

const fmtRupees = (paise) =>
  `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export const PubDashboard = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      slotService.getByPublisher(user.id),
      analyticsService.getPublisherStats(user.id),
    ]).then(([sl, st]) => {
      setSlots(sl);
      setStats(st);
      setLoading(false);
    });
  }, [user.id]);

  if (loading) return <div className="admin-page"><div className="loading-state">Loading…</div></div>;

  const activeSlots  = slots.filter(s => s.status === 'active').length;
  const revenueToday = slots.reduce((a, s) => a + (s.revenueToday || 0), 0);
  const avgFillRate  = slots.length
    ? (slots.reduce((a, s) => a + (s.fillRate || 0), 0) / slots.length * 100).toFixed(1)
    : '0.0';

  return (
    <div className="admin-page">
      <h1 className="page-title">Publisher Dashboard</h1>
      <p className="page-sub">Welcome back, {user.name}. Your slot and earnings summary.</p>

      <div className="cards-row">
        <div className="metric-card">
          <div className="metric-label">Active Slots</div>
          <div className="metric-value mono" style={{ color: 'var(--success-green)' }}>{activeSlots}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Revenue Today</div>
          <div className="metric-value mono" style={{ fontSize: '1.3rem' }}>{fmtRupees(revenueToday)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg Fill Rate</div>
          <div className="metric-value mono">{avgFillRate}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Slots</div>
          <div className="metric-value mono">{slots.length}</div>
        </div>
      </div>

      {slots.length === 0 ? (
        <div className="stub-page" style={{ height: '180px' }}>
          <div className="stub-icon">🗃️</div>
          <div className="stub-label">No slots yet</div>
          <div className="stub-desc">Go to Ad Slots to add your first slot.</div>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table" aria-label="Slots overview">
            <thead>
              <tr>
                <th>Slot Name</th>
                <th>Status</th>
                <th>Category</th>
                <th>Floor Price</th>
                <th>Fill Rate</th>
                <th>Revenue Today</th>
              </tr>
            </thead>
            <tbody>
              {slots.map(s => (
                <tr key={s.id}>
                  <td className="td-bold">{s.slotName}</td>
                  <td>
                    <span className={`badge ${s.status === 'active' ? 'badge-win' : 'badge-warn'}`}>
                      {s.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-dim">{s.category}</td>
                  <td className="mono">{fmtRupees(s.floorPrice)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="bar-track" style={{ width: '80px' }}>
                        <div className="bar-fill" style={{ width: `${(s.fillRate || 0) * 100}%`, background: 'var(--success-green)' }} />
                      </div>
                      <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {((s.fillRate || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="mono" style={{ color: 'var(--success-green)' }}>{fmtRupees(s.revenueToday || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
