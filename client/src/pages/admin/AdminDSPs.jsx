import React, { useState, useEffect } from 'react';
import { dspService } from '../../services/dspService';
import './Admin.css';

const fmtPct = (wins, total) => total > 0 ? ((wins / total) * 100).toFixed(1) + '%' : '0%';

export const AdminDSPs = () => {
  const [dsps, setDsps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dspService.getAll().then(data => {
      setDsps(data);
      setLoading(false);
    });
  }, []);

  const maxWins = Math.max(...dsps.map(d => d.wins), 1);
  const maxLatency = Math.max(...dsps.map(d => d.avgLatencyMs), 1);

  return (
    <div className="admin-page">
      <h1 className="page-title">Bidder Performance</h1>
      <p className="page-sub">Real-time DSP win-rate and latency metrics.</p>

      {loading ? (
        <div className="loading-state">Loading…</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="cards-row">
            <div className="metric-card">
              <div className="metric-label">Total DSPs</div>
              <div className="metric-value mono">{dsps.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Healthy</div>
              <div className="metric-value mono" style={{ color: 'var(--success-green)' }}>
                {dsps.filter(d => d.status === 'healthy').length}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Total Bids</div>
              <div className="metric-value mono">{dsps.reduce((a, d) => a + d.totalBids, 0).toLocaleString()}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Total Wins</div>
              <div className="metric-value mono">{dsps.reduce((a, d) => a + d.wins, 0).toLocaleString()}</div>
            </div>
          </div>

          {/* DSP Table */}
          <div className="data-table-wrap">
            <table className="data-table" aria-label="Bidder performance table">
              <thead>
                <tr>
                  <th>DSP</th>
                  <th>Status</th>
                  <th>Total Bids</th>
                  <th>Wins</th>
                  <th>Win Rate</th>
                  <th>Win Rate Bar</th>
                  <th>Avg Latency</th>
                  <th>Latency Bar</th>
                </tr>
              </thead>
              <tbody>
                {dsps.map(dsp => (
                  <tr key={dsp.id}>
                    <td className="td-bold">{dsp.name}</td>
                    <td>
                      <span className={`badge ${dsp.status === 'healthy' ? 'badge-win' : 'badge-nobid'}`}>
                        {dsp.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="mono">{dsp.totalBids.toLocaleString()}</td>
                    <td className="mono">{dsp.wins.toLocaleString()}</td>
                    <td className="mono">{fmtPct(dsp.wins, dsp.totalBids)}</td>
                    <td>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{ width: `${(dsp.wins / maxWins) * 100}%`, background: 'var(--accent-live)' }}
                        />
                      </div>
                    </td>
                    <td className="mono">{dsp.avgLatencyMs}ms</td>
                    <td>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${(dsp.avgLatencyMs / maxLatency) * 100}%`,
                            background: dsp.avgLatencyMs < 50 ? 'var(--success-green)' : 'var(--warn-amber)'
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
