import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { LeadScoreBadge, StatusBadge } from './Dashboard';
import {
  ArrowLeft,
  RefreshCw,
  Mail,
  Phone,
  Save,
  ExternalLink,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

/* ---------------------------------------------------------------
   Loading skeleton matching the real layout
--------------------------------------------------------------- */
const DetailSkeleton = () => (
  <div className="py-6 px-4 md:px-8 space-y-4 animate-pulse" aria-label="Loading audit..." aria-busy="true">
    <div className="h-5 w-32 bg-white/6 rounded-sm" />
    <div className="rounded-[var(--ax-radius-panel)] bg-[var(--ax-surface)] border border-[var(--ax-border)] p-5 space-y-3">
      <div className="h-6 w-64 bg-white/8 rounded-sm" />
      <div className="flex gap-3">
        <div className="h-4 w-24 bg-white/6 rounded-sm" />
        <div className="h-4 w-36 bg-white/6 rounded-sm" />
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 rounded-[var(--ax-radius-panel)] bg-[var(--ax-surface)] border border-[var(--ax-border)] p-5 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 bg-white/5 rounded-sm" style={{ width: `${60 + (i % 3) * 15}%` }} />
        ))}
      </div>
      <div className="rounded-[var(--ax-radius-panel)] bg-[var(--ax-surface)] border border-[var(--ax-border)] p-5 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 bg-white/5 rounded-sm" />
        ))}
      </div>
    </div>
  </div>
);

