import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { custApi } from '../../lib/api';
import { useCustomerAuth } from '../../lib/hooks';
import { FileSearch, CalendarCheck, ArrowRight, Loader, Sparkles, CheckCircle2, Clock } from 'lucide-react';

const SCORE_COLOR = {
  hot: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/25',
  warm: 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/25',
  cold: 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/25',
};
const STATUS_COLOR = {
  new: 'bg-white/8 text-white border-white/12',
  'in-progress': 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20',
  delivered: 'bg-[#10B981]/12 text-[#10B981] border-[#10B981]/22',
  confirmed: 'bg-[#10B981]/12 text-[#10B981] border-[#10B981]/22',
  completed: 'bg-[#10B981]/12 text-[#10B981] border-[#10B981]/22',
  cancelled: 'bg-[#EF4444]/12 text-[#EF4444] border-[#EF4444]/22',
};

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="text-2xl font-extrabold text-white mb-1">{value}</div>
      <div className="text-sm text-[#C0C0C8]/70">{label}</div>
      {sub && <div className="text-xs text-[#C0C0C8]/45 mt-1">{sub}</div>}
    </div>
  );
}

export default function CustomerDashboard() {
  const { user } = useCustomerAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const r = await custApi.dashboard(); setData(r.data); }
      catch (e) { /* handled by interceptor / empty state */ }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader className="h-6 w-6 text-[#00D4FF] animate-spin" /></div>;
  }

  const audits = data?.audits || [];
  const bookings = data?.bookings || [];

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-[#C0C0C8]/60 text-sm mt-1">Here's an overview of your account.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="AI Audits" value={audits.length} sub={data?.freeAuditUsed ? 'Free audit used' : 'Free audit available'} icon={FileSearch} />
        <StatCard label="Strategy Calls" value={bookings.length} sub="Total requests" icon={CalendarCheck} />
        <StatCard label="Reports Ready" value={audits.filter((a) => a.hasReport).length} sub="Generated reports" icon={Sparkles} />
      </div>

      {/* Free audit CTA */}
      {!data?.freeAuditUsed && (
        <div className="rounded-[16px] bg-[#12121A] border border-[#00D4FF]/25 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_0_1px_rgba(0,212,255,0.12),0_0_28px_rgba(0,212,255,0.10)]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/12 flex items-center justify-center text-[#00D4FF] shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-white font-bold">Your free AI audit is ready to claim</h3>
              <p className="text-[#C0C0C8]/65 text-sm mt-0.5">Get a custom automation report with ROI estimates in ~30 seconds.</p>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard/audit')} className="inline-flex items-center gap-2 rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-5 py-2.5 text-sm font-bold hover:bg-[#FBBF24] transition-colors duration-200 shrink-0">
            Start AI Audit <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Audits */}
      <div className="rounded-[16px] bg-[#12121A] border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-white font-bold">Your AI Audits</h2>
          <Link to="/dashboard/audit" className="text-[#00D4FF] text-xs hover:underline">Go to audit →</Link>
        </div>
        {audits.length === 0 ? (
          <div className="p-8 text-center">
            <FileSearch className="h-10 w-10 text-[#2A2A3A] mx-auto mb-3" />
            <p className="text-[#C0C0C8]/55 text-sm">No audits yet. Claim your free AI audit to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {audits.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02]">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-semibold truncate">{a.businessName}</p>
                    {a.lead_score && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${SCORE_COLOR[a.lead_score] || ''}`}>{a.lead_score}</span>}
                  </div>
                  <p className="text-[#C0C0C8]/55 text-xs mt-0.5">{a.industry} · {a.createdAt?.split('T')[0]}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${STATUS_COLOR[a.status] || STATUS_COLOR.new}`}>{a.status}</span>
                  {a.hasReport ? (
                    <Link to={`/audit-report/${a.id}`} className="text-[#00D4FF] text-xs font-bold hover:underline inline-flex items-center gap-1">
                      View report <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <span className="text-[#C0C0C8]/45 text-xs inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Generating…</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bookings */}
      <div className="rounded-[16px] bg-[#12121A] border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-white font-bold">Strategy Calls</h2>
          <Link to="/dashboard/bookings" className="text-[#00D4FF] text-xs hover:underline">Request a call →</Link>
        </div>
        {bookings.length === 0 ? (
          <div className="p-8 text-center">
            <CalendarCheck className="h-10 w-10 text-[#2A2A3A] mx-auto mb-3" />
            <p className="text-[#C0C0C8]/55 text-sm">No strategy calls requested yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-5 py-4">
                <div className="min-w-0">
                  <p className="text-white text-sm">{b.message || 'Strategy call request'}</p>
                  <p className="text-[#C0C0C8]/55 text-xs mt-0.5">{b.preferredTime || 'No time specified'} · {b.createdAt?.split('T')[0]}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${STATUS_COLOR[b.status] || STATUS_COLOR.new}`}>{b.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
