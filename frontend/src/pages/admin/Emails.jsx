import React, { useEffect, useRef, useState, useCallback } from 'react';
import { adminApi } from '../../lib/api';
import {
  RefreshCw, Send, CheckCircle2, XCircle,
  Mail, AlertCircle, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '../../components/ui/dialog';

// ---- helpers ---------------------------------------------------------------

function formatDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function relativeDay(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 7 * 86400000) return `${Math.floor(diff / 86400000)}d ago`;
  return formatDate(raw);
}

// ---- Skeletons ---------------------------------------------------------------

function ThreadSkeleton({ n }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          className="skel-row"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '16px 20px',
            borderBottom: '1px solid var(--ax-border)',
          }}
        >
          <div className="skel" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="skel" style={{ width: 160, height: 13, borderRadius: 4 }} />
              <div className="skel" style={{ width: 56, height: 11, borderRadius: 4 }} />
            </div>
            <div className="skel" style={{ width: '75%', height: 11, borderRadius: 4, marginBottom: 6 }} />
            <div className="skel" style={{ width: '45%', height: 11, borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- EmailRow (timeline entry) ---------------------------------------------------------------

function EmailRow({ item, index }) {
  const ref = useRef(null);
  const sent = item.status === 'sent';

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transitionDelay = `${index * 40}ms`;
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
      data-testid={`email-row-${item.id}`}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '16px 20px',
        borderBottom: '1px solid var(--ax-border)',
        transition: 'background var(--ax-duration-fast)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      {/* status icon */}
      <div
        aria-label={sent ? 'Sent' : 'Failed'}
        style={{
          flexShrink: 0,
          marginTop: 2,
          width: 32, height: 32,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: sent ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
        }}
      >
        {sent
          ? <CheckCircle2 size={15} strokeWidth={1.5} style={{ color: 'var(--ax-success)' }} />
          : <XCircle size={15} strokeWidth={1.5} style={{ color: 'var(--ax-error)' }} />
        }
      </div>

      {/* content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* first line: subject + timestamp */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <p style={{
            color: 'var(--ax-heading)', fontWeight: 600, fontSize: 13,
            margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
          }}>
            {item.subject || '(no subject)'}
          </p>
          {item.sentAt && (
            <time
              dateTime={item.sentAt}
              title={formatDate(item.sentAt)}
              className="ax-nums"
              style={{ fontSize: 11, color: 'var(--ax-muted-2)', flexShrink: 0 }}
            >
              {relativeDay(item.sentAt)}
            </time>
          )}
        </div>

        {/* second line: to + template */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 5, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--ax-muted)' }}>
            To: <span style={{ color: 'var(--ax-text)' }}>{item.toEmail}</span>
          </span>
          {item.template && (
            <span
              className="ax-nums"
              style={{
                fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--ax-muted-2)',
                background: 'var(--ax-surface-2)',
                borderRadius: 'var(--ax-radius-pill)',
                padding: '2px 7px',
              }}
            >
              {item.template}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// ---- SendDialog ---------------------------------------------------------------

const EMPTY_DRAFT = { to: '', subject: '', html: '' };

function SendDialog({ open, onOpenChange, onSent }) {
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const toRef = useRef(null);

  useEffect(() => {
    if (open) {
      setDraft(EMPTY_DRAFT);
      setTimeout(() => toRef.current?.focus(), 60);
    }
  }, [open]);

  const handle = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }));

  const submit = async () => {
    if (!draft.to || !draft.subject || !draft.html) {
      toast.error('To, Subject, and body are required');
      return;
    }
    setBusy(true);
    try {
      const r = await adminApi.sendEmail(draft);
      if (r.data.ok) {
        toast.success('Email sent');
        onOpenChange(false);
        onSent();
      } else {
        toast.error(r.data.error || 'Send failed');
      }
    } catch {
      toast.error('Send failed');
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'var(--ax-bg)',
    border: '1px solid var(--ax-border)',
    borderRadius: 'var(--ax-radius-control)',
    padding: '10px 12px',
    fontSize: 13,
    color: 'var(--ax-heading)',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color var(--ax-duration-fast)',
  };

  const focusOn = (e) => { e.target.style.borderColor = 'rgba(0,212,255,0.45)'; };
  const focusOff = (e) => { e.target.style.borderColor = 'var(--ax-border)'; };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{
          background: 'var(--ax-surface)',
          border: '1px solid var(--ax-border-strong)',
          maxWidth: 560,
          width: '90vw',
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--ax-heading)' }}>Send manual email</DialogTitle>
        </DialogHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--ax-muted)', fontWeight: 500 }}>To</span>
            <input
              ref={toRef}
              type="email"
              value={draft.to}
              onChange={handle('to')}
              data-testid="email-to-input"
              placeholder="recipient@example.com"
              style={inputStyle}
              onFocus={focusOn} onBlur={focusOff}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--ax-muted)', fontWeight: 500 }}>Subject</span>
            <input
              type="text"
              value={draft.subject}
              onChange={handle('subject')}
              data-testid="email-subject-input"
              placeholder="Email subject line"
              style={inputStyle}
              onFocus={focusOn} onBlur={focusOff}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--ax-muted)', fontWeight: 500 }}>HTML body</span>
            <textarea
              value={draft.html}
              onChange={handle('html')}
              data-testid="email-html-input"
              rows={8}
              placeholder="<p>Your message here...</p>"
              style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, resize: 'vertical' }}
              onFocus={focusOn} onBlur={focusOff}
            />
          </label>

          <button
            onClick={submit}
            disabled={busy}
            data-testid="email-form-submit"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'var(--ax-accent)', color: 'var(--ax-on-accent)',
              border: 'none', borderRadius: 'var(--ax-radius-control)',
              padding: '11px 20px', fontSize: 13, fontWeight: 600,
              cursor: busy ? 'wait' : 'pointer',
              opacity: busy ? 0.65 : 1, minHeight: 44,
              transition: 'opacity var(--ax-duration-fast)',
              marginTop: 4,
            }}
          >
            {busy
              ? <Loader2 size={14} strokeWidth={1.5} style={{ animation: 'spin 0.8s linear infinite' }} />
              : <Send size={14} strokeWidth={1.5} />
            }
            {busy ? 'Sending...' : 'Send via Resend'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---- Main ---------------------------------------------------------------

export default function AdminEmails() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | error | ok
  const [composing, setComposing] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const r = await adminApi.listEmails();
      setItems(r.data);
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const sentCount = items.filter((e) => e.status === 'sent').length;

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skel { background: linear-gradient(90deg, var(--ax-surface) 0%, var(--ax-surface-2) 50%, var(--ax-surface) 100%); background-size: 200% 100%; animation: shimmer 1.4s ease-in-out infinite; }
      `}</style>

      <div data-testid="admin-emails-page" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ax-mono-label" style={{ marginBottom: 6 }}>Emails</div>
            <h1 style={{ color: 'var(--ax-heading)', fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
              Email log
            </h1>
            {status === 'ok' && items.length > 0 && (
              <p style={{ fontSize: 12, color: 'var(--ax-muted)', marginTop: 4 }}>
                <span className="ax-nums">{sentCount}</span> of <span className="ax-nums">{items.length}</span> delivered
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={load}
              aria-label="Refresh email log"
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

            <Dialog open={composing} onOpenChange={setComposing}>
              <DialogTrigger asChild>
                <button
                  data-testid="email-send-button"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'var(--ax-accent)', color: 'var(--ax-on-accent)',
                    border: 'none', borderRadius: 'var(--ax-radius-control)',
                    padding: '10px 16px', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', minHeight: 44,
                    transition: 'background var(--ax-duration-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ax-accent-dim)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--ax-accent)'; }}
                >
                  <Send size={14} strokeWidth={1.5} />
                  Send email
                </button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* thread panel */}
        <div
          style={{
            background: 'var(--ax-surface)',
            border: '1px solid var(--ax-border)',
            borderRadius: 'var(--ax-radius-panel)',
            overflow: 'hidden',
          }}
        >
          {/* loading skeleton */}
          {status === 'loading' && <ThreadSkeleton n={6} />}

          {/* error */}
          {status === 'error' && (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <AlertCircle size={28} strokeWidth={1.5} style={{ color: 'var(--ax-error)', marginBottom: 12 }} />
              <p style={{ color: 'var(--ax-heading)', fontWeight: 600, marginBottom: 6 }}>Could not load emails</p>
              <p style={{ color: 'var(--ax-muted)', fontSize: 13, marginBottom: 20 }}>Check your connection and try again.</p>
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
              <Mail size={32} strokeWidth={1.5} style={{ color: 'var(--ax-muted)', marginBottom: 14 }} />
              <p style={{ color: 'var(--ax-heading)', fontWeight: 600, marginBottom: 6 }}>No emails yet</p>
              <p style={{ color: 'var(--ax-muted)', fontSize: 13, marginBottom: 24 }}>Send the first email or wait for automation to trigger one.</p>
              <button
                onClick={() => setComposing(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'var(--ax-accent)', color: 'var(--ax-on-accent)',
                  border: 'none', borderRadius: 'var(--ax-radius-control)',
                  padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 44,
                }}
              >
                <Send size={14} strokeWidth={1.5} /> Send first email
              </button>
            </div>
          )}

          {/* thread list */}
          {status === 'ok' && items.length > 0 && (
            <div>
              {/* column header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr',
                gap: 14,
                padding: '10px 20px',
                borderBottom: '1px solid var(--ax-border)',
                background: 'var(--ax-bg)',
              }}>
                <div />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="ax-mono-label" style={{ fontSize: 10, marginBottom: 0 }}>Subject / Recipient</span>
                  <span className="ax-mono-label" style={{ fontSize: 10, marginBottom: 0 }}>Sent</span>
                </div>
              </div>
              {items.map((item, i) => (
                <EmailRow key={item.id} item={item} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      <SendDialog open={composing} onOpenChange={setComposing} onSent={load} />
    </>
  );
}
