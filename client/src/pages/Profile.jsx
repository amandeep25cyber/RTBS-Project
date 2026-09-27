import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './admin/Admin.css';
import './advertiser/Advertiser.css';

export const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName]         = useState(user?.name || '');
  const [email, setEmail]       = useState(user?.email || '');
  const [currentPw, setCurrent] = useState('');
  const [newPw, setNewPw]       = useState('');
  const [confirmPw, setConfirm] = useState('');
  const [saved, setSaved]       = useState(false);
  const [pwError, setPwError]   = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    // In Phase 9 this will call authService.updateProfile()
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPwError('');
    if (newPw.length < 6)           { setPwError('New password must be at least 6 characters'); return; }
    if (newPw !== confirmPw)        { setPwError('Passwords do not match'); return; }
    // In Phase 9 this will call authService.changePassword()
    setCurrent(''); setNewPw(''); setConfirm('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="admin-page">
      <h1 className="page-title">Profile &amp; Settings</h1>
      <p className="page-sub">Manage your account details and security settings.</p>

      {saved && (
        <div style={{
          background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '8px', padding: '10px 16px', color: '#6ee7b7', fontSize: '0.875rem',
        }}>
          ✓ Changes saved successfully.
        </div>
      )}

      {/* Profile card */}
      <div className="profile-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="profile-avatar">{initials}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.name}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user?.role}</div>
          </div>
        </div>

        <form id="profile-form" onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="fg">
            <label className="fl" htmlFor="profile-name">Full name</label>
            <input id="profile-name" className="fi" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="fg">
            <label className="fl" htmlFor="profile-email">Email</label>
            <input id="profile-email" className="fi" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <button id="profile-save-btn" type="submit" className="btn-primary-sm" style={{ alignSelf: 'flex-start' }}>
            Save profile
          </button>
        </form>
      </div>

      {/* Change password card */}
      <div className="profile-card">
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Change Password</h2>

        {pwError && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '7px', padding: '8px 14px', color: '#fca5a5', fontSize: '0.82rem',
          }}>
            {pwError}
          </div>
        )}

        <form id="change-password-form" onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="fg">
            <label className="fl" htmlFor="current-pw">Current password</label>
            <input id="current-pw" className="fi" type="password" value={currentPw}
              onChange={e => { setCurrent(e.target.value); setPwError(''); }} />
          </div>
          <div className="fg">
            <label className="fl" htmlFor="new-pw">New password</label>
            <input id="new-pw" className="fi" type="password" value={newPw}
              onChange={e => { setNewPw(e.target.value); setPwError(''); }} placeholder="At least 6 characters" />
          </div>
          <div className="fg">
            <label className="fl" htmlFor="confirm-pw">Confirm new password</label>
            <input id="confirm-pw" className="fi" type="password" value={confirmPw}
              onChange={e => { setConfirm(e.target.value); setPwError(''); }} />
          </div>
          <button id="change-pw-btn" type="submit" className="btn-primary-sm" style={{ alignSelf: 'flex-start' }}>
            Change password
          </button>
        </form>
      </div>

      {/* Logout */}
      <div className="profile-card" style={{ padding: '20px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Sign out</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              You will be redirected to the login page.
            </div>
          </div>
          <button id="profile-logout-btn" className="action-btn action-block" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
