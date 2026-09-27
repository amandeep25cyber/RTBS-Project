import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { walletService } from '../../services/walletService';
import '../admin/Admin.css';
import './Advertiser.css';

const fmtRupees = (paise) =>
  `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const TYPE_COLORS = {
  deposit:          { bg: 'rgba(16,185,129,0.12)', color: '#6ee7b7'  },
  campaign_spend:   { bg: 'rgba(59,130,246,0.12)',  color: '#93c5fd'  },
  publisher_earning:{ bg: 'rgba(16,185,129,0.12)', color: '#6ee7b7'  },
  platform_fee:     { bg: 'rgba(245,158,11,0.12)', color: '#fcd34d'  },
  payout:           { bg: 'rgba(245,158,11,0.12)', color: '#fcd34d'  },
};

// Minimal Add-Funds modal
const AddFundsModal = ({ onAdd, onClose }) => {
  const [amount, setAmount] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) { setErr('Enter a valid amount'); return; }
    setSaving(true);
    try {
      await onAdd(Math.round(val * 100)); // convert ₹ to paise
      onClose();
    } catch (e) {
      setErr(e.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Add funds">
      <div className="modal-card" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Add Funds</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            In production, this would open the payment gateway. For now, we'll credit your wallet directly.
          </p>
          <div className="fg">
            <label className="fl">Amount (₹)</label>
            <input
              id="add-funds-amount"
              className={`fi ${err ? 'fi-err' : ''}`}
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={e => { setAmount(e.target.value); setErr(''); }}
              placeholder="e.g. 500"
              autoFocus
            />
            {err && <span className="field-err">{err}</span>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost-sm" onClick={onClose} disabled={saving}>Cancel</button>
          <button id="add-funds-confirm-btn" className="btn-primary-sm" onClick={handleAdd} disabled={saving}>
            {saving ? '…' : 'Add Funds'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdvWallet = () => {
  const { user } = useAuth();
  const [balance, setBalance]           = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);

  const load = async () => {
    const [bal, txns] = await Promise.all([
      walletService.getBalance(user.id),
      walletService.getTransactions(user.id),
    ]);
    setBalance(bal);
    setTransactions(txns);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user.id]);

  const handleAddFunds = async (paiseAmount) => {
    await walletService.addFunds(user.id, paiseAmount);
    await load();
  };

  return (
    <div className="admin-page">
      <div className="page-row">
        <div>
          <h1 className="page-title">Wallet</h1>
          <p className="page-sub">Manage your advertising balance and transaction history.</p>
        </div>
        <button id="add-funds-btn" className="btn-primary-sm" onClick={() => setShowModal(true)}>
          + Add Funds
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading…</div>
      ) : (
        <>
          {/* Balance card */}
          <div className="wallet-balance-card">
            <div>
              <div className="wallet-balance-label">Available Balance</div>
              <div className="wallet-balance-value">{fmtRupees(balance)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="metric-label">Account</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '4px' }}>{user.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</div>
            </div>
          </div>

          {/* Transaction history */}
          <div>
            <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Transaction History
            </h2>
            {transactions.length === 0 ? (
              <div className="stub-page" style={{ height: '160px' }}>
                <div className="stub-icon">📄</div>
                <div className="stub-label">No transactions yet</div>
              </div>
            ) : (
              <div className="data-table-wrap">
                <table className="data-table" aria-label="Transaction history table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Balance After</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => {
                      const tc = TYPE_COLORS[tx.type] || { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' };
                      return (
                        <tr key={tx.id}>
                          <td className="mono text-dim">{fmtDate(tx.createdAt)}</td>
                          <td>
                            <span className="role-pill" style={{ background: tc.bg, color: tc.color }}>
                              {tx.type.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="mono" style={{ color: tx.type === 'deposit' ? 'var(--success-green)' : 'var(--text-primary)' }}>
                            {tx.type === 'deposit' ? '+' : ''}{fmtRupees(tx.amount)}
                          </td>
                          <td className="mono">{fmtRupees(tx.balanceAfter)}</td>
                          <td>
                            <span className={`badge ${tx.status === 'completed' ? 'badge-win' : tx.status === 'pending' ? 'badge-warn' : 'badge-nobid'}`}>
                              {tx.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {showModal && (
        <AddFundsModal
          onAdd={handleAddFunds}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};
