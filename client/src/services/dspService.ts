import { dsps } from '../mocks/dsps.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const dspService = {
  getDSPs: async () => {
    await delay(350);
    return dsps;
  }
};
