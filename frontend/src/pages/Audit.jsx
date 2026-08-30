import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Workflow,
  BarChart3,
  User,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { publicApi } from '../lib/api';

/* ─── constants ──────────────────────────────────────────────────────────── */

const INDUSTRIES = [
  'E-commerce / DTC',
  'Real estate',
  'Healthcare / Clinics',
  'Agencies',
  'SaaS',
  'Professional services',
  'Education',
  'Finance',
  'Hospitality',
  'Other',
];
const REVENUE_RANGES = [
  '<$10K/mo',
  '$10K-$50K/mo',
  '$50K-$200K/mo',
  '$200K-$1M/mo',
  '$1M+/mo',
];
const BUDGET_RANGES = ['<$1K', '$1K-$5K', '$5K-$15K', '$15K-$50K', '$50K+'];
const TIMELINES = [
  'ASAP (this month)',
  '1-3 months',
  '3-6 months',
  'Just exploring',
];
const AUTOMATION_LEVELS = [
  'None',
  'Basic (zapier, email auto)',
  'Some workflows',
  'Heavy automation',
];
const TOOL_OPTIONS = [
  'Shopify',
  'WooCommerce',
  'HubSpot',
  'Salesforce',
  'Pipedrive',
  'Calendly',
  'Intercom',
  'Gorgias',
  'Zendesk',
  'Klaviyo',
  'Mailchimp',
  'WhatsApp',
  'Other',
];

const STEPS = [
  { id: 'business', label: 'Business', icon: Building2 },
  { id: 'workflows', label: 'Workflows', icon: Workflow },
  { id: 'volume', label: 'Volume', icon: BarChart3 },
  { id: 'contact', label: 'Contact', icon: User },
];

/* ─── sub-components ─────────────────────────────────────────────────────── */

const inputBase =
  'w-full bg-[var(--ax-bg)] border border-[var(--ax-border-strong)] rounded-[12px] px-4 py-2.5 text-sm text-[var(--ax-heading)] placeholder:text-[var(--ax-muted-2)] focus:outline-none focus:border-[var(--ax-accent)] transition-colors duration-200';

function FieldLabel({ htmlFor, required, hint, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-semibold text-[var(--ax-heading)] mb-1"
      >
        {children}
        {required && (
          <span className="ml-1 text-[var(--ax-accent)] text-xs" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {hint && (
        <p className="text-xs text-[var(--ax-muted)] mb-1.5">{hint}</p>
      )}
    </div>
  );
}

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 flex items-center gap-1 text-xs text-[var(--ax-error)]">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
      {message}
    </p>
  );
}

/* ─── step-tracker ───────────────────────────────────────────────────────── */

