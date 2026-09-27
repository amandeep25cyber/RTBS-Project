import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { campaignService } from '../../services/campaignService';
import { categories } from '../../mocks/categories';
import '../admin/Admin.css';
import './Advertiser.css';

const fmtRupees = (paise) =>
  `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const GEOS    = ['IN', 'US', 'GB', 'AE', 'SG'];
const DEVICES = ['mobile', 'desktop', 'tablet'];

const EMPTY_FORM = {
  name: '',
  dailyBudget: '',   // user enters rupees; we convert to paise on save
  maxBid: '',        // same
  geo: ['IN'],
  device: ['mobile'],
  category: [],
  frequencyCap: 5,
  status: 'active',
};

const CampaignForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial
    ? {
        ...initial,
        dailyBudget: (initial.dailyBudget / 100).toString(),
        maxBid: (initial.maxBid / 100).toString(),
      }
    : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const setField = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const toggleArr = (key, val) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())          e.name        = 'Name is required';
    if (!form.dailyBudget || isNaN(form.dailyBudget) || parseFloat(form.dailyBudget) <= 0)
                                     e.dailyBudget = 'Enter a valid daily budget (₹)';
    if (!form.maxBid || isNaN(form.maxBid) || parseFloat(form.maxBid) <= 0)
                                     e.maxBid      = 'Enter a valid max bid (₹)';
    if (!form.geo.length)            e.geo         = 'Select at least one geo';
    if (!form.device.length)         e.device      = 'Select at least one device';
    if (!form.category.length)       e.category    = 'Select at least one category';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        dailyBudget: Math.round(parseFloat(form.dailyBudget) * 100),
        maxBid:      Math.round(parseFloat(form.maxBid) * 100),
        frequencyCap: parseInt(form.frequencyCap, 10),
        targeting: { geo: form.geo, device: form.device, category: form.category },
      };
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  const err = (k) => errors[k] ? <span className="field-err">{errors[k]}</span> : null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Campaign form">
      <div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title">{initial ? 'Edit Campaign' : 'New Campaign'}</h2>
          <button className="modal-close" onClick={onCancel} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          <div className="form-2col">
            {/* Name */}
            <div className="fg full-span">
              <label className="fl">Campaign name</label>
              <input className={`fi ${errors.name ? 'fi-err' : ''}`} value={form.name}
                onChange={e => setField('name', e.target.value)} placeholder="e.g. Summer Sale" id="camp-name" />
              {err('name')}
            </div>

            {/* Daily budget */}
            <div className="fg">
              <label className="fl">Daily Budget (₹)</label>
              <input className={`fi ${errors.dailyBudget ? 'fi-err' : ''}`} type="number" min="1" step="0.01"
                value={form.dailyBudget} onChange={e => setField('dailyBudget', e.target.value)}
                placeholder="e.g. 1000" id="camp-budget" />
              {err('dailyBudget')}
            </div>

            {/* Max bid */}
            <div className="fg">
              <label className="fl">Max Bid (₹)</label>
              <input className={`fi ${errors.maxBid ? 'fi-err' : ''}`} type="number" min="0.01" step="0.01"
                value={form.maxBid} onChange={e => setField('maxBid', e.target.value)}
                placeholder="e.g. 2.50" id="camp-maxbid" />
              {err('maxBid')}
            </div>

            {/* Frequency cap */}
            <div className="fg">
              <label className="fl">Frequency Cap (per day)</label>
              <input className="fi" type="number" min="1" max="20" step="1"
                value={form.frequencyCap} onChange={e => setField('frequencyCap', e.target.value)}
                id="camp-freqcap" />
            </div>

            {/* Status */}
            <div className="fg">
              <label className="fl">Status</label>
              <select className="fi fi-select" value={form.status} onChange={e => setField('status', e.target.value)} id="camp-status">
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          {/* Geo targeting */}
          <div className="fg full-span" style={{ marginTop: '8px' }}>
            <label className="fl">Target Geo {err('geo')}</label>
            <div className="chip-group">
              {GEOS.map(g => (
                <button key={g} type="button"
                  className={`chip ${form.geo.includes(g) ? 'chip-on' : ''}`}
                  onClick={() => toggleArr('geo', g)} id={`camp-geo-${g}`}>{g}</button>
              ))}
            </div>
          </div>

          {/* Device targeting */}
          <div className="fg full-span">
            <label className="fl">Target Device {err('device')}</label>
            <div className="chip-group">
              {DEVICES.map(d => (
                <button key={d} type="button"
                  className={`chip ${form.device.includes(d) ? 'chip-on' : ''}`}
                  onClick={() => toggleArr('device', d)} id={`camp-device-${d}`}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Category targeting (all categories — broad + specific per spec) */}
          <div className="fg full-span">
            <label className="fl">Target Category {err('category')}</label>
            <div className="chip-group">
              {categories.map(c => (
                <button key={c.id} type="button"
                  className={`chip ${form.category.includes(c.id) ? 'chip-on' : ''}`}
                  onClick={() => toggleArr('category', c.id)} id={`camp-cat-${c.id}`}>
                  {c.parent ? `↳ ${c.name}` : c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-ghost-sm" onClick={onCancel} disabled={saving}>Cancel</button>
          <button id="camp-save-btn" className="btn-primary-sm" onClick={handleSave} disabled={saving}>
            {saving ? '…' : initial ? 'Save changes' : 'Create campaign'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdvCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);   // campaign object or null
  const [creating, setCreating] = useState(false);

  const load = () =>
    campaignService.getByAdvertiser(user.id).then(data => {
      setCampaigns(data);
      setLoading(false);
    });

  useEffect(() => { load(); }, [user.id]);

  const handleCreate = async (data) => {
    await campaignService.create({ ...data, advertiserId: user.id });
    await load();
    setCreating(false);
  };

  const handleEdit = async (data) => {
    await campaignService.update(editing.id, data);
    await load();
    setEditing(null);
  };

  return (
    <div className="admin-page">
      <div className="page-row">
        <div>
          <h1 className="page-title">Campaign Management</h1>
          <p className="page-sub">Manage your ad campaigns and targeting.</p>
        </div>
        <button id="new-campaign-btn" className="btn-primary-sm" onClick={() => setCreating(true)}>
          + New Campaign
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading…</div>
      ) : campaigns.length === 0 ? (
        <div className="stub-page" style={{ height: '220px' }}>
          <div className="stub-icon">📋</div>
          <div className="stub-label">No campaigns yet</div>
          <div className="stub-desc">Click "New Campaign" to get started.</div>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table" aria-label="Campaigns table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Daily Budget</th>
                <th>Spent Today</th>
                <th>Pacing</th>
                <th>Max Bid</th>
                <th>Geo</th>
                <th>Freq Cap</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => {
                const pct = c.dailyBudget > 0 ? Math.min((c.spentToday / c.dailyBudget) * 100, 100) : 0;
                const barColor = pct >= 90 ? 'var(--error-red)' : pct >= 70 ? 'var(--warn-amber)' : 'var(--accent-live)';
                return (
                  <tr key={c.id}>
                    <td className="td-bold">{c.name}</td>
                    <td>
                      <span className={`badge ${c.status === 'active' ? 'badge-win' : 'badge-warn'}`}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="mono">{fmtRupees(c.dailyBudget)}</td>
                    <td className="mono">{fmtRupees(c.spentToday || 0)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className="bar-track" style={{ width: '80px' }}>
                          <div className="bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                        </div>
                        <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', minWidth: '36px' }}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="mono">{fmtRupees(c.maxBid)}</td>
                    <td className="text-dim" style={{ fontSize: '0.82rem' }}>
                      {(c.targeting?.geo || []).join(', ')}
                    </td>
                    <td className="mono">{c.frequencyCap}</td>
                    <td>
                      <button
                        id={`edit-camp-${c.id}`}
                        className="action-btn action-unblock"
                        onClick={() => setEditing(c)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <CampaignForm
          initial={null}
          onSave={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}
      {editing && (
        <CampaignForm
          initial={editing}
          onSave={handleEdit}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
};
