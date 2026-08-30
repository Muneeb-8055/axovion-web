import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../lib/api';
import { setAuth, useAuth } from '../../lib/hooks';
import { LOGO_URL } from '../../lib/content';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState('');
  const [passErr, setPassErr] = useState('');

  if (isAuthed) return <Navigate to="/admin" replace />;

  const validate = () => {
    let ok = true;
    if (!email) { setEmailErr('Email is required.'); ok = false; } else setEmailErr('');
    if (!password) { setPassErr('Password is required.'); ok = false; } else setPassErr('');
    return ok;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await adminApi.login({ email, password });
      setAuth(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name || res.data.user.email}`);
      navigate('/admin');
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Invalid credentials. Check your email and password.';
      toast.error(msg);
      setPassErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center px-5 py-12"
      style={{ background: 'var(--ax-bg)' }}
      data-testid="admin-login-page"
    >
      <Helmet>
        <title>Admin Login | Axovion.io</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Subtle radial hint, no blobs */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(700px circle at 50% 30%, rgba(0,212,255,0.06), transparent 60%)',
        }}
      />

      <div className="relative w-full" style={{ maxWidth: 400 }}>
        {/* Brand mark */}
        <div className="text-center mb-8">
          <img
            src={LOGO_URL}
            alt="Axovion.io logo"
            style={{ height: 48, width: 48, borderRadius: 10, display: 'inline-block' }}
          />
          <h1
            className="ax-heading"
            style={{
              marginTop: 16,
              fontSize: '1.375rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Axovion<span style={{ color: 'var(--ax-accent)' }}>.io</span> Admin
          </h1>
          <p style={{ color: 'var(--ax-muted)', fontSize: 13, marginTop: 6 }}>
            Sign in to continue
          </p>
        </div>

        <form
          onSubmit={submit}
          noValidate
          data-testid="admin-login-form"
          style={{
            background: 'var(--ax-surface)',
            border: '1px solid var(--ax-border)',
            borderRadius: 'var(--ax-radius-panel)',
            padding: '32px 28px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
          }}
        >
          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <label
              htmlFor="ax-login-email"
              style={{
                display: 'block',
                color: 'var(--ax-heading)',
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Email
            </label>
            <input
              id="ax-login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailErr(''); }}
              aria-invalid={Boolean(emailErr)}
              aria-describedby={emailErr ? 'ax-login-email-err' : undefined}
              data-testid="admin-login-email"
              style={{
                width: '100%',
                background: 'var(--ax-bg)',
                border: `1px solid ${emailErr ? 'var(--ax-error)' : 'var(--ax-border)'}`,
                borderRadius: 'var(--ax-radius-control)',
                padding: '10px 14px',
                fontSize: 14,
                color: 'var(--ax-heading)',
                outline: 'none',
                boxSizing: 'border-box',
                minHeight: 44,
                transition: 'border-color 160ms ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(0,212,255,0.5)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = emailErr ? 'var(--ax-error)' : 'var(--ax-border)';
              }}
            />
            {emailErr && (
              <p
                id="ax-login-email-err"
                role="alert"
                style={{ color: 'var(--ax-error)', fontSize: 12, marginTop: 4 }}
              >
                {emailErr}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label
              htmlFor="ax-login-password"
              style={{
                display: 'block',
                color: 'var(--ax-heading)',
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                aria-hidden="true"
                strokeWidth={1.5}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 15,
                  height: 15,
                  color: 'var(--ax-muted)',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="ax-login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPassErr(''); }}
                aria-invalid={Boolean(passErr)}
                aria-describedby={passErr ? 'ax-login-pass-err' : undefined}
                data-testid="admin-login-password"
                style={{
                  width: '100%',
                  background: 'var(--ax-bg)',
                  border: `1px solid ${passErr ? 'var(--ax-error)' : 'var(--ax-border)'}`,
                  borderRadius: 'var(--ax-radius-control)',
                  padding: '10px 14px 10px 38px',
                  fontSize: 14,
                  color: 'var(--ax-heading)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  minHeight: 44,
                  transition: 'border-color 160ms ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(0,212,255,0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = passErr ? 'var(--ax-error)' : 'var(--ax-border)';
                }}
              />
            </div>
            {passErr && (
              <p
                id="ax-login-pass-err"
                role="alert"
                style={{ color: 'var(--ax-error)', fontSize: 12, marginTop: 4 }}
              >
                {passErr}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="admin-login-submit"
            style={{
              width: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: 'var(--ax-accent)',
              color: 'var(--ax-on-accent)',
              border: 'none',
              borderRadius: 'var(--ax-radius-control)',
              padding: '11px 20px',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              minHeight: 44,
              transition: 'opacity 160ms ease, background 160ms ease',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--ax-accent-dim)'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = 'var(--ax-accent)'; }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
            {!loading && <ArrowRight strokeWidth={1.5} style={{ width: 16, height: 16 }} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
