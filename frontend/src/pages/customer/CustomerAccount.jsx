import React, { useEffect, useState } from 'react';
import { custApi } from '../../lib/api';
import { setCustomerAuth, useCustomerAuth } from '../../lib/hooks';
import { User, Lock, Loader, Save } from 'lucide-react';
import { toast } from 'sonner';

const inputCls = "w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-4 py-2.5 text-sm text-white placeholder:text-[#C0C0C8]/40 focus:outline-none focus:border-[#00D4FF]/60 transition-colors duration-200";

export default function CustomerAccount() {
  const { token } = useCustomerAuth();
  const [profile, setProfile] = useState({ name: '', email: '', company: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await custApi.me();
        setProfile({ name: r.data.name || '', email: r.data.email || '', company: r.data.company || '', phone: r.data.phone || '' });
      } catch (e) {}
      finally { setLoading(false); }
    })();
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const r = await custApi.updateProfile({ name: profile.name, company: profile.company, phone: profile.phone });
      setCustomerAuth(token, r.data); // refresh cached user
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    setSavingPw(true);
    try {
      await custApi.changePassword(pw);
      toast.success('Password updated');
      setPw({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader className="h-6 w-6 text-[#00D4FF] animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Account</h1>
        <p className="text-[#C0C0C8]/60 text-sm mt-1">Manage your profile and security.</p>
      </div>

      {/* Profile */}
      <form onSubmit={saveProfile} className="rounded-[16px] bg-[#12121A] border border-white/10 p-6 space-y-4">
        <h2 className="text-white font-bold flex items-center gap-2"><User className="h-4 w-4 text-[#00D4FF]" /> Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm font-semibold mb-1.5">Full name</label>
            <input className={inputCls} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-white text-sm font-semibold mb-1.5">Email</label>
            <input className={`${inputCls} opacity-60 cursor-not-allowed`} value={profile.email} disabled title="Email cannot be changed" />
          </div>
          <div>
            <label className="block text-white text-sm font-semibold mb-1.5">Company</label>
            <input className={inputCls} value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} />
          </div>
          <div>
            <label className="block text-white text-sm font-semibold mb-1.5">Phone</label>
            <input className={inputCls} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          </div>
        </div>
        <button type="submit" disabled={savingProfile} className="inline-flex items-center gap-2 rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-5 py-2.5 text-sm font-bold hover:bg-[#FBBF24] transition-colors duration-200 disabled:opacity-60">
          <Save className="h-4 w-4" /> {savingProfile ? 'Saving…' : 'Save profile'}
        </button>
      </form>

      {/* Password */}
      <form onSubmit={savePassword} className="rounded-[16px] bg-[#12121A] border border-white/10 p-6 space-y-4">
        <h2 className="text-white font-bold flex items-center gap-2"><Lock className="h-4 w-4 text-[#00D4FF]" /> Change password</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm font-semibold mb-1.5">Current password</label>
            <input type="password" className={inputCls} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          </div>
          <div>
            <label className="block text-white text-sm font-semibold mb-1.5">New password</label>
            <input type="password" className={inputCls} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          </div>
        </div>
        <button type="submit" disabled={savingPw} className="inline-flex items-center gap-2 rounded-[12px] bg-[#12121A] border border-white/12 text-white px-5 py-2.5 text-sm font-bold hover:border-[#00D4FF]/35 transition-colors duration-200 disabled:opacity-60">
          <Lock className="h-4 w-4" /> {savingPw ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
