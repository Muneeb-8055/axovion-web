import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Sparkles, Loader, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { custApi } from '../../lib/api';

const INDUSTRIES = ['E-commerce / DTC', 'Real estate', 'Healthcare / Clinics', 'Agencies', 'SaaS', 'Professional services', 'Education', 'Finance', 'Hospitality', 'Other'];
const REVENUE_RANGES = ['<$10K/mo', '$10K-$50K/mo', '$50K-$200K/mo', '$200K-$1M/mo', '$1M+/mo'];
const BUDGET_RANGES = ['<$1K', '$1K-$5K', '$5K-$15K', '$15K-$50K', '$50K+'];
const TIMELINES = ['ASAP (this month)', '1-3 months', '3-6 months', 'Just exploring'];
const AUTOMATION_LEVELS = ['None', 'Basic (zapier, email auto)', 'Some workflows', 'Heavy automation'];
const TOOL_OPTIONS = ['Shopify', 'WooCommerce', 'HubSpot', 'Salesforce', 'Pipedrive', 'Calendly', 'Intercom', 'Gorgias', 'Zendesk', 'Klaviyo', 'Mailchimp', 'WhatsApp', 'Other'];

const inputCls = "w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-4 py-2.5 text-sm text-white placeholder:text-[#C0C0C8]/40 focus:outline-none focus:border-[#00D4FF]/60 transition-colors duration-200";

const Field = ({ label, required, hint, children }) => (
  <label className="block">
    <span className="text-white text-sm font-semibold flex items-center gap-2 mb-1.5">{label}{required && <span className="text-[#F97316] text-xs">*</span>}</span>
    {hint && <span className="block text-[#C0C0C8]/55 text-xs mb-2">{hint}</span>}
    {children}
  </label>
);

