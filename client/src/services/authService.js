import { users } from '../mocks/users';
import { delay } from './delay';

export const authService = {
  login: async (email, password) => {
    await delay();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error("Invalid credentials");
    // Return copy without password
    const { password: _, ...safeUser } = user;
    return safeUser;
  },
  signup: async (userData) => {
    await delay();
    const newUser = { id: `u${Date.now()}`, ...userData };
    users.push(newUser); // Mutating mock data for session
    const { password: _, ...safeUser } = newUser;
    return safeUser;
  }
};
