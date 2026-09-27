import { dsps } from '../mocks/dsps';
import { delay } from './delay';

export const dspService = {
  getAll: async () => {
    await delay();
    return [...dsps];
  }
};
