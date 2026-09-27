import React, { useState, useEffect, useRef, useCallback, useContext, createContext } from 'react';
import { generateAuctionEvent } from '../../mocks/auctions';
import './AdminFeed.css';

/* ─── Simulator context (shared with SimulatorControl page) ─── */
export const SimulatorContext = createContext({ rate: 1000, setRate: () => {} });

const MAX_ROWS = 120;

const fmtBid  = (paise) => paise != null ? `₹${(paise / 100).toFixed(2)}` : '—';
const fmtTime = (iso)   => new Date(iso).toLocaleTimeString('en-IN', { hour12: false });

export const AdminFeed = () => {
  const { rate } = useContext(SimulatorContext);

  const [events, setEvents] = useState([]);
  const [paused, setPaused] = useState(false);
  const [auctionsPerSec, setAuctionsPerSec] = useState(0);
  const [noBidCount, setNoBidCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const tickRef = useRef(0);
  const listRef = useRef(null);
  const intervalRef = useRef(null);

  // Attach / detach the event generator
  const startInterval = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (paused) return;
      const ev = generateAuctionEvent();
      tickRef.current += 1;
      setEvents(prev => [ev, ...prev].slice(0, MAX_ROWS));
      setTotalCount(c => c + 1);
      if (ev.isNoBid) setNoBidCount(c => c + 1);
    }, rate);
  }, [rate, paused]);

  useEffect(() => {
    startInterval();
    return () => clearInterval(intervalRef.current);
  }, [startInterval]);

  // Auctions-per-second counter (reset every second)
  useEffect(() => {
    const t = setInterval(() => {
      setAuctionsPerSec(tickRef.current);
      tickRef.current = 0;
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll to top (newest)
  useEffect(() => {
    if (listRef.current && !paused) {
      listRef.current.scrollTop = 0;
    }
  }, [events, paused]);

  const winRate = totalCount > 0 ? (((totalCount - noBidCount) / totalCount) * 100).toFixed(1) : '—';

  return (
    <div className="feed-root">
      {/* Header bar */}
      <div className="feed-header">
        <div className="feed-title">
          <span className="live-dot" aria-label="Live" />
          Live Auction Feed
        </div>
        <div className="feed-stats">
          <div className="stat-chip">
            <span className="stat-label">QPS</span>
            <span className="stat-value mono">{auctionsPerSec}</span>
          </div>
          <div className="stat-chip">
            <span className="stat-label">Win rate</span>
            <span className="stat-value mono">{winRate}%</span>
          </div>
          <div className="stat-chip warn">
            <span className="stat-label">No-bid</span>
            <span className="stat-value mono">{noBidCount}</span>
          </div>
          <div className="stat-chip">
            <span className="stat-label">Total</span>
            <span className="stat-value mono">{totalCount}</span>
          </div>
          <button
            id="feed-pause-btn"
            className={`feed-ctrl-btn ${paused ? 'paused' : ''}`}
            onClick={() => setPaused(p => !p)}
          >
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div className="feed-cols">
        <span>Time</span>
        <span>ID</span>
        <span>Winner</span>
        <span>Winning bid</span>
        <span>Latency</span>
        <span>Status</span>
      </div>

      {/* Scrollable event list */}
      <div className="feed-list" ref={listRef} aria-live="polite" aria-label="Auction events">
        {events.length === 0 && (
          <div className="feed-empty">Waiting for events…</div>
        )}
        {events.map(ev => (
          <div key={ev.id} className={`feed-row ${ev.isNoBid ? 'row-nobid' : 'row-win'}`}>
            <span className="mono text-dim">{fmtTime(ev.timestamp)}</span>
            <span className="mono text-dim">{ev.id}</span>
            <span>{ev.isNoBid ? '—' : ev.winnerId}</span>
            <span className="mono">{fmtBid(ev.winningBid)}</span>
            <span className="mono">{ev.latencyMs}ms</span>
            <span className={`badge ${ev.isNoBid ? 'badge-nobid' : 'badge-win'}`}>
              {ev.isNoBid ? 'NO-BID' : 'WIN'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
