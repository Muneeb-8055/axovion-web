import React, { useEffect, useRef, useState, useCallback } from 'react';
import { adminApi } from '../../lib/api';
import {
  Save, RefreshCw, AlertCircle, Loader2,
  Building2, Mail, Phone, Bot, CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

// ---- helpers ---------------------------------------------------------------

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ---- Atoms ---------------------------------------------------------------

function Label({ htmlFor, text, help }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <label
        htmlFor={htmlFor}
        style={{ display: 'block', fontSize: 13, color: 'var(--ax-heading)', fontWeight: 500 }}
      >
        {text}
      </label>
      {help && (
        <p style={{ fontSize: 11, color: 'var(--ax-muted-2)', marginTop: 3, lineHeight: 1.4 }}>
          {help}
        </p>
      )}
    </div>
  );
}

const inputBaseStyle = {
  width: '100%',
  boxSizing: 'border-box',
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

function TextField({ id, value, onChange, placeholder, type = 'text', testId }) {
  return (
    <input
      id={id}
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      data-testid={testId}
      style={inputBaseStyle}
      onFocus={(e) => { e.target.style.borderColor = 'rgba(0,212,255,0.45)'; }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--ax-border)'; }}
    />
  );
}

function NumberField({ id, value, onChange, testId, min }) {
  return (
    <input
      id={id}
      type="number"
      value={value ?? 0}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      data-testid={testId}
      style={{ ...inputBaseStyle, fontFamily: "'JetBrains Mono', monospace" }}
      onFocus={(e) => { e.target.style.borderColor = 'rgba(0,212,255,0.45)'; }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--ax-border)'; }}
    />
  );
}

function TextareaField({ id, value, onChange, rows, placeholder, testId }) {
  return (
    <textarea
      id={id}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      data-testid={testId}
      style={{ ...inputBaseStyle, resize: 'vertical', lineHeight: 1.5 }}
      onFocus={(e) => { e.target.style.borderColor = 'rgba(0,212,255,0.45)'; }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--ax-border)'; }}
    />
  );
}

function Toggle({ id, checked, onChange, testId }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44 }}>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        data-testid={testId}
        style={{
          width: 40, height: 22,
          borderRadius: 'var(--ax-radius-pill)',
          background: checked ? 'var(--ax-accent)' : 'var(--ax-border-strong)',
          border: 'none', cursor: 'pointer',
          position: 'relative',
          transition: 'background var(--ax-duration-fast)',
          flexShrink: 0,
          outline: 'none',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3, left: checked ? 21 : 3,
            width: 16, height: 16,
            borderRadius: '50%',
            background: '#fff',
            transition: 'left var(--ax-duration-fast)',
          }}
        />
      </button>
      <span style={{ fontSize: 13, color: checked ? 'var(--ax-text)' : 'var(--ax-muted)' }}>
        {checked ? 'Enabled' : 'Disabled'}
      </span>
    </div>
  );
}

// ---- Section ---------------------------------------------------------------

function Section({ icon: Icon, title, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('ax-reveal-in');
          obs.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="ax-reveal"
      style={{
        background: 'var(--ax-surface)',
        border: '1px solid var(--ax-border)',
        borderRadius: 'var(--ax-radius-panel)',
        overflow: 'hidden',
      }}
    >
      {/* section header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 20px',
        borderBottom: '1px solid var(--ax-border)',
        background: 'var(--ax-bg)',
      }}>
        <Icon size={15} strokeWidth={1.5} style={{ color: 'var(--ax-accent)', flexShrink: 0 }} />
        <h2 style={{ color: 'var(--ax-heading)', fontSize: 13, fontWeight: 600, margin: 0 }}>
          {title}
        </h2>
      </div>

      {/* section body */}
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </section>
  );
}

// ---- FieldRow ---------------------------------------------------------------

function FieldRow({ label, help, children, wide }) {
  return (
    <div style={{ gridColumn: wide ? '1 / -1' : undefined }}>
      <Label text={label} help={help} />
      {children}
    </div>
  );
}

// ---- Skeleton ---------------------------------------------------------------

function SettingsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[4, 3, 3, 2].map((fields, si) => (
        <div key={si} style={{
          background: 'var(--ax-surface)',
          border: '1px solid var(--ax-border)',
          borderRadius: 'var(--ax-radius-panel)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--ax-border)', background: 'var(--ax-bg)' }}>
            <div className="skel" style={{ width: 120, height: 14, borderRadius: 4 }} />
          </div>
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {Array.from({ length: fields }).map((_, i) => (
              <div key={i}>
                <div className="skel" style={{ width: 90, height: 12, borderRadius: 4, marginBottom: 8 }} />
                <div className="skel" style={{ width: '100%', height: 40, borderRadius: 'var(--ax-radius-control)' }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Main ---------------------------------------------------------------

export default function AdminSettings() {
  const [saved, setSaved] = useState(null);   // last confirmed server state
  const [form, setForm] = useState(null);     // live form state
  const [loadStatus, setLoadStatus] = useState('loading'); // loading | error | ok
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const load = useCallback(async () => {
    setLoadStatus('loading');
    try {
      const r = await adminApi.getSettings();
      setSaved(r.data);
      setForm(r.data);
      setLoadStatus('ok');
    } catch {
      setLoadStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  }, []);

  const isDirty = form && saved && !deepEqual(form, saved);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const r = await adminApi.updateSettings(form);
      setSaved(r.data);
      setForm(r.data);
      setSaveSuccess(true);
      toast.success('Settings saved');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      toast.error('Save failed. Your changes are still unsaved.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setForm(saved);
    setSaveSuccess(false);
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 20,
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skel { background: linear-gradient(90deg, var(--ax-surface) 0%, var(--ax-surface-2) 50%, var(--ax-surface) 100%); background-size: 200% 100%; animation: shimmer 1.4s ease-in-out infinite; }
      `}</style>

      <div data-testid="admin-settings-page" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ax-mono-label" style={{ marginBottom: 6 }}>Settings</div>
            <h1 style={{ color: 'var(--ax-heading)', fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
              Configuration
            </h1>
          </div>

          {loadStatus === 'ok' && (
            <button
              onClick={load}
              aria-label="Reload settings from server"
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
              Reload
            </button>
          )}
        </div>

        {/* unsaved-changes banner */}
        {isDirty && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12,
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.22)',
            borderRadius: 'var(--ax-radius-control)',
            padding: '12px 16px',
          }}>
            <p style={{ fontSize: 13, color: 'var(--ax-warn)', margin: 0, fontWeight: 500 }}>
              You have unsaved changes.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleDiscard}
                style={{
                  fontSize: 12, color: 'var(--ax-muted)',
                  background: 'none', border: '1px solid var(--ax-border)',
                  borderRadius: 'var(--ax-radius-control)',
                  padding: '6px 12px', cursor: 'pointer', minHeight: 36,
                }}
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                data-testid="settings-save-button"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 12, color: 'var(--ax-on-accent)',
                  background: 'var(--ax-accent)',
                  border: 'none', borderRadius: 'var(--ax-radius-control)',
                  padding: '6px 14px', cursor: saving ? 'wait' : 'pointer',
                  opacity: saving ? 0.65 : 1, minHeight: 36,
                  fontWeight: 600,
                }}
              >
                {saving
                  ? <Loader2 size={12} strokeWidth={1.5} style={{ animation: 'spin 0.8s linear infinite' }} />
                  : <Save size={12} strokeWidth={1.5} />
                }
                {saving ? 'Saving...' : 'Save now'}
              </button>
            </div>
          </div>
        )}

        {/* save-success confirmation */}
        {saveSuccess && !isDirty && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.22)',
            borderRadius: 'var(--ax-radius-control)',
            padding: '12px 16px',
          }}>
            <CheckCircle2 size={14} strokeWidth={1.5} style={{ color: 'var(--ax-success)', flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: 'var(--ax-success)', margin: 0, fontWeight: 500 }}>
              Settings saved successfully.
            </p>
          </div>
        )}

        {/* loading skeleton */}
        {loadStatus === 'loading' && <SettingsSkeleton />}

        {/* error */}
        {loadStatus === 'error' && (
          <div style={{
            background: 'var(--ax-surface)',
            border: '1px solid var(--ax-border)',
            borderRadius: 'var(--ax-radius-panel)',
            padding: '48px 24px',
            textAlign: 'center',
          }}>
            <AlertCircle size={28} strokeWidth={1.5} style={{ color: 'var(--ax-error)', marginBottom: 12 }} />
            <p style={{ color: 'var(--ax-heading)', fontWeight: 600, marginBottom: 6 }}>Could not load settings</p>
            <p style={{ color: 'var(--ax-muted)', fontSize: 13, marginBottom: 20 }}>
              The server may be unavailable. Check your connection and try again.
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

        {/* form sections */}
        {loadStatus === 'ok' && form && (
          <>
            {/* Business info */}
            <Section icon={Building2} title="Business info">
              <div style={gridStyle}>
                <FieldRow label="Business name">
                  <TextField
                    id="businessName"
                    value={form.businessName}
                    onChange={(v) => set('businessName', v)}
                    placeholder="Axovion Ltd."
                    testId="settings-business-name"
                  />
                </FieldRow>
                <FieldRow label="Contact email">
                  <TextField
                    id="contactEmail"
                    type="email"
                    value={form.contactEmail}
                    onChange={(v) => set('contactEmail', v)}
                    placeholder="hello@example.com"
                    testId="settings-contact-email"
                  />
                </FieldRow>
                <FieldRow label="WhatsApp number" help="Include country code, e.g. +447911123456">
                  <TextField
                    id="whatsapp"
                    value={form.whatsapp}
                    onChange={(v) => set('whatsapp', v)}
                    placeholder="+1 555 000 0000"
                    testId="settings-whatsapp"
                  />
                </FieldRow>
                <FieldRow label="Calendly link" help="Paste the full booking page URL">
                  <TextField
                    id="calendlyLink"
                    type="url"
                    value={form.calendlyLink}
                    onChange={(v) => set('calendlyLink', v)}
                    placeholder="https://calendly.com/you/30min"
                    testId="settings-calendly"
                  />
                </FieldRow>
              </div>
            </Section>

            {/* Email */}
            <Section icon={Mail} title="Email">
              <div style={gridStyle}>
                <FieldRow label="From name" help="Shown in the recipient's inbox">
                  <TextField
                    id="emailFromName"
                    value={form.emailFromName}
                    onChange={(v) => set('emailFromName', v)}
                    placeholder="Axovion Team"
                    testId="settings-email-from-name"
                  />
                </FieldRow>
                <FieldRow label="From address" help="Must be a verified sender in Resend">
                  <TextField
                    id="emailFromAddress"
                    type="email"
                    value={form.emailFromAddress}
                    onChange={(v) => set('emailFromAddress', v)}
                    placeholder="noreply@example.com"
                    testId="settings-email-from-address"
                  />
                </FieldRow>
                <FieldRow
                  label="Auto-send emails"
                  help="When on, the system sends follow-up emails automatically after each audit submission."
                  wide
                >
                  <Toggle
                    id="autoEmailEnabled"
                    checked={!!form.autoEmailEnabled}
                    onChange={(v) => set('autoEmailEnabled', v)}
                    testId="settings-auto-email"
                  />
                </FieldRow>
              </div>
            </Section>

            {/* AI Calling */}
            <Section icon={Phone} title="AI Calling">
              <div style={gridStyle}>
                <FieldRow
                  label="Auto-call high-value leads"
                  help="Triggers an outbound AI call when a new lead exceeds the thresholds below."
                  wide
                >
                  <Toggle
                    id="autoCallEnabled"
                    checked={!!form.autoCallEnabled}
                    onChange={(v) => set('autoCallEnabled', v)}
                    testId="settings-auto-call"
                  />
                </FieldRow>
                <FieldRow
                  label="Revenue threshold (USD)"
                  help="Leads with reported revenue above this amount qualify for auto-call."
                >
                  <NumberField
                    id="highValueRevenueUsd"
                    value={form.highValueRevenueUsd}
                    onChange={(v) => set('highValueRevenueUsd', v)}
                    min={0}
                    testId="settings-revenue-threshold"
                  />
                </FieldRow>
                <FieldRow
                  label="Budget threshold (USD)"
                  help="Leads with a stated budget above this amount also qualify."
                >
                  <NumberField
                    id="highValueBudgetUsd"
                    value={form.highValueBudgetUsd}
                    onChange={(v) => set('highValueBudgetUsd', v)}
                    min={0}
                    testId="settings-budget-threshold"
                  />
                </FieldRow>
              </div>
            </Section>

            {/* Chatbot */}
            <Section icon={Bot} title="Chatbot">
              <FieldRow
                label="System prompt override"
                help="Leave blank to use the default Axovion AI prompt. Override only if you need to restrict topics or add company-specific context."
                wide
              >
                <TextareaField
                  id="chatbotSystemPrompt"
                  value={form.chatbotSystemPrompt}
                  onChange={(v) => set('chatbotSystemPrompt', v)}
                  rows={6}
                  placeholder="You are an assistant for Axovion..."
                  testId="settings-chatbot-prompt"
                />
              </FieldRow>
            </Section>

            {/* bottom save bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
              paddingBottom: 8,
            }}>
              {isDirty && (
                <button
                  onClick={handleDiscard}
                  style={{
                    fontSize: 13, color: 'var(--ax-muted)',
                    background: 'none', border: '1px solid var(--ax-border)',
                    borderRadius: 'var(--ax-radius-control)',
                    padding: '10px 18px', cursor: 'pointer', minHeight: 44,
                    transition: 'color var(--ax-duration-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ax-heading)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ax-muted)'; }}
                >
                  Discard changes
                </button>
              )}

              <button
                onClick={handleSave}
                disabled={saving || !isDirty}
                data-testid="settings-save-button"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: isDirty ? 'var(--ax-accent)' : 'var(--ax-surface-2)',
                  color: isDirty ? 'var(--ax-on-accent)' : 'var(--ax-muted)',
                  border: isDirty ? 'none' : '1px solid var(--ax-border)',
                  borderRadius: 'var(--ax-radius-control)',
                  padding: '11px 22px', fontSize: 13, fontWeight: 600,
                  cursor: saving ? 'wait' : isDirty ? 'pointer' : 'default',
                  opacity: saving ? 0.65 : 1, minHeight: 44,
                  transition: 'background var(--ax-duration-fast), color var(--ax-duration-fast)',
                }}
              >
                {saving
                  ? <Loader2 size={14} strokeWidth={1.5} style={{ animation: 'spin 0.8s linear infinite' }} />
                  : saveSuccess && !isDirty
                    ? <CheckCircle2 size={14} strokeWidth={1.5} />
                    : <Save size={14} strokeWidth={1.5} />
                }
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
