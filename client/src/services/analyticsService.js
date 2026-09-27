import { analytics } from '../mocks/analytics';
import { delay } from './delay';

export const analyticsService = {
  getPlatformStats: async () => {
    await delay();
    return [...analytics];
  },
  getAdvertiserStats: async (advertiserId) => {
    await delay();
    return [...analytics]; // For mock, returning same data
  },
  getPublisherStats: async (publisherId) => {
    await delay();
    return [...analytics]; // For mock, returning same data
  }
};
