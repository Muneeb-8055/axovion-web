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

const FOUNDERS = [
  {
    id: 'muneeb',
    name: 'Muneeb ur Rehman',
    tag: 'Co-Founder',
    role: 'Co-Founder & AI Solutions Architect',
    photo: '/team/founder-1.webp',
    photoFallback: '/team/founder-1.jpg',
    bio: [
      'I co-founded Axovion after seeing businesses waste countless hours every week hiring to fix bottlenecks that modern AI agents could eliminate in days. I specialize in architecting production-grade multi-agent systems, automated customer support pipelines, and intelligent workflow automation.',
      'Our edge is relentlessly outcome-driven: every agent we build is tied directly to measurable return on investment, reduced first-reply times, and quantifiable hours saved.',
    ],
    quote: 'Most AI projects fail because they optimize for novelty, not outcomes. We engineer the boring, reliable infrastructure that compounds.',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
  },
  {
    id: 'hamza',
    name: 'Muhammad Hamza Zafar',
    tag: 'Co-Founder',
    role: 'Co-Founder & Head of Automation',
    photo: '/team/founder-2.webp',
    photoFallback: '/team/founder-2.jpg',
    bio: [
      'Co-founded Axovion to bridge the gap between cutting-edge LLMs and high-reliability business operations. Leading the development of enterprise integrations, intelligent triage systems, and autonomous booking and sales pipelines.',
      'We build agents that run quietly and reliably inside existing workflows—integrating with CRMs, ticketing systems, and operational backends with zero manual babysitting.',
    ],
    quote: 'We do not build prototypes or fragile demos. We build battle-tested AI infrastructure designed to operate unattended.',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
  },
];

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
        <link rel="canonical" href="https://www.axovion.io/team" />
        <meta property="og:title" content="Team | Axovion.io" />
        <meta
          property="og:description"
          content="Meet the builders behind Axovion.io who deploy production-grade AI for measurable business outcomes."
        />
        <meta property="og:url" content="https://www.axovion.io/team" />
        <meta property="og:type" content="website" />
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

      {/* ── Section 2: Founders portrait cards ── */}
      <section
        className="pb-20 md:pb-[120px]"
        style={{ background: 'var(--ax-bg)' }}
      >
        <div className="ax-container space-y-12 md:space-y-16">
          {FOUNDERS.map((founder, index) => (
            <Reveal key={founder.id} delay={index * 100}>
              <article
                className="grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden"
                style={{
                  borderRadius: 'var(--ax-radius-panel)',
                  background: 'var(--ax-surface)',
                  border: '1px solid var(--ax-border)',
                }}
                data-testid={`founder-card-${founder.id}`}
              >
                {/* Portrait */}
                <div
                  className="md:col-span-5 relative"
                  style={{ minHeight: '380px' }}
                >
                  <img
                    src={founder.photo}
                    alt={`${founder.name}, ${founder.role} at Axovion.io`}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center 25%',
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
                <div className="md:col-span-7 p-7 md:p-12 flex flex-col justify-between">
                  <div>
                    <p
                      className="text-sm font-semibold mb-1"
                      style={{ color: 'var(--ax-accent)' }}
                    >
                      {founder.tag}
                    </p>
                    <h2
                      className="text-white font-extrabold tracking-tight"
                      style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
                    >
                      {founder.name}
                    </h2>
                    <p
                      className="mt-1 text-sm font-medium"
                      style={{ color: 'var(--ax-muted)' }}
                    >
                      {founder.role}
                    </p>
                  </div>

                  <div
                    className="mt-6 space-y-4 text-base leading-relaxed"
                    style={{ color: 'var(--ax-text)' }}
                  >
                    {founder.bio.map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
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
                      className="text-base leading-relaxed italic"
                      style={{ color: 'var(--ax-heading)' }}
                    >
                      {`"${founder.quote}"`}
                    </p>
                  </blockquote>

                  {/* Social links */}
                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <a
                      href={founder.linkedin}
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
                      data-testid={`founder-${founder.id}-linkedin`}
                    >
                      <Linkedin
                        strokeWidth={1.5}
                        className="h-4 w-4"
                        style={{ color: 'var(--ax-accent)' }}
                      />
                      LinkedIn
                    </a>
                    <a
                      href={founder.twitter}
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
                      data-testid={`founder-${founder.id}-twitter`}
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
          ))}
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
