import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => {
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const r = await adminApi.getSettings(); setS(r.data); }
    catch (e) { toast.error('Failed to load settings'); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try { const r = await adminApi.updateSettings(s); setS(r.data); toast.success('Settings saved'); }
    catch (e) { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  if (!s) return <div className="text-[#C0C0C8]/60">Loading…</div>;
  const f = (k, v) => setS((cur) => ({ ...cur, [k]: v }));

  return (
    <div className="space-y-6" data-testid="admin-settings-page">
      <div>
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-2">Settings</div>
        <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Configuration</h1>
      </div>

      <Section title="Business info">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="Business name"><input value={s.businessName || ''} onChange={(e) => f('businessName', e.target.value)} data-testid="settings-business-name" className="ax-input" /></FormField>
          <FormField label="Contact email"><input value={s.contactEmail || ''} onChange={(e) => f('contactEmail', e.target.value)} data-testid="settings-contact-email" className="ax-input" /></FormField>
          <FormField label="WhatsApp"><input value={s.whatsapp || ''} onChange={(e) => f('whatsapp', e.target.value)} data-testid="settings-whatsapp" className="ax-input" /></FormField>
          <FormField label="Calendly link"><input value={s.calendlyLink || ''} onChange={(e) => f('calendlyLink', e.target.value)} data-testid="settings-calendly" className="ax-input" /></FormField>
        </div>
      </Section>

      <Section title="Email">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="From name"><input value={s.emailFromName || ''} onChange={(e) => f('emailFromName', e.target.value)} data-testid="settings-email-from-name" className="ax-input" /></FormField>
          <FormField label="From address"><input value={s.emailFromAddress || ''} onChange={(e) => f('emailFromAddress', e.target.value)} data-testid="settings-email-from-address" className="ax-input" /></FormField>
          <FormField label="Auto-send emails"><input type="checkbox" checked={!!s.autoEmailEnabled} onChange={(e) => f('autoEmailEnabled', e.target.checked)} data-testid="settings-auto-email" className="h-5 w-5 accent-[#00D4FF]" /></FormField>
        </div>
      </Section>

      <Section title="AI Calling">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="Auto-call high-value leads"><input type="checkbox" checked={!!s.autoCallEnabled} onChange={(e) => f('autoCallEnabled', e.target.checked)} data-testid="settings-auto-call" className="h-5 w-5 accent-[#00D4FF]" /></FormField>
          <FormField label="High-value revenue threshold ($)"><input type="number" value={s.highValueRevenueUsd || 0} onChange={(e) => f('highValueRevenueUsd', Number(e.target.value))} data-testid="settings-revenue-threshold" className="ax-input" /></FormField>
          <FormField label="High-value budget threshold ($)"><input type="number" value={s.highValueBudgetUsd || 0} onChange={(e) => f('highValueBudgetUsd', Number(e.target.value))} data-testid="settings-budget-threshold" className="ax-input" /></FormField>
        </div>
      </Section>

      <Section title="Chatbot">
        <FormField label="System prompt override (optional)">
          <textarea value={s.chatbotSystemPrompt || ''} onChange={(e) => f('chatbotSystemPrompt', e.target.value)} rows="6" data-testid="settings-chatbot-prompt" className="ax-input" placeholder="Leave blank to use default Axovion AI prompt" />
        </FormField>
      </Section>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving} data-testid="settings-save-button" className="inline-flex items-center gap-2 rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-6 py-3 text-sm font-bold hover:bg-[#FBBF24] disabled:opacity-60">
          <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <style>{`
        .ax-input { width: 100%; background: #0A0A0F; border: 1px solid rgba(255,255,255,0.10); border-radius: 10px; padding: 8px 12px; font-size: 14px; color: #FFF; outline: none; }
        .ax-input:focus { border-color: rgba(0,212,255,0.45); }
      `}</style>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-6">
    <div className="flex items-center gap-2 mb-5">
      <SettingsIcon className="h-4 w-4 text-[#00D4FF]" />
      <h2 className="text-white text-lg font-bold">{title}</h2>
    </div>
    {children}
  </div>
);

const FormField = ({ label, children }) => (
  <label className="block">
    <span className="block text-white text-sm font-semibold mb-1.5">{label}</span>
    {children}
  </label>
);

export default AdminSettings;
