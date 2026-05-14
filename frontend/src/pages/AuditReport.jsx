import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Download, CalendarCheck, Sparkles, AlertTriangle, RefreshCw, TrendingUp, Cog, Clock, Target } from 'lucide-react';
import CountUp from 'react-countup';
import { publicApi } from '../lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';

const AuditReport = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [polls, setPolls] = useState(0);

  // ROI calc state
  const [supportVol, setSupportVol] = useState(200);
  const [hourlyCost, setHourlyCost] = useState(35);

  const load = async () => {
    try {
      const res = await publicApi.getReport(id);
      setData(res.data);
    } catch (e) {
      setErr(e?.response?.data?.detail || 'Report not found');
    }
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    // Poll while report is still generating
    if (!data) return;
    if (data?.report && !data.report.error && (data.report.opportunities?.length || data.report.executive_summary)) return;
    if (polls > 30) return; // stop after ~60s
    const t = setTimeout(() => {
      setPolls((p) => p + 1);
      load();
    }, 2000);
    return () => clearTimeout(t);
  }, [data, polls]);

  const isLoading = !data;
  const isGenerating = data && (!data.report || (!data.report.error && (!data.report.opportunities || !data.report.opportunities.length)));
  const hasError = data?.report?.error;
  const report = data?.report;

  const totalSavings = report?.total_monthly_savings_usd || 0;
  const totalHours = report?.total_hours_saved_per_month || 0;

  // Live ROI calculator (additive)
  const calculatedSavings = useMemo(() => {
    return Math.round(supportVol * hourlyCost * 0.4); // assume 40% auto-deflection
  }, [supportVol, hourlyCost]);

  return (
    <>
      <Helmet>
        <title>{data?.businessName ? `${data.businessName} — AI Audit Report | Axovion.io` : 'AI Audit Report | Axovion.io'}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <section className="relative ax-section bg-[#0A0A0F] pb-10" data-testid="audit-report-hero">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -inset-24 bg-[radial-gradient(700px_circle_at_70%_20%,rgba(0,212,255,0.10),transparent_60%)]" />
        </div>
        <div className="relative ax-container">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-4">AI Audit Report</div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-white text-[36px] md:text-[56px] leading-[1.05] tracking-[-0.03em] font-extrabold" data-testid="audit-report-business">
                {data?.businessName || <Skeleton className="h-12 w-80 bg-white/8" />}
              </h1>
              <p className="mt-3 text-[#C0C0C8]/75 text-base">{data?.industry} {data?.websiteUrl && <>· <a href={data.websiteUrl} target="_blank" rel="noreferrer" className="text-[#00D4FF] hover:underline">{data.websiteUrl}</a></>}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.print()}
                data-testid="audit-report-download-pdf-button"
                className="inline-flex items-center gap-2 rounded-[12px] bg-[#12121A] text-white px-5 py-3 text-sm font-semibold border border-white/15 hover:border-[#00D4FF]/45 transition-colors duration-200"
              >
                <Download className="h-4 w-4" /> Download as PDF
              </button>
              <Link
                to="/contact"
                data-testid="audit-report-book-call-button"
                className="inline-flex items-center gap-2 rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-5 py-3 text-sm font-bold transition-colors duration-200 hover:bg-[#FBBF24] ax-cta-pulse"
              >
                <CalendarCheck className="h-4 w-4" /> Book Implementation Call
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-[120px] bg-[#0A0A0F]">
        <div className="ax-container">
          {err && (
            <div className="rounded-[16px] bg-[#EF4444]/10 border border-[#EF4444]/30 p-6 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[#EF4444] mt-0.5" />
              <div>
                <h3 className="text-white font-bold">Report not found</h3>
                <p className="text-[#C0C0C8]/75 text-sm mt-1">{err}</p>
                <Link to="/audit" className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#00D4FF]">Start a new audit <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
          )}

          {isLoading && !err && <ReportSkeleton />}

          {data && isGenerating && (
            <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-8 text-center" data-testid="audit-loading-state">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/30">
                <RefreshCw className="h-4 w-4 text-[#00D4FF] animate-spin" />
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#00D4FF]">AI analyzing your business</span>
              </div>
              <h3 className="mt-5 text-white text-2xl font-extrabold">Generating your custom report…</h3>
              <p className="mt-3 text-[#C0C0C8]/70 max-w-md mx-auto">Our AI is mapping automation opportunities and calculating ROI. This usually takes 10-30 seconds.</p>
              <div className="mt-8 max-w-md mx-auto space-y-3">
                <Skeleton className="h-3 w-full bg-white/8" />
                <Skeleton className="h-3 w-5/6 bg-white/8" />
                <Skeleton className="h-3 w-4/6 bg-white/8" />
              </div>
            </div>
          )}

          {hasError && (
            <div className="rounded-[16px] bg-[#EF4444]/10 border border-[#EF4444]/30 p-6 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[#EF4444] mt-0.5" />
              <div>
                <h3 className="text-white font-bold">Report generation failed</h3>
                <p className="text-[#C0C0C8]/75 text-sm mt-1">{report.error}</p>
                <p className="text-[#C0C0C8]/55 text-xs mt-2">Our team has been notified. You can also <Link to="/contact" className="text-[#00D4FF]">reach out directly</Link>.</p>
              </div>
            </div>
          )}

          {report && !isGenerating && !hasError && (
            <div className="space-y-8">
              {/* Executive summary + headline metrics */}
              <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-7 md:p-10" data-testid="audit-report-summary">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-[#00D4FF]" />
                  <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#00D4FF]">Executive summary</div>
                </div>
                <p className="text-white text-lg md:text-xl leading-relaxed" data-testid="audit-report-exec-summary-text">{report.executive_summary}</p>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <BigMetric icon={TrendingUp} label="Monthly savings" value={totalSavings} prefix="$" testId="audit-report-savings" />
                  <BigMetric icon={Clock} label="Hours saved/mo" value={totalHours} testId="audit-report-hours" />
                  <BigMetric icon={Cog} label="Implementation" value={report.implementation_timeline_days || 0} suffix=" days" testId="audit-report-days" />
                </div>
              </div>

              {/* Opportunities */}
              <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-7 md:p-10" data-testid="audit-report-opportunities">
                <h2 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Automation opportunity map</h2>
                <p className="mt-3 text-[#C0C0C8]/75 max-w-2xl">Specific workflows that AI can take over for you. Ordered by impact.</p>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  {(report.opportunities || []).map((opp, i) => (
                    <div key={i} className="rounded-[14px] bg-[#0A0A0F] border border-white/10 p-6 transition-colors duration-200 hover:border-[#00D4FF]/30" data-testid={`audit-report-opportunity-${i}`}>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-white text-lg font-bold leading-snug">{opp.title}</h3>
                        <PriorityBadge priority={opp.priority} />
                      </div>
                      <p className="mt-3 text-[#C0C0C8]/75 text-sm leading-relaxed">{opp.description}</p>
                      <div className="mt-5 pt-4 border-t border-white/8 grid grid-cols-2 gap-3">
                        <div>
                          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Hours saved</div>
                          <div className="text-white font-bold text-xl mt-0.5">{opp.estimated_hours_saved_per_month || 0}<span className="text-[#C0C0C8]/55 text-xs ml-1 font-normal">/mo</span></div>
                        </div>
                        <div>
                          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Monthly savings</div>
                          <div className="text-[#00D4FF] font-bold text-xl mt-0.5">${(opp.monthly_savings_usd || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ROI Calculator */}
              <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-7 md:p-10" data-testid="roi-calculator">
                <h2 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">ROI calculator</h2>
                <p className="mt-3 text-[#C0C0C8]/75 max-w-2xl">Adjust the inputs to see how AI deflection scales with your support volume.</p>
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
                    <div className="text-[#C0C0C8]/55 text-xs">
                      Calculation assumes ~40% ticket auto-deflection and ~6 minutes saved per resolved ticket.
                    </div>
                  </div>
                  <div className="rounded-[14px] bg-[#0A0A0F] border border-white/10 p-6 flex flex-col justify-between">
                    <div>
                      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Estimated monthly savings</div>
                      <div className="mt-2 text-[#00D4FF] text-5xl md:text-6xl font-extrabold tracking-tight font-mono" data-testid="roi-result">
                        $<CountUp end={calculatedSavings} duration={0.6} preserveValue separator="," />
                      </div>
                      <div className="mt-2 text-[#C0C0C8]/70 text-sm">~${(calculatedSavings * 12).toLocaleString()}/year recovered</div>
                    </div>
                    <div className="mt-6 pt-5 border-t border-white/8 flex items-center justify-between gap-3">
                      <Target className="h-5 w-5 text-[#00D4FF]" />
                      <div className="text-xs text-[#C0C0C8]/70 leading-snug">Combined with the {report.opportunities?.length || 0} opportunities above, total monthly recovered: <span className="text-white font-bold">${(totalSavings + calculatedSavings).toLocaleString()}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended agents */}
              <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-7 md:p-10" data-testid="audit-report-agents">
                <h2 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Recommended AI agents</h2>
                <p className="mt-3 text-[#C0C0C8]/75 max-w-2xl">The specific agents we'd build for you, with setup cost &amp; timeline.</p>
                <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(report.recommended_agents || []).map((a, i) => (
                    <div key={i} className="rounded-[14px] bg-[#0A0A0F] border border-white/10 p-6" data-testid={`audit-report-agent-${i}`}>
                      <h3 className="text-white text-base font-bold">{a.name}</h3>
                      <p className="mt-2 text-[#C0C0C8]/70 text-sm leading-relaxed">{a.description}</p>
                      <div className="mt-5 pt-4 border-t border-white/8 flex items-center justify-between">
                        <div>
                          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Setup</div>
                          <div className="text-white font-bold mt-0.5">${(a.setup_cost_estimate_usd || 0).toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Timeline</div>
                          <div className="text-[#00D4FF] font-bold mt-0.5">{a.implementation_days || 0} days</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow map */}
              <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-7 md:p-10" data-testid="audit-report-workflow">
                <h2 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Workflow map</h2>
                <p className="mt-3 text-[#C0C0C8]/75 max-w-2xl">How automation flows through your business once agents are live.</p>
                <ol className="mt-7 space-y-4">
                  {(report.workflow_map || []).map((w, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="shrink-0 h-10 w-10 rounded-[12px] bg-[#00D4FF]/12 border border-[#00D4FF]/30 inline-flex items-center justify-center text-[#00D4FF] font-mono font-bold">{w.step}</div>
                      <div>
                        <h3 className="text-white text-base font-bold">{w.title}</h3>
                        <p className="mt-1 text-[#C0C0C8]/75 text-sm leading-relaxed">{w.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Final CTA */}
              <div className="rounded-[16px] bg-gradient-to-br from-[#12121A] to-[#0A0A0F] border border-[#F97316]/25 p-7 md:p-10 text-center">
                <h2 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Ready to ship?</h2>
                <p className="mt-3 text-[#C0C0C8]/75 max-w-xl mx-auto">Book a 15-minute call to walk through your report and pick the first automation to build.</p>
                <Link to="/contact" data-testid="audit-report-final-cta-button" className="mt-6 inline-flex items-center gap-2 rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-7 py-4 text-base font-bold transition-colors duration-200 hover:bg-[#FBBF24] ax-cta-pulse">
                  Book Implementation Call <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

const BigMetric = ({ icon: Icon, label, value, prefix = '', suffix = '', testId }) => (
  <div className="rounded-[14px] bg-[#0A0A0F] border border-white/10 p-6" data-testid={testId}>
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-[#00D4FF]" />
      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">{label}</div>
    </div>
    <div className="text-white text-3xl md:text-4xl font-extrabold tracking-tight">
      {prefix}<CountUp end={Number(value) || 0} duration={1.2} separator="," />{suffix}
    </div>
  </div>
);

const PriorityBadge = ({ priority }) => {
  const map = {
    high: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/25',
    medium: 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/25',
    low: 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/25',
  };
  const cls = map[priority] || map.medium;
  return <span className={`shrink-0 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border ${cls}`}>{priority || 'medium'}</span>;
};

const RangeField = ({ label, value, onChange, min, max, step = 1, prefix = '', testId }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-white text-sm font-semibold">{label}</span>
      <span className="text-[#00D4FF] font-mono font-bold">{prefix}{value.toLocaleString()}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      data-testid={testId}
      className="w-full accent-[#00D4FF]"
    />
    <div className="mt-1 flex justify-between text-[10px] font-mono text-[#C0C0C8]/55">
      <span>{prefix}{min.toLocaleString()}</span>
      <span>{prefix}{max.toLocaleString()}</span>
    </div>
  </div>
);

const ReportSkeleton = () => (
  <div className="space-y-6">
    <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-8 space-y-4">
      <Skeleton className="h-3 w-32 bg-white/8" />
      <Skeleton className="h-5 w-3/4 bg-white/8" />
      <Skeleton className="h-5 w-2/3 bg-white/8" />
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 bg-white/8" />)}
      </div>
    </div>
    <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40 bg-white/8" />)}
    </div>
  </div>
);

export default AuditReport;
