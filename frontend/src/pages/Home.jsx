import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ClipboardCheck, MessageSquare, Zap, CalendarClock,
  ShoppingCart, PackageSearch, MailPlus, Compass, ArrowUpRight,
} from 'lucide-react';
import { ScrollWorld } from '../components/ScrollWorld';
import { SERVICES, TESTIMONIALS } from '../lib/content';
import { useScrollReveal } from '../lib/hooks';
import { worldUrl } from '../lib/assetUrl';

/* ---------------------------------------------------------------------------
   content.js carries a couple of raw HTML entities and long dashes from the
   old copy deck. Nothing user visible on this page is allowed either, so every
   string that comes out of content.js is passed through here first.
   --------------------------------------------------------------------------- */
const clean = (value) =>
  String(value)
    .replace(/&amp;/g, '&')
    .replace(/\s*[—–]\s*/g, '. ')
    .replace(/\.\s+([a-z])/g, (_m, c) => `. ${c.toUpperCase()}`);

const Reveal = ({ children, className = '', delay = 0 }) => {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`ax-reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const H2 = 'text-[30px] md:text-[46px] font-semibold leading-[1.06] tracking-[-0.03em]';

/* ---------------------------------------------------------------------------
   The five beats of the scroll cinematic.
   Order is fixed: backlog, audit, build, deployment, result. Connector N
   bridges dive N to dive N+1 and the seams are already frame matched.
   --------------------------------------------------------------------------- */
const SCENES = [
  {
    id: 'backlog',
    label: 'Backlog',
    eyebrow: 'The backlog',
    title: 'The queue never gets to zero',
    body: 'Tickets wait hours for a first reply. Leads go cold inside 48 hours. Somewhere between 30 and 60 percent of the week disappears into work nobody chose to do.',
    still: '/world/img/dive1.webp',
    clip: '/world/vid/dive1.mp4',
    clipMobile: '/world/vid/dive1-m.mp4',
    alt: 'Miniature model of an operations floor at night, stacked with ticket trays, a ringing phone and a whiteboard full of unfinished work.',
    scroll: 1.4,
    linger: 0.35,
  },
  {
    id: 'audit',
    label: 'Audit',
    eyebrow: 'The audit',
    title: 'Measure it before you automate it',
    body: 'The free AI Audit maps every workflow, scores what can actually be automated, and puts a monthly savings figure beside each one. It comes back within 24 hours.',
    still: '/world/img/dive2.webp',
    clip: '/world/vid/dive2.mp4',
    clipMobile: '/world/vid/dive2-m.mp4',
    alt: 'Miniature model of a diagnostic room where scanning rigs measure the ticket trays and a technician traces a workflow across a readout.',
    scroll: 1.25,
    linger: 0.35,
  },
  {
    id: 'build',
    label: 'Build',
    eyebrow: 'The build',
    title: 'Agents built for your workflow',
    body: 'No general purpose assistant. Each agent is trained on your knowledge base, wired into the process it runs, and tested against real tickets before it goes near a customer.',
    still: '/world/img/dive3.webp',
    clip: '/world/vid/dive3.mp4',
    clipMobile: '/world/vid/dive3-m.mp4',
    alt: 'Miniature model of a workshop where agents are assembled on modular racks, with cabling running back to a central spine.',
    scroll: 1.25,
    linger: 0.35,
  },
  {
    id: 'deployment',
    label: 'Deploy',
    eyebrow: 'The deployment',
    title: 'Plugged into what you already run',
    body: 'Agents connect to HubSpot, Salesforce, Pipedrive, Gorgias, Zendesk, Intercom, Shopify, WhatsApp and your calendar. Most are live in about two weeks. You keep the keys and the configs.',
    still: '/world/img/dive4.webp',
    clip: '/world/vid/dive4.mp4',
    clipMobile: '/world/vid/dive4-m.mp4',
    alt: 'Miniature model of an integration hub where finished agents slot into conveyor lines feeding inboxes, calendars and CRM terminals.',
    scroll: 1.25,
    linger: 0.35,
  },
  {
    id: 'result',
    label: 'Result',
    eyebrow: 'The result',
    title: 'Quiet operations by morning',
    body: 'On the e-commerce build, 82 percent of tickets now resolve without a person and replies land in about two minutes. The team spends its week on growth instead.',
    still: '/world/img/dive5.webp',
    clip: '/world/vid/dive5.mp4',
    clipMobile: '/world/vid/dive5-m.mp4',
    alt: 'Miniature model of a calm operations floor at dawn, ticket trays empty and one operator watching a wall of green readouts.',
    scroll: 1.4,
    linger: 0.3,
    cta: {
      primary: { label: 'Start Free AI Audit', href: '/audit' },
      secondary: { label: 'Book a Call', href: '/contact' },
    },
  },
];

const CONNECTORS = [
  '/world/vid/conn1.mp4',
  '/world/vid/conn2.mp4',
  '/world/vid/conn3.mp4',
  '/world/vid/conn4.mp4',
];

const CONNECTORS_MOBILE = [
  '/world/vid/conn1-m.mp4',
  '/world/vid/conn2-m.mp4',
  '/world/vid/conn3-m.mp4',
  '/world/vid/conn4-m.mp4',
];

/* Figures below are the ones the audits keep producing, taken from the
   e-commerce, real estate and clinic engagements already on the site. */
const COST_STATS = [
  { value: '14h', label: 'Average first reply on the support desk we later automated, now about two minutes.' },
  { value: '48h', label: 'How long an unworked lead usually takes to go cold when follow-up is manual.' },
  { value: '30-60%', label: 'Share of the working week a typical team spends on tasks an agent can run.' },
  { value: '30%', label: 'No-show rate at a multi-location clinic before automated reminders and rescheduling.' },
];

const TRUST_ITEMS = [
  'We run these agents inside our own operations before we sell them.',
  'A daily AI content system that publishes without a human edit.',
  'Two years and more than a hundred delivered demos behind the playbook.',
  'Built on Kimi K2.6 and Llama 3.3, chosen per workflow rather than per trend.',
  'Every agent ships with a tracked return. If it saves nothing, we do not build it.',
  'You own what we build. Keys, configs and documentation are handed over.',
];

const ICON_MAP = {
  ClipboardCheck,
  MessageSquareBot: MessageSquare,
  Zap,
  CalendarClock,
  ShoppingCart,
  PackageSearch,
  MailPlus,
  Compass,
};

const Home = () => {
  const [featured, ...others] = TESTIMONIALS;

  return (
    <>
      <Helmet>
        <title>Axovion.io | AI Automation Agency, Automate to Win</title>
        <meta name="description" content="Axovion.io builds ROI-focused AI agents that automate customer support, lead follow-up, booking, and repetitive business workflows. Get your free AI Audit." />
        <meta property="og:title" content="Axovion.io | AI Automation Agency" />
        <meta property="og:description" content="Automate repetitive workflows in days, not quarters." />
        {/* LCP hint for the first poster. Routed through worldUrl so it points at the
            CDN when one is configured. Deliberately no crossOrigin attribute: the
            <img> loads without CORS, and a mismatched preload mode is ignored and
            refetched. */}
        <link rel="preload" as="image" type="image/webp" href={worldUrl('/world/img/dive1.webp')} />
      </Helmet>

      {/* HERO: the scroll cinematic.
          The engine emits an h2 per scene, so the single page h1 sits here,
          ahead of them, and the outline runs h1 then h2 with no skipped level. */}
      <section data-testid="home-hero">
        <h1 className="sr-only">
          Axovion.io builds AI agents that automate customer support, lead follow-up, booking
          and the repetitive work behind them.
        </h1>
        <ScrollWorld
          scenes={SCENES}
          connectors={CONNECTORS}
          connectorsMobile={CONNECTORS_MOBILE}
          diveScroll={1.25}
          connScroll={0.8}
        />
      </section>

      {/* Everything below the cinematic. Raised above the engine's fixed
          layers, which stay mounted for the length of the flight. */}
      <div className="relative z-10">

        {/* WHAT IT COSTS TO LEAVE IT ALONE */}
        <section className="ax-section" data-testid="home-problem-section">
          <div className="ax-container">
            <Reveal>
              <h2 className={H2}>Still doing work that AI should handle?</h2>
              <p className="mt-5 text-base md:text-lg leading-relaxed max-w-[56ch]" style={{ color: 'var(--ax-muted)' }}>
                Every figure here came out of a real audit. The pattern repeats across industries,
                and it is always measurable before anyone writes a line of code.
              </p>
            </Reveal>

            <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-10">
              {COST_STATS.map((stat, i) => (
                <Reveal key={stat.value} delay={i * 60}>
                  <div className="pt-6 border-t lg:border-t-0 lg:pt-0 lg:border-l lg:pl-8 lg:first:border-l-0 lg:first:pl-0" style={{ borderColor: 'var(--ax-border)' }}>
                    <div className="ax-nums text-[42px] md:text-[54px] font-medium leading-none" style={{ color: 'var(--ax-heading)' }}>
                      {stat.value}
                    </div>
                    <p className="mt-5 text-sm leading-relaxed max-w-[34ch]" style={{ color: 'var(--ax-muted)' }}>
                      {stat.label}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES INDEX */}
        <section className="ax-section pt-0 md:pt-0" data-testid="home-services-section">
          <div className="ax-container">
            <Reveal>
              <h2 className={H2}>Eight agents, built and handed over</h2>
              <p className="mt-5 text-base md:text-lg leading-relaxed max-w-[56ch]" style={{ color: 'var(--ax-muted)' }}>
                Production builds for the workflows that eat the margin. Pick the one that hurts
                most and we will scope it in the audit.
              </p>
            </Reveal>

            <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-x-14">
              {SERVICES.map((service, i) => {
                const Icon = ICON_MAP[service.icon] || Compass;
                return (
                  <Reveal key={service.slug} delay={(i % 2) * 60}>
                    <Link
                      to="/services"
                      data-testid={`service-row-${service.slug}`}
                      className="group flex items-start gap-5 py-6 border-t transition-colors duration-200"
                      style={{ borderColor: 'var(--ax-border)' }}
                    >
                      <Icon className="h-5 w-5 mt-1 shrink-0" strokeWidth={1.5} style={{ color: 'var(--ax-accent)' }} aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block text-lg font-semibold" style={{ color: 'var(--ax-heading)' }}>
                          {clean(service.title)}
                        </span>
                        <span className="block mt-2 text-sm leading-relaxed" style={{ color: 'var(--ax-muted)' }}>
                          {clean(service.short)}
                        </span>
                      </span>
                      <ArrowUpRight
                        className="h-4 w-4 mt-1.5 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        strokeWidth={1.5}
                        style={{ color: 'var(--ax-accent)' }}
                        aria-hidden="true"
                      />
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* PROOF */}
        <section className="ax-section pt-0 md:pt-0" data-testid="testimonials-section">
          <div className="ax-container">
            <Reveal>
              <h2 className={H2}>Business owners who automated to win</h2>
            </Reveal>

            <div className="mt-10 md:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
              <Reveal className="lg:col-span-7">
                <figure
                  className="h-full m-0 flex flex-col justify-between rounded-[16px] p-8 md:p-10"
                  style={{ background: 'var(--ax-surface)', border: '1px solid var(--ax-border)' }}
                  data-testid="testimonial-featured"
                >
                  <blockquote className="m-0 text-xl md:text-[26px] leading-[1.4] font-medium" style={{ color: 'var(--ax-heading)' }}>
                    “{clean(featured.quote)}”
                  </blockquote>
                  <figcaption className="mt-10 pt-6" style={{ borderTop: '1px solid var(--ax-border)' }}>
                    <div className="ax-nums text-base font-medium" style={{ color: 'var(--ax-accent)' }}>
                      {clean(featured.metric)}
                    </div>
                    <div className="mt-4 text-sm font-medium" style={{ color: 'var(--ax-heading)' }}>{featured.name}</div>
                    <div className="text-sm" style={{ color: 'var(--ax-muted-2)' }}>{featured.role}</div>
                  </figcaption>
                </figure>
              </Reveal>

              <div className="lg:col-span-5 flex flex-col justify-center">
                {others.map((item, i) => (
                  <Reveal key={item.name} delay={80 + i * 80}>
                    <figure
                      className="m-0 py-8"
                      style={{ borderTop: i === 0 ? 'none' : '1px solid var(--ax-border)' }}
                      data-testid={`testimonial-card-${i}`}
                    >
                      <blockquote className="m-0 text-base leading-relaxed" style={{ color: 'var(--ax-text)' }}>
                        “{clean(item.quote)}”
                      </blockquote>
                      <figcaption className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-sm font-medium" style={{ color: 'var(--ax-heading)' }}>{item.name}</span>
                        <span className="text-sm" style={{ color: 'var(--ax-muted-2)' }}>{item.role}</span>
                        <span className="ax-nums text-sm w-full" style={{ color: 'var(--ax-accent)' }}>{clean(item.metric)}</span>
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* WHY AXOVION */}
        <section className="ax-section pt-0 md:pt-0" data-testid="trust-section">
          <div className="ax-container">
            <Reveal>
              <h2 className={H2}>Why Axovion.io</h2>
            </Reveal>

            <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-9">
              {TRUST_ITEMS.map((item, i) => (
                <Reveal key={item} delay={i * 50}>
                  <p
                    className="pt-5 m-0 text-[15px] leading-relaxed border-t"
                    style={{ borderColor: 'var(--ax-border)', color: 'var(--ax-text)' }}
                  >
                    {item}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CLOSING CTA */}
        <section className="ax-section pt-0 md:pt-0" data-testid="final-cta-section">
          <div className="ax-container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pt-16 md:pt-20 border-t" style={{ borderColor: 'var(--ax-border)' }}>
              <Reveal className="lg:col-span-7">
                <h2 className="text-[34px] md:text-[56px] font-bold leading-[1.03] tracking-[-0.03em]">
                  Ready to stop working harder and start scaling?
                </h2>
                <p className="mt-6 text-base md:text-lg leading-relaxed max-w-[54ch]" style={{ color: 'var(--ax-muted)' }}>
                  Describe the business once. You get an automation map, an estimate of what it
                  saves per month, and the agents we would build first.
                </p>
                <div className="mt-9 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/audit"
                    data-testid="final-cta-primary-button"
                    className="inline-flex items-center justify-center rounded-[12px] px-7 text-base font-semibold transition-colors duration-200 active:scale-[0.98]"
                    style={{ minHeight: 52, background: 'var(--ax-accent)', color: 'var(--ax-on-accent)' }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'var(--ax-accent-dim)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'var(--ax-accent)'; }}
                  >
                    Start Free AI Audit
                  </Link>
                  <Link
                    to="/contact"
                    data-testid="final-cta-secondary-button"
                    className="inline-flex items-center justify-center rounded-[12px] px-7 text-base font-semibold transition-colors duration-200"
                    style={{
                      minHeight: 52,
                      background: 'var(--ax-surface)',
                      color: 'var(--ax-heading)',
                      border: '1px solid var(--ax-border-strong)',
                    }}
                  >
                    Book a Call
                  </Link>
                </div>
              </Reveal>

              <Reveal className="lg:col-span-5" delay={80}>
                <div className="rounded-[16px] p-7 md:p-8" style={{ background: 'var(--ax-surface)', border: '1px solid var(--ax-border)' }}>
                  <p className="m-0 text-sm font-medium" style={{ color: 'var(--ax-muted-2)' }}>
                    What comes back in the report
                  </p>
                  <ul className="mt-5 m-0 p-0 list-none">
                    {SERVICES[0].bullets.map((bullet, i) => (
                      <li
                        key={bullet}
                        className="py-3.5 text-[15px]"
                        style={{ color: 'var(--ax-text)', borderTop: i === 0 ? 'none' : '1px solid var(--ax-border)' }}
                      >
                        {clean(bullet)}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
