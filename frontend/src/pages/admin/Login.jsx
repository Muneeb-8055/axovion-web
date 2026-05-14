import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../lib/api';
import { setAuth, useAuth } from '../../lib/hooks';
import { LOGO_URL } from '../../lib/content';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();
  const [email, setEmail] = useState('admin@axovion.io');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthed) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminApi.login({ email, password });
      setAuth(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name || res.data.user.email}`);
      navigate('/admin');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-5 py-12" data-testid="admin-login-page">
      <Helmet>
        <title>Admin Login | Axovion.io</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -inset-24 bg-[radial-gradient(700px_circle_at_50%_30%,rgba(0,212,255,0.08),transparent_60%)]" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="Axovion.io" className="h-14 w-14 rounded-md mx-auto" />
          <h1 className="mt-4 text-white text-2xl font-extrabold tracking-tight">Axovion<span className="text-[#00D4FF]">.io</span> Admin</h1>
          <p className="text-[#C0C0C8]/60 text-sm mt-1">Sign in to access the dashboard</p>
        </div>

        <form onSubmit={submit} className="rounded-[16px] bg-[#12121A] border border-white/10 p-6 md:p-8 space-y-5 shadow-[0_30px_80px_rgba(0,0,0,0.6)]" data-testid="admin-login-form">
          <div>
            <label className="block text-white text-sm font-semibold mb-1.5">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required data-testid="admin-login-email" className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-4 py-2.5 text-sm text-white placeholder:text-[#C0C0C8]/40 focus:outline-none focus:border-[#00D4FF]/60" />
          </div>
          <div>
            <label className="block text-white text-sm font-semibold mb-1.5">Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 text-[#C0C0C8]/55 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required data-testid="admin-login-password" className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-[#C0C0C8]/40 focus:outline-none focus:border-[#00D4FF]/60" />
            </div>
          </div>
          <button type="submit" disabled={loading} data-testid="admin-login-submit" className="w-full inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-5 py-3 text-sm font-bold transition-colors duration-200 hover:bg-[#FBBF24] disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign in'} <ArrowRight className="h-4 w-4" />
          </button>
          <div className="rounded-[12px] bg-[#0A0A0F] border border-[#00D4FF]/15 p-4 flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-[#00D4FF] mt-0.5" />
            <div className="text-xs text-[#C0C0C8]/75">
              <div className="text-white font-semibold mb-1">Test credentials (remove before deploy):</div>
              admin@axovion.io / AxovionAdmin2025!
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
