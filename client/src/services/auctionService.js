import { generateAuctionEvent } from '../mocks/auctions';
import { delay } from './delay';

export const auctionService = {
  getLiveEvent: async () => {
    // delay not strictly needed here as we simulate real-time interval in the UI, 
    // but added to simulate network jitter
    await delay(Math.random() * 200 + 100); 
    return generateAuctionEvent();
  }
};
