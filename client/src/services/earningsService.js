import { users } from '../mocks/users';
import { transactions } from '../mocks/transactions';
import { delay } from './delay';

// Mock payout history for publishers
const payouts = [
  { id: 'p1', userId: 'u3', amount: 80000, status: 'completed', createdAt: '2024-01-08T09:00:00Z' },
];

export const earningsService = {
  getBalance: async (userId) => {
    await delay();
    const user = users.find(u => u.id === userId);
    return user ? (user.earningsBalance || 0) : 0;
  },

  getTransactions: async (userId) => {
    await delay();
    // Return publisher earning type transactions for this user
    return transactions.filter(t => t.userId === userId && t.type === 'publisher_earning');
  },

  getPayouts: async (userId) => {
    await delay();
    return payouts.filter(p => p.userId === userId);
  },
};
