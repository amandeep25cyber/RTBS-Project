import React, { useState, useEffect } from 'react';
import { walletService } from '../../services/walletService';
import { analyticsService } from '../../services/analyticsService';
import './Admin.css';
import './Analytics.css';

export const AdminRevenue = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getPlatformStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="admin-page"><div className="loading-state">Loading…</div></div>;

  // Derive revenue metrics from analytics mock (spend * platform commission ~15%)
  const COMMISSION = 0.15;
  const totalSpend     = stats.reduce((a, d) => a + d.spend, 0);
  const totalRevenue   = Math.floor(totalSpend * COMMISSION);
  const avgHourly      = Math.floor(totalRevenue / (stats.length || 1));
  const peakHour       = stats.reduce((best, d) => d.spend > best.spend ? d : best, stats[0]);

  return (
    <div className="admin-page">
      <h1 className="page-title">Platform Revenue</h1>
      <p className="page-sub">Commission earned from platform_fee transactions. Commission rate: {(COMMISSION * 100).toFixed(0)}%.</p>

      <div className="revenue-grid">
        <div className="revenue-card">
          <div className="revenue-card-icon">💰</div>
          <div className="revenue-card-title">Total Commission (24h)</div>
          <div className="revenue-card-value green">
            ₹{(totalRevenue / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="revenue-card">
          <div className="revenue-card-icon">📊</div>
          <div className="revenue-card-title">Total Ad Spend (24h)</div>
          <div className="revenue-card-value blue">
            ₹{(totalSpend / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="revenue-card">
          <div className="revenue-card-icon">⏱️</div>
          <div className="revenue-card-title">Avg Hourly Revenue</div>
          <div className="revenue-card-value">
            ₹{(avgHourly / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="revenue-card">
          <div className="revenue-card-icon">🏆</div>
          <div className="revenue-card-title">Peak Hour</div>
          <div className="revenue-card-value" style={{ fontSize: '1.4rem' }}>
            {peakHour?.hour || '—'}
          </div>
        </div>
      </div>

      {/* Revenue breakdown table by hour */}
      <div className="data-table-wrap">
        <table className="data-table" aria-label="Hourly revenue table">
          <thead>
            <tr>
              <th>Hour</th>
              <th>Ad Spend (paise)</th>
              <th>Ad Spend (₹)</th>
              <th>Commission (₹)</th>
              <th>Win Rate</th>
              <th>Share of 24h</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((d, i) => {
              const commission = Math.floor(d.spend * COMMISSION);
              const sharePct = totalSpend > 0 ? ((d.spend / totalSpend) * 100).toFixed(1) : '0.0';
              return (
                <tr key={i}>
                  <td className="mono td-bold">{d.hour}</td>
                  <td className="mono text-dim">{d.spend.toLocaleString()}</td>
                  <td className="mono">₹{(d.spend / 100).toFixed(2)}</td>
                  <td className="mono" style={{ color: 'var(--success-green)' }}>
                    ₹{(commission / 100).toFixed(2)}
                  </td>
                  <td className="mono">{(parseFloat(d.winRate) * 100).toFixed(0)}%</td>
                  <td>
                    <div className="bar-track" style={{ width: '120px' }}>
                      <div
                        className="bar-fill"
                        style={{
                          width: `${sharePct}%`,
                          background: 'var(--success-green)',
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
