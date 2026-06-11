import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, setAuth } from '../../lib/hooks';
import { adminApi } from '../../lib/api';
import { LOGO_URL } from '../../lib/content';
import { Eye, EyeOff, Loader } from 'lucide-react';

export default function EmployeeLogin() {
  const { isAuthed, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthed && user?.role === 'employee') return <Navigate to="/employee" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminApi.login({ email, password });
      const data = res.data;
      if (data.user.role !== 'employee') {
        setError('This login is for employees only. Use the admin panel.');
        setLoading(false);
        return;
      }
      setAuth(data.token, data.user);
      window.location.href = '/employee';
    } catch (err) {
      setError(err?.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A12] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="Axovion" className="h-10 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Employee Portal</h1>
          <p className="text-[#A0A0B0] text-sm mt-1">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="ax-card space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-[#A0A0B0] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@axovion.io"
              required
              className="w-full bg-[#12121A] border border-[#2A2A3A] rounded-lg px-4 py-2.5 text-white placeholder-[#4A4A5A] text-sm focus:outline-none focus:border-[#6366F1]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#A0A0B0] mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#12121A] border border-[#2A2A3A] rounded-lg px-4 py-2.5 pr-10 text-white placeholder-[#4A4A5A] text-sm focus:outline-none focus:border-[#6366F1]"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#606070] hover:text-white"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6366F1] hover:bg-[#5558E3] disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2.5 text-sm flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[#606070] text-xs mt-6">
          <a href="/admin/login" className="hover:text-white transition-colors">Admin login →</a>
        </p>
      </div>
    </div>
  );
}