import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/analyticsService';
import '../admin/Admin.css';
import '../admin/Analytics.css';

const BAR_H = 80;

const SparkBar = ({ data, valueKey, color, label, formatter }) => {
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
              title={`${d.hour}: ${formatter ? formatter(d[valueKey]) : d[valueKey]}`}
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

const WinRateLine = ({ data }) => {
  const W = 100, H = BAR_H;
  const vals = data.map(d => parseFloat(d.winRate));
  const max = Math.max(...vals, 1);
  const pts = vals.map((v, i) => {
    const x = (i / Math.max(vals.length - 1, 1)) * W;
    const y = H - (v / max) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <div className="chart-wrap">
      <div className="chart-label-top">Win Rate (24h)</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="line-chart" preserveAspectRatio="none">
        <defs>
          <linearGradient id="adv-wr-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-live)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent-live)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${H} ${pts} ${W},${H}`} fill="url(#adv-wr-grad)" />
        <polyline points={pts} fill="none" stroke="var(--accent-live)" strokeWidth="1.5" />
      </svg>
      <div className="chart-x-labels">
        {data.filter((_, i) => i % 6 === 0).map(d => <span key={d.hour}>{d.hour}</span>)}
      </div>
    </div>
  );
};

export const AdvAnalytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getAdvertiserStats(user.id).then(data => {
      setStats(data);
      setLoading(false);
    });
  }, [user.id]);

  if (loading) return <div className="admin-page"><div className="loading-state">Loading…</div></div>;

  const totalSpend  = stats.reduce((a, d) => a + d.spend, 0);
  const avgWinRate  = stats.length ? (stats.reduce((a, d) => a + parseFloat(d.winRate), 0) / stats.length * 100).toFixed(1) : 0;
  const avgLatP50   = stats.length ? Math.round(stats.reduce((a, d) => a + d.latencyP50, 0) / stats.length) : 0;

  return (
    <div className="admin-page">
      <h1 className="page-title">Analytics</h1>
      <p className="page-sub">Your own campaign spend, pacing, and win-rate — last 24 hours.</p>

      <div className="cards-row">
        <div className="metric-card">
          <div className="metric-label">Total Spend (24h)</div>
          <div className="metric-value mono" style={{ fontSize: '1.3rem' }}>
            ₹{(totalSpend / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg Win Rate</div>
          <div className="metric-value mono" style={{ color: 'var(--success-green)' }}>{avgWinRate}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg Latency p50</div>
          <div className="metric-value mono">{avgLatP50}ms</div>
        </div>
      </div>

      <div className="charts-grid">
        <SparkBar
          data={stats}
          valueKey="spend"
          color="var(--accent-live)"
          label="Spend per hour (paise)"
          formatter={v => `₹${(v/100).toFixed(0)}`}
        />
        <WinRateLine data={stats} />
        <SparkBar
          data={stats}
          valueKey="latencyP50"
          color="var(--success-green)"
          label="Avg Latency p50 (ms)"
          formatter={v => `${v}ms`}
        />
      </div>
    </div>
  );
};
