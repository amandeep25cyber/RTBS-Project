import { campaigns } from '../mocks/campaigns';
import { delay } from './delay';

export const campaignService = {
  getByAdvertiser: async (advertiserId) => {
    await delay();
    return campaigns.filter(c => c.advertiserId === advertiserId);
  },
  create: async (campaignData) => {
    await delay();
    const newCampaign = { id: `c${Date.now()}`, ...campaignData, spentToday: 0, status: 'active' };
    campaigns.push(newCampaign);
    return newCampaign;
  },
  update: async (id, data) => {
    await delay();
    const index = campaigns.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Not found");
    campaigns[index] = { ...campaigns[index], ...data };
    return campaigns[index];
  }
};
