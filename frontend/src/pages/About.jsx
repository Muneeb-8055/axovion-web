import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import { VALUES, TIMELINE } from '../lib/content';
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
   About page
   Argument: "Here is who we are and why you can trust us."

   Sections (6):
   1. Hero             - mission statement, left-aligned, no eyebrow
   2. Mission prose    - two-column editorial text block (NOT card)
   3. Timeline         - vertical labeled sequence with left rail
   4. Values           - divider-separated list (cards would add no hierarchy)
   5. Credibility row  - three plain stat/fact items in a horizontal band
   6. CTA              - asymmetric, left close with right action

   Eyebrow budget: ceil(6/3) = 2. Eyebrows used: 1 (values section).
   Total = 1. Within budget.

   Layout families: full-width prose, two-column editorial, vertical timeline,
   divider list, horizontal band, asymmetric CTA. Six distinct families.
   ----------------------------------------------------------------------- */

const About = () => {
  return (
    <>
      <Helmet>
        <title>About | Axovion.io | Automate to Win</title>
        <meta
          name="description"
          content="Axovion.io is an AI automation agency on a mission to help businesses reclaim their time. Learn our story, values, and how we work."
        />
      </Helmet>

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <section
        className="ax-section"
        style={{ background: 'var(--ax-bg)' }}
        data-testid="about-hero"
      >
        <div className="ax-container">
          <h1
            className="text-white font-extrabold leading-[1.05] tracking-[-0.03em]"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', maxWidth: '20ch' }}
          >
            We automate to win.
          </h1>
          <p
            className="mt-5 text-base md:text-lg leading-relaxed"
            style={{ color: 'var(--ax-text)', maxWidth: '58ch' }}
          >
            Axovion.io was built on a simple belief: business owners
            should not drown in repetitive work that AI can handle today.
          </p>
        </div>
      </section>

      {/* ── 2. Mission prose (two-column editorial, no cards) ───────────── */}
      <section
        style={{
          background: 'var(--ax-surface)',
          borderTop: '1px solid var(--ax-border)',
          paddingTop: '5rem',
          paddingBottom: '5rem',
        }}
        data-testid="about-mission"
      >
        <div className="ax-container">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
            <div className="md:col-span-5">
              <Reveal>
                <h2
                  className="text-white font-bold leading-[1.1] tracking-[-0.02em]"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
                >
                  Help business owners reclaim their time.
                </h2>
              </Reveal>
            </div>
            <div
              className="md:col-span-7 space-y-5"
              style={{ color: 'var(--ax-text)' }}
            >
              <Reveal>
                <p className="text-base md:text-lg leading-relaxed">
                  We do not just build chatbots. We build systems that run your
                  business while you sleep, covering customer support, lead
                  follow-up, booking, and repetitive operations, so you can
                  focus on the work only humans can do.
                </p>
              </Reveal>
              <Reveal delay={80}>
                <p className="text-base md:text-lg leading-relaxed">
                  Every agent we ship comes with a tracked return. If it does
                  not save money or time, we do not build it. That is what
                  ROI-focused actually means.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Timeline (vertical labeled sequence, left rail) ──────────── */}
      <section
        className="ax-section"
        style={{ background: 'var(--ax-bg)' }}
        data-testid="about-timeline"
      >
        <div className="ax-container">
          <h2
            className="text-white font-extrabold leading-[1.05] tracking-[-0.02em] mb-12"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
          >
            How we got here.
          </h2>

          {/* Vertical timeline: left year column + right content */}
          <div className="relative">
            {/* Vertical rail */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '1px',
                background: 'var(--ax-border)',
              }}
            />

            <div className="space-y-0">
              {TIMELINE.map((t, i) => (
                <Reveal key={t.year} delay={i * 70}>
                  <div
                    className="grid grid-cols-12 gap-6 md:gap-10 py-8 md:py-10"
                    style={{
                      borderBottom:
                        i < TIMELINE.length - 1
                          ? '1px solid var(--ax-border)'
                          : undefined,
                      paddingLeft: '1.5rem',
                    }}
                  >
                    {/* Timeline dot on the rail */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        left: '-4px',
                        width: '9px',
                        height: '9px',
                        borderRadius: '9999px',
                        background: 'var(--ax-accent)',
                        marginTop: '0.375rem',
                        boxShadow: '0 0 0 3px var(--ax-bg)',
                      }}
                    />

                    {/* Year */}
                    <div className="col-span-3 md:col-span-2">
                      <span
                        className="font-mono font-medium ax-nums text-sm"
                        style={{ color: 'var(--ax-accent)' }}
                      >
                        {t.year}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="col-span-9 md:col-span-10">
                      <h3
                        className="text-white text-lg md:text-xl font-semibold leading-snug tracking-[-0.01em]"
                      >
                        {t.title}
                      </h3>
                      <p
                        className="mt-2 text-sm md:text-base leading-relaxed"
                        style={{ color: 'var(--ax-text)', maxWidth: '56ch' }}
                      >
                        {t.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Values (divider list, no cards) ──────────────────────────── */}
      <section
        style={{
          background: 'var(--ax-surface)',
          borderTop: '1px solid var(--ax-border)',
          paddingTop: '5rem',
          paddingBottom: '5rem',
        }}
        data-testid="about-values"
      >
        <div className="ax-container">
          <p className="ax-mono-label mb-10" style={{ color: 'var(--ax-accent)' }}>
            How we work
          </p>

          <div style={{ borderTop: '1px solid var(--ax-border-strong)' }}>
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 60}>
                <div
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-10 py-6 md:py-7"
                  style={{ borderBottom: '1px solid var(--ax-border)' }}
                  data-testid={`value-card-${i}`}
                >
                  <div className="md:col-span-3">
                    <h3
                      className="text-white text-lg md:text-xl font-semibold tracking-[-0.01em]"
                    >
                      {v.title}
                    </h3>
                  </div>
                  <div className="md:col-span-9">
                    <p
                      className="text-base leading-relaxed"
                      style={{ color: 'var(--ax-text)', maxWidth: '60ch' }}
                    >
                      {v.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Credibility row (three plain stat/fact items) ────────────── */}
      <section
        style={{
          background: 'var(--ax-bg)',
          borderTop: '1px solid var(--ax-border)',
          borderBottom: '1px solid var(--ax-border)',
          paddingTop: '4rem',
          paddingBottom: '4rem',
        }}
        data-testid="about-credibility"
      >
        <div className="ax-container">
          <Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0 sm:divide-x sm:divide-white/[0.08]">
              {[
                {
                  figure: '2023',
                  caption: 'Year we started building production AI agents.',
                },
                {
                  figure: '100+',
                  caption: 'Agents shipped across e-commerce, real estate, and healthcare.',
                },
                {
                  figure: '2 weeks',
                  caption: 'Typical time from audit to first live interaction.',
                },
              ].map((item) => (
                <div
                  key={item.figure}
                  className="sm:px-8 first:pl-0 last:pr-0"
                >
                  <p
                    className="font-mono font-medium ax-nums"
                    style={{
                      fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                      color: 'var(--ax-accent)',
                      lineHeight: 1,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {item.figure}
                  </p>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: 'var(--ax-muted)', maxWidth: '28ch' }}
                  >
                    {item.caption}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 6. CTA (asymmetric, left close, right action) ───────────────── */}
      <section
        style={{
          background: 'var(--ax-bg)',
          paddingTop: '5rem',
          paddingBottom: '5rem',
        }}
        data-testid="about-final-cta"
      >
        <div className="ax-container flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div style={{ maxWidth: '44ch' }}>
            <h2
              className="text-white font-extrabold leading-[1.1] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
            >
              Want to work with us?
            </h2>
            <p
              className="mt-3 text-base leading-relaxed"
              style={{ color: 'var(--ax-muted)' }}
            >
              Start with a call. We will tell you exactly what we can automate
              and what it is worth.
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <Link
              to="/contact"
              data-testid="about-final-cta-button"
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
              Book a Call
              <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
