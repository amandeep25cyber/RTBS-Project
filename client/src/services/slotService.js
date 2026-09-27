import { slots } from '../mocks/slots';
import { delay } from './delay';

export const slotService = {
  getByPublisher: async (publisherId) => {
    await delay();
    return slots.filter(s => s.publisherId === publisherId);
  },
  create: async (slotData) => {
    await delay();
    const newSlot = { id: `s${Date.now()}`, ...slotData, fillRate: 0, revenueToday: 0, status: 'active' };
    slots.push(newSlot);
    return newSlot;
  },
  update: async (id, data) => {
    await delay();
    const index = slots.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Not found");
    slots[index] = { ...slots[index], ...data };
    return slots[index];
  }
};
