import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin/feed');
      else if (user.role === 'advertiser') navigate('/advertiser/dashboard');
      else navigate('/publisher/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-logo-row">
          <span className="auth-logo-dot" />
          <span className="auth-brand">RTB Platform</span>
        </div>
        <h1 className="auth-heading">Sign in to your account</h1>
        <p className="auth-sub">Access the real-time bidding dashboard</p>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <form id="login-form" onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">Email address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password" className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button id="login-submit" type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer-link">
          Don't have an account? <Link to="/signup" className="link">Create one</Link>
        </div>

        <div className="auth-demo-creds">
          <p className="demo-label">Demo credentials</p>
          <div className="demo-grid">
            <div className="demo-item">
              <span className="demo-role admin">Admin</span>
              <span className="demo-email">admin@platform.com / admin123</span>
            </div>
            <div className="demo-item">
              <span className="demo-role advertiser">Advertiser</span>
              <span className="demo-email">priya@nikeindia.com / pass123</span>
            </div>
            <div className="demo-item">
              <span className="demo-role publisher">Publisher</span>
              <span className="demo-email">rahul@indianexpress.com / pass123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
