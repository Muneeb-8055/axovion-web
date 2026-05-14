import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { publicApi } from '../lib/api';

const INDUSTRIES = [
  'E-commerce / DTC', 'Real estate', 'Healthcare / Clinics', 'Agencies', 'SaaS',
  'Professional services', 'Education', 'Finance', 'Hospitality', 'Other',
];
const REVENUE_RANGES = ['<$10K/mo', '$10K-$50K/mo', '$50K-$200K/mo', '$200K-$1M/mo', '$1M+/mo'];
const BUDGET_RANGES = ['<$1K', '$1K-$5K', '$5K-$15K', '$15K-$50K', '$50K+'];
const TIMELINES = ['ASAP (this month)', '1-3 months', '3-6 months', 'Just exploring'];
const AUTOMATION_LEVELS = ['None', 'Basic (zapier, email auto)', 'Some workflows', 'Heavy automation'];
const TOOL_OPTIONS = ['Shopify', 'WooCommerce', 'HubSpot', 'Salesforce', 'Pipedrive', 'Calendly', 'Intercom', 'Gorgias', 'Zendesk', 'Klaviyo', 'Mailchimp', 'WhatsApp', 'Other'];

const Field = ({ label, required, hint, children }) => (
  <label className="block">
    <span className="text-white text-sm font-semibold flex items-center gap-2 mb-1.5">
      {label}
      {required && <span className="text-[#F97316] text-xs">*</span>}
    </span>
    {hint && <span className="block text-[#C0C0C8]/55 text-xs mb-2">{hint}</span>}
    {children}
  </label>
);

const inputCls = "w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-4 py-2.5 text-sm text-white placeholder:text-[#C0C0C8]/40 focus:outline-none focus:border-[#00D4FF]/60 transition-colors duration-200";

