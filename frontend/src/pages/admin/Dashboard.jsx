import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, MessageSquare, CalendarCheck, Flame, TrendingUp, ArrowRight, Sparkles, Mail, Phone, KanbanSquare } from 'lucide-react';
import { adminApi } from '../../lib/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.dashboard().then((r) => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      <div>
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-2">Dashboard</div>
        <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">At a glance</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Audits" value={stats?.audits?.total || 0} sub={`${stats?.audits?.new || 0} new`} icon={ClipboardList} testId="stat-audits" />
        <StatCard label="Chats" value={stats?.chats || 0} sub="sessions" icon={MessageSquare} testId="stat-chats" />
        <StatCard label="Bookings" value={stats?.bookings || 0} sub="requests" icon={CalendarCheck} testId="stat-bookings" />
        <StatCard label="Conversion" value={`${stats?.conversion_rate || 0}%`} sub="chat→audit" icon={TrendingUp} testId="stat-conversion" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LeadCard label="Hot leads" value={stats?.leads?.hot || 0} color="#EF4444" />
        <LeadCard label="Warm leads" value={stats?.leads?.warm || 0} color="#FBBF24" />
        <LeadCard label="Cold leads" value={stats?.leads?.cold || 0} color="#3B82F6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-[16px] bg-[#12121A] border border-white/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white text-lg font-bold">Recent audits</h2>
            <Link to="/admin/audits" className="text-xs text-[#00D4FF] inline-flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="divide-y divide-white/8">
            {(stats?.recent_audits || []).map((a) => (
              <Link key={a.id} to={`/admin/audits/${a.id}`} className="flex items-center justify-between py-3 hover:bg-white/3 -mx-2 px-2 rounded transition-colors" data-testid={`recent-audit-${a.id}`}>
                <div className="min-w-0">
                  <div className="text-white font-semibold truncate">{a.businessName}</div>
                  <div className="text-xs text-[#C0C0C8]/60 truncate">{a.industry} · {a.contactEmail}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <LeadScoreBadge score={a.lead_score} />
                  <StatusBadge status={a.status} />
                </div>
              </Link>
            ))}
            {(!stats?.recent_audits || stats.recent_audits.length === 0) && (
              <p className="text-[#C0C0C8]/55 text-sm py-6 text-center">No audits yet. <Link to="/audit" className="text-[#00D4FF]">Submit a test audit</Link>.</p>
            )}
          </div>
        </div>

        <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-6 space-y-3">
          <h2 className="text-white text-lg font-bold mb-3">Activity</h2>
          <Mini icon={Mail} label="Emails sent" value={stats?.emails || 0} />
          <Mini icon={Phone} label="Calls logged" value={stats?.calls || 0} />
          <Mini icon={KanbanSquare} label="Open tasks" value={stats?.tasks?.open || 0} />
          <Mini icon={Sparkles} label="Total tasks" value={stats?.tasks?.total || 0} />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, testId }) => (
  <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-5" data-testid={testId}>
    <div className="flex items-center justify-between">
      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">{label}</div>
      <Icon className="h-4 w-4 text-[#00D4FF]" />
    </div>
    <div className="mt-2 text-white text-3xl font-extrabold tracking-tight">{value}</div>
    <div className="text-[#C0C0C8]/55 text-xs mt-1">{sub}</div>
  </div>
);

const LeadCard = ({ label, value, color }) => (
  <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-5 flex items-center justify-between">
    <div>
      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">{label}</div>
      <div className="text-white text-3xl font-extrabold mt-1">{value}</div>
    </div>
    <Flame className="h-6 w-6" style={{ color }} />
  </div>
);

const Mini = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2 text-sm text-[#C0C0C8]"><Icon className="h-3.5 w-3.5 text-[#00D4FF]" /> {label}</div>
    <div className="text-white font-mono font-bold">{value}</div>
  </div>
);

export const LeadScoreBadge = ({ score }) => {
  const map = {
    hot: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/25',
    warm: 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/25',
    cold: 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/25',
  };
  return <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${map[score] || map.cold}`}>{score || 'cold'}</span>;
};

export const StatusBadge = ({ status }) => {
  const map = {
    new: 'bg-white/8 text-white border-white/15',
    'in-progress': 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/25',
    delivered: 'bg-[#10B981]/12 text-[#10B981] border-[#10B981]/25',
    closed: 'bg-[#C0C0C8]/8 text-[#C0C0C8]/60 border-white/8',
  };
  return <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${map[status] || map.new}`}>{status || 'new'}</span>;
};

export default AdminDashboard;
