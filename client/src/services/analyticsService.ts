import { analytics } from '../mocks/analytics.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const analyticsService = {
  getPlatformAnalytics: async () => {
    await delay(500);
    return analytics.platform;
  },
  getAdvertiserAnalytics: async (_advertiserId) => {
    await delay(400);
    return analytics.advertiser;
  },
  getPublisherAnalytics: async (_publisherId) => {
    await delay(400);
    return analytics.publisher;
  }
};
