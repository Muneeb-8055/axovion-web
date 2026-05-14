import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { RefreshCw, Phone, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const statusColor = {
  scheduled: 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/25',
  'in-progress': 'bg-[#00D4FF]/12 text-[#00D4FF] border-[#00D4FF]/25',
  completed: 'bg-[#10B981]/12 text-[#10B981] border-[#10B981]/25',
  failed: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/25',
  'no-answer': 'bg-white/8 text-white border-white/15',
};

const AdminCalls = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [agents, setAgents] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [calls, h, ags] = await Promise.all([
        adminApi.listCalls(),
        adminApi.callsHealth(),
        adminApi.retellAgents().catch(() => ({ data: [] })),
      ]);
      setItems(calls.data);
      setHealth(h.data);
      setAgents(ags.data || []);
    } catch (e) { toast.error('Failed to load calls'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6" data-testid="admin-calls-page">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-2">Calls</div>
          <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">AI calling — Retell + Vapi</h1>
        </div>
        <button onClick={load} className="inline-flex items-center gap-1.5 text-sm text-[#C0C0C8] hover:text-white"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ProviderCard name="Retell (Primary)" ok={health?.retell} info={`${agents.length} agent(s)`} />
        <ProviderCard name="Vapi (Fallback)" ok={health?.vapi} info={health?.vapi ? 'Reachable' : 'Provide private API key'} />
        <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-5">
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Setup guide</div>
          <p className="mt-2 text-[#C0C0C8] text-sm leading-relaxed">To place real outbound calls, configure a Retell agent + purchased phone number at <a href="https://dashboard.retellai.com" target="_blank" rel="noreferrer" className="text-[#00D4FF]">dashboard.retellai.com</a>.</p>
        </div>
      </div>

      <div className="rounded-[16px] bg-[#12121A] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0A0A0F] border-b border-white/10">
              <tr className="text-left">
                <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Lead</th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Phone</th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Provider</th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Status</th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Note</th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">When</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/2" data-testid={`call-row-${c.id}`}>
                  <td className="px-4 py-3 text-white">{c.leadName}</td>
                  <td className="px-4 py-3 text-[#C0C0C8] font-mono text-xs">{c.phone}</td>
                  <td className="px-4 py-3 text-[#C0C0C8] uppercase text-xs font-mono">{c.provider}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${statusColor[c.status] || statusColor['no-answer']}`}>{c.status}</span></td>
                  <td className="px-4 py-3 text-[#C0C0C8] max-w-md truncate" title={c.error || c.outcome || ''}>{c.error || c.outcome || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#C0C0C8]/65">{c.scheduledAt ? new Date(c.scheduledAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
              {items.length === 0 && !loading && (<tr><td colSpan="6" className="px-6 py-12 text-center text-[#C0C0C8]/55">No calls logged yet. Trigger one from any audit detail page.</td></tr>)}
              {loading && (<tr><td colSpan="6" className="px-6 py-12 text-center text-[#C0C0C8]/55">Loading…</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProviderCard = ({ name, ok, info }) => (
  <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-[#00D4FF]" />
        <span className="text-white font-bold">{name}</span>
      </div>
      {ok ? <CheckCircle2 className="h-4 w-4 text-[#10B981]" /> : <AlertTriangle className="h-4 w-4 text-[#FBBF24]" />}
    </div>
    <div className="mt-3 text-[#C0C0C8] text-sm">{info}</div>
  </div>
);

export default AdminCalls;