export default function CustomerAudit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [used, setUsed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    businessName: '', industry: '', websiteUrl: '', mainGoal: '', monthlyRevenue: '',
    employees: '', repetitiveTasks: '', tools: [], supportVolume: '', leadsPerMonth: '',
    bottleneck: '', budget: '', timeline: '', salesCycleLength: '', currentAutomationLevel: '',
  });

  useEffect(() => {
    (async () => {
      try { const r = await custApi.auditEligibility(); setUsed(r.data.freeAuditUsed); }
      catch (e) {}
      finally { setLoading(false); }
    })();
  }, []);

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const toggleTool = (t) => setForm((s) => ({ ...s, tools: s.tools.includes(t) ? s.tools.filter((x) => x !== t) : [...s.tools, t] }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.businessName || !form.industry || !form.websiteUrl || !form.mainGoal) {
      toast.error('Please complete the required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, employees: form.employees ? Number(form.employees) : undefined };
      const res = await custApi.submitAudit(payload);
      toast.success('Audit submitted! Generating your AI report…');
      navigate(`/audit-report/${res.data.id}`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to submit.');
      if (err?.response?.status === 403) setUsed(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader className="h-6 w-6 text-[#00D4FF] animate-spin" /></div>;
  }

  if (used) {
    return (
      <div className="max-w-2xl">
        <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#10B981]/12 flex items-center justify-center text-[#10B981] mx-auto mb-4">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="text-white text-xl font-bold">You've used your free AI audit</h2>
          <p className="text-[#C0C0C8]/65 text-sm mt-2 max-w-md mx-auto">
            Each account includes one free audit. To explore more automation opportunities, book a strategy call with our team.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/dashboard')} className="rounded-[12px] bg-[#12121A] border border-white/12 text-white px-5 py-2.5 text-sm font-semibold hover:border-[#00D4FF]/35 transition-colors duration-200">
              View my audits
            </button>
            <button onClick={() => navigate('/dashboard/bookings')} className="rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-5 py-2.5 text-sm font-bold hover:bg-[#FBBF24] transition-colors duration-200">
              Book a strategy call
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-2">Free AI Audit</div>
        <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Your business, audited by AI</h1>
        <p className="text-[#C0C0C8]/65 text-sm mt-1">Answer a few questions — our AI builds a custom automation report with ROI estimates.</p>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-6">
            <h2 className="text-white text-lg font-bold mb-5">About your business</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Business name" required><input required className={inputCls} value={form.businessName} onChange={(e) => update('businessName', e.target.value)} /></Field>
              <Field label="Industry" required>
                <select required className={inputCls} value={form.industry} onChange={(e) => update('industry', e.target.value)}>
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </Field>
              <Field label="Website URL" required><input required type="url" placeholder="https://example.com" className={inputCls} value={form.websiteUrl} onChange={(e) => update('websiteUrl', e.target.value)} /></Field>
              <Field label="Monthly revenue" hint="Used for ROI estimates">
                <select className={inputCls} value={form.monthlyRevenue} onChange={(e) => update('monthlyRevenue', e.target.value)}>
                  <option value="">Prefer not to say</option>
                  {REVENUE_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Number of employees"><input type="number" min="0" className={inputCls} value={form.employees} onChange={(e) => update('employees', e.target.value)} /></Field>
              <Field label="Current automation level">
                <select className={inputCls} value={form.currentAutomationLevel} onChange={(e) => update('currentAutomationLevel', e.target.value)}>
                  <option value="">—</option>
                  {AUTOMATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
            </div>
          </div>

          <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-6">
            <h2 className="text-white text-lg font-bold mb-5">Workflows &amp; bottlenecks</h2>
            <div className="space-y-5">
              <Field label="Main goal" required hint="What outcome are you hoping AI helps with?">
                <textarea required rows="3" className={inputCls} placeholder="E.g. reduce support response time, recover abandoned carts…" value={form.mainGoal} onChange={(e) => update('mainGoal', e.target.value)} />
              </Field>
              <Field label="Repetitive tasks your team does daily">
                <textarea rows="3" className={inputCls} placeholder="E.g. answering shipping questions, qualifying leads…" value={form.repetitiveTasks} onChange={(e) => update('repetitiveTasks', e.target.value)} />
              </Field>
              <Field label="Biggest bottleneck">
                <textarea rows="3" className={inputCls} placeholder="What's slowing your business down most?" value={form.bottleneck} onChange={(e) => update('bottleneck', e.target.value)} />
              </Field>
              <Field label="Tools you use">
                <div className="flex flex-wrap gap-2">
                  {TOOL_OPTIONS.map((t) => (
                    <button key={t} type="button" onClick={() => toggleTool(t)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors duration-200 ${form.tools.includes(t) ? 'bg-[#00D4FF]/12 border-[#00D4FF]/40 text-[#00D4FF]' : 'bg-[#0A0A0F] border-white/10 text-[#C0C0C8] hover:text-white hover:border-[#00D4FF]/30'}`}>{t}</button>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-6">
            <h2 className="text-white text-lg font-bold mb-5">Volume, budget &amp; timeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Support volume" hint="e.g., 100 tickets/week"><input className={inputCls} value={form.supportVolume} onChange={(e) => update('supportVolume', e.target.value)} /></Field>
              <Field label="Leads per month"><input className={inputCls} value={form.leadsPerMonth} onChange={(e) => update('leadsPerMonth', e.target.value)} /></Field>
              <Field label="Sales cycle length" hint="e.g., 7 days / 30 days"><input className={inputCls} value={form.salesCycleLength} onChange={(e) => update('salesCycleLength', e.target.value)} /></Field>
              <Field label="Budget range">
                <select className={inputCls} value={form.budget} onChange={(e) => update('budget', e.target.value)}>
                  <option value="">Prefer not to say</option>
                  {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Timeline">
                <select className={inputCls} value={form.timeline} onChange={(e) => update('timeline', e.target.value)}>
                  <option value="">—</option>
                  {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-7 py-4 text-base font-bold transition-colors duration-200 hover:bg-[#FBBF24] disabled:opacity-60">
            {submitting ? 'Submitting…' : 'Submit for AI Analysis'} <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <aside className="lg:col-span-4 hidden lg:block">
          <div className="sticky top-8 rounded-[16px] bg-[#12121A] border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-[#00D4FF]" />
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#00D4FF]">What you get</div>
            </div>
            <h3 className="text-white text-xl font-extrabold tracking-tight">Custom AI report</h3>
            <ul className="mt-5 space-y-3">
              {['Automation opportunity map', 'Estimated ROI & monthly savings', 'Recommended AI agents', 'Step-by-step workflow map', 'Implementation timeline'].map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-[#C0C0C8]"><CheckCircle2 className="h-4 w-4 text-[#00D4FF] mt-0.5 shrink-0" /> {b}</li>
              ))}
            </ul>
            <div className="mt-6 pt-5 border-t border-white/8 flex items-center gap-2 text-[#C0C0C8]/60 text-xs">
              <Lock className="h-3.5 w-3.5" /> One free audit per account
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
