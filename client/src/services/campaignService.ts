import { campaigns } from '../mocks/campaigns.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const campaignService = {
  getCampaignsByAdvertiser: async (advertiserId) => {
    await delay(300);
    return campaigns.filter(c => c.advertiserId === advertiserId);
  },
  createCampaign: async (campaignData) => {
    await delay(400);
    const newCampaign = { id: `c_${Math.random().toString(36).substr(2, 9)}`, ...campaignData };
    campaigns.push(newCampaign);
    return newCampaign;
  }
};
