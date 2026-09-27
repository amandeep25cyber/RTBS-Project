export const generateAuctionEvent = () => {
  const isNoBid = Math.random() > 0.8;
  return {
    id: Math.random().toString(36).substr(2, 9),
    winnerId: isNoBid ? null : "c1",
    winningBid: isNoBid ? null : Math.floor(Math.random() * 200) + 50, // paise
    latencyMs: Math.floor(Math.random() * 80) + 10,
    timestamp: new Date().toISOString(),
    isNoBid,
  };
};
