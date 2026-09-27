import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { categories as allCategories } from '../../mocks/categories';
import './Auth.css';

const STEPS = ['Choose role', 'Account details', 'Profile'];

// Step 1 — Role selection cards
const StepRole = ({ role, onSelect }) => (
  <div className="signup-step">
    <h2 className="auth-heading" style={{ marginBottom: '8px' }}>Create your account</h2>
    <p className="auth-sub">What best describes you?</p>
    <div className="role-cards">
      <button
        id="role-card-advertiser"
        type="button"
        className={`role-card ${role === 'advertiser' ? 'selected' : ''}`}
        onClick={() => onSelect('advertiser')}
      >
        <div className="role-card-icon">📢</div>
        <div className="role-card-title">Advertiser</div>
        <div className="role-card-desc">Run campaigns, set budgets, reach your audience through real-time bidding.</div>
        {role === 'advertiser' && <div className="role-card-check">✓</div>}
      </button>
      <button
        id="role-card-publisher"
        type="button"
        className={`role-card ${role === 'publisher' ? 'selected' : ''}`}
        onClick={() => onSelect('publisher')}
      >
        <div className="role-card-icon">🌐</div>
        <div className="role-card-title">Publisher</div>
        <div className="role-card-desc">Monetise your inventory by offering ad slots to the highest bidder.</div>
        {role === 'publisher' && <div className="role-card-check">✓</div>}
      </button>
    </div>
  </div>
);