function StepTracker({ current, total }) {
  return (
    <nav aria-label="Form progress" className="mb-8">
      <ol className="flex items-center gap-0">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const Icon = step.icon;
          return (
            <li key={step.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  aria-current={active ? 'step' : undefined}
                  className={[
                    'h-8 w-8 rounded-[12px] border flex items-center justify-center transition-colors duration-200',
                    done
                      ? 'bg-[var(--ax-accent)] border-[var(--ax-accent)]'
                      : active
                      ? 'bg-[var(--ax-surface-2)] border-[var(--ax-accent)] text-[var(--ax-accent)]'
                      : 'bg-[var(--ax-surface)] border-[var(--ax-border)] text-[var(--ax-muted)]',
                  ].join(' ')}
                >
                  {done ? (
                    <CheckCircle2
                      className="h-4 w-4 text-[var(--ax-on-accent)]"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <Icon
                      className="h-4 w-4"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <span
                  className={[
                    'hidden sm:block text-sm font-medium',
                    active
                      ? 'text-[var(--ax-heading)]'
                      : done
                      ? 'text-[var(--ax-accent)]'
                      : 'text-[var(--ax-muted)]',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>
              {i < total - 1 && (
                <div
                  aria-hidden="true"
                  className={[
                    'mx-3 h-px flex-1 w-8 md:w-16 transition-colors duration-300',
                    done
                      ? 'bg-[var(--ax-accent)]'
                      : 'bg-[var(--ax-border)]',
                  ].join(' ')}
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs text-[var(--ax-muted)] font-mono">
        Step {current + 1} of {total}
      </p>
    </nav>
  );
}

/* ─── individual steps ───────────────────────────────────────────────────── */

function StepBusiness({ form, update, errors }) {
  return (
    <fieldset>
      <legend className="sr-only">About your business</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <FieldLabel htmlFor="businessName" required>
            Business name
          </FieldLabel>
          <input
            id="businessName"
            data-testid="audit-form-business-name"
            className={inputBase}
            value={form.businessName}
            onChange={(e) => update('businessName', e.target.value)}
            aria-describedby={errors.businessName ? 'err-businessName' : undefined}
            aria-required="true"
          />
          <FieldError id="err-businessName" message={errors.businessName} />
        </div>

        <div>
          <FieldLabel htmlFor="industry" required>
            Industry
          </FieldLabel>
          <select
            id="industry"
            data-testid="audit-form-industry"
            className={inputBase}
            value={form.industry}
            onChange={(e) => update('industry', e.target.value)}
            aria-describedby={errors.industry ? 'err-industry' : undefined}
            aria-required="true"
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
          <FieldError id="err-industry" message={errors.industry} />
        </div>

        <div>
          <FieldLabel htmlFor="websiteUrl" required>
            Website URL
          </FieldLabel>
          <input
            id="websiteUrl"
            data-testid="audit-form-website"
            type="url"
            placeholder="https://example.com"
            className={inputBase}
            value={form.websiteUrl}
            onChange={(e) => update('websiteUrl', e.target.value)}
            aria-describedby={errors.websiteUrl ? 'err-websiteUrl' : undefined}
            aria-required="true"
          />
          <FieldError id="err-websiteUrl" message={errors.websiteUrl} />
        </div>

        <div>
          <FieldLabel htmlFor="monthlyRevenue" hint="Used for ROI estimates - optional">
            Monthly revenue
          </FieldLabel>
          <select
            id="monthlyRevenue"
            data-testid="audit-form-revenue"
            className={inputBase}
            value={form.monthlyRevenue}
            onChange={(e) => update('monthlyRevenue', e.target.value)}
          >
            <option value="">Prefer not to say</option>
            {REVENUE_RANGES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel htmlFor="employees">Number of employees</FieldLabel>
          <input
            id="employees"
            data-testid="audit-form-employees"
            type="number"
            min="0"
            className={inputBase}
            value={form.employees}
            onChange={(e) => update('employees', e.target.value)}
          />
        </div>

        <div>
          <FieldLabel htmlFor="currentAutomationLevel">
            Current automation level
          </FieldLabel>
          <select
            id="currentAutomationLevel"
            data-testid="audit-form-automation"
            className={inputBase}
            value={form.currentAutomationLevel}
            onChange={(e) => update('currentAutomationLevel', e.target.value)}
          >
            <option value="">Select level</option>
            {AUTOMATION_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>
    </fieldset>
  );
}

function StepWorkflows({ form, update, errors }) {
  return (
    <fieldset>
      <legend className="sr-only">Workflows and bottlenecks</legend>
      <div className="space-y-5">
        <div>
          <FieldLabel htmlFor="mainGoal" required hint="What outcome are you hoping AI helps with?">
            Main goal
          </FieldLabel>
          <textarea
            id="mainGoal"
            data-testid="audit-form-goal"
            rows={3}
            className={inputBase}
            placeholder="Reduce support response time, recover abandoned carts, free up reps from manual follow-up..."
            value={form.mainGoal}
            onChange={(e) => update('mainGoal', e.target.value)}
            aria-describedby={errors.mainGoal ? 'err-mainGoal' : undefined}
            aria-required="true"
          />
          <FieldError id="err-mainGoal" message={errors.mainGoal} />
        </div>

        <div>
          <FieldLabel htmlFor="repetitiveTasks">
            Repetitive tasks your team does daily
          </FieldLabel>
          <textarea
            id="repetitiveTasks"
            data-testid="audit-form-repetitive"
            rows={3}
            className={inputBase}
            placeholder="Answering shipping questions, qualifying inbound leads, processing returns..."
            value={form.repetitiveTasks}
            onChange={(e) => update('repetitiveTasks', e.target.value)}
          />
        </div>

        <div>
          <FieldLabel htmlFor="bottleneck">Biggest bottleneck</FieldLabel>
          <textarea
            id="bottleneck"
            data-testid="audit-form-bottleneck"
            rows={3}
            className={inputBase}
            placeholder="The single thing slowing your business down most"
            value={form.bottleneck}
            onChange={(e) => update('bottleneck', e.target.value)}
          />
        </div>

        <div>
          <FieldLabel>Tools you use</FieldLabel>
          <div
            role="group"
            aria-label="Select tools your team uses"
            className="flex flex-wrap gap-2 mt-1"
          >
            {TOOL_OPTIONS.map((t) => {
              const selected = form.tools.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    const next = selected
                      ? form.tools.filter((x) => x !== t)
                      : [...form.tools, t];
                    update('tools', next);
                  }}
                  data-testid={`audit-form-tool-${t.toLowerCase()}`}
                  aria-pressed={selected}
                  className={[
                    'text-xs px-3 py-1.5 rounded-[9999px] border transition-colors duration-150',
                    selected
                      ? 'bg-[rgba(0,212,255,0.12)] border-[rgba(0,212,255,0.4)] text-[var(--ax-accent)]'
                      : 'bg-[var(--ax-surface)] border-[var(--ax-border)] text-[var(--ax-text)] hover:border-[rgba(0,212,255,0.3)] hover:text-[var(--ax-heading)]',
                  ].join(' ')}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </fieldset>
  );
}

function StepVolume({ form, update }) {
  return (
    <fieldset>
      <legend className="sr-only">Volume and cycles</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <FieldLabel htmlFor="supportVolume" hint="For example: 100 tickets/week">
            Customer support volume
          </FieldLabel>
          <input
            id="supportVolume"
            data-testid="audit-form-support"
            className={inputBase}
            value={form.supportVolume}
            onChange={(e) => update('supportVolume', e.target.value)}
          />
        </div>

        <div>
          <FieldLabel htmlFor="leadsPerMonth">Leads per month</FieldLabel>
          <input
            id="leadsPerMonth"
            data-testid="audit-form-leads"
            className={inputBase}
            value={form.leadsPerMonth}
            onChange={(e) => update('leadsPerMonth', e.target.value)}
          />
        </div>

        <div>
          <FieldLabel htmlFor="salesCycleLength" hint="For example: 7 days, 30 days">
            Sales cycle length
          </FieldLabel>
          <input
            id="salesCycleLength"
            data-testid="audit-form-cycle"
            className={inputBase}
            value={form.salesCycleLength}
            onChange={(e) => update('salesCycleLength', e.target.value)}
          />
        </div>
      </div>
    </fieldset>
  );
}

function StepContact({ form, update, errors }) {
  return (
    <fieldset>
      <legend className="sr-only">Budget and contact information</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <FieldLabel htmlFor="budget">Budget range</FieldLabel>
          <select
            id="budget"
            data-testid="audit-form-budget"
            className={inputBase}
            value={form.budget}
            onChange={(e) => update('budget', e.target.value)}
          >
            <option value="">Prefer not to say</option>
            {BUDGET_RANGES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel htmlFor="timeline">Timeline</FieldLabel>
          <select
            id="timeline"
            data-testid="audit-form-timeline"
            className={inputBase}
            value={form.timeline}
            onChange={(e) => update('timeline', e.target.value)}
          >
            <option value="">Select timeline</option>
            {TIMELINES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel htmlFor="contactName">Your name</FieldLabel>
          <input
            id="contactName"
            data-testid="audit-form-contact-name"
            className={inputBase}
            value={form.contactName}
            onChange={(e) => update('contactName', e.target.value)}
          />
        </div>

        <div>
          <FieldLabel htmlFor="contactEmail" required>
            Contact email
          </FieldLabel>
          <input
            id="contactEmail"
            data-testid="audit-form-email"
            type="email"
            className={inputBase}
            value={form.contactEmail}
            onChange={(e) => update('contactEmail', e.target.value)}
            aria-describedby={errors.contactEmail ? 'err-contactEmail' : undefined}
            aria-required="true"
          />
          <FieldError id="err-contactEmail" message={errors.contactEmail} />
        </div>

        <div>
          <FieldLabel htmlFor="whatsapp">WhatsApp (optional)</FieldLabel>
          <input
            id="whatsapp"
            data-testid="audit-form-whatsapp"
            className={inputBase}
            value={form.whatsapp}
            onChange={(e) => update('whatsapp', e.target.value)}
          />
        </div>
      </div>
    </fieldset>
  );
}

/* ─── validation ─────────────────────────────────────────────────────────── */

function validateStep(step, form) {
  const errs = {};
  if (step === 0) {
    if (!form.businessName.trim())
      errs.businessName = 'Business name is required.';
    if (!form.industry) errs.industry = 'Select an industry.';
    if (!form.websiteUrl.trim())
      errs.websiteUrl = 'Website URL is required.';
    else if (!/^https?:\/\//.test(form.websiteUrl))
      errs.websiteUrl = 'Enter a URL starting with https://.';
  }
  if (step === 1) {
    if (!form.mainGoal.trim())
      errs.mainGoal = 'Describe your main goal so our AI can tailor the report.';
  }
  if (step === 3) {
    if (!form.contactEmail.trim())
      errs.contactEmail = 'Email is required so we can send your report.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail))
      errs.contactEmail = 'Enter a valid email address.';
  }
  return errs;
}

/* ─── review summary ─────────────────────────────────────────────────────── */

function ReviewRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2 border-b border-[var(--ax-border)] last:border-0">
      <dt className="w-36 shrink-0 text-xs text-[var(--ax-muted)] font-mono uppercase tracking-wide pt-0.5">
        {label}
      </dt>
      <dd className="text-sm text-[var(--ax-text)] break-words">{value}</dd>
    </div>
  );
}

function ReviewPanel({ form }) {
  return (
    <aside className="lg:col-span-4 hidden lg:block" aria-label="Your answers so far">
      <div className="sticky top-24 rounded-[16px] bg-[var(--ax-surface)] border border-[var(--ax-border)] p-6">
        <p className="ax-mono-label mb-4">Your answers</p>
        <dl>
          <ReviewRow label="Business" value={form.businessName} />
          <ReviewRow label="Industry" value={form.industry} />
          <ReviewRow label="Website" value={form.websiteUrl} />
          <ReviewRow label="Revenue" value={form.monthlyRevenue} />
          <ReviewRow label="Goal" value={form.mainGoal} />
          <ReviewRow label="Tools" value={form.tools.join(', ')} />
          <ReviewRow label="Budget" value={form.budget} />
          <ReviewRow label="Timeline" value={form.timeline} />
          <ReviewRow label="Email" value={form.contactEmail} />
        </dl>
        <div className="mt-5 pt-4 border-t border-[var(--ax-border)]">
          <div className="ax-mono-label mb-1.5">What you get</div>
          <ul className="space-y-2">
            {[
              'Automation opportunity map',
              'ROI estimate and monthly savings',
              'Recommended AI agents',
              'Step-by-step workflow map',
              'Implementation timeline',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-[var(--ax-text)]">
                <CheckCircle2
                  className="h-3.5 w-3.5 text-[var(--ax-accent)] mt-0.5 shrink-0"
                  strokeWidth={1.5}
                />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[var(--ax-muted)]">
            Report delivered in about 30 seconds. No credit card needed.
          </p>
        </div>
      </div>
    </aside>
  );
}

/* ─── main component ─────────────────────────────────────────────────────── */

const INITIAL_FORM = {
  businessName: '',
  industry: '',
  websiteUrl: '',
  contactName: '',
  contactEmail: '',
  whatsapp: '',
  mainGoal: '',
  monthlyRevenue: '',
  employees: '',
  repetitiveTasks: '',
  tools: [],
  supportVolume: '',
  leadsPerMonth: '',
  bottleneck: '',
  budget: '',
  timeline: '',
  salesCycleLength: '',
  currentAutomationLevel: '',
};

const Audit = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(INITIAL_FORM);
  const stepRef = useRef(null);

  // Scroll the step heading into view when step changes
  useEffect(() => {
    stepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  const update = useCallback(
    (k, v) => setForm((s) => ({ ...s, [k]: v })),
    []
  );

  const advance = () => {
    const errs = validateStep(step, form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Focus the first errored field
      const firstKey = Object.keys(errs)[0];
      document.getElementById(firstKey)?.focus();
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const retreat = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validateStep(step, form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.getElementById(firstKey)?.focus();
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        employees: form.employees ? Number(form.employees) : undefined,
      };
      const res = await publicApi.submitAudit(payload);
      toast.success('Audit submitted. Generating your AI report...');
      navigate(`/audit-report/${res.data.id}`);
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to submit. Please try again.';
      toast.error(
        typeof detail === 'string' ? detail : 'Failed to submit. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitles = [
    'About your business',
    'Workflows and bottlenecks',
    'Volume and cycles',
    'Budget and contact',
  ];

  const isLast = step === STEPS.length - 1;

  return (
    <>
      <Helmet>
        <title>Free AI Business Audit | Axovion.io</title>
        <meta
          name="description"
          content="Free AI Audit - our AI analyzes your business and builds a custom automation report with ROI estimates in minutes."
        />
      </Helmet>

      {/* Hero */}
      <section
        className="relative bg-[var(--ax-bg)] pt-24 pb-12"
        data-testid="audit-hero"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[radial-gradient(700px_circle_at_30%_0%,rgba(0,212,255,0.07),transparent_60%)]" />
        </div>
        <div className="relative ax-container">
          <p className="ax-mono-label mb-4">Free AI Audit</p>
          <h1 className="text-[var(--ax-heading)] text-[40px] md:text-[60px] leading-[1.05] tracking-[-0.03em] font-bold max-w-3xl">
            Your business, audited by AI
          </h1>
          <p className="mt-5 text-[var(--ax-text)] text-lg leading-relaxed max-w-2xl">
            Answer a few questions. Our AI maps your workflows, finds automation
            gaps, and builds a custom report with ROI estimates in about 30
            seconds.
          </p>
          <div className="mt-6 flex flex-wrap gap-3" aria-label="Audit details">
            {[
              '3 minutes to complete',
              'Instant AI analysis',
              'No credit card',
            ].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-[9999px] bg-[var(--ax-surface)] border border-[var(--ax-border)] text-[var(--ax-text)]"
              >
                <CheckCircle2
                  className="h-3.5 w-3.5 text-[var(--ax-success)]"
                  strokeWidth={1.5}
                />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="bg-[var(--ax-bg)] pb-20 md:pb-32">
        <div className="ax-container">
          <div
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            data-testid="audit-form"
          >
            <div className="lg:col-span-8">
              {/* Step tracker */}
              <StepTracker current={step} total={STEPS.length} />

              {/* Step card */}
              <div
                ref={stepRef}
                className="rounded-[16px] bg-[var(--ax-surface)] border border-[var(--ax-border)] p-6 md:p-8"
                data-testid={`audit-section-${STEPS[step].id}`}
              >
                <h2 className="text-[var(--ax-heading)] text-xl font-semibold mb-6">
                  {stepTitles[step]}
                </h2>

                <form
                  onSubmit={isLast ? submit : (e) => { e.preventDefault(); advance(); }}
                  noValidate
                >
                  {step === 0 && (
                    <StepBusiness
                      form={form}
                      update={update}
                      errors={errors}
                    />
                  )}
                  {step === 1 && (
                    <StepWorkflows
                      form={form}
                      update={update}
                      errors={errors}
                    />
                  )}
                  {step === 2 && (
                    <StepVolume form={form} update={update} />
                  )}
                  {step === 3 && (
                    <StepContact
                      form={form}
                      update={update}
                      errors={errors}
                    />
                  )}

                  <div className="mt-8 flex items-center gap-3">
                    {step > 0 && (
                      <button
                        type="button"
                        onClick={retreat}
                        className="inline-flex items-center gap-2 rounded-[12px] border border-[var(--ax-border-strong)] bg-[var(--ax-bg)] text-[var(--ax-text)] px-5 py-3 text-sm font-medium hover:text-[var(--ax-heading)] hover:border-[var(--ax-border-strong)] transition-colors duration-150 active:scale-[0.98]"
                      >
                        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                        Back
                      </button>
                    )}

                    {isLast ? (
                      <button
                        type="submit"
                        disabled={submitting}
                        data-testid="audit-form-submit-button"
                        className="inline-flex items-center gap-2 rounded-[12px] bg-[var(--ax-accent)] text-[var(--ax-on-accent)] px-7 py-3 text-sm font-semibold transition-colors duration-150 hover:bg-[var(--ax-accent-dim)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ax-cta-pulse"
                      >
                        {submitting ? (
                          'Submitting...'
                        ) : (
                          <>
                            Submit for AI Analysis
                            <ArrowRight
                              className="h-4 w-4"
                              strokeWidth={1.5}
                            />
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-[12px] bg-[var(--ax-accent)] text-[var(--ax-on-accent)] px-7 py-3 text-sm font-semibold transition-colors duration-150 hover:bg-[var(--ax-accent-dim)] active:scale-[0.98]"
                      >
                        Continue
                        <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>

                  {isLast && (
                    <p className="mt-3 text-xs text-[var(--ax-muted)]">
                      By submitting, you agree to receive emails about your
                      audit. We never share your data.
                    </p>
                  )}
                </form>
              </div>
            </div>

            <ReviewPanel form={form} />
          </div>
        </div>
      </section>
    </>
  );
};

export default Audit;
