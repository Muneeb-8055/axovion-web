import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  Download,
  CalendarCheck,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Cog,
  Clock,
  Target,
  ChevronRight,
} from 'lucide-react';
import CountUp from 'react-countup';
import { publicApi } from '../lib/api';
import { Skeleton } from '../components/ui/skeleton';

/* ─── reveal hook (IntersectionObserver, no window scroll) ───────────────── */

function useReveal(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      el.classList.add('ax-reveal-in');
      return;
    }
    el.classList.add('ax-reveal');
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('ax-reveal-in');
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
}

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── sub-components ─────────────────────────────────────────────────────── */

function PriorityBadge({ priority }) {
  const map = {
    high: 'bg-[rgba(239,68,68,0.12)] text-[var(--ax-error)] border-[rgba(239,68,68,0.25)]',
    medium:
      'bg-[rgba(251,191,36,0.12)] text-[var(--ax-warn)] border-[rgba(251,191,36,0.25)]',
    low: 'bg-[rgba(59,130,246,0.12)] text-[var(--ax-info)] border-[rgba(59,130,246,0.25)]',
  };
  const p = (priority || 'medium').toLowerCase();
  const cls = map[p] || map.medium;
  return (
    <span
      className={`shrink-0 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-[9999px] border ${cls}`}
    >
      {p}
    </span>
  );
}

function BigMetric({ icon: Icon, label, value, prefix, suffix, testId }) {
  return (
    <div
      className="rounded-[14px] bg-[var(--ax-bg)] border border-[var(--ax-border)] p-5"
      data-testid={testId}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon
          className="h-4 w-4 text-[var(--ax-accent)]"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <p className="ax-mono-label">{label}</p>
      </div>
      <p className="ax-nums text-[var(--ax-heading)] text-3xl md:text-4xl font-bold tracking-tight">
        {prefix}
        <CountUp end={Number(value) || 0} duration={1.2} separator="," />
        {suffix}
      </p>
    </div>
  );
}

function RangeField({ label, value, onChange, min, max, step = 1, prefix, testId }) {
  const id = `roi-${testId}`;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={id}
          className="text-sm font-medium text-[var(--ax-heading)]"
        >
          {label}
        </label>
        <span
          className="ax-nums text-[var(--ax-accent)] text-sm font-bold"
          aria-live="polite"
        >
          {prefix}{value.toLocaleString()}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        data-testid={testId}
        className="w-full accent-[var(--ax-accent)]"
      />
      <div className="mt-1 flex justify-between text-[10px] font-mono text-[var(--ax-muted-2)]">
        <span>
          {prefix}{min.toLocaleString()}
        </span>
        <span>
          {prefix}{max.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading report" aria-busy="true">
      <div className="rounded-[16px] bg-[var(--ax-surface)] border border-[var(--ax-border)] p-8 space-y-4">
        <Skeleton className="h-3 w-28 bg-white/8 rounded-[9999px]" />
        <Skeleton className="h-6 w-3/4 bg-white/8 rounded-[9999px]" />
        <Skeleton className="h-5 w-2/3 bg-white/8 rounded-[9999px]" />
        <Skeleton className="h-4 w-4/5 bg-white/8 rounded-[9999px]" />
        <div className="grid grid-cols-3 gap-4 pt-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 bg-white/8 rounded-[14px]" />
          ))}
        </div>
      </div>
      <div className="rounded-[16px] bg-[var(--ax-surface)] border border-[var(--ax-border)] p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40 bg-white/8 rounded-[14px]" />
        ))}
      </div>
    </div>
  );
}

