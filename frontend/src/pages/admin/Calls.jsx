import React, { useEffect, useRef, useState, useCallback } from 'react';
import { adminApi } from '../../lib/api';
import {
  RefreshCw, Phone, AlertCircle, CheckCircle2, AlertTriangle,
  PhoneOff, PhoneMissed, Clock, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

// ---- status config ---------------------------------------------------------------

const STATUS_META = {
  scheduled:    { label: 'Scheduled',   icon: Clock,        color: 'var(--ax-warn)' },
  'in-progress':{ label: 'In Progress', icon: Phone,        color: 'var(--ax-accent)' },
  completed:    { label: 'Completed',   icon: CheckCircle2, color: 'var(--ax-success)' },
  failed:       { label: 'Failed',      icon: AlertTriangle, color: 'var(--ax-error)' },
  'no-answer':  { label: 'No Answer',   icon: PhoneMissed,  color: 'var(--ax-muted)' },
};

function getStatusMeta(s) { return STATUS_META[s] || STATUS_META['no-answer']; }

// ---- helpers ---------------------------------------------------------------

function formatDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function relativeTime(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  const diff = new Date() - d;
  if (diff < 0) return formatDate(raw); // future (scheduled)
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 7 * 86400000) return `${Math.floor(diff / 86400000)}d ago`;
  return formatDate(raw);
}

// ---- ProviderCard ---------------------------------------------------------------

function ProviderCard({ name, ok, detail, loading }) {
  return (
    <div style={{
      background: 'var(--ax-surface)',
      border: `1px solid ${ok ? 'rgba(16,185,129,0.22)' : 'var(--ax-border)'}`,
      borderRadius: 'var(--ax-radius-panel)',
      padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ color: 'var(--ax-heading)', fontWeight: 600, fontSize: 13 }}>{name}</span>
        {loading
          ? <Loader2 size={14} strokeWidth={1.5} style={{ color: 'var(--ax-muted)', animation: 'spin 0.8s linear infinite' }} />
          : ok
            ? <CheckCircle2 size={14} strokeWidth={1.5} style={{ color: 'var(--ax-success)' }} />
            : <AlertTriangle size={14} strokeWidth={1.5} style={{ color: 'var(--ax-warn)' }} />
        }
      </div>
      {/* hairline */}
      <div style={{ height: 1, background: 'var(--ax-border)', marginBottom: 8 }} />
      <p style={{ color: 'var(--ax-muted)', fontSize: 12, margin: 0 }}>{detail}</p>
    </div>
  );
}

// ---- CallRow (timeline entry) ---------------------------------------------------------------

function CallRow({ call, index }) {
  const ref = useRef(null);
  const meta = getStatusMeta(call.status);
  const StatusIcon = meta.icon;
  const note = call.error || call.outcome;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transitionDelay = `${index * 35}ms`;
          el.classList.add('ax-reveal-in');
          obs.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [index]);

  return (
    <article
      ref={ref}
      className="ax-reveal"
      data-testid={`call-row-${call.id}`}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '14px 20px',
        borderBottom: '1px solid var(--ax-border)',
        transition: 'background var(--ax-duration-fast)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      {/* status icon circle */}
      <div
        aria-label={meta.label}
        style={{
          flexShrink: 0, marginTop: 2,
          width: 32, height: 32,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: meta.color + '18',
        }}
      >
        <StatusIcon size={14} strokeWidth={1.5} style={{ color: meta.color }} />
      </div>

      {/* main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* row 1: lead name + time */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <p style={{ color: 'var(--ax-heading)', fontWeight: 600, fontSize: 13, margin: 0 }}>
            {call.leadName || 'Unknown lead'}
          </p>
          <time
            dateTime={call.scheduledAt}
            title={formatDate(call.scheduledAt)}
            className="ax-nums"
            style={{ fontSize: 11, color: 'var(--ax-muted-2)', flexShrink: 0 }}
          >
            {relativeTime(call.scheduledAt)}
          </time>
        </div>

        {/* row 2: phone + provider + status pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5, flexWrap: 'wrap' }}>
          {call.phone && (
            <span
              className="ax-nums"
              style={{ fontSize: 12, color: 'var(--ax-muted)', letterSpacing: '0.04em' }}
            >
              {call.phone}
            </span>
          )}
          {call.provider && (
            <span
              className="ax-nums"
              style={{
                fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--ax-muted-2)',
                background: 'var(--ax-surface-2)',
                borderRadius: 'var(--ax-radius-pill)',
                padding: '2px 7px',
              }}
            >
              {call.provider}
            </span>
          )}
          <span
            style={{
              fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: meta.color,
              background: meta.color + '1a',
              borderRadius: 'var(--ax-radius-pill)',
              padding: '2px 7px',
              border: `1px solid ${meta.color}33`,
            }}
          >
            {meta.label}
          </span>
        </div>

        {/* row 3: outcome / error note */}
        {note && (
          <p style={{
            marginTop: 6, fontSize: 12,
            color: call.error ? 'var(--ax-error)' : 'var(--ax-muted)',
            lineHeight: 1.4,
          }}>
            {note}
          </p>
        )}
      </div>
    </article>
  );
}

// ---- Skeleton ---------------------------------------------------------------

