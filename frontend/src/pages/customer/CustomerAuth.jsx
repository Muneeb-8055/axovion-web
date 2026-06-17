import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Lock, Mail, User, Building2, Phone, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { custApi } from '../../lib/api';
import { setCustomerAuth, useCustomerAuth } from '../../lib/hooks';
import { LOGO_URL } from '../../lib/content';

const inputCls = "w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-[#C0C0C8]/40 focus:outline-none focus:border-[#00D4FF]/60 transition-colors duration-200";

export default function CustomerAuth({ mode = 'login' }) {
  const navigate = useNavigate();
  const { isAuthed } = useCustomerAuth();
  const [isSignup, setIsSignup] = useState(mode === 'signup');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '', phone: '' });

  if (isAuthed) return <Navigate to="/dashboard" replace />;

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = isSignup
        ? await custApi.signup(form)
        : await custApi.login({ email: form.email, password: form.password });
      setCustomerAuth(res.data.token, res.data.user);
      toast.success(isSignup ? 'Welcome to Axovion!' : `Welcome back, ${res.data.user.name || ''}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-stretch" data-testid="customer-auth-page">
      <Helmet>
        <title>{`${isSignup ? 'Create account' : 'Sign in'} | Axovion.io`}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Left brand panel (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-white/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -inset-24 bg-[radial-gradient(800px_circle_at_30%_25%,rgba(0,212,255,0.16),transparent_55%)]" />
          <div className="absolute -inset-24 bg-[radial-gradient(700px_circle_at_70%_75%,rgba(59,130,246,0.12),transparent_55%)]" />
        </div>
        <div className="relative flex flex-col justify-between p-12 xl:p-16">
          <Link to="/" className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Axovion.io" className="h-10 w-10 rounded-md" />
            <span className="text-white font-extrabold text-xl">Axovion<span className="text-[#00D4FF]">.io</span></span>
          </Link>

          <div>
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-4">Customer Portal</div>
            <h1 className="text-white text-[44px] leading-[1.05] tracking-[-0.03em] font-extrabold max-w-md">
              Your AI automation, all in one place.
            </h1>
            <ul className="mt-8 space-y-3 max-w-sm">
              {[
                'Run your free AI business audit',
                'Track your audit reports & ROI',
                'Request strategy calls in one click',
                'Manage your account & history',
              ].map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-[#C0C0C8] text-sm">
                  <CheckCircle2 className="h-4 w-4 text-[#00D4FF] mt-0.5 shrink-0" /> {b}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[#C0C0C8]/45 text-xs">Trusted by businesses automating revenue ops with AI.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <img src={LOGO_URL} alt="Axovion.io" className="h-12 w-12 rounded-md mx-auto" />
          </div>

          <div className="mb-7">
            <div className="inline-flex items-center gap-2 text-[#00D4FF] mb-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-mono text-[11px] tracking-[0.18em] uppercase">{isSignup ? 'Get started' : 'Welcome back'}</span>
            </div>
            <h2 className="text-white text-3xl font-extrabold tracking-tight">
              {isSignup ? 'Create your account' : 'Sign in to your dashboard'}
            </h2>
            <p className="text-[#C0C0C8]/60 text-sm mt-2">
              {isSignup ? 'One free AI audit included with every account.' : 'Access your audits, reports, and bookings.'}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4" data-testid="customer-auth-form">
            {isSignup && (
              <div className="relative">
                <User className="h-4 w-4 text-[#C0C0C8]/55 absolute left-3 top-1/2 -translate-y-1/2" />
                <input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Full name" className={inputCls} data-testid="customer-name" />
              </div>
            )}
            <div className="relative">
              <Mail className="h-4 w-4 text-[#C0C0C8]/55 absolute left-3 top-1/2 -translate-y-1/2" />
              <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="Email address" className={inputCls} data-testid="customer-email" />
            </div>
            <div className="relative">
              <Lock className="h-4 w-4 text-[#C0C0C8]/55 absolute left-3 top-1/2 -translate-y-1/2" />
              <input required type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Password" className={`${inputCls} pr-10`} data-testid="customer-password" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C0C0C8]/55 hover:text-white">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {isSignup && (
              <>
                <div className="relative">
                  <Building2 className="h-4 w-4 text-[#C0C0C8]/55 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input value={form.company} onChange={(e) => update('company', e.target.value)} placeholder="Company (optional)" className={inputCls} data-testid="customer-company" />
                </div>
                <div className="relative">
                  <Phone className="h-4 w-4 text-[#C0C0C8]/55 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="Phone (optional)" className={inputCls} data-testid="customer-phone" />
                </div>
              </>
            )}

            <button type="submit" disabled={loading} data-testid="customer-auth-submit" className="w-full inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-5 py-3 text-sm font-bold transition-colors duration-200 hover:bg-[#FBBF24] disabled:opacity-60">
              {loading ? 'Please wait…' : (isSignup ? 'Create account' : 'Sign in')} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="text-center text-[#C0C0C8]/60 text-sm mt-6">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsSignup(!isSignup)} className="text-[#00D4FF] hover:underline font-semibold" data-testid="customer-auth-toggle">
              {isSignup ? 'Sign in' : 'Sign up free'}
            </button>
          </p>
          <p className="text-center text-[#C0C0C8]/40 text-xs mt-4">
            <Link to="/" className="hover:text-white">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
