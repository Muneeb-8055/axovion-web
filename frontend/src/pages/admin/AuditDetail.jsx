import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { LeadScoreBadge, StatusBadge } from './Dashboard';
import { ArrowLeft, RefreshCw, Mail, Phone, Save, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const AdminAuditDetail = () => {
  const { id } = useParams();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('new');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAudit(id);
      setAudit(res.data);
      setStatus(res.data.status || 'new');
      setNotes(res.data.notes || '');
    } catch (e) { toast.error('Failed to load audit'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateAudit(id, { status, notes });
      toast.success('Updated');
      load();
    } catch (e) { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const regenerate = async () => {
    try { await adminApi.regenerateReport(id); toast.success('Regenerating report…'); setTimeout(load, 3000); }
    catch (e) { toast.error('Regenerate failed'); }
  };

  const resend = async () => {
    try { const res = await adminApi.resendReport(id); res.data.ok ? toast.success('Email resent') : toast.error(res.data.error || 'Resend failed'); }
    catch (e) { toast.error('Resend failed'); }
  };

  const triggerCall = async () => {
    if (!audit?.whatsapp) { toast.error('No phone number on file'); return; }
    try { await adminApi.triggerCall({ auditId: id, phone: audit.whatsapp, provider: 'retell' }); toast.success('Call queued (check Calls page)'); }
    catch (e) { toast.error('Call trigger failed'); }
  };

  if (loading) return <div className="text-[#C0C0C8]/60">Loading…</div>;
  if (!audit) return <div className="text-[#C0C0C8]/60">Audit not found.</div>;

  const r = audit.report;

  return (
    <div className="space-y-6" data-testid="admin-audit-detail">
      <div className="flex items-center gap-3">
        <Link to="/admin/audits" className="inline-flex items-center gap-1 text-sm text-[#C0C0C8] hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to audits</Link>
      </div>

      <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">{audit.businessName}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-[#C0C0C8]/65">{audit.industry}</span>
              <span className="text-[#C0C0C8]/40">·</span>
              <a href={audit.websiteUrl} target="_blank" rel="noreferrer" className="text-[#00D4FF] hover:underline inline-flex items-center gap-1">{audit.websiteUrl} <ExternalLink className="h-3 w-3" /></a>
              <span className="text-[#C0C0C8]/40">·</span>
              <a href={`mailto:${audit.contactEmail}`} className="text-[#00D4FF] hover:underline">{audit.contactEmail}</a>
              {audit.whatsapp && <><span className="text-[#C0C0C8]/40">·</span><span className="text-[#C0C0C8]">{audit.whatsapp}</span></>}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <LeadScoreBadge score={audit.lead_score} />
              <StatusBadge status={audit.status} />
              <Link to={`/audit-report/${audit.id}`} target="_blank" rel="noreferrer" className="text-xs text-[#00D4FF] inline-flex items-center gap-1 hover:underline">Public report ↗</Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={regenerate} data-testid="audit-regenerate-button" className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-[10px] bg-[#0A0A0F] border border-white/15 text-white hover:border-[#00D4FF]/35"><RefreshCw className="h-3.5 w-3.5" /> Regenerate</button>
            <button onClick={resend} data-testid="audit-resend-email-button" className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-[10px] bg-[#0A0A0F] border border-white/15 text-white hover:border-[#00D4FF]/35"><Mail className="h-3.5 w-3.5" /> Resend report</button>
            <button onClick={triggerCall} data-testid="audit-call-button" className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-[10px] bg-[#F97316] text-[#0A0A0F] font-semibold hover:bg-[#FBBF24]"><Phone className="h-3.5 w-3.5" /> AI call</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-6">
            <h2 className="text-white text-lg font-bold mb-4">Submission</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <Row label="Main goal" value={audit.mainGoal} />
              <Row label="Monthly revenue" value={audit.monthlyRevenue} />
              <Row label="Employees" value={audit.employees} />
              <Row label="Budget" value={audit.budget} />
              <Row label="Timeline" value={audit.timeline} />
              <Row label="Sales cycle" value={audit.salesCycleLength} />
              <Row label="Support volume" value={audit.supportVolume} />
              <Row label="Leads/month" value={audit.leadsPerMonth} />
              <Row label="Automation level" value={audit.currentAutomationLevel} />
              <Row label="Tools" value={(audit.tools || []).join(', ') || '—'} />
              <Row label="Repetitive tasks" value={audit.repetitiveTasks} full />
              <Row label="Bottleneck" value={audit.bottleneck} full />
            </dl>
          </div>

          {r && !r.error && r.opportunities && (
            <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-6">
              <h2 className="text-white text-lg font-bold mb-4">AI Report</h2>
              <p className="text-[#C0C0C8] text-sm leading-relaxed mb-5">{r.executive_summary}</p>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <Stat label="Monthly savings" value={`$${(r.total_monthly_savings_usd || 0).toLocaleString()}`} />
                <Stat label="Hours/mo" value={r.total_hours_saved_per_month || 0} />
                <Stat label="Days" value={r.implementation_timeline_days || 0} />
              </div>
              <div className="space-y-3">
                {(r.opportunities || []).map((o, i) => (
                  <div key={i} className="rounded-[12px] bg-[#0A0A0F] border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-bold text-sm">{o.title}</h3>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#C0C0C8]/55">{o.priority}</span>
                    </div>
                    <p className="mt-2 text-[#C0C0C8]/75 text-sm">{o.description}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-[#C0C0C8]/65">
                      <span>${(o.monthly_savings_usd || 0).toLocaleString()}/mo</span>
                      <span>{o.estimated_hours_saved_per_month || 0}h saved</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {r?.error && (
            <div className="rounded-[16px] bg-[#EF4444]/10 border border-[#EF4444]/25 p-6">
              <h2 className="text-white font-bold">Report error</h2>
              <p className="text-sm text-[#C0C0C8] mt-2">{r.error}</p>
              <button onClick={regenerate} className="mt-3 text-sm text-[#00D4FF]">Retry</button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-6">
            <h2 className="text-white text-lg font-bold mb-4">Manage</h2>
            <label className="block text-xs font-mono uppercase tracking-widest text-[#C0C0C8]/55 mb-2">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} data-testid="audit-status-select" className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00D4FF]/45">
              <option value="new">New</option>
              <option value="in-progress">In progress</option>
              <option value="delivered">Delivered</option>
              <option value="closed">Closed</option>
            </select>
            <label className="block text-xs font-mono uppercase tracking-widest text-[#C0C0C8]/55 mt-4 mb-2">Internal notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="5" data-testid="audit-notes-textarea" className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00D4FF]/45" />
            <button onClick={save} disabled={saving} data-testid="audit-save-button" className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-[#F97316] text-[#0A0A0F] px-4 py-2.5 text-sm font-bold hover:bg-[#FBBF24]">
              <Save className="h-3.5 w-3.5" /> {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, full }) => (
  <div className={full ? 'sm:col-span-2' : ''}>
    <dt className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">{label}</dt>
    <dd className="mt-1 text-[#C0C0C8]">{value || '—'}</dd>
  </div>
);

const Stat = ({ label, value }) => (
  <div className="rounded-[10px] bg-[#0A0A0F] border border-white/10 p-3">
    <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">{label}</div>
    <div className="text-white text-lg font-extrabold mt-0.5">{value}</div>
  </div>
);

export default AdminAuditDetail;
