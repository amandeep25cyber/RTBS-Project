import { transactions } from '../mocks/transactions';
import { users } from '../mocks/users';
import { delay } from './delay';

export const walletService = {
  getTransactions: async (userId) => {
    await delay();
    return transactions.filter(t => t.userId === userId);
  },
  getBalance: async (userId) => {
    await delay();
    const user = users.find(u => u.id === userId);
    return user ? user.walletBalance || user.earningsBalance : 0;
  },
  addFunds: async (userId, amount) => {
    await delay();
    const newTx = {
      id: `t${Date.now()}`,
      userId,
      type: 'deposit',
      amount,
      balanceAfter: amount, // simplify for mock
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    transactions.push(newTx);
    
    // update mock user balance
    const user = users.find(u => u.id === userId);
    if(user && user.walletBalance !== undefined) {
      user.walletBalance += amount;
      newTx.balanceAfter = user.walletBalance;
    }
    
    return newTx;
  }
};