function GeneratingState() {
  const steps = [
    'Analyzing business model...',
    'Mapping workflow bottlenecks...',
    'Calculating ROI estimates...',
    'Identifying AI agent candidates...',
    'Compiling final report...',
  ];

  return (
    <div
      className="rounded-[16px] bg-[var(--ax-surface)] border border-[var(--ax-border)] p-8 md:p-12"
      data-testid="audit-loading-state"
      aria-live="polite"
      aria-label="Report is being generated"
    >
      <div className="max-w-md mx-auto text-center">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-[9999px] bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.25)] mb-6">
          <RefreshCw
            className="h-4 w-4 text-[var(--ax-accent)] animate-spin"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span className="ax-mono-label" style={{ color: 'var(--ax-accent)' }}>
            AI analyzing your business
          </span>
        </div>

        <h2 className="text-[var(--ax-heading)] text-2xl font-bold mb-3">
          Generating your custom report
        </h2>
        <p className="text-[var(--ax-text)] text-sm leading-relaxed mb-8">
          Our AI is mapping automation opportunities and calculating ROI for your
          specific workflows. This usually takes 10-30 seconds.
        </p>

        <ol className="space-y-2 text-left" aria-label="Generation steps">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-3 text-sm">
              <Skeleton
                className="h-2 w-2 rounded-full bg-white/8 shrink-0"
                style={{ animationDelay: `${i * 300}ms` }}
              />
              <Skeleton
                className="h-3 bg-white/8 rounded-[9999px]"
                style={{
                  width: `${70 + i * 5}%`,
                  animationDelay: `${i * 300}ms`,
                }}
                aria-label={s}
              />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function ErrorPanel({ title, message, action }) {
  return (
    <div
      className="rounded-[16px] bg-[rgba(239,68,68,0.07)] border border-[rgba(239,68,68,0.22)] p-6 flex items-start gap-4"
      role="alert"
    >
      <AlertTriangle
        className="h-5 w-5 text-[var(--ax-error)] mt-0.5 shrink-0"
        strokeWidth={1.5}
      />
      <div>
        <h3 className="text-[var(--ax-heading)] font-semibold">{title}</h3>
        {message && (
          <p className="text-[var(--ax-text)] text-sm mt-1">{message}</p>
        )}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────────────────── */

const AuditReport = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [polls, setPolls] = useState(0);

  // ROI calculator state
  const [supportVol, setSupportVol] = useState(200);
  const [hourlyCost, setHourlyCost] = useState(35);

  // useCallback so both useEffects can list `load` as a stable dependency
  // and neither holds a stale closure over `id`.
  const load = useCallback(async () => {
    try {
      const res = await publicApi.getReport(id);
      setData(res.data);
    } catch (e) {
      setErr(e?.response?.data?.detail || 'Report not found');
    }
  }, [id]);

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // Polling while the report is still generating
  useEffect(() => {
    if (!data) return;
    const hasContent =
      data.report &&
      !data.report.error &&
      (data.report.opportunities?.length || data.report.executive_summary);
    if (hasContent) return;
    if (polls > 30) return; // stop after ~60s
    const t = setTimeout(() => {
      setPolls((p) => p + 1);
      load();
    }, 2000);
    return () => clearTimeout(t);
  }, [data, polls, load]);

  const isLoading = !data && !err;
  const isGenerating =
    data &&
    (!data.report ||
      (!data.report.error &&
        (!data.report.opportunities || !data.report.opportunities.length)));
  const hasError = data?.report?.error;
  const report = data?.report;

  const totalSavings = report?.total_monthly_savings_usd || 0;
  const totalHours = report?.total_hours_saved_per_month || 0;

  const calculatedSavings = useMemo(
    () => Math.round(supportVol * hourlyCost * 0.4),
    [supportVol, hourlyCost]
  );

  return (
    <>
      <Helmet>
        <title>
          {data?.businessName
            ? `${data.businessName} - AI Audit Report | Axovion.io`
            : 'AI Audit Report | Axovion.io'}
        </title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Hero */}
      <section
        className="relative bg-[var(--ax-bg)] pt-24 pb-10"
        data-testid="audit-report-hero"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[radial-gradient(700px_circle_at_70%_0%,rgba(0,212,255,0.07),transparent_60%)]" />
        </div>
        <div className="relative ax-container">
          <p className="ax-mono-label mb-4">AI Audit Report</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <h1
                className="text-[var(--ax-heading)] text-[36px] md:text-[52px] leading-[1.05] tracking-[-0.03em] font-bold"
                data-testid="audit-report-business"
              >
                {data?.businessName ? (
                  data.businessName
                ) : (
                  <Skeleton className="h-12 w-80 bg-white/8 rounded-[12px]" />
                )}
              </h1>
              {(data?.industry || data?.websiteUrl) && (
                <p className="mt-2 text-[var(--ax-text)] text-sm">
                  {data.industry}
                  {data.industry && data.websiteUrl && (
                    <span aria-hidden="true"> · </span>
                  )}
                  {data.websiteUrl && (
                    <a
                      href={data.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--ax-accent)] hover:underline"
                    >
                      {data.websiteUrl}
                    </a>
                  )}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.print()}
                data-testid="audit-report-download-pdf-button"
                className="inline-flex items-center gap-2 rounded-[12px] bg-[var(--ax-surface)] text-[var(--ax-text)] px-4 py-2.5 text-sm font-medium border border-[var(--ax-border-strong)] hover:border-[rgba(0,212,255,0.4)] hover:text-[var(--ax-heading)] transition-colors duration-150 active:scale-[0.98]"
              >
                <Download className="h-4 w-4" strokeWidth={1.5} />
                Download as PDF
              </button>
              <Link
                to="/contact"
                data-testid="audit-report-book-call-button"
                className="inline-flex items-center gap-2 rounded-[12px] bg-[var(--ax-accent)] text-[var(--ax-on-accent)] px-4 py-2.5 text-sm font-semibold transition-colors duration-150 hover:bg-[var(--ax-accent-dim)] active:scale-[0.98] ax-cta-pulse"
              >
                <CalendarCheck className="h-4 w-4" strokeWidth={1.5} />
                Book Implementation Call
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="bg-[var(--ax-bg)] pb-20 md:pb-32">
        <div className="ax-container">
          {/* Network/404 error */}
          {err && (
            <ErrorPanel
              title="Report not found"
              message={err}
              action={
                <Link
                  to="/audit"
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--ax-accent)] hover:underline"
                >
                  Start a new audit
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              }
            />
          )}

          {/* Initial skeleton */}
          {isLoading && <ReportSkeleton />}

          {/* Generating state */}
          {data && isGenerating && <GeneratingState />}

          {/* AI generation error */}
          {hasError && (
            <ErrorPanel
              title="Report generation failed"
              message={report.error}
              action={
                <p className="text-xs text-[var(--ax-muted)]">
                  Our team has been notified. You can also{' '}
                  <Link
                    to="/contact"
                    className="text-[var(--ax-accent)] hover:underline"
                  >
                    reach out directly
                  </Link>
                  .
                </p>
              }
            />
          )}

          {/* Populated report */}
          {report && !isGenerating && !hasError && (
            <div className="space-y-6">
              {/* Executive summary */}
              <Reveal>
                <div
                  className="rounded-[16px] bg-[var(--ax-surface)] border border-[var(--ax-border)] p-7 md:p-10"
                  data-testid="audit-report-summary"
                >
                  <p className="ax-mono-label mb-4">Executive summary</p>
                  <p
                    className="text-[var(--ax-heading)] text-lg md:text-xl leading-relaxed font-medium"
                    data-testid="audit-report-exec-summary-text"
                  >
                    {report.executive_summary}
                  </p>
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <BigMetric
                      icon={TrendingUp}
                      label="Monthly savings"
                      value={totalSavings}
                      prefix="$"
                      testId="audit-report-savings"
                    />
                    <BigMetric
                      icon={Clock}
                      label="Hours saved / mo"
                      value={totalHours}
                      testId="audit-report-hours"
                    />
                    <BigMetric
                      icon={Cog}
                      label="Implementation"
                      value={report.implementation_timeline_days || 0}
                      suffix=" days"
                      testId="audit-report-days"
                    />
                  </div>
                </div>
              </Reveal>

              {/* Opportunities */}
              <Reveal delay={60}>
                <div
                  className="rounded-[16px] bg-[var(--ax-surface)] border border-[var(--ax-border)] p-7 md:p-10"
                  data-testid="audit-report-opportunities"
                >
                  <h2 className="text-[var(--ax-heading)] text-2xl md:text-3xl font-bold tracking-tight">
                    Automation opportunity map
                  </h2>
                  <p className="mt-2 text-[var(--ax-text)] text-sm max-w-2xl">
                    Specific workflows that AI can own. Ordered by impact.
                  </p>

                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {(report.opportunities || []).map((opp, i) => (
                      <article
                        key={i}
                        className="rounded-[14px] bg-[var(--ax-bg)] border border-[var(--ax-border)] p-6 transition-colors duration-150 hover:border-[rgba(0,212,255,0.3)]"
                        data-testid={`audit-report-opportunity-${i}`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="text-[var(--ax-heading)] text-base font-semibold leading-snug">
                            {opp.title}
                          </h3>
                          <PriorityBadge priority={opp.priority} />
                        </div>
                        <p className="text-[var(--ax-text)] text-sm leading-relaxed">
                          {opp.description}
                        </p>
                        <div className="mt-5 pt-4 border-t border-[var(--ax-border)] grid grid-cols-2 gap-3">
                          <div>
                            <p className="ax-mono-label mb-1">Hours saved</p>
                            <p className="ax-nums text-[var(--ax-heading)] text-xl font-bold">
                              {opp.estimated_hours_saved_per_month || 0}
                              <span className="text-[var(--ax-muted)] text-xs font-normal ml-1">
                                /mo
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="ax-mono-label mb-1">Monthly savings</p>
                            <p className="ax-nums text-[var(--ax-accent)] text-xl font-bold">
                              ${(opp.monthly_savings_usd || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* ROI Calculator */}
              <Reveal delay={120}>
                <div
                  className="rounded-[16px] bg-[var(--ax-surface)] border border-[var(--ax-border)] p-7 md:p-10"
                  data-testid="roi-calculator"
                >
                  <h2 className="text-[var(--ax-heading)] text-2xl md:text-3xl font-bold tracking-tight">
                    ROI calculator
                  </h2>
                  <p className="mt-2 text-[var(--ax-text)] text-sm max-w-2xl">
                    Adjust the inputs to see how AI deflection scales with your
                    support volume.
                  </p>

                  <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-5">
                      <RangeField
                        label="Support tickets / month"
                        value={supportVol}
                        onChange={setSupportVol}
                        min={50}
                        max={5000}
                        step={50}
                        testId="roi-support-volume-input"
                      />
                      <RangeField
                        label="Hourly cost (USD)"
                        value={hourlyCost}
                        onChange={setHourlyCost}
                        min={15}
                        max={150}
                        step={5}
                        prefix="$"
                        testId="roi-hourly-cost-input"
                      />
                      <p className="text-xs text-[var(--ax-muted)]">
                        Calculation assumes ~40% ticket auto-deflection and ~6
                        minutes saved per resolved ticket.
                      </p>
                    </div>

                    <div className="rounded-[14px] bg-[var(--ax-bg)] border border-[var(--ax-border)] p-6 flex flex-col justify-between">
                      <div>
                        <p className="ax-mono-label mb-2">
                          Estimated monthly savings
                        </p>
                        <p
                          className="ax-nums text-[var(--ax-accent)] text-5xl md:text-6xl font-bold tracking-tight"
                          data-testid="roi-result"
                          aria-live="polite"
                        >
                          $
                          <CountUp
                            end={calculatedSavings}
                            duration={0.6}
                            preserveValue
                            separator=","
                          />
                        </p>
                        <p className="mt-2 text-[var(--ax-text)] text-sm">
                          ~$
                          {(calculatedSavings * 12).toLocaleString()}/year
                          recovered
                        </p>
                      </div>
                      <div className="mt-6 pt-5 border-t border-[var(--ax-border)] flex items-start gap-3">
                        <Target
                          className="h-4 w-4 text-[var(--ax-accent)] mt-0.5 shrink-0"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                        <p className="text-xs text-[var(--ax-text)] leading-snug">
                          Combined with the{' '}
                          {report.opportunities?.length || 0} opportunities
                          above, total monthly recovered:{' '}
                          <span className="ax-nums text-[var(--ax-heading)] font-bold">
                            $
                            {(
                              totalSavings + calculatedSavings
                            ).toLocaleString()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Recommended agents */}
              <Reveal delay={180}>
                <div
                  className="rounded-[16px] bg-[var(--ax-surface)] border border-[var(--ax-border)] p-7 md:p-10"
                  data-testid="audit-report-agents"
                >
                  <h2 className="text-[var(--ax-heading)] text-2xl md:text-3xl font-bold tracking-tight">
                    Recommended AI agents
                  </h2>
                  <p className="mt-2 text-[var(--ax-text)] text-sm max-w-2xl">
                    The specific agents we would build for you, with setup cost
                    and timeline.
                  </p>

                  <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(report.recommended_agents || []).map((a, i) => (
                      <article
                        key={i}
                        className="rounded-[14px] bg-[var(--ax-bg)] border border-[var(--ax-border)] p-5"
                        data-testid={`audit-report-agent-${i}`}
                      >
                        <h3 className="text-[var(--ax-heading)] text-sm font-semibold">
                          {a.name}
                        </h3>
                        <p className="mt-2 text-[var(--ax-text)] text-sm leading-relaxed">
                          {a.description}
                        </p>
                        <div className="mt-5 pt-4 border-t border-[var(--ax-border)] flex items-center justify-between gap-3">
                          <div>
                            <p className="ax-mono-label mb-0.5">Setup</p>
                            <p className="ax-nums text-[var(--ax-heading)] text-sm font-bold">
                              ${(a.setup_cost_estimate_usd || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="ax-mono-label mb-0.5">Timeline</p>
                            <p className="ax-nums text-[var(--ax-accent)] text-sm font-bold">
                              {a.implementation_days || 0} days
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* Workflow map */}
              <Reveal delay={240}>
                <div
                  className="rounded-[16px] bg-[var(--ax-surface)] border border-[var(--ax-border)] p-7 md:p-10"
                  data-testid="audit-report-workflow"
                >
                  <h2 className="text-[var(--ax-heading)] text-2xl md:text-3xl font-bold tracking-tight">
                    Workflow map
                  </h2>
                  <p className="mt-2 text-[var(--ax-text)] text-sm max-w-2xl">
                    How automation flows through your business once agents are
                    live.
                  </p>

                  <ol className="mt-7 space-y-0" aria-label="Workflow steps">
                    {(report.workflow_map || []).map((w, i) => (
                      <li key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-9 w-9 rounded-[12px] bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.25)] flex items-center justify-center text-[var(--ax-accent)] font-mono text-sm font-bold shrink-0">
                            {w.step}
                          </div>
                          {i < (report.workflow_map || []).length - 1 && (
                            <div
                              className="w-px flex-1 bg-[var(--ax-border)] my-2"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <div className="pb-6">
                          <h3 className="text-[var(--ax-heading)] text-sm font-semibold pt-1.5">
                            {w.title}
                          </h3>
                          <p className="mt-1 text-[var(--ax-text)] text-sm leading-relaxed">
                            {w.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>

              {/* Final CTA */}
              <Reveal delay={300}>
                <div className="rounded-[16px] bg-[var(--ax-surface-2)] border border-[var(--ax-border)] p-7 md:p-10">
                  <div className="max-w-xl">
                    <h2 className="text-[var(--ax-heading)] text-2xl md:text-3xl font-bold tracking-tight">
                      Ready to ship the first automation?
                    </h2>
                    <p className="mt-3 text-[var(--ax-text)] text-sm leading-relaxed">
                      Book a 15-minute call. We walk through your report,
                      pick the first workflow to build, and give you a
                      concrete implementation plan.
                    </p>
                    <Link
                      to="/contact"
                      data-testid="audit-report-final-cta-button"
                      className="mt-6 inline-flex items-center gap-2 rounded-[12px] bg-[var(--ax-accent)] text-[var(--ax-on-accent)] px-6 py-3 text-sm font-semibold transition-colors duration-150 hover:bg-[var(--ax-accent-dim)] active:scale-[0.98] ax-cta-pulse"
                    >
                      Book Implementation Call
                      <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                    </Link>
                  </div>
                </div>
              </Reveal>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default AuditReport;
