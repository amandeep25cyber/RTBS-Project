import { slots } from '../mocks/slots.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const slotService = {
  getSlotsByPublisher: async (publisherId) => {
    await delay(300);
    return slots.filter(s => s.publisherId === publisherId);
  },
  createSlot: async (slotData) => {
    await delay(400);
    const newSlot = { id: `s_${Math.random().toString(36).substr(2, 9)}`, ...slotData };
    slots.push(newSlot);
    return newSlot;
  }
};
