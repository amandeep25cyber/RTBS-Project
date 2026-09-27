import React from 'react';
import '../admin/Admin.css';

const Stub = ({ icon, title, step }) => (
  <div className="admin-page">
    <h1 className="page-title">{title}</h1>
    <div className="stub-page">
      <div className="stub-icon">{icon}</div>
      <div className="stub-label">{title}</div>
      <div className="stub-desc">Coming in Day 4 — Step {step}</div>
    </div>
  </div>
);

export const AdvDashboard  = () => <Stub icon="📈" title="Advertiser Dashboard"   step={18} />;
export const AdvCampaigns  = () => <Stub icon="📋" title="Campaign Management"    step={18} />;
export const AdvAnalytics  = () => <Stub icon="📊" title="Advertiser Analytics"   step={19} />;
export const AdvWallet     = () => <Stub icon="💳" title="Wallet"                 step={19} />;
