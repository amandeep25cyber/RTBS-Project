import { dsps } from './dsps.js';

export function generateAuctionEvent() {
  const isNoBid = Math.random() > 0.8;
  const winner = dsps[Math.floor(Math.random() * dsps.length)];
  
  return {
    id: `auc_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    isNoBid,
    winner: isNoBid ? null : winner.name,
    winningBid: isNoBid ? 0 : Number((Math.random() * 2 + 0.1).toFixed(2)),
    latencyMs: Math.floor(Math.random() * 80) + 10
  };
}
