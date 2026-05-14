import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Quote } from 'lucide-react';
import CountUp from 'react-countup';
import { CASE_STUDIES } from '../lib/content';
import { useScrollReveal } from '../lib/hooks';

const Reveal = ({ children, delay = 0 }) => {
  const ref = useScrollReveal();
  return <div ref={ref} className="ax-reveal" style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

const BIG_STATS = [
  { value: 500000, label: 'Customer interactions automated', suffix: '+' },
  { value: 2000000, label: 'Client revenue recovered/saved', prefix: '$', suffix: '+' },
  { value: 100, label: 'AI agents deployed', suffix: '+' },
  { value: 24, label: 'Always-on availability', suffix: '/7' },
];

const Results = () => {
  return (
    <>
      <Helmet>
        <title>Real Results, Real ROI | Axovion.io</title>
        <meta name="description" content="See how businesses are saving time and money with Axovion.io AI agents — real case studies, real numbers." />
      </Helmet>

      <section className="relative ax-section bg-[#0A0A0F]" data-testid="results-hero">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -inset-24 bg-[radial-gradient(700px_circle_at_30%_20%,rgba(0,212,255,0.10),transparent_60%)]" />
        </div>
        <div className="relative ax-container">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-4">Results</div>
          <h1 className="text-white text-[40px] md:text-[64px] leading-[1.05] tracking-[-0.03em] font-extrabold max-w-3xl">Real results, real ROI</h1>
          <p className="mt-5 text-[#C0C0C8]/80 text-lg max-w-2xl">See how businesses like yours are saving time and money with AI agents — with the actual numbers.</p>
        </div>
      </section>

      <section className="pb-20 md:pb-[120px] bg-[#0A0A0F]">
        <div className="ax-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6" data-testid="results-metrics">
            {BIG_STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-6 md:p-7">
                  <div className="text-[#F97316] text-3xl md:text-5xl font-extrabold tracking-tight font-mono" data-testid={`results-metric-${i}`}>
                    {s.prefix || ''}<CountUp end={s.value} duration={1.8} separator="," enableScrollSpy scrollSpyOnce />{s.suffix || ''}
                  </div>
                  <div className="mt-2 text-[#C0C0C8]/70 text-sm">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-[120px] bg-[#0A0A0F]">
        <div className="ax-container">
          <h2 className="text-white text-[32px] md:text-[48px] leading-[1.05] tracking-[-0.03em] font-extrabold max-w-3xl">Case studies</h2>
          <div className="mt-10 md:mt-14 space-y-6">
            {CASE_STUDIES.map((c, idx) => (
              <Reveal key={c.industry} delay={idx * 80}>
                <article className="rounded-[16px] bg-[#12121A] border border-white/10 p-7 md:p-10 transition-colors duration-300 hover:border-[#00D4FF]/25" data-testid={`case-study-${idx}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#00D4FF] bg-[#00D4FF]/10 border border-[#00D4FF]/25 px-2.5 py-1 rounded-full">{c.industry}</span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 space-y-5">
                      <div>
                        <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55 mb-1">Challenge</div>
                        <p className="text-white text-lg leading-snug">{c.challenge}</p>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55 mb-1">Solution</div>
                        <p className="text-[#C0C0C8]/80 leading-relaxed">{c.solution}</p>
                      </div>
                      <div className="rounded-[14px] bg-[#0A0A0F] border border-white/10 p-5 mt-2">
                        <Quote className="h-5 w-5 text-[#00D4FF]" />
                        <p className="mt-3 text-white text-base leading-relaxed">“{c.quote}”</p>
                        <div className="mt-3 text-[#C0C0C8]/55 text-xs font-mono uppercase tracking-widest">{c.quoteName}</div>
                      </div>
                    </div>
                    <div className="lg:col-span-5">
                      <div className="grid grid-cols-1 gap-3">
                        {c.results.map((r, i) => (
                          <div key={i} className="rounded-[14px] bg-[#0A0A0F] border border-white/10 p-5 flex items-baseline justify-between">
                            <div>
                              <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">{r.label}</div>
                              {r.from && <div className="text-[#C0C0C8]/55 text-xs mt-1 line-through">{r.from}</div>}
                            </div>
                            <div className="text-[#00D4FF] text-3xl md:text-4xl font-extrabold tracking-tight font-mono" data-testid={`case-study-${idx}-metric-${i}`}>
                              {r.prefix || ''}<CountUp end={r.value} duration={1.5} separator="," enableScrollSpy scrollSpyOnce />{r.suffix || ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 text-center">
            <h3 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Ready to be our next success story?</h3>
            <Link to="/audit" data-testid="results-final-cta-button" className="mt-6 inline-flex items-center gap-2 rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-7 py-3.5 text-base font-bold transition-colors duration-200 hover:bg-[#FBBF24] ax-cta-pulse">
              Start Free AI Audit <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Results;
