import { users } from '../mocks/users';
import { delay } from './delay';

export const userService = {
  getAll: async () => {
    await delay();
    // Return copies without passwords; add a mock status field if missing
    return users.map(({ password: _, ...u }) => ({ status: 'active', ...u }));
  },

  setStatus: async (userId, status) => {
    await delay(200);
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    users[idx].status = status;
    const { password: _, ...u } = users[idx];
    return { status: 'active', ...u, status };
  }
};
