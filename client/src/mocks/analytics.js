// Generate dummy analytics data
export const analytics = {
  platform: {
    spendData: Array.from({ length: 24 }).map((_, i) => ({
      hour: `${i}:00`,
      spend: Math.floor(Math.random() * 1000) + 500
    })),
    latencyData: Array.from({ length: 24 }).map((_, i) => ({
      hour: `${i}:00`,
      p50: Math.floor(Math.random() * 20) + 20,
      p95: Math.floor(Math.random() * 30) + 40,
      p99: Math.floor(Math.random() * 50) + 60
    })),
    winRateData: Array.from({ length: 24 }).map((_, i) => ({
      hour: `${i}:00`,
      winRate: Number((Math.random() * 0.2 + 0.6).toFixed(2))
    }))
  },
  advertiser: {
    spendData: Array.from({ length: 24 }).map((_, i) => ({
      hour: `${i}:00`,
      spend: Math.floor(Math.random() * 200) + 50
    })),
    winRateData: Array.from({ length: 24 }).map((_, i) => ({
      hour: `${i}:00`,
      winRate: Number((Math.random() * 0.3 + 0.4).toFixed(2))
    }))
  },
  publisher: {
    revenueData: Array.from({ length: 24 }).map((_, i) => ({
      hour: `${i}:00`,
      revenue: Math.floor(Math.random() * 150) + 40
    })),
    fillRateData: Array.from({ length: 24 }).map((_, i) => ({
      hour: `${i}:00`,
      fillRate: Number((Math.random() * 0.2 + 0.7).toFixed(2))
    }))
  }
};
