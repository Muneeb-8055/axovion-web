import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  MessageSquare,
  CalendarCheck,
  TrendingUp,
  ArrowRight,
  Mail,
  Phone,
  KanbanSquare,
  Flame,
  AlertCircle,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { adminApi } from '../../lib/api';

/* ---- Skeleton primitives ---- */
const Skel = ({ style }) => (
  <div
    aria-hidden="true"
    style={{
      background: 'var(--ax-surface-2)',
      borderRadius: 6,
      animation: 'ax-pulse 1.4s ease-in-out infinite',
      ...style,
    }}
  />
);

/* ---- Four-state shell ---- */
function DataShell({ loading, error, empty, onRetry, children }) {
  if (loading) return children; // caller renders skeletons
  if (error) {
    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <AlertCircle strokeWidth={1.5} style={{ width: 28, height: 28, color: 'var(--ax-error)' }} />
        <p style={{ color: 'var(--ax-text)', fontSize: 14, margin: 0 }}>
          Failed to load dashboard data. Check your connection or try again.
        </p>
        <button
          onClick={onRetry}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            border: '1px solid var(--ax-border)',
            borderRadius: 'var(--ax-radius-control)',
            background: 'transparent',
            color: 'var(--ax-text)',
            fontSize: 13,
            cursor: 'pointer',
            minHeight: 44,
          }}
        >
          <RefreshCw strokeWidth={1.5} style={{ width: 13, height: 13 }} /> Retry
        </button>
      </div>
    );
  }
  if (empty) return empty;
  return children;
}

