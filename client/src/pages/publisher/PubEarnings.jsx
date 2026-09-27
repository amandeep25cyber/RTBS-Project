import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { earningsService } from '../../services/earningsService';
import '../admin/Admin.css';
import '../advertiser/Advertiser.css';

const fmtRupees = (paise) =>
  `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const PubEarnings = () => {
  const { user } = useAuth();
  const [balance, setBalance]       = useState(0);
  const [transactions, setTxns]     = useState([]);
  const [payouts, setPayouts]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('transactions'); // 'transactions' | 'payouts'

  useEffect(() => {
    Promise.all([
      earningsService.getBalance(user.id),
      earningsService.getTransactions(user.id),
      earningsService.getPayouts(user.id),
    ]).then(([bal, txns, pyts]) => {
      setBalance(bal);
      setTxns(txns);
      setPayouts(pyts);
      setLoading(false);
    });
  }, [user.id]);

  return (
    <div className="admin-page">
      <h1 className="page-title">Earnings</h1>
      <p className="page-sub">Your accumulated publisher earnings and payout history.</p>

      {loading ? (
        <div className="loading-state">Loading…</div>
      ) : (
        <>
          {/* Balance card */}
          <div className="earnings-balance-card">
            <div>
              <div className="wallet-balance-label">Accumulated Earnings</div>
              <div className="earnings-balance-value">{fmtRupees(balance)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="metric-label" style={{ marginBottom: '6px' }}>Payout schedule</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Weekly (every Monday)</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Automatic via payment gateway
              </div>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="filter-tabs">
            <button
              id="earnings-tab-transactions"
              role="tab"
              aria-selected={activeTab === 'transactions'}
              className={`filter-tab ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              Transactions
              <span className="tab-count">{transactions.length}</span>
            </button>
            <button
              id="earnings-tab-payouts"
              role="tab"
              aria-selected={activeTab === 'payouts'}
              className={`filter-tab ${activeTab === 'payouts' ? 'active' : ''}`}
              onClick={() => setActiveTab('payouts')}
            >
              Payouts
              <span className="tab-count">{payouts.length}</span>
            </button>
          </div>

          {/* Transactions tab */}
          {activeTab === 'transactions' && (
            transactions.length === 0 ? (
              <div className="stub-page" style={{ height: '160px' }}>
                <div className="stub-icon">📄</div>
                <div className="stub-label">No earning transactions yet</div>
              </div>
            ) : (
              <div className="data-table-wrap">
                <table className="data-table" aria-label="Earnings transactions table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Balance After</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx.id}>
                        <td className="mono text-dim">{fmtDate(tx.createdAt)}</td>
                        <td className="mono" style={{ color: 'var(--success-green)' }}>+{fmtRupees(tx.amount)}</td>
                        <td className="mono">{fmtRupees(tx.balanceAfter)}</td>
                        <td>
                          <span className={`badge ${tx.status === 'completed' ? 'badge-win' : 'badge-warn'}`}>
                            {tx.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Payouts tab */}
          {activeTab === 'payouts' && (
            payouts.length === 0 ? (
              <div className="stub-page" style={{ height: '160px' }}>
                <div className="stub-icon">💵</div>
                <div className="stub-label">No payouts yet</div>
                <div className="stub-desc">Payouts are processed weekly on Mondays.</div>
              </div>
            ) : (
              <div className="data-table-wrap">
                <table className="data-table" aria-label="Payouts table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map(p => (
                      <tr key={p.id}>
                        <td className="mono text-dim">{fmtDate(p.createdAt)}</td>
                        <td className="mono" style={{ color: 'var(--success-green)' }}>{fmtRupees(p.amount)}</td>
                        <td>
                          <span className={`badge ${p.status === 'completed' ? 'badge-win' : 'badge-warn'}`}>
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};