/* ---------------------------------------------------------------
   Main component
--------------------------------------------------------------- */
const AdminAuditDetail = () => {
  const { id } = useParams();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('new');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const regenTimerRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getAudit(id);
      setAudit(res.data);
      setStatus(res.data.status || 'new');
      setNotes(res.data.notes || '');
    } catch {
      setError('Could not load this audit. It may have been deleted or the server is unreachable.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    // Clear any dangling regen timer on unmount
    return () => {
      if (regenTimerRef.current) {
        clearTimeout(regenTimerRef.current);
      }
    };
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateAudit(id, { status, notes });
      toast.success('Changes saved');
      load();
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const regenerate = async () => {
    try {
      await adminApi.regenerateReport(id);
      toast.success('Regenerating report...');
      // Clear any existing timer before setting a new one to avoid double-fires
      if (regenTimerRef.current) clearTimeout(regenTimerRef.current);
      regenTimerRef.current = setTimeout(() => {
        regenTimerRef.current = null;
        load();
      }, 3000);
    } catch {
      toast.error('Regenerate failed');
    }
  };

  const resend = async () => {
    try {
      const res = await adminApi.resendReport(id);
      if (res.data.ok) {
        toast.success('Report email resent');
      } else {
        toast.error(res.data.error || 'Resend failed');
      }
    } catch {
      toast.error('Resend failed');
    }
  };

  const triggerCall = async () => {
    if (!audit?.whatsapp) {
      toast.error('No phone number on file');
      return;
    }
    try {
      await adminApi.triggerCall({ auditId: id, phone: audit.whatsapp, provider: 'retell' });
      toast.success('Call queued (check Calls page)');
    } catch {
      toast.error('Call trigger failed');
    }
  };

  if (loading) return <DetailSkeleton />;

  if (error) {
    return (
      <div className="py-6 px-4 md:px-8 space-y-4">
        <Link
          to="/admin/audits"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--ax-muted)] hover:text-[var(--ax-heading)] focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] min-h-[44px] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          Back to audits
        </Link>
        <div className="flex items-start gap-3 rounded-[var(--ax-radius-panel)] bg-[var(--ax-surface)] border border-[var(--ax-error)]/25 p-5">
          <AlertCircle className="h-4 w-4 text-[var(--ax-error)] shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden="true" />
          <div>
            <p className="text-sm text-[var(--ax-heading)] font-medium">Load failed</p>
            <p className="text-xs text-[var(--ax-muted)] mt-0.5">{error}</p>
            <button
              onClick={load}
              className="mt-2 text-xs text-[var(--ax-accent)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)]"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!audit) return null;

  const r = audit.report;

  return (
    <div className="py-6 px-4 md:px-8 space-y-4" data-testid="admin-audit-detail">
      {/* ---- Back nav ---- */}
      <Link
        to="/admin/audits"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--ax-muted)] hover:text-[var(--ax-heading)] focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] min-h-[44px] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        Back to audits
      </Link>

      {/* ---- Header card ---- */}
      <div className="rounded-[var(--ax-radius-panel)] bg-[var(--ax-surface)] border border-[var(--ax-border)] p-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[var(--ax-heading)] text-xl md:text-2xl font-semibold tracking-tight truncate">
              {audit.businessName}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {audit.industry && (
                <span className="text-[var(--ax-muted)]">{audit.industry}</span>
              )}
              {audit.websiteUrl && (
                <a
                  href={audit.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--ax-accent)] hover:underline inline-flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)]"
                >
                  {audit.websiteUrl}
                  <ExternalLink className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                </a>
              )}
              {audit.contactEmail && (
                <a
                  href={`mailto:${audit.contactEmail}`}
                  className="text-[var(--ax-accent)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)]"
                >
                  {audit.contactEmail}
                </a>
              )}
              {audit.whatsapp && (
                <span className="text-[var(--ax-muted)]">{audit.whatsapp}</span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <LeadScoreBadge score={audit.lead_score} />
              <StatusBadge status={audit.status} />
              <Link
                to={`/audit-report/${audit.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[var(--ax-accent)] inline-flex items-center gap-1 hover:underline focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)]"
              >
                Public report
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={regenerate}
              data-testid="audit-regenerate-button"
              className="inline-flex items-center gap-1.5 text-xs px-3 min-h-[44px] rounded-[var(--ax-radius-control)] bg-[var(--ax-bg)] border border-[var(--ax-border-strong)] text-[var(--ax-heading)] hover:border-[var(--ax-accent)]/40 focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              Regenerate
            </button>
            <button
              onClick={resend}
              data-testid="audit-resend-email-button"
              className="inline-flex items-center gap-1.5 text-xs px-3 min-h-[44px] rounded-[var(--ax-radius-control)] bg-[var(--ax-bg)] border border-[var(--ax-border-strong)] text-[var(--ax-heading)] hover:border-[var(--ax-accent)]/40 focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] transition-colors"
            >
              <Mail className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              Resend report
            </button>
            <button
              onClick={triggerCall}
              data-testid="audit-call-button"
              className="inline-flex items-center gap-1.5 text-xs px-3 min-h-[44px] rounded-[var(--ax-radius-control)] bg-[var(--ax-warn)] text-[var(--ax-bg)] font-semibold hover:bg-[var(--ax-warn)]/80 focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] transition-colors"
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              AI call
            </button>
          </div>
        </div>
      </div>

      {/* ---- Content grid ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ---- Left: submission + report ---- */}
        <div className="lg:col-span-2 space-y-4">
          {/* Submission data */}
          <section className="rounded-[var(--ax-radius-panel)] bg-[var(--ax-surface)] border border-[var(--ax-border)] p-5">
            <h2 className="text-[var(--ax-heading)] text-sm font-semibold mb-3">Submission</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Row label="Main goal" value={audit.mainGoal} />
              <Row label="Monthly revenue" value={audit.monthlyRevenue} />
              <Row label="Employees" value={audit.employees} />
              <Row label="Budget" value={audit.budget} />
              <Row label="Timeline" value={audit.timeline} />
              <Row label="Sales cycle" value={audit.salesCycleLength} />
              <Row label="Support volume" value={audit.supportVolume} />
              <Row label="Leads per month" value={audit.leadsPerMonth} />
              <Row label="Automation level" value={audit.currentAutomationLevel} />
              <Row label="Tools" value={(audit.tools || []).join(', ') || null} />
              <Row label="Repetitive tasks" value={audit.repetitiveTasks} full />
              <Row label="Bottleneck" value={audit.bottleneck} full />
            </dl>
          </section>

          {/* Report error */}
          {r?.error && (
            <section className="rounded-[var(--ax-radius-panel)] bg-[var(--ax-surface)] border border-[var(--ax-error)]/25 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-[var(--ax-error)] shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <h2 className="text-[var(--ax-heading)] text-sm font-semibold">Report generation failed</h2>
                  <p className="text-xs text-[var(--ax-muted)] mt-1">{r.error}</p>
                  <button
                    onClick={regenerate}
                    className="mt-2 text-xs text-[var(--ax-accent)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)]"
                  >
                    Retry generation
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* AI Report */}
          {r && !r.error && r.opportunities && (
            <section className="rounded-[var(--ax-radius-panel)] bg-[var(--ax-surface)] border border-[var(--ax-border)] p-5">
              <h2 className="text-[var(--ax-heading)] text-sm font-semibold mb-3">AI Report</h2>
              {r.executive_summary && (
                <p className="text-[var(--ax-muted)] text-sm leading-relaxed mb-4">{r.executive_summary}</p>
              )}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <Stat
                  label="Monthly savings"
                  value={`$${(r.total_monthly_savings_usd || 0).toLocaleString()}`}
                />
                <Stat label="Hours/mo saved" value={r.total_hours_saved_per_month || 0} />
                <Stat label="Est. days" value={r.implementation_timeline_days || 0} />
              </div>
              <div className="space-y-2">
                {(r.opportunities || []).map((o, i) => (
                  <div
                    key={i}
                    className="rounded-[var(--ax-radius-control)] bg-[var(--ax-bg)] border border-[var(--ax-border)] p-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[var(--ax-heading)] font-medium text-sm">{o.title}</h3>
                      <span className="ax-mono-label shrink-0">{o.priority}</span>
                    </div>
                    <p className="mt-1.5 text-[var(--ax-muted)] text-xs leading-relaxed">{o.description}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-[var(--ax-muted-2)] ax-nums">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                        ${(o.monthly_savings_usd || 0).toLocaleString()}/mo
                      </span>
                      <span>{o.estimated_hours_saved_per_month || 0}h saved</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ---- Right: manage panel ---- */}
        <div>
          <section className="rounded-[var(--ax-radius-panel)] bg-[var(--ax-surface)] border border-[var(--ax-border)] p-5 space-y-4">
            <h2 className="text-[var(--ax-heading)] text-sm font-semibold">Manage</h2>

            <div>
              <label htmlFor="audit-status" className="ax-mono-label block mb-1.5">Status</label>
              <select
                id="audit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                data-testid="audit-status-select"
                className="w-full bg-[var(--ax-bg)] border border-[var(--ax-border)] rounded-[var(--ax-radius-control)] px-3 py-2 text-sm text-[var(--ax-heading)] focus:outline-none focus:border-[var(--ax-accent)] cursor-pointer min-h-[44px] transition-colors"
              >
                <option value="new">New</option>
                <option value="in-progress">In progress</option>
                <option value="delivered">Delivered</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label htmlFor="audit-notes" className="ax-mono-label block mb-1.5">Internal notes</label>
              <textarea
                id="audit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                data-testid="audit-notes-textarea"
                className="w-full bg-[var(--ax-bg)] border border-[var(--ax-border)] rounded-[var(--ax-radius-control)] px-3 py-2 text-sm text-[var(--ax-heading)] focus:outline-none focus:border-[var(--ax-accent)] resize-y transition-colors"
              />
            </div>

            <button
              onClick={save}
              disabled={saving}
              data-testid="audit-save-button"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-[var(--ax-radius-control)] bg-[var(--ax-accent)] text-[var(--ax-on-accent)] px-4 min-h-[44px] text-sm font-semibold hover:bg-[var(--ax-accent-dim)] focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, full }) => (
  <div className={full ? 'sm:col-span-2' : ''}>
    <dt className="ax-mono-label">{label}</dt>
    <dd className="mt-0.5 text-[var(--ax-text)] text-sm">{value || 'n/a'}</dd>
  </div>
);

const Stat = ({ label, value }) => (
  <div className="rounded-[var(--ax-radius-control)] bg-[var(--ax-bg)] border border-[var(--ax-border)] p-3">
    <div className="ax-mono-label mb-0.5">{label}</div>
    <div className="text-[var(--ax-heading)] text-base font-semibold ax-nums">{value}</div>
  </div>
);

export default AdminAuditDetail;
