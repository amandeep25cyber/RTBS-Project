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

export const PubDashboard = () => <Stub icon="🌐" title="Publisher Dashboard"   step={20} />;
export const PubSlots     = () => <Stub icon="🗃️"  title="Slot Management"       step={20} />;
export const PubAnalytics = () => <Stub icon="📊" title="Publisher Analytics"   step={20} />;
export const PubEarnings  = () => <Stub icon="💵" title="Earnings"               step={20} />;
