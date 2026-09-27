import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { slotService } from '../../services/slotService';
import { categories } from '../../mocks/categories';
import '../admin/Admin.css';
import '../advertiser/Advertiser.css';

const fmtRupees = (paise) =>
  `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

// Only leaf categories per spec
const leafCategories = categories.filter(c => c.parent !== null);

const EMPTY_FORM = { slotName: '', category: '', floorPrice: '', status: 'active' };

const SlotForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial
    ? { ...initial, floorPrice: (initial.floorPrice / 100).toString() }
    : EMPTY_FORM
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setField = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.slotName.trim())                                          e.slotName   = 'Slot name is required';
    if (!form.category)                                                 e.category   = 'Category is required';
    if (!form.floorPrice || isNaN(form.floorPrice) || parseFloat(form.floorPrice) < 0)
                                                                        e.floorPrice = 'Enter a valid floor price (₹)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        ...form,
        floorPrice: Math.round(parseFloat(form.floorPrice) * 100),
      });
    } finally {
      setSaving(false);
    }
  };

  const err = (k) => errors[k] ? <span className="field-err">{errors[k]}</span> : null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Slot form">
      <div className="modal-card" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{initial ? 'Edit Slot' : 'Add Ad Slot'}</h2>
          <button className="modal-close" onClick={onCancel} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <div className="fg">
            <label className="fl">Slot name</label>
            <input className={`fi ${errors.slotName ? 'fi-err' : ''}`} value={form.slotName}
              onChange={e => setField('slotName', e.target.value)}
              placeholder="e.g. Homepage banner" id="slot-name" />
            {err('slotName')}
          </div>
          <div className="fg">
            <label className="fl">Category (leaf only)</label>
            <select className={`fi fi-select ${errors.category ? 'fi-err' : ''}`} value={form.category}
              onChange={e => setField('category', e.target.value)} id="slot-category">
              <option value="">Select…</option>
              {leafCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {err('category')}
          </div>
          <div className="fg">
            <label className="fl">Floor Price (₹)</label>
            <input className={`fi ${errors.floorPrice ? 'fi-err' : ''}`} type="number" min="0" step="0.01"
              value={form.floorPrice} onChange={e => setField('floorPrice', e.target.value)}
              placeholder="e.g. 0.50" id="slot-floor" />
            {err('floorPrice')}
          </div>
          <div className="fg">
            <label className="fl">Status</label>
            <select className="fi fi-select" value={form.status} onChange={e => setField('status', e.target.value)} id="slot-status">
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost-sm" onClick={onCancel} disabled={saving}>Cancel</button>
          <button id="slot-save-btn" className="btn-primary-sm" onClick={handleSave} disabled={saving}>
            {saving ? '…' : initial ? 'Save changes' : 'Add slot'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const PubSlots = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = () =>
    slotService.getByPublisher(user.id).then(data => {
      setSlots(data);
      setLoading(false);
    });

  useEffect(() => { load(); }, [user.id]);

  const handleCreate = async (data) => {
    await slotService.create({ ...data, publisherId: user.id });
    await load();
    setCreating(false);
  };

  const handleEdit = async (data) => {
    await slotService.update(editing.id, data);
    await load();
    setEditing(null);
  };

  return (
    <div className="admin-page">
      <div className="page-row">
        <div>
          <h1 className="page-title">Slot Management</h1>
          <p className="page-sub">Manage your ad inventory slots and floor prices.</p>
        </div>
        <button id="new-slot-btn" className="btn-primary-sm" onClick={() => setCreating(true)}>
          + Add Slot
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading…</div>
      ) : slots.length === 0 ? (
        <div className="stub-page" style={{ height: '220px' }}>
          <div className="stub-icon">🗃️</div>
          <div className="stub-label">No slots yet</div>
          <div className="stub-desc">Click "Add Slot" to register your first ad slot.</div>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table" aria-label="Slots table">
            <thead>
              <tr>
                <th>Slot Name</th>
                <th>Status</th>
                <th>Category</th>
                <th>Floor Price</th>
                <th>Fill Rate</th>
                <th>Revenue Today</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map(s => (
                <tr key={s.id}>
                  <td className="td-bold">{s.slotName}</td>
                  <td>
                    <span className={`badge ${s.status === 'active' ? 'badge-win' : 'badge-warn'}`}>
                      {s.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-dim">{s.category}</td>
                  <td className="mono">{fmtRupees(s.floorPrice)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="bar-track" style={{ width: '80px' }}>
                        <div className="bar-fill" style={{ width: `${(s.fillRate || 0) * 100}%`, background: 'var(--success-green)' }} />
                      </div>
                      <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {((s.fillRate || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="mono" style={{ color: 'var(--success-green)' }}>{fmtRupees(s.revenueToday || 0)}</td>
                  <td>
                    <button
                      id={`edit-slot-${s.id}`}
                      className="action-btn action-unblock"
                      onClick={() => setEditing(s)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <SlotForm initial={null} onSave={handleCreate} onCancel={() => setCreating(false)} />
      )}
      {editing && (
        <SlotForm initial={editing} onSave={handleEdit} onCancel={() => setEditing(null)} />
      )}
    </div>
  );
};
