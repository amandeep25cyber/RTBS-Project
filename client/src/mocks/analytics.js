const currentHour = new Date().getHours();

export const analytics = Array.from({ length: 24 }).map((_, i) => {
  const hour = (currentHour - 23 + i + 24) % 24;
  return {
    hour: `${hour.toString().padStart(2, '0')}:00`,
    spend: Math.floor(Math.random() * 50000) + 10000,
    latencyP50: Math.floor(Math.random() * 20) + 20,
    latencyP95: Math.floor(Math.random() * 40) + 40,
    latencyP99: Math.floor(Math.random() * 60) + 80,
    winRate: (Math.random() * 0.4 + 0.4).toFixed(2), // 40-80%
  };
});