// Step 2 — Common fields
const StepCommon = ({ data, onChange, errors }) => (
  <div className="signup-step">
    <h2 className="auth-heading" style={{ marginBottom: '8px' }}>Account details</h2>
    <p className="auth-sub">Fill in your basic information</p>
    <div className="auth-form">
      <div className="form-group">
        <label htmlFor="signup-name" className="form-label">Full name</label>
        <input
          id="signup-name"
          type="text"
          className={`form-input ${errors.name ? 'input-error' : ''}`}
          value={data.name}
          onChange={e => onChange('name', e.target.value)}
          placeholder="Jane Doe"
          autoComplete="name"
        />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="signup-email" className="form-label">Email address</label>
        <input
          id="signup-email"
          type="email"
          className={`form-input ${errors.email ? 'input-error' : ''}`}
          value={data.email}
          onChange={e => onChange('email', e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="signup-password" className="form-label">Password</label>
        <input
          id="signup-password"
          type="password"
          className={`form-input ${errors.password ? 'input-error' : ''}`}
          value={data.password}
          onChange={e => onChange('password', e.target.value)}
          placeholder="At least 6 characters"
          autoComplete="new-password"
        />
        {errors.password && <span className="field-error">{errors.password}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="signup-confirm" className="form-label">Confirm password</label>
        <input
          id="signup-confirm"
          type="password"
          className={`form-input ${errors.confirm ? 'input-error' : ''}`}
          value={data.confirm}
          onChange={e => onChange('confirm', e.target.value)}
          placeholder="Repeat your password"
          autoComplete="new-password"
        />
        {errors.confirm && <span className="field-error">{errors.confirm}</span>}
      </div>
    </div>
  </div>
);

// Step 3 — Role-specific fields
const StepProfile = ({ role, data, onChange, errors, categories }) => {
  if (role === 'advertiser') {
    return (
      <div className="signup-step">
        <h2 className="auth-heading" style={{ marginBottom: '8px' }}>Advertiser profile</h2>
        <p className="auth-sub">Tell us about your business</p>
        <div className="auth-form">
          <div className="form-group">
            <label htmlFor="signup-company" className="form-label">Company name</label>
            <input
              id="signup-company"
              type="text"
              className={`form-input ${errors.companyName ? 'input-error' : ''}`}
              value={data.companyName || ''}
              onChange={e => onChange('companyName', e.target.value)}
              placeholder="e.g. Acme Corp"
            />
            {errors.companyName && <span className="field-error">{errors.companyName}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="signup-industry" className="form-label">Industry</label>
            <select
              id="signup-industry"
              className={`form-input form-select ${errors.industry ? 'input-error' : ''}`}
              value={data.industry || ''}
              onChange={e => onChange('industry', e.target.value)}
            >
              <option value="">Select industry…</option>
              <option value="e-commerce">E-commerce</option>
              <option value="fintech">Fintech</option>
              <option value="edtech">EdTech</option>
              <option value="gaming">Gaming</option>
              <option value="travel">Travel</option>
              <option value="other">Other</option>
            </select>
            {errors.industry && <span className="field-error">{errors.industry}</span>}
          </div>
        </div>
      </div>
    );
  }

  // Publisher
  const leafCategories = categories.filter(c => c.parent !== null);
  return (
    <div className="signup-step">
      <h2 className="auth-heading" style={{ marginBottom: '8px' }}>Publisher profile</h2>
      <p className="auth-sub">Tell us about your website</p>
      <div className="auth-form">
        <div className="form-group">
          <label htmlFor="signup-website-name" className="form-label">Website name</label>
          <input
            id="signup-website-name"
            type="text"
            className={`form-input ${errors.websiteName ? 'input-error' : ''}`}
            value={data.websiteName || ''}
            onChange={e => onChange('websiteName', e.target.value)}
            placeholder="e.g. Daily News"
          />
          {errors.websiteName && <span className="field-error">{errors.websiteName}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="signup-website-url" className="form-label">Website URL</label>
          <input
            id="signup-website-url"
            type="text"
            className={`form-input ${errors.websiteUrl ? 'input-error' : ''}`}
            value={data.websiteUrl || ''}
            onChange={e => onChange('websiteUrl', e.target.value)}
            placeholder="e.g. dailynews.com"
          />
          {errors.websiteUrl && <span className="field-error">{errors.websiteUrl}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="signup-category" className="form-label">Primary category</label>
          <select
            id="signup-category"
            className={`form-input form-select ${errors.category ? 'input-error' : ''}`}
            value={data.category || ''}
            onChange={e => onChange('category', e.target.value)}
          >
            <option value="">Select category…</option>
            {leafCategories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.category && <span className="field-error">{errors.category}</span>}
        </div>
      </div>
    </div>
  );
};

export const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0); // 0=role, 1=common, 2=profile
  const [role, setRole] = useState('');
  const [common, setCommon] = useState({ name: '', email: '', password: '', confirm: '' });
  const [profile, setProfile] = useState({});
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories] = useState(() => allCategories);

  const updateCommon = (field, value) => {
    setCommon(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = () => {
    const errs = {};
    if (step === 0) {
      if (!role) errs.role = 'Please select a role';
    } else if (step === 1) {
      if (!common.name.trim()) errs.name = 'Name is required';
      if (!common.email.trim()) errs.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(common.email)) errs.email = 'Invalid email';
      if (!common.password) errs.password = 'Password is required';
      else if (common.password.length < 6) errs.password = 'Minimum 6 characters';
      if (common.password !== common.confirm) errs.confirm = 'Passwords do not match';
    } else if (step === 2) {
      if (role === 'advertiser') {
        if (!profile.companyName?.trim()) errs.companyName = 'Company name is required';
        if (!profile.industry) errs.industry = 'Please select an industry';
      } else {
        if (!profile.websiteName?.trim()) errs.websiteName = 'Website name is required';
        if (!profile.websiteUrl?.trim()) errs.websiteUrl = 'Website URL is required';
        if (!profile.category) errs.category = 'Please select a category';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const back = () => {
    setErrors({});
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitError('');
    setLoading(true);
    try {
      const userData = {
        name: common.name,
        email: common.email,
        password: common.password,
        role,
        ...profile,
        walletBalance: role === 'advertiser' ? 0 : undefined,
        earningsBalance: role === 'publisher' ? 0 : undefined,
      };
      const user = await signup(userData);
      if (user.role === 'advertiser') navigate('/advertiser/dashboard');
      else navigate('/publisher/dashboard');
    } catch (err) {
      setSubmitError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-card auth-card-wide">
        <div className="auth-logo-row">
          <span className="auth-logo-dot" />
          <span className="auth-brand">RTB Platform</span>
        </div>

        {/* Step progress indicator */}
        <div className="stepper" aria-label="Signup steps">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className={`step-node ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <div className={`step-label ${i === step ? 'step-label-active' : ''}`}>{label}</div>
              {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'step-line-done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        {submitError && <div className="auth-error" role="alert">{submitError}</div>}

        {step === 0 && <StepRole role={role} onSelect={r => { setRole(r); setErrors({}); }} />}
        {step === 1 && <StepCommon data={common} onChange={updateCommon} errors={errors} />}
        {step === 2 && <StepProfile role={role} data={profile} onChange={updateProfile} errors={errors} categories={categories} />}

        {errors.role && <div className="auth-error">{errors.role}</div>}

        <div className="signup-nav">
          {step > 0 && (
            <button id="signup-back" type="button" className="btn-ghost" onClick={back} disabled={loading}>
              ← Back
            </button>
          )}
          {step < 2 ? (
            <button id="signup-next" type="button" className="btn-primary" onClick={next} style={{ marginLeft: 'auto' }}>
              Continue →
            </button>
          ) : (
            <button id="signup-submit" type="button" className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginLeft: 'auto' }}>
              {loading ? <span className="btn-spinner" /> : 'Create account'}
            </button>
          )}
        </div>

        <div className="auth-footer-link" style={{ marginTop: '16px' }}>
          Already have an account? <Link to="/login" className="link">Sign in</Link>
        </div>
      </div>
    </div>
  );
};
