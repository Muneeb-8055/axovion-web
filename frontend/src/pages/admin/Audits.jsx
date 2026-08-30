import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { LeadScoreBadge, StatusBadge } from './Dashboard';
import { Search, Trash2, RefreshCw, Eye, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

/* ---------------------------------------------------------------
   Skeleton row for loading state
--------------------------------------------------------------- */
const SkeletonRow = () => (
  <tr className="border-b border-white/5" aria-hidden="true">
    {[40, 60, 70, 30, 40, 35, 20].map((w, i) => (
      <td key={i} className="px-4 py-2.5">
        <div
          className="h-3 rounded-sm bg-white/6 animate-pulse"
          style={{ width: `${w}%` }}
        />
      </td>
    ))}
  </tr>
);

/* ---------------------------------------------------------------
   Confirm-delete dialog state managed inline
--------------------------------------------------------------- */
const AdminAudits = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [leadScore, setLeadScore] = useState('');
  const [q, setQ] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (status) params.status = status;
      if (leadScore) params.lead_score = leadScore;
      const res = await adminApi.listAudits(params);
      setItems(res.data);
    } catch {
      setError('Could not load audits. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [status, leadScore]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = (id) => setPendingDelete(id);
  const cancelDelete = () => setPendingDelete(null);

  const executeDelete = async () => {
    const id = pendingDelete;
    setPendingDelete(null);
    try {
      await adminApi.deleteAudit(id);
      toast.success('Audit deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = items.filter((a) => {
    if (!q) return true;
    const v = `${a.businessName} ${a.industry} ${a.contactEmail}`.toLowerCase();
    return v.includes(q.toLowerCase());
  });

  return (
    <div className="py-6 px-4 md:px-8 space-y-4" data-testid="admin-audits-page">
      {/* ---- Header ---- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="ax-mono-label mb-1">Audits</p>
          <h1 className="text-[var(--ax-heading)] text-xl md:text-2xl font-semibold tracking-tight">
            AI Audit submissions
          </h1>
          {!loading && !error && (
            <p className="text-[var(--ax-muted-2)] text-xs mt-0.5 ax-nums">
              {filtered.length} of {items.length} shown
            </p>
          )}
        </div>
        <button
          onClick={load}
          className="self-start inline-flex items-center gap-1.5 text-xs text-[var(--ax-muted)] hover:text-[var(--ax-heading)] min-h-[44px] px-3 rounded-[var(--ax-radius-control)] focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] transition-colors"
          aria-label="Refresh audit list"
        >
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* ---- Filters ---- */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search
            className="h-3.5 w-3.5 text-[var(--ax-muted-2)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search business, industry, email..."
            aria-label="Search audits"
            data-testid="admin-audits-search"
            className="w-full bg-[var(--ax-surface)] border border-[var(--ax-border)] rounded-[var(--ax-radius-control)] pl-9 pr-3 py-2 text-sm text-[var(--ax-heading)] placeholder:text-[var(--ax-muted-2)] focus:outline-none focus:border-[var(--ax-accent)] min-h-[36px] transition-colors"
          />
        </div>
        <label className="sr-only" htmlFor="filter-status">Filter by status</label>
        <select
          id="filter-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          data-testid="admin-audits-filter-status"
          className="bg-[var(--ax-surface)] border border-[var(--ax-border)] rounded-[var(--ax-radius-control)] px-3 py-2 text-sm text-[var(--ax-heading)] focus:outline-none focus:border-[var(--ax-accent)] min-h-[36px] cursor-pointer"
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="in-progress">In progress</option>
          <option value="delivered">Delivered</option>
          <option value="closed">Closed</option>
        </select>
        <label className="sr-only" htmlFor="filter-leadscore">Filter by lead score</label>
        <select
          id="filter-leadscore"
          value={leadScore}
          onChange={(e) => setLeadScore(e.target.value)}
          data-testid="admin-audits-filter-leadscore"
          className="bg-[var(--ax-surface)] border border-[var(--ax-border)] rounded-[var(--ax-radius-control)] px-3 py-2 text-sm text-[var(--ax-heading)] focus:outline-none focus:border-[var(--ax-accent)] min-h-[36px] cursor-pointer"
        >
          <option value="">All scores</option>
          <option value="hot">Hot</option>
          <option value="warm">Warm</option>
          <option value="cold">Cold</option>
        </select>
      </div>

      {/* ---- Error state ---- */}
      {error && (
        <div className="flex items-start gap-3 rounded-[var(--ax-radius-panel)] bg-[var(--ax-surface)] border border-[var(--ax-error)]/25 p-4">
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
      )}

      {/* ---- Table ---- */}
      {!error && (
        <div
          className="rounded-[var(--ax-radius-panel)] bg-[var(--ax-surface)] border border-[var(--ax-border)] overflow-hidden"
          data-testid="admin-audits-table"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="bg-[var(--ax-bg)] border-b border-[var(--ax-border)] text-left">
                  <Th scope="col">Business</Th>
                  <Th scope="col">Industry</Th>
                  <Th scope="col">Contact</Th>
                  <Th scope="col">Score</Th>
                  <Th scope="col">Status</Th>
                  <Th scope="col">Date</Th>
                  <Th scope="col"><span className="sr-only">Actions</span></Th>
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="h-7 w-7 text-[var(--ax-muted-2)]" strokeWidth={1.5} aria-hidden="true" />
                        <p className="text-sm text-[var(--ax-muted)]">
                          {q || status || leadScore ? 'No audits match the current filters.' : 'No audit submissions yet.'}
                        </p>
                        {(q || status || leadScore) && (
                          <button
                            onClick={() => { setQ(''); setStatus(''); setLeadScore(''); }}
                            className="text-xs text-[var(--ax-accent)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)]"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && filtered.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-[var(--ax-border)] hover:bg-white/[0.02] transition-colors"
                    data-testid={`audit-row-${a.id}`}
                  >
                    <Td>
                      <Link
                        to={`/admin/audits/${a.id}`}
                        className="text-[var(--ax-heading)] font-semibold hover:text-[var(--ax-accent)] focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] transition-colors"
                      >
                        {a.businessName}
                      </Link>
                      {a.report?.total_monthly_savings_usd ? (
                        <div className="text-[var(--ax-success)] text-xs ax-nums mt-0.5">
                          ${a.report.total_monthly_savings_usd.toLocaleString()}/mo
                        </div>
                      ) : null}
                    </Td>
                    <Td>{a.industry}</Td>
                    <Td>
                      <a
                        href={`mailto:${a.contactEmail}`}
                        className="text-[var(--ax-muted)] hover:text-[var(--ax-accent)] focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] transition-colors"
                      >
                        {a.contactEmail}
                      </a>
                    </Td>
                    <Td><LeadScoreBadge score={a.lead_score} /></Td>
                    <Td><StatusBadge status={a.status} /></Td>
                    <Td className="ax-nums text-xs text-[var(--ax-muted-2)]">
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'n/a'}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/admin/audits/${a.id}`}
                          aria-label={`View audit for ${a.businessName}`}
                          className="h-[44px] w-[44px] inline-flex items-center justify-center rounded-[var(--ax-radius-control)] text-[var(--ax-muted)] hover:text-[var(--ax-heading)] hover:bg-white/6 focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                        </Link>
                        <button
                          onClick={() => confirmDelete(a.id)}
                          aria-label={`Delete audit for ${a.businessName}`}
                          data-testid={`audit-delete-${a.id}`}
                          className="h-[44px] w-[44px] inline-flex items-center justify-center rounded-[var(--ax-radius-control)] text-[var(--ax-muted)] hover:text-[var(--ax-error)] hover:bg-white/6 focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- Confirm delete dialog ---- */}
      {pendingDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm deletion"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
        >
          <div className="w-full max-w-sm bg-[var(--ax-surface-2)] border border-[var(--ax-border-strong)] rounded-[var(--ax-radius-panel)] p-6 space-y-4">
            <h2 className="text-[var(--ax-heading)] font-semibold text-base">Delete this audit?</h2>
            <p className="text-sm text-[var(--ax-muted)]">
              This action cannot be undone. The audit record and its generated report will be permanently removed.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm text-[var(--ax-muted)] hover:text-[var(--ax-heading)] rounded-[var(--ax-radius-control)] bg-[var(--ax-surface)] border border-[var(--ax-border)] focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] min-h-[44px] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 text-sm font-semibold text-white rounded-[var(--ax-radius-control)] bg-[var(--ax-error)]/90 hover:bg-[var(--ax-error)] focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] min-h-[44px] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Th = ({ children, scope }) => (
  <th
    scope={scope}
    className="px-4 py-2.5 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ax-muted-2)] font-normal"
  >
    {children}
  </th>
);

const Td = ({ children, className = '' }) => (
  <td className={`px-4 py-2.5 ${className}`}>{children}</td>
);

export default AdminAudits;
