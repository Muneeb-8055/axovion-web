import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  MessageSquare,
  Zap,
  CalendarClock,
  ShoppingCart,
  PackageSearch,
  MailPlus,
  Compass,
} from 'lucide-react';
import { SERVICES } from '../lib/content';
import { useScrollReveal } from '../lib/hooks';

const ICONS = {
  ClipboardCheck,
  MessageSquareBot: MessageSquare,
  Zap,
  CalendarClock,
  ShoppingCart,
  PackageSearch,
  MailPlus,
  Compass,
};

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
   Services page
   Argument: "Here is every capability we have, and why each one earns its
   place." A capability argument organized as a scannable reference, not a
   sales sheet.

   Sections (7):
   1. Hero             - full-width, left-aligned, number-in-heading device
   2. Audit callout    - horizontal accent band (distinct from hero)
   3. Service table    - two-column label-plus-details list (no cards)
   4. Industry tags    - flat horizontal tag strip
   5. Depth spotlight  - one service shown in full-detail asymmetric layout
   6. How it works     - three-step numbered prose (NOT icon-in-circle cards)
   7. CTA              - left-aligned close, not centered

   Eyebrow budget: ceil(7/3) = 3. Eyebrows used: 1 (hero), 1 (how it works).
   Total = 2. Within budget.
   ----------------------------------------------------------------------- */

