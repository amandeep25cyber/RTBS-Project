import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import './Admin.css';
import './Analytics.css';

/* ─── Tiny SVG line/bar chart helpers (no library dependency) ─── */

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
              style={{
                height: `${(d[valueKey] / max) * BAR_H}px`,
                background: color,
              }}
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

const LatencyBars = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.latencyP99), 1);
  return (
    <div className="chart-wrap">
      <div className="chart-label-top">Latency (ms) — p50 / p95 / p99</div>
      <div className="sparkbar-row">
        {data.map((d, i) => (
          <div key={i} className="sparkbar-col triple">
            <div className="sparkbar-fill" style={{ height: `${(d.latencyP99 / maxVal) * BAR_H}px`, background: 'var(--error-red)', opacity: 0.5 }} />
            <div className="sparkbar-fill" style={{ height: `${(d.latencyP95 / maxVal) * BAR_H}px`, background: 'var(--warn-amber)', opacity: 0.7, position: 'absolute', bottom: 0 }} />
            <div className="sparkbar-fill" style={{ height: `${(d.latencyP50 / maxVal) * BAR_H}px`, background: 'var(--success-green)', position: 'absolute', bottom: 0 }} />
          </div>
        ))}
      </div>
      <div className="chart-x-labels">
        {data.filter((_, i) => i % 6 === 0).map(d => (
          <span key={d.hour}>{d.hour}</span>
        ))}
      </div>
      <div className="latency-legend">
        <span className="legend-dot" style={{ background: 'var(--success-green)' }} /> p50
        <span className="legend-dot" style={{ background: 'var(--warn-amber)' }} /> p95
        <span className="legend-dot" style={{ background: 'var(--error-red)' }} /> p99
      </div>
    </div>
  );
};

const WinRateLine = ({ data }) => {
  const W = 100, H = BAR_H;
  const vals = data.map(d => parseFloat(d.winRate));
  const max = Math.max(...vals, 1);
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W;
    const y = H - (v / max) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className="chart-wrap">
      <div className="chart-label-top">Win Rate (24h)</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="line-chart" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wr-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-live)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent-live)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${H} ${pts} ${W},${H}`} fill="url(#wr-grad)" />
        <polyline points={pts} fill="none" stroke="var(--accent-live)" strokeWidth="1.5" />
      </svg>
      <div className="chart-x-labels">
        {data.filter((_, i) => i % 6 === 0).map(d => (
          <span key={d.hour}>{d.hour}</span>
        ))}
      </div>
    </div>
  );
};

export const AdminAnalytics = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getPlatformStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="admin-page"><div className="loading-state">Loading…</div></div>;

  const totalSpend = stats.reduce((a, d) => a + d.spend, 0);
  const avgWinRate = stats.length ? (stats.reduce((a, d) => a + parseFloat(d.winRate), 0) / stats.length * 100).toFixed(1) : 0;
  const avgLatP50  = stats.length ? Math.round(stats.reduce((a, d) => a + d.latencyP50, 0) / stats.length) : 0;

  return (
    <div className="admin-page">
      <h1 className="page-title">Platform Analytics</h1>
      <p className="page-sub">24-hour platform-wide spend, latency percentiles, and win rate.</p>

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
        <div className="metric-card">
          <div className="metric-label">Data Points</div>
          <div className="metric-value mono">{stats.length}h</div>
        </div>
      </div>

      <div className="charts-grid">
        <SparkBar data={stats} valueKey="spend" color="var(--accent-live)" label="Spend per hour (paise)" />
        <WinRateLine data={stats} />
        <LatencyBars data={stats} />
      </div>
    </div>
  );
};
