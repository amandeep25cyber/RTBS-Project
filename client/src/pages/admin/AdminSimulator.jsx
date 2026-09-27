import React from 'react';
import { useSimulator } from '../../context/SimulatorContext';
import './Admin.css';
import './Analytics.css';

// rate (ms) → events-per-second label
const rateToLabel = (rate) => {
  const eps = (1000 / rate).toFixed(1);
  return `${eps} events/sec`;
};

// Predefined load presets
const PRESETS = [
  { label: 'Slow',   rate: 3000 },
  { label: 'Normal', rate: 1000 },
  { label: 'Fast',   rate: 500  },
  { label: 'Burst',  rate: 100  },
];

export const AdminSimulator = () => {
  const { rate, setRate, running, setRunning } = useSimulator();

  // Slider: 100ms – 5000ms (inverted: higher slider = faster)
  // We map slider value directly to rate
  const sliderVal = 5100 - rate; // 100→5000, 5000→100

  const handleSlider = (e) => {
    const newRate = 5100 - parseInt(e.target.value, 10);
    setRate(Math.max(100, Math.min(5000, newRate)));
  };

  return (
    <div className="admin-page">
      <h1 className="page-title">Simulator Control</h1>
      <p className="page-sub">
        Adjust the auction traffic load. Changes propagate instantly to the Live Auction Feed.
      </p>

      <div className="simulator-panel">

        {/* Start / Stop */}
        <div className="sim-row">
          <div className="sim-label">Simulator status</div>
          <div className="sim-status-row">
            {running ? (
              <button
                id="sim-stop-btn"
                className="sim-stop-btn"
                onClick={() => setRunning(false)}
              >
                ⏹ Stop Simulator
              </button>
            ) : (
              <button
                id="sim-start-btn"
                className="sim-start-btn"
                onClick={() => setRunning(true)}
              >
                ▶ Start Simulator
              </button>
            )}
            <div className="sim-status-indicator">
              <span className={running ? 'sim-dot-running' : 'sim-dot-stopped'} />
              {running ? 'Running' : 'Stopped'}
            </div>
          </div>
        </div>

        {/* Rate slider */}
        <div className="sim-row">
          <div className="sim-label">Event rate</div>
          <div className="sim-value-display">{rateToLabel(rate)}</div>
          <input
            id="sim-rate-slider"
            type="range"
            className="sim-slider"
            min={100}
            max={5000}
            step={50}
            value={sliderVal}
            onChange={handleSlider}
            aria-label="Auction event rate"
            disabled={!running}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <span>Slow (0.2/s)</span>
            <span>Burst (10/s)</span>
          </div>
        </div>

        {/* Preset buttons */}
        <div className="sim-row">
          <div className="sim-label">Load presets</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {PRESETS.map(p => (
              <button
                key={p.label}
                id={`sim-preset-${p.label.toLowerCase()}`}
                className={`action-btn ${rate === p.rate ? 'action-unblock' : 'action-block'}`}
                style={{ border: rate === p.rate ? '1px solid var(--success-green)' : '1px solid rgba(255,255,255,0.12)', color: rate === p.rate ? 'var(--success-green)' : 'var(--text-secondary)' }}
                onClick={() => { setRate(p.rate); if (!running) setRunning(true); }}
              >
                {p.label} — {rateToLabel(p.rate)}
              </button>
            ))}
          </div>
        </div>

        <p className="sim-hint">
          Rate changes are applied immediately to the Live Auction Feed. Navigate to{' '}
          <strong>/admin/feed</strong> to see the effect in real-time.
        </p>
      </div>
    </div>
  );
};
