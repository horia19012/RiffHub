import { useState, useCallback } from 'react';
import './AuthPage.css';
import AuthService from '../services/AuthService.jsx';
import User from '../models/User.js';
import { useNavigate } from 'react-router-dom';

function getStrength(password) {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: labels[score] };
}

const strengthClass = (barIndex, score) => {
  if (barIndex >= score) return 'strength-bar';
  const map = ['', 'filled-weak', 'filled-fair', 'filled-good', 'filled-strong'];
  return `strength-bar ${map[score]}`;
};

function LoginForm({ onSwitch }) {
  const [fields, setFields] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const set = (k) => (e) => setFields(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!fields.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(fields.email)) errs.email = 'Invalid email';
    if (!fields.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      const data = await AuthService.login(fields.email, fields.password);
      localStorage.setItem('token', data.token);

      setAlert({ type: 'success', msg: 'Signed in successfully!' });
      navigate("/");
    } catch (err) {
      setAlert({ type: 'error', msg: "Wrong credentials!" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form visible" id="form-login">
      <div className="form-heading">
        <h2>SIGN <span>IN</span></h2>
        <p>Welcome back — good to see you again.</p>
      </div>

      {alert && <div className={`auth-alert ${alert.type}`}>{alert.msg}</div>}

      <div className="field">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={fields.email}
          onChange={set('email')}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>

      <div className="field">
        <div className="row-between">
          <label htmlFor="login-password">Password</label>
          <button type="button" className="forgot-link">Forgot password?</button>
        </div>
        <input
          id="login-password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={fields.password}
          onChange={set('password')}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <span className="field-error">{errors.password}</span>}
      </div>

      <button
        type="button"
        className={`btn-primary${loading ? ' loading' : ''}`}
        onClick={handleSubmit}
        disabled={loading}
      >
        SIGN IN
      </button>

      <div className="divider">or continue with</div>
    </div>
  );
}

function RegisterForm({ onSwitch }) {
  const [fields, setFields] = useState({
    username: '', email: '', password: '', confirm: '', terms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const set = (k) => (e) =>
    setFields(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const strength = getStrength(fields.password);

  const validate = () => {
    const errs = {};
    if (!fields.username) errs.username = 'Username is required';
    if (!fields.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(fields.email)) errs.email = 'Invalid email';
    if (!fields.password) errs.password = 'Password is required';
    else if (fields.password.length < 8) errs.password = 'Minimum 8 characters';
    if (fields.password !== fields.confirm) errs.confirm = 'Passwords do not match';
    if (!fields.terms) errs.terms = 'You must accept the terms';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      await AuthService.register(fields.username, fields.email, fields.password);

      setAlert({ type: 'success', msg: 'Account created! You can now sign in.' });
      setTimeout(() => onSwitch('login'), 1800);
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form visible" id="form-register">
      <div className="form-heading">
        <h2>CREATE <span>ACCOUNT</span></h2>
        <p>Join us — it only takes a moment.</p>
      </div>

      {alert && <div className={`auth-alert ${alert.type}`}>{alert.msg}</div>}

      <div className="field">
        <label htmlFor="reg-username">Username</label>
        <input
          id="reg-username"
          type="text"
          placeholder="cooluser42"
          autoComplete="username"
          value={fields.username}
          onChange={set('username')}
          className={errors.username ? 'error' : ''}
        />
        {errors.username && <span className="field-error">{errors.username}</span>}
      </div>

      <div className="field">
        <label htmlFor="reg-email">Email</label>
        <input
          id="reg-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={fields.email}
          onChange={set('email')}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>

      <div className="field">
        <label htmlFor="reg-password">Password</label>
        <input
          id="reg-password"
          type="password"
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          value={fields.password}
          onChange={set('password')}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <span className="field-error">{errors.password}</span>}
        {fields.password && (
          <div className="strength-wrap">
            <div className="strength-bars">
              {[0,1,2,3].map(i => (
                <div key={i} className={strengthClass(i, strength.score)} />
              ))}
            </div>
            <span className="strength-label">{strength.label}</span>
          </div>
        )}
      </div>

      <div className="field">
        <label htmlFor="reg-confirm">Confirm Password</label>
        <input
          id="reg-confirm"
          type="password"
          placeholder="Repeat password"
          autoComplete="new-password"
          value={fields.confirm}
          onChange={set('confirm')}
          className={errors.confirm ? 'error' : ''}
        />
        {errors.confirm && <span className="field-error">{errors.confirm}</span>}
      </div>

      <div className="terms">
        <input
          type="checkbox"
          id="terms-check"
          checked={fields.terms}
          onChange={set('terms')}
        />
        <label htmlFor="terms-check">
          I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </label>
      </div>
      {errors.terms && <span className="field-error" style={{ marginTop: '-0.6rem' }}>{errors.terms}</span>}

      <button
        type="button"
        className={`btn-primary${loading ? ' loading' : ''}`}
        onClick={handleSubmit}
        disabled={loading}
      >
        CREATE ACCOUNT
      </button>

      <div className="divider">or sign up with</div>
    </div>
  );
}

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const switchTo = useCallback(tab => setActiveTab(tab), []);

  return (
    <div className="auth-page">
      <div className="auth-grid-bg" aria-hidden="true" />
      <div className="auth-card" role="main">

        <div className="auth-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'login'}
            className={`auth-tab${activeTab === 'login' ? ' active' : ''}`}
            onClick={() => switchTo('login')}
          >
            Sign In
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'register'}
            className={`auth-tab${activeTab === 'register' ? ' active' : ''}`}
            onClick={() => switchTo('register')}
          >
            Register
          </button>
        </div>

        <div className="auth-body">
          {activeTab === 'login'
            ? <LoginForm key="login" onSwitch={switchTo} />
            : <RegisterForm key="register" onSwitch={switchTo} />
          }
        </div>

        <div className="auth-footer">
          {activeTab === 'login' ? (
            <>Don't have an account?{' '}
              <button onClick={() => switchTo('register')}>Register here</button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => switchTo('login')}>Sign in</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
