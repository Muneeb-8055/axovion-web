import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { LeadScoreBadge, StatusBadge } from './Dashboard';
import { Search, Trash2, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';

const AdminAudits = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [leadScore, setLeadScore] = useState('');
  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      if (leadScore) params.lead_score = leadScore;
      const res = await adminApi.listAudits(params);
      setItems(res.data);
    } catch (e) { toast.error('Failed to load audits'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status, leadScore]);

  const remove = async (id) => {
    if (!window.confirm('Delete this audit?')) return;
    try { await adminApi.deleteAudit(id); toast.success('Deleted'); load(); }
    catch (e) { toast.error('Delete failed'); }
  };

  const filtered = items.filter((a) => {
    if (!q) return true;
    const v = (a.businessName + ' ' + a.industry + ' ' + a.contactEmail).toLowerCase();
    return v.includes(q.toLowerCase());
  });

  return (
    <div className="space-y-6" data-testid="admin-audits-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-2">Audits</div>
          <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">AI Audit submissions</h1>
          <p className="text-[#C0C0C8]/60 text-sm mt-1">{filtered.length} of {items.length} shown</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-1.5 text-sm text-[#C0C0C8] hover:text-white"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-[#C0C0C8]/55 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search business, industry, email…" data-testid="admin-audits-search" className="w-full bg-[#12121A] border border-white/10 rounded-[10px] pl-9 pr-3 py-2 text-sm text-white placeholder:text-[#C0C0C8]/40 focus:outline-none focus:border-[#00D4FF]/45" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} data-testid="admin-audits-filter-status" className="bg-[#12121A] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white">
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="in-progress">In progress</option>
          <option value="delivered">Delivered</option>
          <option value="closed">Closed</option>
        </select>
        <select value={leadScore} onChange={(e) => setLeadScore(e.target.value)} data-testid="admin-audits-filter-leadscore" className="bg-[#12121A] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white">
          <option value="">All scores</option>
          <option value="hot">Hot</option>
          <option value="warm">Warm</option>
          <option value="cold">Cold</option>
        </select>
      </div>

      <div className="rounded-[16px] bg-[#12121A] border border-white/10 overflow-hidden" data-testid="admin-audits-table">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0A0A0F] border-b border-white/10">
              <tr className="text-left">
                <Th>Business</Th>
                <Th>Industry</Th>
                <Th>Contact</Th>
                <Th>Score</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-white/5 hover:bg-white/2 transition-colors" data-testid={`audit-row-${a.id}`}>
                  <Td>
                    <Link to={`/admin/audits/${a.id}`} className="text-white font-semibold hover:text-[#00D4FF]">{a.businessName}</Link>
                    {a.report?.total_monthly_savings_usd ? (
                      <div className="text-[#10B981] text-xs font-mono mt-0.5">${a.report.total_monthly_savings_usd.toLocaleString()}/mo</div>
                    ) : null}
                  </Td>
                  <Td>{a.industry}</Td>
                  <Td><span className="text-[#C0C0C8]">{a.contactEmail}</span></Td>
                  <Td><LeadScoreBadge score={a.lead_score} /></Td>
                  <Td><StatusBadge status={a.status} /></Td>
                  <Td className="font-mono text-xs text-[#C0C0C8]/65">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}</Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <Link to={`/admin/audits/${a.id}`} aria-label="View" className="h-7 w-7 inline-flex items-center justify-center rounded text-[#C0C0C8] hover:text-white hover:bg-white/8"><Eye className="h-3.5 w-3.5" /></Link>
                      <button onClick={() => remove(a.id)} aria-label="Delete" data-testid={`audit-delete-${a.id}`} className="h-7 w-7 inline-flex items-center justify-center rounded text-[#C0C0C8] hover:text-[#EF4444] hover:bg-white/8"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </Td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-[#C0C0C8]/55">No audits found.</td></tr>
              )}
              {loading && (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-[#C0C0C8]/55">Loading…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Th = ({ children }) => <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">{children}</th>;
const Td = ({ children, className = '' }) => <td className={`px-4 py-3 ${className}`}>{children}</td>;

export default AdminAudits;
