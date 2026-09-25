import { users } from '../mocks/users.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  login: async (email, password) => {
    await delay(400);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error("Invalid credentials");
    return user;
  },
  signup: async (userData) => {
    await delay(500);
    const newUser = { id: `u_${Math.random().toString(36).substr(2, 9)}`, ...userData };
    users.push(newUser);
    return newUser;
  }
};
