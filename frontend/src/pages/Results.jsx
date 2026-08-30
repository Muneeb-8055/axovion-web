import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Quote } from 'lucide-react';
import CountUp from 'react-countup';
import { CASE_STUDIES } from '../lib/content';
import { useScrollReveal } from '../lib/hooks';

/* Scroll-reveal wrapper using IntersectionObserver (never window scroll) */
const Reveal = ({ children, delay = 0 }) => {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="ax-reveal" style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

/* -----------------------------------------------------------------------
   Results page
   Argument: "Here is the evidence. Numbers first, story second."

   Sections (6):
   1. Hero             - number-in-heading device, no eyebrow
   2. Aggregate stats  - bento grid, 4 cells, 2 visually distinct
   3. Case studies     - three separate articles, two-column data layout
   4. Quote panel      - staggered blockquote layout (NOT cards-in-row)
   5. Guarantee strip  - horizontal prose band
   6. CTA              - asymmetric, left close with right action

   Eyebrow budget: ceil(6/3) = 2. Eyebrows used: 0.
   Total = 0. Within budget.

   Metric colors: cyan only. No orange. Status colors reserved for status.
   ----------------------------------------------------------------------- */

const BIG_STATS = [
  { value: 500000, label: 'Customer interactions automated', suffix: '+' },
  { value: 2000000, label: 'Client revenue recovered or saved', prefix: '$', suffix: '+' },
  { value: 100, label: 'AI agents in production', suffix: '+' },
  { value: 24, label: 'Hours per day your agents run', suffix: '/7' },
];

const Results = () => {
  return (
    <>
      <Helmet>
        <title>Real Results, Real ROI | Axovion.io</title>
        <meta
          name="description"
          content="See how businesses are saving time and money with Axovion.io AI agents, real case studies, real numbers."
        />
      </Helmet>

      {/* ── 1. Hero (number-led, no eyebrow) ────────────────────────────── */}
      <section
        className="ax-section"
        style={{ background: 'var(--ax-bg)' }}
        data-testid="results-hero"
      >
        <div className="ax-container">
          <h1
            className="text-white font-extrabold leading-[1.05] tracking-[-0.03em]"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', maxWidth: '22ch' }}
          >
            The numbers speak. Here they are.
          </h1>
          <p
            className="mt-5 text-base md:text-lg leading-relaxed"
            style={{ color: 'var(--ax-text)', maxWidth: '58ch' }}
          >
            Every figure on this page comes from production deployments. No
            projections, no averages from curated samples. Actual client
            outcomes.
          </p>
        </div>
      </section>

      {/* ── 2. Aggregate stats bento (4 cells, 2 visually distinct) ────── */}
      <section
        style={{ background: 'var(--ax-bg)', paddingBottom: '5rem' }}
        data-testid="results-metrics"
      >
        <div className="ax-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {BIG_STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 70}>
                <div
                  style={{
                    borderRadius: 'var(--ax-radius-panel)',
                    border:
                      i === 0
                        ? '1px solid rgba(0,212,255,0.25)'
                        : '1px solid var(--ax-border)',
                    background:
                      i === 0 ? 'rgba(0,212,255,0.05)' : 'var(--ax-surface)',
                    padding: i === 0 ? '1.75rem' : '1.5rem',
                    gridColumn: i === 0 ? 'span 2' : 'span 1',
                  }}
                  data-testid={`results-metric-${i}`}
                >
                  <div
                    className="font-mono font-medium ax-nums"
                    style={{
                      fontSize:
                        i === 0
                          ? 'clamp(2.5rem, 6vw, 3.75rem)'
                          : 'clamp(1.75rem, 4vw, 2.5rem)',
                      color: 'var(--ax-accent)',
                      lineHeight: 1,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {s.prefix || ''}
                    <CountUp
                      end={s.value}
                      duration={1.8}
                      separator=","
                      enableScrollSpy
                      scrollSpyOnce
                    />
                    {s.suffix || ''}
                  </div>
                  <p
                    className="mt-2 text-sm leading-snug"
                    style={{
                      color: i === 0 ? 'var(--ax-text)' : 'var(--ax-muted)',
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Case studies ─────────────────────────────────────────────── */}
      <section
        className="ax-section"
        style={{
          background: 'var(--ax-surface)',
          borderTop: '1px solid var(--ax-border)',
        }}
        data-testid="results-case-studies"
      >
        <div className="ax-container">
          <h2
            className="text-white font-extrabold leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', marginBottom: '3rem' }}
          >
            Three client stories in full detail.
          </h2>

          <div className="space-y-0" style={{ borderTop: '1px solid var(--ax-border)' }}>
            {CASE_STUDIES.map((c, idx) => (
              <Reveal key={c.industry} delay={idx * 60}>
                <article
                  className="py-10 md:py-12"
                  style={{ borderBottom: '1px solid var(--ax-border)' }}
                  data-testid={`case-study-${idx}`}
                >
                  {/* Industry label */}
                  <p
                    className="font-mono text-[11px] uppercase tracking-[0.16em] mb-5"
                    style={{ color: 'var(--ax-accent)' }}
                  >
                    {c.industry}
                  </p>

                  {/* Two-column: narrative left, metrics right */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
                    <div className="lg:col-span-7 space-y-6">
                      <div>
                        <p
                          className="text-xs font-mono uppercase tracking-widest mb-1"
                          style={{ color: 'var(--ax-muted-2)' }}
                        >
                          Challenge
                        </p>
                        <p
                          className="text-white text-lg leading-snug font-medium"
                        >
                          {c.challenge}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-xs font-mono uppercase tracking-widest mb-1"
                          style={{ color: 'var(--ax-muted-2)' }}
                        >
                          What we built
                        </p>
                        <p
                          className="text-base leading-relaxed"
                          style={{ color: 'var(--ax-text)' }}
                        >
                          {c.solution}
                        </p>
                      </div>
                      {/* Quote inline, not a separate card */}
                      <blockquote
                        className="border-l-2 pl-4 text-base italic leading-relaxed"
                        style={{
                          borderColor: 'var(--ax-accent)',
                          color: 'var(--ax-text)',
                        }}
                      >
                        <Quote
                          strokeWidth={1.5}
                          className="h-4 w-4 mb-2"
                          style={{ color: 'var(--ax-accent)' }}
                        />
                        {c.quote}
                        <footer
                          className="mt-2 not-italic text-xs font-mono uppercase tracking-widest"
                          style={{ color: 'var(--ax-muted-2)' }}
                        >
                          {c.quoteName}
                        </footer>
                      </blockquote>
                    </div>

                    {/* Metrics column */}
                    <div className="lg:col-span-5 flex flex-col gap-3">
                      {c.results.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-end justify-between py-4 px-5"
                          style={{
                            background: 'var(--ax-surface-2)',
                            borderRadius: 'var(--ax-radius-panel)',
                            border: '1px solid var(--ax-border)',
                          }}
                          data-testid={`case-study-${idx}-metric-${i}`}
                        >
                          <div>
                            <p
                              className="text-xs font-mono uppercase tracking-widest"
                              style={{ color: 'var(--ax-muted-2)' }}
                            >
                              {r.label}
                            </p>
                            {r.from && (
                              <p
                                className="text-xs mt-0.5 line-through"
                                style={{ color: 'var(--ax-muted-2)' }}
                              >
                                {r.from}
                              </p>
                            )}
                          </div>
                          <div
                            className="font-mono font-medium ax-nums"
                            style={{
                              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                              color: 'var(--ax-accent)',
                              lineHeight: 1,
                              letterSpacing: '-0.03em',
                            }}
                          >
                            {r.prefix || ''}
                            <CountUp
                              end={r.value}
                              duration={1.5}
                              separator=","
                              enableScrollSpy
                              scrollSpyOnce
                            />
                            {r.suffix || ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Guarantee strip ──────────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--ax-bg)',
          borderTop: '1px solid var(--ax-border)',
          borderBottom: '1px solid var(--ax-border)',
          paddingTop: '3.5rem',
          paddingBottom: '3.5rem',
        }}
        data-testid="results-guarantee"
      >
        <div className="ax-container">
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-start">
              <div className="md:col-span-4">
                <p
                  className="text-white text-2xl md:text-3xl font-bold leading-snug tracking-[-0.02em]"
                >
                  ROI or we keep working.
                </p>
              </div>
              <div className="md:col-span-8">
                <p
                  className="text-base md:text-lg leading-relaxed"
                  style={{ color: 'var(--ax-text)', maxWidth: '60ch' }}
                >
                  Every agent we ship comes with a tracked return. If it does
                  not save money or time within 60 days, we continue optimizing
                  at no charge until it does. That is what ROI-first actually
                  means in practice.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 5. CTA (asymmetric) ─────────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--ax-bg)',
          paddingTop: '5rem',
          paddingBottom: '5rem',
        }}
        data-testid="results-final-cta"
      >
        <div className="ax-container flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div style={{ maxWidth: '46ch' }}>
            <h2
              className="text-white font-extrabold leading-[1.1] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
            >
              See what the audit surfaces for your business.
            </h2>
            <p
              className="mt-3 text-base leading-relaxed"
              style={{ color: 'var(--ax-muted)' }}
            >
              Free, delivered in 24 hours.
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <Link
              to="/audit"
              data-testid="results-final-cta-button"
              className="inline-flex items-center gap-2 text-base font-bold transition-colors duration-200 active:scale-[0.98] ax-cta-pulse"
              style={{
                background: 'var(--ax-accent)',
                color: 'var(--ax-on-accent)',
                borderRadius: 'var(--ax-radius-control)',
                padding: '0.75rem 1.75rem',
                minHeight: '48px',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--ax-accent-dim)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'var(--ax-accent)';
              }}
            >
              Start Free AI Audit
              <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Results;