function CallsSkeleton({ n }) {
  return (
    <div>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          padding: '14px 20px',
          borderBottom: '1px solid var(--ax-border)',
        }}>
          <div className="skel" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="skel" style={{ width: 140, height: 13, borderRadius: 4 }} />
              <div className="skel" style={{ width: 52, height: 11, borderRadius: 4 }} />
            </div>
            <div className="skel" style={{ width: '55%', height: 11, borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Main ---------------------------------------------------------------

export default function AdminCalls() {
  const [items, setItems] = useState([]);
  const [health, setHealth] = useState(null);
  const [agents, setAgents] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | error | ok

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [callsRes, healthRes, agentsRes] = await Promise.all([
        adminApi.listCalls(),
        adminApi.callsHealth(),
        adminApi.retellAgents().catch(() => ({ data: [] })),
      ]);
      setItems(callsRes.data);
      setHealth(healthRes.data);
      setAgents(agentsRes.data || []);
      setStatus('ok');
    } catch {
      setStatus('error');
      toast.error('Failed to load calls');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const completedCount = items.filter((c) => c.status === 'completed').length;

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skel { background: linear-gradient(90deg, var(--ax-surface) 0%, var(--ax-surface-2) 50%, var(--ax-surface) 100%); background-size: 200% 100%; animation: shimmer 1.4s ease-in-out infinite; }
      `}</style>

      <div data-testid="admin-calls-page" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ax-mono-label" style={{ marginBottom: 6 }}>Calls</div>
            <h1 style={{ color: 'var(--ax-heading)', fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
              AI call log
            </h1>
            {status === 'ok' && items.length > 0 && (
              <p style={{ fontSize: 12, color: 'var(--ax-muted)', marginTop: 4 }}>
                <span className="ax-nums">{completedCount}</span> completed of <span className="ax-nums">{items.length}</span> total
              </p>
            )}
          </div>

          <button
            onClick={load}
            aria-label="Refresh call log"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: 'var(--ax-muted)',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 10px', borderRadius: 'var(--ax-radius-control)', minHeight: 44,
              transition: 'color var(--ax-duration-fast)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ax-heading)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ax-muted)'; }}
          >
            <RefreshCw size={13} strokeWidth={1.5} />
            Refresh
          </button>
        </div>

        {/* provider status row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12,
        }}>
          <ProviderCard
            name="Retell (Primary)"
            ok={health?.retell}
            loading={status === 'loading'}
            detail={status === 'ok' ? `${agents.length} agent${agents.length !== 1 ? 's' : ''} configured` : 'Loading...'}
          />
          <ProviderCard
            name="Vapi (Fallback)"
            ok={health?.vapi}
            loading={status === 'loading'}
            detail={
              status === 'ok'
                ? health?.vapi
                  ? 'Reachable'
                  : 'Add a private API key in settings to activate'
                : 'Loading...'
            }
          />
          <div style={{
            background: 'var(--ax-surface)',
            border: '1px solid var(--ax-border)',
            borderRadius: 'var(--ax-radius-panel)',
            padding: '16px 18px',
          }}>
            <p style={{ color: 'var(--ax-muted-2)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }}>
              Setup
            </p>
            <div style={{ height: 1, background: 'var(--ax-border)', marginBottom: 8 }} />
            <p style={{ color: 'var(--ax-muted)', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
              Configure a Retell agent at{' '}
              <a
                href="https://dashboard.retellai.com"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--ax-accent)', textDecoration: 'none' }}
              >
                dashboard.retellai.com
              </a>
              {' '}to place outbound calls.
            </p>
          </div>
        </div>

        {/* call log panel */}
        <div style={{
          background: 'var(--ax-surface)',
          border: '1px solid var(--ax-border)',
          borderRadius: 'var(--ax-radius-panel)',
          overflow: 'hidden',
        }}>
          {/* loading skeleton */}
          {status === 'loading' && <CallsSkeleton n={5} />}

          {/* error */}
          {status === 'error' && (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <AlertCircle size={28} strokeWidth={1.5} style={{ color: 'var(--ax-error)', marginBottom: 12 }} />
              <p style={{ color: 'var(--ax-heading)', fontWeight: 600, marginBottom: 6 }}>Could not load call log</p>
              <p style={{ color: 'var(--ax-muted)', fontSize: 13, marginBottom: 20 }}>
                The API may be unreachable. Check credentials and try again.
              </p>
              <button
                onClick={load}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'var(--ax-surface-2)', border: '1px solid var(--ax-border-strong)',
                  borderRadius: 'var(--ax-radius-control)', color: 'var(--ax-heading)',
                  padding: '10px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', minHeight: 44,
                }}
              >
                <RefreshCw size={13} strokeWidth={1.5} /> Retry
              </button>
            </div>
          )}

          {/* empty */}
          {status === 'ok' && items.length === 0 && (
            <div style={{ padding: '56px 24px', textAlign: 'center' }}>
              <PhoneOff size={32} strokeWidth={1.5} style={{ color: 'var(--ax-muted)', marginBottom: 14 }} />
              <p style={{ color: 'var(--ax-heading)', fontWeight: 600, marginBottom: 6 }}>No calls logged yet</p>
              <p style={{ color: 'var(--ax-muted)', fontSize: 13 }}>
                Trigger a call from an audit detail page. It will appear here once initiated.
              </p>
            </div>
          )}

          {/* call list */}
          {status === 'ok' && items.length > 0 && (
            <div>
              {/* column header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '32px 1fr',
                gap: 14, padding: '10px 20px',
                borderBottom: '1px solid var(--ax-border)',
                background: 'var(--ax-bg)',
              }}>
                <div />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="ax-mono-label" style={{ fontSize: 10, marginBottom: 0 }}>Lead / Status / Outcome</span>
                  <span className="ax-mono-label" style={{ fontSize: 10, marginBottom: 0 }}>Scheduled</span>
                </div>
              </div>
              {items.map((call, i) => (
                <CallRow key={call.id} call={call} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
