import { categories } from '../mocks/categories';
import { delay } from './delay';

export const categoryService = {
  getAll: async () => {
    await delay();
    return [...categories];
  }
};
