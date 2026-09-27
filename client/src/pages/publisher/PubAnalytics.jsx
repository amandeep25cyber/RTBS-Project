import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/analyticsService';
import '../admin/Admin.css';
import '../admin/Analytics.css';

const BAR_H = 80;

const SparkBar = ({ data, valueKey, color, label }) => {
  const values = data.map(d => d[valueKey]);
  const max = Math.max(...values, 1);
  return (
    <div className="chart-wrap">
      <div className="chart-label-top">{label}</div>
      <div className="sparkbar-row">
        {data.map((d, i) => (
          <div key={i} className="sparkbar-col">
            <div
              className="sparkbar-fill"
              style={{ height: `${(d[valueKey] / max) * BAR_H}px`, background: color }}
              title={`${d.hour}: ${d[valueKey]}`}
            />
          </div>
        ))}
      </div>
      <div className="chart-x-labels">
        {data.filter((_, i) => i % 6 === 0).map(d => (
          <span key={d.hour}>{d.hour}</span>
        ))}
      </div>
    </div>
  );
};

const FillRateLine = ({ data }) => {
  const W = 100, H = BAR_H;
  const vals = data.map(d => parseFloat(d.winRate)); // proxy fill rate
  const max = Math.max(...vals, 1);
  const pts = vals.map((v, i) => {
    const x = (i / Math.max(vals.length - 1, 1)) * W;
    const y = H - (v / max) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <div className="chart-wrap">
      <div className="chart-label-top">Fill Rate (24h proxy)</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="line-chart" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pub-fill-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--success-green)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--success-green)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${H} ${pts} ${W},${H}`} fill="url(#pub-fill-grad)" />
        <polyline points={pts} fill="none" stroke="var(--success-green)" strokeWidth="1.5" />
      </svg>
      <div className="chart-x-labels">
        {data.filter((_, i) => i % 6 === 0).map(d => <span key={d.hour}>{d.hour}</span>)}
      </div>
    </div>
  );
};

export const PubAnalytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getPublisherStats(user.id).then(data => {
      setStats(data);
      setLoading(false);
    });
  }, [user.id]);

  if (loading) return <div className="admin-page"><div className="loading-state">Loading…</div></div>;

  const totalRevenue = stats.reduce((a, d) => a + d.spend, 0);
  const avgFillRate  = stats.length
    ? (stats.reduce((a, d) => a + parseFloat(d.winRate), 0) / stats.length * 100).toFixed(1)
    : 0;
  const avgLatP50 = stats.length ? Math.round(stats.reduce((a, d) => a + d.latencyP50, 0) / stats.length) : 0;

  return (
    <div className="admin-page">
      <h1 className="page-title">Analytics</h1>
      <p className="page-sub">Your slot revenue and fill-rate trends — last 24 hours.</p>

      <div className="cards-row">
        <div className="metric-card">
          <div className="metric-label">Revenue (24h)</div>
          <div className="metric-value mono" style={{ fontSize: '1.3rem', color: 'var(--success-green)' }}>
            ₹{(totalRevenue / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg Fill Rate</div>
          <div className="metric-value mono">{avgFillRate}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg Latency p50</div>
          <div className="metric-value mono">{avgLatP50}ms</div>
        </div>
      </div>

      <div className="charts-grid">
        <SparkBar data={stats} valueKey="spend" color="var(--success-green)" label="Revenue per hour (paise)" />
        <FillRateLine data={stats} />
      </div>
    </div>
  );
};