const Audit = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    businessName: '', industry: '', websiteUrl: '', contactName: '', contactEmail: '', whatsapp: '',
    mainGoal: '', monthlyRevenue: '', employees: '', repetitiveTasks: '', tools: [],
    supportVolume: '', leadsPerMonth: '', bottleneck: '', budget: '', timeline: '',
    salesCycleLength: '', currentAutomationLevel: '',
  });

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const toggleTool = (t) => setForm((s) => ({ ...s, tools: s.tools.includes(t) ? s.tools.filter(x => x !== t) : [...s.tools, t] }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.businessName || !form.industry || !form.websiteUrl || !form.contactEmail || !form.mainGoal) {
      toast.error('Please complete the required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, employees: form.employees ? Number(form.employees) : undefined };
      const res = await publicApi.submitAudit(payload);
      toast.success('Audit submitted! Generating your AI report…');
      navigate(`/audit-report/${res.data.id}`);
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.message || 'Failed to submit. Please try again.';
      toast.error(typeof detail === 'string' ? detail : 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Free AI Business Audit | Axovion.io</title>
        <meta name="description" content="Free AI Audit — our AI analyzes your business and builds a custom automation report with ROI estimates in minutes." />
      </Helmet>

      <section className="relative ax-section bg-[#0A0A0F] pb-12" data-testid="audit-hero">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -inset-24 bg-[radial-gradient(700px_circle_at_30%_20%,rgba(0,212,255,0.10),transparent_60%)]" />
        </div>
        <div className="relative ax-container">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-4">Free AI Audit</div>
          <h1 className="text-white text-[40px] md:text-[64px] leading-[1.05] tracking-[-0.03em] font-extrabold max-w-3xl">Your business, audited by AI</h1>
          <p className="mt-5 text-[#C0C0C8]/80 text-lg max-w-2xl">Answer a few questions about your business. Our AI analyzes your workflows and instantly builds a custom automation report with ROI estimates.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge>3 min to complete</Badge>
            <Badge>Instant AI analysis</Badge>
            <Badge>Custom report</Badge>
            <Badge>No credit card</Badge>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-[120px] bg-[#0A0A0F]">
        <div className="ax-container">
          <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-testid="audit-form">
            <div className="lg:col-span-8 space-y-6">
              <Section title="About your business" testId="audit-section-business">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Business name" required>
                    <input data-testid="audit-form-business-name" required className={inputCls} value={form.businessName} onChange={(e) => update('businessName', e.target.value)} />
                  </Field>
                  <Field label="Industry" required>
                    <select data-testid="audit-form-industry" required className={inputCls} value={form.industry} onChange={(e) => update('industry', e.target.value)}>
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </Field>
                  <Field label="Website URL" required>
                    <input data-testid="audit-form-website" required type="url" placeholder="https://example.com" className={inputCls} value={form.websiteUrl} onChange={(e) => update('websiteUrl', e.target.value)} />
                  </Field>
                  <Field label="Monthly revenue" hint="Optional — used for ROI estimates">
                    <select data-testid="audit-form-revenue" className={inputCls} value={form.monthlyRevenue} onChange={(e) => update('monthlyRevenue', e.target.value)}>
                      <option value="">Prefer not to say</option>
                      {REVENUE_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </Field>
                  <Field label="Number of employees">
                    <input data-testid="audit-form-employees" type="number" min="0" className={inputCls} value={form.employees} onChange={(e) => update('employees', e.target.value)} />
                  </Field>
                  <Field label="Current automation level">
                    <select data-testid="audit-form-automation" className={inputCls} value={form.currentAutomationLevel} onChange={(e) => update('currentAutomationLevel', e.target.value)}>
                      <option value="">—</option>
                      {AUTOMATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </Field>
                </div>
              </Section>

              <Section title="Workflows &amp; bottlenecks" testId="audit-section-workflows">
                <div className="space-y-5">
                  <Field label="Main goal" required hint="What outcome are you hoping AI helps with?">
                    <textarea data-testid="audit-form-goal" required rows="3" className={inputCls} placeholder="E.g. reduce support response time, recover abandoned carts, free up reps from manual follow-up…" value={form.mainGoal} onChange={(e) => update('mainGoal', e.target.value)} />
                  </Field>
                  <Field label="Repetitive tasks your team does daily">
                    <textarea data-testid="audit-form-repetitive" rows="3" className={inputCls} placeholder="E.g. answering shipping questions, qualifying inbound leads, processing returns…" value={form.repetitiveTasks} onChange={(e) => update('repetitiveTasks', e.target.value)} />
                  </Field>
                  <Field label="Biggest bottleneck">
                    <textarea data-testid="audit-form-bottleneck" rows="3" className={inputCls} placeholder="What's the single thing slowing your business down most?" value={form.bottleneck} onChange={(e) => update('bottleneck', e.target.value)} />
                  </Field>
                  <Field label="Tools you use">
                    <div className="flex flex-wrap gap-2">
                      {TOOL_OPTIONS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTool(t)}
                          data-testid={`audit-form-tool-${t.toLowerCase()}`}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-colors duration-200 ${
                            form.tools.includes(t)
                              ? 'bg-[#00D4FF]/12 border-[#00D4FF]/40 text-[#00D4FF]'
                              : 'bg-[#0A0A0F] border-white/10 text-[#C0C0C8] hover:text-white hover:border-[#00D4FF]/30'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              </Section>

              <Section title="Volume &amp; cycles" testId="audit-section-volume">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Customer support volume" hint="e.g., 100 tickets/week">
                    <input data-testid="audit-form-support" className={inputCls} value={form.supportVolume} onChange={(e) => update('supportVolume', e.target.value)} />
                  </Field>
                  <Field label="Leads per month">
                    <input data-testid="audit-form-leads" className={inputCls} value={form.leadsPerMonth} onChange={(e) => update('leadsPerMonth', e.target.value)} />
                  </Field>
                  <Field label="Sales cycle length" hint="e.g., 7 days / 30 days">
                    <input data-testid="audit-form-cycle" className={inputCls} value={form.salesCycleLength} onChange={(e) => update('salesCycleLength', e.target.value)} />
                  </Field>
                </div>
              </Section>

              <Section title="Budget &amp; contact" testId="audit-section-contact">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Budget range">
                    <select data-testid="audit-form-budget" className={inputCls} value={form.budget} onChange={(e) => update('budget', e.target.value)}>
                      <option value="">Prefer not to say</option>
                      {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </Field>
                  <Field label="Timeline">
                    <select data-testid="audit-form-timeline" className={inputCls} value={form.timeline} onChange={(e) => update('timeline', e.target.value)}>
                      <option value="">—</option>
                      {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Your name">
                    <input data-testid="audit-form-contact-name" className={inputCls} value={form.contactName} onChange={(e) => update('contactName', e.target.value)} />
                  </Field>
                  <Field label="Contact email" required>
                    <input data-testid="audit-form-email" required type="email" className={inputCls} value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} />
                  </Field>
                  <Field label="WhatsApp (optional)">
                    <input data-testid="audit-form-whatsapp" className={inputCls} value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} />
                  </Field>
                </div>
              </Section>

              <button
                type="submit"
                disabled={submitting}
                data-testid="audit-form-submit-button"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-7 py-4 text-base font-bold transition-colors duration-200 hover:bg-[#FBBF24] disabled:opacity-60 disabled:cursor-not-allowed ax-cta-pulse"
              >
                {submitting ? 'Submitting…' : 'Submit for AI Analysis'} <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-[#C0C0C8]/55 text-xs">By submitting, you agree to receive emails about your audit. We never share your data.</p>
            </div>

            {/* Sticky summary panel */}
            <aside className="lg:col-span-4 hidden lg:block">
              <div className="sticky top-24 rounded-[16px] bg-[#12121A] border border-white/10 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-[#00D4FF]" />
                  <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#00D4FF]">What you get</div>
                </div>
                <h3 className="text-white text-xl font-extrabold tracking-tight">Custom AI report</h3>
                <ul className="mt-5 space-y-3">
                  {[
                    'Automation opportunity map (3-5 specific workflows)',
                    'Estimated ROI &amp; monthly savings',
                    'Recommended AI agents with setup cost',
                    'Step-by-step workflow map',
                    'Implementation timeline',
                    'Priority ranking for what to build first',
                  ].map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-[#C0C0C8]">
                      <CheckCircle2 className="h-4 w-4 text-[#00D4FF] mt-0.5 shrink-0" />
                      <span dangerouslySetInnerHTML={{ __html: b }} />
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-5 border-t border-white/8">
                  <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55 mb-2">Delivery</div>
                  <div className="text-white text-sm font-semibold">~30 seconds — instant AI generation</div>
                  <div className="text-[#C0C0C8]/60 text-xs mt-1">Full report &amp; email follow-up included</div>
                </div>
              </div>
            </aside>
          </form>
        </div>
      </section>
    </>
  );
};

const Section = ({ title, testId, children }) => (
  <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-6 md:p-8" data-testid={testId}>
    <h2 className="text-white text-xl font-bold mb-5" dangerouslySetInnerHTML={{ __html: title }} />
    {children}
  </div>
);

const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#12121A] border border-white/10 text-[#C0C0C8]">
    <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> {children}
  </span>
);

export default Audit;
