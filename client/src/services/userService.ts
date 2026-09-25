import { users } from '../mocks/users.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const userService = {
  getAllUsers: async () => {
    await delay(350);
    return users.filter(u => u.role !== 'admin');
  },
  updateUserStatus: async (userId, blocked) => {
    await delay(300);
    const user = users.find(u => u.id === userId);
    if (user) {
      (user as any).blocked = blocked;
    }
    return user;
  },
  updateProfile: async (userId, data) => {
    await delay(400);
    const user = users.find(u => u.id === userId);
    if (user) {
      Object.assign(user, data);
    }
    return user;
  }
};
