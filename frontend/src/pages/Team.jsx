import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Linkedin, Twitter, ArrowRight } from 'lucide-react';
import { useScrollReveal } from '../lib/hooks';

/* ── Layout strategy:
   Hero (left-aligned text, no eyebrow, subtle radial). Full-bleed portraiture
   card for the founder (image left, bio right, 12-col grid). Open-roles list as
   a bordered divide-y stack, not a card grid. Closing CTA row: left-aligned
   with a single action. Three distinct layout families, zero centred-everything.
   Eyebrow budget: 0 per ceil(4 sections / 3) = 2 allowed, using 0 here
   because the sections speak for themselves.
── */

const FOUNDER_PHOTO =
  'https://images.unsplash.com/photo-1710527304331-4186db4ee708?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=600';

const OPEN_ROLES = [
  {
    role: 'AI Engineer',
    detail: 'Python, LangChain, production deployments. Remote.',
    status: 'Opening Q3 2026',
  },
  {
    role: 'Automation Specialist',
    detail: 'Make, Zapier, custom integrations. Remote.',
    status: 'Opening Q3 2026',
  },
  {
    role: 'Client Success Manager',
    detail: 'Onboarding, QBRs, expansion. Remote.',
    status: 'Opening Q4 2026',
  },
];

const Reveal = ({ children, delay = 0 }) => {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="ax-reveal" style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const Team = () => {
  return (
    <>
      <Helmet>
        <title>Team | Axovion.io</title>
        <meta
          name="description"
          content="Meet the team behind Axovion.io: builders who deploy production-grade AI for business outcomes, not demos."
        />
      </Helmet>

      {/* ── Section 1: Hero ── */}
      <section
        className="relative ax-section"
        style={{ background: 'var(--ax-bg)' }}
        data-testid="team-hero"
      >
        {/* Subtle cyan radial, top-left quadrant */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(640px circle at 15% 10%, rgba(0,212,255,0.08), transparent 60%)',
          }}
        />
        <div className="relative ax-container">
          <h1
            className="text-white font-extrabold tracking-[-0.03em] leading-[1.05]"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)', maxWidth: '36ch', textWrap: 'balance' }}
          >
            The people behind the agents
          </h1>
          <p
            className="mt-5 text-lg leading-relaxed"
            style={{ color: 'var(--ax-text)', maxWidth: '52ch' }}
          >
            We build AI that works because we understand business, not just models.
            Small team, sharp focus, and a bias for shipping.
          </p>
        </div>
      </section>

      {/* ── Section 2: Founder portrait card ── */}
      <section
        className="pb-20 md:pb-[120px]"
        style={{ background: 'var(--ax-bg)' }}
      >
        <div className="ax-container">
          <Reveal>
            <article
              className="grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden"
              style={{
                borderRadius: 'var(--ax-radius-panel)',
                background: 'var(--ax-surface)',
                border: '1px solid var(--ax-border)',
              }}
              data-testid="founder-card"
            >
              {/* Portrait */}
              <div
                className="md:col-span-5 relative"
                style={{ minHeight: '360px' }}
              >
                <img
                  src={FOUNDER_PHOTO}
                  alt="Alex Morgan, Founder of Axovion.io, smiling in a workroom setting"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                  }}
                />
                {/* Subtle cyan tint ring inside image */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    boxShadow: 'inset 0 0 0 1px rgba(0,212,255,0.12)',
                  }}
                />
              </div>

              {/* Bio */}
              <div className="md:col-span-7 p-7 md:p-12 flex flex-col">
                <div>
                  <p
                    className="text-sm font-semibold mb-1"
                    style={{ color: 'var(--ax-accent)' }}
                  >
                    Founder
                  </p>
                  <h2
                    className="text-white font-extrabold tracking-tight"
                    style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
                  >
                    Alex Morgan
                  </h2>
                  <p
                    className="mt-1 text-sm"
                    style={{ color: 'var(--ax-muted)' }}
                  >
                    Founder and AI Automation Strategist
                  </p>
                </div>

                <div
                  className="mt-6 space-y-4 text-base leading-relaxed"
                  style={{ color: 'var(--ax-text)' }}
                >
                  <p>
                    I started Axovion after watching too many businesses hire to fix problems that AI
                    could solve in a week. After two years building production AI agents across
                    chatbots, follow-up systems, booking, and ops, I productized the playbook so any
                    business gets ROI-focused automation in days.
                  </p>
                  <p>
                    Our edge is not the AI. It is the focus on outcomes: every agent we ship has a
                    tracked return. If it does not save you money or time, we do not build it.
                  </p>
                </div>

                {/* Pull quote */}
                <blockquote
                  className="mt-7 p-5"
                  style={{
                    borderRadius: 'var(--ax-radius-panel)',
                    background: 'var(--ax-bg)',
                    borderLeft: '3px solid var(--ax-accent)',
                  }}
                >
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: 'var(--ax-heading)' }}
                  >
                    {'"Most AI projects fail because they optimize for novelty, not outcomes. We build the boring stuff that compounds."'}
                  </p>
                </blockquote>

                {/* Social links */}
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm transition-colors duration-200"
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--ax-radius-control)',
                      background: 'var(--ax-bg)',
                      color: 'var(--ax-heading)',
                      border: '1px solid var(--ax-border)',
                      minHeight: '44px',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0,212,255,0.35)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = 'var(--ax-border)';
                    }}
                    data-testid="founder-linkedin"
                  >
                    <Linkedin
                      strokeWidth={1.5}
                      className="h-4 w-4"
                      style={{ color: 'var(--ax-accent)' }}
                    />
                    LinkedIn
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm transition-colors duration-200"
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--ax-radius-control)',
                      background: 'var(--ax-bg)',
                      color: 'var(--ax-heading)',
                      border: '1px solid var(--ax-border)',
                      minHeight: '44px',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0,212,255,0.35)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = 'var(--ax-border)';
                    }}
                    data-testid="founder-twitter"
                  >
                    <Twitter
                      strokeWidth={1.5}
                      className="h-4 w-4"
                      style={{ color: 'var(--ax-accent)' }}
                    />
                    Twitter / X
                  </a>
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ── Section 3: Open roles (divide-y list, not a card grid) ── */}
      <section
        className="pb-20 md:pb-[120px]"
        style={{ background: 'var(--ax-bg)' }}
      >
        <div className="ax-container">
          <h2
            className="text-white font-extrabold tracking-tight leading-[1.05]"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)' }}
          >
            Joining soon
          </h2>
          <p
            className="mt-3 text-base leading-relaxed"
            style={{ color: 'var(--ax-muted)', maxWidth: '52ch' }}
          >
            We scale carefully. Roles open as client volume grows.
          </p>

          <div
            className="mt-10"
            style={{ borderTop: '1px solid var(--ax-border)' }}
          >
            {OPEN_ROLES.map((item, i) => (
              <Reveal key={item.role} delay={i * 80}>
                <div
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 py-6 items-baseline"
                  style={{ borderBottom: '1px solid var(--ax-border)' }}
                >
                  <div className="sm:col-span-4">
                    <h3
                      className="text-white font-semibold text-lg"
                    >
                      {item.role}
                    </h3>
                  </div>
                  <div className="sm:col-span-5">
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--ax-text)' }}
                    >
                      {item.detail}
                    </p>
                  </div>
                  <div className="sm:col-span-3 sm:text-right">
                    <span
                      className="text-xs font-mono"
                      style={{
                        color: 'var(--ax-warn)',
                        background: 'rgba(251,191,36,0.08)',
                        border: '1px solid rgba(251,191,36,0.22)',
                        padding: '0.25rem 0.625rem',
                        borderRadius: 'var(--ax-radius-pill)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Join CTA (left-aligned, not centred) ── */}
      <section
        className="ax-section"
        style={{ background: 'var(--ax-bg)' }}
      >
        <div className="ax-container">
          <Reveal>
            <div
              className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              style={{
                borderRadius: 'var(--ax-radius-panel)',
                background: 'var(--ax-surface)',
                border: '1px solid var(--ax-border)',
              }}
            >
              <div>
                <h2
                  className="text-white font-extrabold tracking-tight leading-[1.05]"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}
                >
                  Want to join?
                </h2>
                <p
                  className="mt-3 text-base leading-relaxed"
                  style={{ color: 'var(--ax-muted)', maxWidth: '44ch' }}
                >
                  Remote-first, async, AI-native workflows. We work the way we ship.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:hello@axovion.io?subject=Joining%20Axovion"
                  data-testid="team-join-button"
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-200 active:scale-[0.98]"
                  style={{
                    padding: '0.75rem 1.5rem',
                    minHeight: '44px',
                    borderRadius: 'var(--ax-radius-control)',
                    background: 'var(--ax-accent)',
                    color: 'var(--ax-on-accent)',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'var(--ax-accent-dim)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'var(--ax-accent)';
                  }}
                >
                  Send a note <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-200"
                  style={{
                    padding: '0.75rem 1.5rem',
                    minHeight: '44px',
                    borderRadius: 'var(--ax-radius-control)',
                    background: 'var(--ax-bg)',
                    color: 'var(--ax-text)',
                    border: '1px solid var(--ax-border-strong)',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0,212,255,0.35)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ax-border-strong)';
                  }}
                >
                  Learn more about us
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};

export default Team;
