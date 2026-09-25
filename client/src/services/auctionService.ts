import { generateAuctionEvent } from '../mocks/auctions.js';

// Auction event doesn't need a huge delay if it's polling
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const auctionService = {
  getLatestAuction: async () => {
    await delay(100);
    return generateAuctionEvent();
  }
};