/* ---- Stat card ---- */
function StatCard({ icon: Icon, label, value, sub, accent, testId, loading }) {
  return (
    <div
      data-testid={testId}
      style={{
        background: 'var(--ax-surface)',
        border: '1px solid var(--ax-border)',
        borderRadius: 'var(--ax-radius-panel)',
        padding: '14px 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div className="ax-mono-label">{label}</div>
        <Icon
          strokeWidth={1.5}
          aria-hidden="true"
          style={{ width: 14, height: 14, color: accent || 'var(--ax-accent)', flexShrink: 0 }}
        />
      </div>
      {loading ? (
        <>
          <Skel style={{ height: 28, width: '55%', marginBottom: 6 }} />
          <Skel style={{ height: 11, width: '38%' }} />
        </>
      ) : (
        <>
          <div
            className="ax-nums"
            style={{
              color: 'var(--ax-heading)',
              fontSize: 26,
              fontWeight: 500,
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            {value}
          </div>
          <div style={{ color: 'var(--ax-muted-2)', fontSize: 11 }}>{sub}</div>
        </>
      )}
    </div>
  );
}

/* ---- Lead score chip ---- */
export const LeadScoreBadge = ({ score }) => {
  const styles = {
    hot:  { bg: 'rgba(239,68,68,0.12)',  text: 'var(--ax-error)',   border: 'rgba(239,68,68,0.25)' },
    warm: { bg: 'rgba(251,191,36,0.12)', text: 'var(--ax-warn)',    border: 'rgba(251,191,36,0.25)' },
    cold: { bg: 'rgba(59,130,246,0.12)', text: 'var(--ax-info)',    border: 'rgba(59,130,246,0.25)' },
  };
  const s = styles[score] || styles.cold;
  return (
    <span
      className="ax-mono-label"
      style={{
        padding: '2px 7px',
        borderRadius: 'var(--ax-radius-pill)',
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        letterSpacing: '0.12em',
        fontSize: 9,
      }}
    >
      {score || 'cold'}
    </span>
  );
};

/* ---- Status badge ---- */
export const StatusBadge = ({ status }) => {
  const styles = {
    new:          { bg: 'rgba(255,255,255,0.08)', text: 'var(--ax-text)',    border: 'rgba(255,255,255,0.15)' },
    'in-progress':{ bg: 'rgba(0,212,255,0.09)',   text: 'var(--ax-accent)',  border: 'rgba(0,212,255,0.22)' },
    delivered:    { bg: 'rgba(16,185,129,0.1)',    text: 'var(--ax-success)', border: 'rgba(16,185,129,0.22)' },
    closed:       { bg: 'rgba(192,192,200,0.06)',  text: 'var(--ax-muted-2)', border: 'rgba(255,255,255,0.08)' },
  };
  const s = styles[status] || styles.new;
  return (
    <span
      className="ax-mono-label"
      style={{
        padding: '2px 7px',
        borderRadius: 'var(--ax-radius-pill)',
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        letterSpacing: '0.12em',
        fontSize: 9,
      }}
    >
      {status || 'new'}
    </span>
  );
};

/* ---- Mini activity row ---- */
function Mini({ icon: Icon, label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '7px 0',
        borderBottom: '1px solid var(--ax-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon strokeWidth={1.5} aria-hidden="true" style={{ width: 13, height: 13, color: 'var(--ax-muted)' }} />
        <span style={{ color: 'var(--ax-text)', fontSize: 13 }}>{label}</span>
      </div>
      <span className="ax-nums" style={{ color: 'var(--ax-heading)', fontSize: 13, fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}

/* ---- Lead row ---- */
function LeadRow({ label, value, accent }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '9px 14px',
        background: 'var(--ax-surface)',
        border: '1px solid var(--ax-border)',
        borderRadius: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Flame strokeWidth={1.5} aria-hidden="true" style={{ width: 13, height: 13, color: accent }} />
        <div className="ax-mono-label">{label}</div>
      </div>
      <span className="ax-nums" style={{ color: 'var(--ax-heading)', fontSize: 20, fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}

/* ---- Main dashboard ---- */
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setError(false);
    setLoading(true);
    adminApi
      .dashboard()
      .then((r) => setStats(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div data-testid="admin-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Inline keyframes for skeleton pulse */}
      <style>{`
        @keyframes ax-pulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Page heading */}
      <div>
        <div className="ax-mono-label" style={{ color: 'var(--ax-accent)', marginBottom: 4 }}>Dashboard</div>
        <h1
          style={{
            color: 'var(--ax-heading)',
            fontSize: 20,
            fontWeight: 700,
            margin: 0,
            letterSpacing: '-0.02em',
            textWrap: 'balance',
          }}
        >
          At a glance
        </h1>
      </div>

      <DataShell loading={loading} error={error} onRetry={load}>
        {/* Stat cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
          }}
          className="md:grid-cols-4"
        >
          <StatCard loading={loading} label="Audits"     value={stats?.audits?.total ?? 0}        sub={`${stats?.audits?.new ?? 0} new`}     icon={ClipboardList} testId="stat-audits" />
          <StatCard loading={loading} label="Chats"      value={stats?.chats ?? 0}                 sub="sessions"                              icon={MessageSquare} testId="stat-chats" />
          <StatCard loading={loading} label="Bookings"   value={stats?.bookings ?? 0}              sub="requests"                              icon={CalendarCheck} testId="stat-bookings" />
          <StatCard loading={loading} label="Conversion" value={`${stats?.conversion_rate ?? 0}%`} sub="chat to audit"                         icon={TrendingUp}    testId="stat-conversion" accent="var(--ax-success)" />
        </div>

        {/* Lead temperature */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
          }}
        >
          {loading ? (
            [0, 1, 2].map((i) => (
              <Skel key={i} style={{ height: 54, borderRadius: 10 }} />
            ))
          ) : (
            <>
              <LeadRow label="Hot"  value={stats?.leads?.hot  ?? 0} accent="var(--ax-error)" />
              <LeadRow label="Warm" value={stats?.leads?.warm ?? 0} accent="var(--ax-warn)" />
              <LeadRow label="Cold" value={stats?.leads?.cold ?? 0} accent="var(--ax-info)" />
            </>
          )}
        </div>

        {/* Recent audits + activity */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 10,
          }}
          className="lg:grid-cols-3-audit"
        >
          {/* Recent audits */}
          <div
            style={{
              background: 'var(--ax-surface)',
              border: '1px solid var(--ax-border)',
              borderRadius: 'var(--ax-radius-panel)',
              padding: '16px',
              gridColumn: 'span 2',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ color: 'var(--ax-heading)', fontSize: 14, fontWeight: 600, margin: 0 }}>
                Recent audits
              </h2>
              <Link
                to="/admin/audits"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  color: 'var(--ax-accent)',
                  fontSize: 12,
                  textDecoration: 'none',
                }}
              >
                View all
                <ArrowRight strokeWidth={1.5} style={{ width: 11, height: 11 }} />
              </Link>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Skel style={{ height: 13, width: 160, marginBottom: 5 }} />
                      <Skel style={{ height: 10, width: 110 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Skel style={{ height: 18, width: 36, borderRadius: 9999 }} />
                      <Skel style={{ height: 18, width: 60, borderRadius: 9999 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : !stats?.recent_audits || stats.recent_audits.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  padding: '32px 0',
                  textAlign: 'center',
                }}
              >
                <FileText strokeWidth={1.5} style={{ width: 24, height: 24, color: 'var(--ax-muted-2)' }} />
                <p style={{ color: 'var(--ax-muted)', fontSize: 13, margin: 0 }}>No audits yet.</p>
                <Link
                  to="/audit"
                  style={{
                    color: 'var(--ax-accent)',
                    fontSize: 13,
                    textDecoration: 'none',
                    padding: '8px 14px',
                    border: '1px solid rgba(0,212,255,0.22)',
                    borderRadius: 'var(--ax-radius-control)',
                    minHeight: 36,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  Submit a test audit
                </Link>
              </div>
            ) : (
              <div>
                {stats.recent_audits.map((a, idx) => (
                  <Link
                    key={a.id}
                    to={`/admin/audits/${a.id}`}
                    data-testid={`recent-audit-${a.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 8px',
                      borderTop: idx === 0 ? 'none' : '1px solid var(--ax-border)',
                      borderRadius: 8,
                      textDecoration: 'none',
                      transition: 'background 160ms ease',
                      margin: '0 -8px',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          color: 'var(--ax-heading)',
                          fontSize: 13,
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {a.businessName}
                      </div>
                      <div
                        style={{
                          color: 'var(--ax-muted-2)',
                          fontSize: 11,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginTop: 2,
                        }}
                      >
                        {a.industry} - {a.contactEmail}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 10 }}>
                      <LeadScoreBadge score={a.lead_score} />
                      <StatusBadge status={a.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Activity */}
          <div
            style={{
              background: 'var(--ax-surface)',
              border: '1px solid var(--ax-border)',
              borderRadius: 'var(--ax-radius-panel)',
              padding: '16px',
            }}
          >
            <h2 style={{ color: 'var(--ax-heading)', fontSize: 14, fontWeight: 600, margin: '0 0 10px 0' }}>
              Activity
            </h2>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--ax-border)' }}>
                    <Skel style={{ height: 13, width: 100 }} />
                    <Skel style={{ height: 13, width: 28 }} />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <Mini icon={Mail}         label="Emails sent"  value={stats?.emails ?? 0} />
                <Mini icon={Phone}        label="Calls logged" value={stats?.calls ?? 0} />
                <Mini icon={KanbanSquare} label="Open tasks"   value={stats?.tasks?.open ?? 0} />
                <Mini icon={ClipboardList} label="Total tasks" value={stats?.tasks?.total ?? 0} />
              </>
            )}
          </div>
        </div>
      </DataShell>
    </div>
  );
};

export default AdminDashboard;