const Services = () => {
  /* Bento card mouse-tracking highlight */
  const bentoRef = useRef(null);
  useEffect(() => {
    const el = bentoRef.current;
    if (!el) return;
    const cards = el.querySelectorAll('.ax-bento-card');
    const handleMove = (e) => {
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', `${x}%`);
        card.style.setProperty('--my', `${y}%`);
      });
    };
    el.addEventListener('mousemove', handleMove);
    return () => el.removeEventListener('mousemove', handleMove);
  }, []);

  /* Spotlight service (consulting = most strategic, last in list) */
  const spotlight = SERVICES[SERVICES.length - 1];
  const SpotlightIcon = ICONS[spotlight.icon] || Compass;

  /* All services except spotlight */
  const listServices = SERVICES.slice(0, -1);

  return (
    <>
      <Helmet>
        <title>AI Automation Services | Axovion.io</title>
        <meta
          name="description"
          content="End-to-end AI agent development: customer support chatbots, lead follow-up, booking automation, e-commerce, CRM &amp; email automation, AI consulting."
        />
      </Helmet>

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <section
        className="ax-section"
        style={{ background: 'var(--ax-bg)' }}
        data-testid="services-hero"
      >
        <div className="ax-container">
          <p
            className="ax-mono-label mb-5"
            style={{ color: 'var(--ax-accent)' }}
          >
            Capabilities
          </p>
          <h1
            className="text-white font-extrabold leading-[1.05] tracking-[-0.03em]"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', maxWidth: '22ch' }}
          >
            Eight ways we take the manual work off your plate.
          </h1>
          <p
            className="mt-5 text-base md:text-lg leading-relaxed"
            style={{ color: 'var(--ax-text)', maxWidth: '60ch' }}
          >
            Every service is production-grade, tracks its own ROI, and ships
            in days. Pick one or let the free AI Audit tell you where to start.
          </p>
        </div>
      </section>

      {/* ── 2. Audit callout band ────────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--ax-surface)',
          borderTop: '1px solid var(--ax-border)',
          borderBottom: '1px solid var(--ax-border)',
        }}
        data-testid="services-audit-band"
      >
        <div className="ax-container py-8 md:py-10">
          <Reveal>
            <div
              className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-10"
            >
              <div style={{ flex: '1 1 auto', maxWidth: '52ch' }}>
                <p
                  className="text-white text-xl md:text-2xl font-semibold leading-snug tracking-[-0.01em]"
                >
                  Not sure which service fits? The free AI Audit answers that.
                </p>
                <p
                  className="mt-2 text-sm"
                  style={{ color: 'var(--ax-muted)' }}
                >
                  Workflow map, ROI projection, and recommended agents, delivered
                  in 24 hours.
                </p>
              </div>
              <div style={{ flexShrink: 0 }}>
                <Link
                  to="/audit"
                  data-testid="services-audit-band-cta"
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-200 active:scale-[0.98]"
                  style={{
                    background: 'var(--ax-accent)',
                    color: 'var(--ax-on-accent)',
                    borderRadius: 'var(--ax-radius-control)',
                    padding: '0.6rem 1.5rem',
                    minHeight: '44px',
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
          </Reveal>
        </div>
      </section>

      {/* ── 3. Service list (label + details, no cards) ──────────────────── */}
      <section
        className="ax-section"
        style={{ background: 'var(--ax-bg)' }}
        data-testid="services-list"
      >
        <div className="ax-container">
          <div
            style={{
              borderTop: '1px solid var(--ax-border-strong)',
            }}
          >
            {listServices.map((s, idx) => {
              const Icon = ICONS[s.icon] || ClipboardCheck;
              return (
                <Reveal key={s.slug} delay={idx * 40}>
                  <article
                    className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-8 md:py-10 transition-colors duration-200"
                    style={{
                      borderBottom: '1px solid var(--ax-border)',
                    }}
                    data-testid={`service-card-${s.slug}`}
                  >
                    {/* Left: icon + title */}
                    <div className="md:col-span-4 flex flex-col gap-3">
                      <div
                        className="inline-flex items-center justify-center"
                        style={{
                          height: '44px',
                          width: '44px',
                          borderRadius: 'var(--ax-radius-control)',
                          background: 'rgba(0,212,255,0.08)',
                          border: '1px solid rgba(0,212,255,0.2)',
                          flexShrink: 0,
                        }}
                      >
                        <Icon
                          strokeWidth={1.5}
                          className="h-5 w-5"
                          style={{ color: 'var(--ax-accent)' }}
                        />
                      </div>
                      <h2
                        className="text-white text-xl font-semibold tracking-[-0.01em]"
                        dangerouslySetInnerHTML={{ __html: s.title }}
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {s.industries.map((ind) => (
                          <span
                            key={ind}
                            className="text-[11px] font-mono uppercase tracking-widest px-2 py-0.5"
                            style={{
                              color: 'var(--ax-muted-2)',
                              background: 'var(--ax-surface)',
                              borderRadius: 'var(--ax-radius-pill)',
                              border: '1px solid var(--ax-border)',
                            }}
                          >
                            {ind}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: description + bullets */}
                    <div className="md:col-span-8">
                      <p
                        className="text-base leading-relaxed"
                        style={{ color: 'var(--ax-text)', maxWidth: '62ch' }}
                        dangerouslySetInnerHTML={{ __html: s.full }}
                      />
                      <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                        {s.bullets.map((b) => (
                          <li
                            key={b}
                            className="flex items-start gap-2 text-sm"
                            style={{ color: 'var(--ax-text)' }}
                          >
                            <Check
                              strokeWidth={1.5}
                              className="h-4 w-4 mt-0.5 shrink-0"
                              style={{ color: 'var(--ax-accent)' }}
                            />
                            <span dangerouslySetInnerHTML={{ __html: b }} />
                          </li>
                        ))}
                      </ul>
                      <Link
                        to="/audit"
                        data-testid={`service-card-cta-${s.slug}`}
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
                        style={{ color: 'var(--ax-accent)', minHeight: '44px', padding: '0.625rem 0' }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.color = 'var(--ax-accent)';
                        }}
                      >
                        Get AI Audit
                        <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. Spotlight: AI Consulting (full-detail asymmetric) ─────────── */}
      <section
        className="ax-section"
        style={{
          background: 'var(--ax-surface)',
          borderTop: '1px solid var(--ax-border)',
          borderBottom: '1px solid var(--ax-border)',
        }}
        data-testid="services-spotlight"
        ref={bentoRef}
      >
        <div className="ax-container">
          <Reveal>
            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16"
              style={{ alignItems: 'start' }}
            >
              {/* Left column */}
              <div>
                <div
                  className="inline-flex items-center justify-center mb-5"
                  style={{
                    height: '52px',
                    width: '52px',
                    borderRadius: 'var(--ax-radius-panel)',
                    background: 'rgba(0,212,255,0.08)',
                    border: '1px solid rgba(0,212,255,0.2)',
                  }}
                >
                  <SpotlightIcon
                    strokeWidth={1.5}
                    className="h-6 w-6"
                    style={{ color: 'var(--ax-accent)' }}
                  />
                </div>
                <h2
                  className="text-white font-extrabold leading-[1.1] tracking-[-0.02em]"
                  style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
                  dangerouslySetInnerHTML={{ __html: spotlight.title }}
                />
                <p
                  className="mt-4 text-base md:text-lg leading-relaxed"
                  style={{ color: 'var(--ax-text)', maxWidth: '52ch' }}
                  dangerouslySetInnerHTML={{ __html: spotlight.full }}
                />
                <div className="flex flex-wrap gap-1.5 mt-5">
                  {spotlight.industries.map((ind) => (
                    <span
                      key={ind}
                      className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-1"
                      style={{
                        color: 'var(--ax-muted)',
                        background: 'rgba(0,212,255,0.06)',
                        border: '1px solid rgba(0,212,255,0.18)',
                        borderRadius: 'var(--ax-radius-pill)',
                      }}
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right column: bento with bullets as distinct cells */}
              <div
                className="grid grid-cols-2 gap-3"
                style={{ alignContent: 'start' }}
              >
                {spotlight.bullets.map((b, i) => (
                  <div
                    key={b}
                    className="ax-bento-card"
                    style={{
                      background:
                        i === 0
                          ? 'rgba(0,212,255,0.06)'
                          : 'var(--ax-surface-2)',
                      border:
                        i === 0
                          ? '1px solid rgba(0,212,255,0.22)'
                          : '1px solid var(--ax-border)',
                      borderRadius: 'var(--ax-radius-panel)',
                      padding: '1.25rem',
                      gridColumn: i === 0 ? 'span 2' : 'span 1',
                    }}
                  >
                    <Check
                      strokeWidth={1.5}
                      className="h-4 w-4 mb-2"
                      style={{ color: 'var(--ax-accent)' }}
                    />
                    <p
                      className="text-sm font-medium leading-snug"
                      style={{
                        color: i === 0 ? 'var(--ax-heading)' : 'var(--ax-text)',
                      }}
                    >
                      {b}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 5. How it works (3-step numbered prose, NOT icon-circle cards) ─ */}
      <section
        className="ax-section"
        style={{ background: 'var(--ax-bg)' }}
        data-testid="services-how-it-works"
      >
        <div className="ax-container">
          <p className="ax-mono-label mb-8" style={{ color: 'var(--ax-accent)' }}>
            How it works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {[
              {
                step: '01',
                title: 'Free AI Audit',
                body:
                  'A 24-hour scan of your business produces a custom automation map, ROI projections, and a ranked list of agents to build first.',
              },
              {
                step: '02',
                title: 'Build and integrate',
                body:
                  'We build the agents, connect them to your existing tools (CRM, helpdesk, calendar), and test end-to-end before you see a single user interaction.',
              },
              {
                step: '03',
                title: 'Monitor and improve',
                body:
                  'Every agent ships with dashboards. We track performance quarterly and tune it, so ROI compounds rather than decays.',
              },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 80}>
                <div
                  className="py-8 md:py-0 md:px-8 flex flex-col gap-3"
                  style={{
                    borderBottom:
                      i < 2 ? '1px solid var(--ax-border)' : undefined,
                    borderLeft:
                      i > 0 && typeof window !== 'undefined' && window.innerWidth >= 768
                        ? '1px solid var(--ax-border)'
                        : undefined,
                  }}
                >
                  <span
                    className="font-mono text-[11px] tracking-[0.18em] uppercase"
                    style={{ color: 'var(--ax-accent)' }}
                  >
                    {item.step}
                  </span>
                  <h3
                    className="text-white text-lg md:text-xl font-semibold tracking-[-0.01em]"
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm md:text-base leading-relaxed"
                    style={{ color: 'var(--ax-text)', maxWidth: '38ch' }}
                  >
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. CTA (left-aligned close) ─────────────────────────────────── */}
      <section
        style={{
          background: 'var(--ax-surface)',
          borderTop: '1px solid var(--ax-border)',
          paddingTop: '5rem',
          paddingBottom: '5rem',
        }}
        data-testid="services-final-cta"
      >
        <div className="ax-container flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div style={{ maxWidth: '48ch' }}>
            <h2
              className="text-white font-extrabold leading-[1.1] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
            >
              The audit is the fastest way to know where to start.
            </h2>
            <p
              className="mt-3 text-base leading-relaxed"
              style={{ color: 'var(--ax-muted)' }}
            >
              Free, delivered in 24 hours, no commitment required.
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <Link
              to="/audit"
              data-testid="services-final-cta-button"
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

export default Services;
