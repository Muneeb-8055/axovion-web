import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { empApi } from '../../lib/api';
import { useEmployeeAuth } from '../../lib/hooks';
import { User, Mail, Phone, CalendarDays, Clock, TrendingUp, Loader, Camera } from 'lucide-react';

export default function Profile() {
  const { user } = useEmployeeAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ax_emp_token');
    if (!token) { navigate('/employee/login'); return; }
    load();
  }, []);

  const load = async () => {
    try {
      const [profRes, sumRes] = await Promise.all([
        empApi.getMyProfile().catch(() => ({ data: null })),
        empApi.getMySummary().catch(() => ({ data: null })),
      ]);
      setProfile(profRes.data);
      setSummary(sumRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-6 w-6 text-[#6366F1] animate-spin" />
      </div>
    );
  }

  const completed = summary?.completed_hours || 0;
  const target = summary?.target_hours || 208;
  const remaining = target - completed;
  const progress = Math.min((completed / target) * 100, 100);

  const initials = (user?.name || 'E').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-[#A0A0B0] text-sm mt-1">Your account details and monthly stats</p>
      </div>

      {/* Profile Card */}
      <div className="ax-card">
        <div className="flex items-center gap-5 mb-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-[#6366F1]/20 flex items-center justify-center text-2xl font-bold text-[#6366F1]">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name || 'Employee'}</h2>
            <p className="text-[#A0A0B0] text-sm">{user?.email}</p>
            <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-[#6366F1]/10 text-[#6366F1] capitalize">
              {user?.role || 'employee'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#12121A] rounded-xl p-4">
            <div className="flex items-center gap-2 text-[#606070] mb-2">
              <Mail className="h-4 w-4" />
              <span className="text-xs">Email</span>
            </div>
            <p className="text-sm text-white">{user?.email || '—'}</p>
          </div>
          {profile?.phone && (
            <div className="bg-[#12121A] rounded-xl p-4">
              <div className="flex items-center gap-2 text-[#606070] mb-2">
                <Phone className="h-4 w-4" />
                <span className="text-xs">Phone</span>
              </div>
              <p className="text-sm text-white">{profile.phone}</p>
            </div>
          )}
          {profile?.department && (
            <div className="bg-[#12121A] rounded-xl p-4">
              <div className="flex items-center gap-2 text-[#606070] mb-2">
                <User className="h-4 w-4" />
                <span className="text-xs">Department</span>
              </div>
              <p className="text-sm text-white">{profile.department}</p>
            </div>
          )}
          {profile?.position && (
            <div className="bg-[#12121A] rounded-xl p-4">
              <div className="flex items-center gap-2 text-[#606070] mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Position</span>
              </div>
              <p className="text-sm text-white">{profile.position}</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Hours */}
      <div className="ax-card">
        <h2 className="font-semibold text-white mb-4">Monthly Hours — {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</h2>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white font-medium">{completed.toFixed(1)}h completed</span>
          <span className="text-sm text-[#606070]">{target}h target</span>
        </div>
        <div className="w-full bg-[#1E1E2E] rounded-full h-4 mb-3">
          <div
            className={`h-4 rounded-full transition-all ${progress >= 100 ? 'bg-green-500' : 'bg-[#6366F1]'}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-[#606070]">
          <span>{progress.toFixed(0)}% complete</span>
          <span>{remaining.toFixed(1)}h remaining · {summary?.leaves_used || 0} leaves used · {summary?.leave_balance || 0} left</span>
        </div>
      </div>
    </div>
  );
}