import { useState, useEffect, useRef } from 'react';
import { auctionService } from '../services/auctionService';
import { Activity, XCircle, DollarSign, Clock } from 'lucide-react';

export default function AdminFeed() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ total: 0, noBids: 0, qps: 0 });
  const eventCounter = useRef(0);
  const feedEndRef = useRef(null);

  useEffect(() => {
    let isActive = true;
    
    // QPS calculator
    const qpsInterval = setInterval(() => {
      setStats(prev => ({ ...prev, qps: eventCounter.current }));
      eventCounter.current = 0;
    }, 1000);

    const fetchAuction = async () => {
      if (!isActive) return;
      
      try {
        const event = await auctionService.getLatestAuction();
        if (!isActive) return;
        
        eventCounter.current += 1;
        
        setEvents(prev => {
          const next = [...prev, event];
          // Keep only last 100 events for performance
          if (next.length > 100) next.shift();
          return next;
        });

        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          noBids: prev.noBids + (event.isNoBid ? 1 : 0)
        }));

      } catch (err) {
        console.error("Failed to fetch auction:", err);
      }

      // Schedule next fetch based on random interval to simulate real traffic (average 10-20 QPS -> 50-100ms)
      // Actually, standard is 1-2s according to spec if we use a simple interval, but spec says "1-2s" interval in 6.2. 
      // Let's use 1000ms. Later simulator control will change this.
      if (isActive) {
        setTimeout(fetchAuction, 1000);
      }
    };

    fetchAuction();

    return () => {
      isActive = false;
      clearInterval(qpsInterval);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="text-accent" /> Live Auction Feed
          </h1>
          <p className="text-slate-400 mt-1">Real-time incoming bid requests and auction resolutions</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-base-panel border border-slate-700 px-6 py-3 rounded-lg text-center min-w-[120px]">
            <p className="text-sm text-slate-400 mb-1">Traffic (QPS)</p>
            <p className="text-2xl font-bold text-accent mono-num">{stats.qps}</p>
          </div>
          <div className="bg-base-panel border border-slate-700 px-6 py-3 rounded-lg text-center min-w-[120px]">
            <p className="text-sm text-slate-400 mb-1">No-Bid Rate</p>
            <p className="text-2xl font-bold text-status-amber mono-num">
              {stats.total > 0 ? Math.round((stats.noBids / stats.total) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-base-panel border border-slate-700 rounded-lg overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-800/50 border-b border-slate-700 text-sm font-medium text-slate-400">
          <div className="col-span-3">Timestamp</div>
          <div className="col-span-3">Auction ID</div>
          <div className="col-span-2">Winner DSP</div>
          <div className="col-span-2 text-right">Winning Bid</div>
          <div className="col-span-2 text-right">Latency</div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {events.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                Waiting for incoming auctions...
              </div>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="grid grid-cols-12 gap-4 px-4 py-2 hover:bg-slate-700/30 rounded font-mono text-sm items-center transition-colors">
                <div className="col-span-3 text-slate-400 tabular-nums">
                  {new Date(event.timestamp).toISOString().split('T')[1].replace('Z', '')}
                </div>
                <div className="col-span-3 text-slate-300 truncate" title={event.id}>
                  {event.id}
                </div>
                <div className="col-span-2">
                  {event.isNoBid ? (
                    <span className="flex items-center gap-1 text-status-red text-xs px-2 py-0.5 rounded bg-status-red/10 border border-status-red/20 w-fit">
                      <XCircle className="w-3 h-3" /> NO BID
                    </span>
                  ) : (
                    <span className="text-slate-200 font-medium">{event.winner}</span>
                  )}
                </div>
                <div className="col-span-2 text-right text-accent tabular-nums flex items-center justify-end gap-1">
                  {!event.isNoBid && (
                    <>
                      <DollarSign className="w-3 h-3 text-accent/70" />
                      {event.winningBid.toFixed(2)}
                    </>
                  )}
                </div>
                <div className="col-span-2 text-right text-slate-300 tabular-nums flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {event.latencyMs}ms
                </div>
              </div>
            ))
          )}
          <div ref={feedEndRef} />
        </div>
      </div>
    </div>
  );
}