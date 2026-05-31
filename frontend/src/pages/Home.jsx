import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight, ShieldCheck, Clock, TrendingUp, Users, Quote, Sparkles, ChevronRight,
  ClipboardCheck, MessageSquare, Zap, CalendarClock, ShoppingCart, PackageSearch, MailPlus, Compass, BrainCircuit, BarChart3,
} from 'lucide-react';
import { AuroraBg } from '../components/AuroraBg';
import { SplitText } from '../components/SplitText';
import { SERVICES, TESTIMONIALS } from '../lib/content';
import { useScrollReveal } from '../lib/hooks';

const Reveal = ({ children, className = '', delay = 0 }) => {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`ax-reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const PROBLEMS = [
  { icon: Clock, title: 'Slow support response', desc: 'Customers wait hours — sometimes days — for basic answers.' },
  { icon: Users, title: 'Leads slipping away', desc: 'Manual follow-up means most leads go cold within 48h.' },
  { icon: BrainCircuit, title: 'Repetitive work eating hours', desc: 'Your team spends 30-60% of the week on tasks AI can handle.' },
  { icon: BarChart3, title: 'Competitors scaling with AI', desc: 'You\'re hiring; they\'re deploying agents. The gap widens daily.' },
];

const TRUST_ITEMS = [
  { icon: Sparkles, label: 'AI agents in our own ops' },
  { icon: ClipboardCheck, label: 'Daily AI content system' },
  { icon: ShieldCheck, label: '2+ years building AI' },
  { icon: TrendingUp, label: '100+ demos delivered' },
  { icon: BrainCircuit, label: 'Powered by Kimi K2.6 + Llama 3.3' },
  { icon: BarChart3, label: 'ROI-focused, not tech-for-tech' },
];

const BentoCard = ({ children, span, glow, dataTestId, to }) => {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  const inner = (
    <div
      ref={ref}
      onMouseMove={onMove}
      data-testid={dataTestId}
      className={`ax-bento-card group ${span} rounded-[16px] bg-[#12121A] border border-white/10 p-6 transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#00D4FF]/35 ${glow ? 'hover:shadow-[0_0_0_1px_rgba(0,212,255,0.22),0_0_28px_rgba(0,212,255,0.14)]' : ''}`}
    >
      {children}
    </div>
  );
  if (to) return <Link to={to} className="block h-full">{inner}</Link>;
  return inner;
};

const ICON_MAP = {
  ClipboardCheck, MessageSquare, Zap, CalendarClock, ShoppingCart, PackageSearch, MailPlus, Compass, MessageSquareBot: MessageSquare,
};

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Axovion.io | AI Automation Agency — Automate to Win</title>
        <meta name="description" content="Axovion.io builds ROI-focused AI agents that automate customer support, lead follow-up, booking, and repetitive business workflows. Get your free AI Audit." />
        <meta property="og:title" content="Axovion.io | AI Automation Agency" />
        <meta property="og:description" content="Automate repetitive workflows in days, not quarters." />
      </Helmet>

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0A0A0F]" data-testid="home-hero">
        <AuroraBg />
        <div className="relative ax-container pt-16 md:pt-24 pb-20 md:pb-[120px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#12121A] border border-white/10 px-3 py-1.5 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/80">100+ demos delivered</span>
              </div>
              <SplitText
                text={'Automate repetitive workflows\nin days, not quarters.'}
                as="h1"
                dataTestId="hero-headline"
                className="font-extrabold text-white text-[40px] md:text-[72px] leading-[1.05] md:leading-[0.95] tracking-[-0.03em] md:tracking-[-0.04em]"
              />
              <p className="mt-6 max-w-[58ch] text-[#C0C0C8]/80 text-base md:text-lg leading-relaxed" data-testid="hero-subcopy">
                Axovion.io builds ROI-focused AI agents that automate customer support, lead follow-up, booking, e-commerce, and the repetitive tasks eating your team's hours.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/audit"
                  data-testid="hero-primary-cta-button"
                  className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-6 py-3.5 text-sm font-bold transition-colors duration-200 hover:bg-[#FBBF24] ax-cta-pulse"
                >
                  Start Free AI Audit <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  data-testid="hero-secondary-cta-button"
                  className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#12121A] text-white px-6 py-3.5 text-sm font-semibold border border-white/15 transition-colors duration-200 hover:border-[#00D4FF]/45"
                >
                  Book a Call
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Powered by</span>
                  <span className="text-sm text-white font-semibold">Kimi K2.6 · Llama 3.3</span>
                </div>
                <div className="flex items-center gap-2 text-[#C0C0C8]/55">
                  <span className="h-1 w-1 rounded-full bg-[#C0C0C8]/40" />
                </div>
                <div className="text-sm text-[#C0C0C8]/80">2+ years building AI · 100+ demos</div>
              </div>
            </div>

            {/* Hero signal panel */}
            <div className="lg:col-span-5" data-testid="hero-signal-panel">
              <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-5 md:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between mb-5">
                  <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Audit Snapshot</div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#10B981]/12 border border-[#10B981]/25 px-2.5 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#10B981]">Live</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Metric label="Cycle time" value="-62%" hint="vs manual" />
                  <Metric label="Cost leak" value="$12K/mo" hint="recovered" />
                  <Metric label="Automation" value="78/100" hint="score" />
                </div>
                <Sparkline />
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[#C0C0C8]/55">Lead score</div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EF4444]/12 border border-[#EF4444]/25 px-2.5 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#EF4444]">Hot</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="ax-section bg-[#0A0A0F]" data-testid="home-problem-section">
        <div className="ax-container">
          <Reveal>
            <div className="max-w-2xl">
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-3">The problem</div>
              <h2 className="text-white text-[32px] md:text-[48px] leading-[1.1] md:leading-[1.05] tracking-[-0.02em] md:tracking-[-0.03em] font-extrabold">
                Still doing work that AI should handle?
              </h2>
              <p className="mt-4 text-[#C0C0C8]/75 text-base md:text-lg max-w-2xl">
                If any of these sound familiar, you're leaving money on the table every single day.
              </p>
            </div>
          </Reveal>
          <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {PROBLEMS.map((p, i) => (
              <Reveal key={p.title} delay={i * 60}>
                <div
                  className="h-full rounded-[16px] bg-[#12121A] border border-white/10 p-6 transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#00D4FF]/30"
                  data-testid={`problem-card-${i}`}
                >
                  <div className="h-10 w-10 rounded-[12px] bg-[#00D4FF]/10 border border-[#00D4FF]/25 inline-flex items-center justify-center mb-4">
                    <p.icon className="h-5 w-5 text-[#00D4FF]" />
                  </div>
                  <h3 className="text-white text-lg font-bold mb-2">{p.title}</h3>
                  <p className="text-[#C0C0C8]/70 text-sm leading-relaxed">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES BENTO */}
      <section className="ax-section bg-[#0A0A0F]" data-testid="services-bento-section">
        <div className="ax-container">
          <Reveal>
            <div className="max-w-3xl">
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-3">Services</div>
              <h2 className="text-white text-[32px] md:text-[48px] leading-[1.1] md:leading-[1.05] tracking-[-0.02em] md:tracking-[-0.03em] font-extrabold">
                AI agents that run your business 24/7
              </h2>
              <p className="mt-4 text-[#C0C0C8]/75 text-base md:text-lg">
                Pre-built, production-grade agents for the workflows that are killing your margin and your weekends.
              </p>
            </div>
          </Reveal>
          <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Large hero card - full width on mobile, 2 cols on md, 2 cols on lg */}
            <BentoCard span="md:col-span-2 lg:col-span-2 min-h-[280px] lg:min-h-[360px]" glow dataTestId="services-bento-card-audit" to="/audit">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 mb-3">
                    <div className="h-9 w-9 rounded-[10px] bg-[#F97316]/12 border border-[#F97316]/30 inline-flex items-center justify-center">
                      <ClipboardCheck className="h-5 w-5 text-[#F97316]" />
                    </div>
                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#FBBF24]">Most popular</span>
                  </div>
                  <h3 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Free AI Audit</h3>
                  <p className="mt-3 text-[#C0C0C8]/75 text-sm md:text-base max-w-md">
                    Submit your business once. Get a custom automation map, ROI estimate, and recommended agents — delivered in minutes.
                  </p>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  <div className="grid grid-cols-3 gap-3 max-w-md w-full">
                    <KPI label="Map" value="3-5" hint="opportunities" />
                    <KPI label="ROI" value="$" hint="estimated" />
                    <KPI label="ETA" value="~30s" hint="AI generated" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#00D4FF] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </div>
            </BentoCard>

            {/* Chatbots card */}
            <BentoCard span="min-h-[180px]" glow dataTestId="services-bento-card-chatbots" to="/services">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <MessageSquare className="h-7 w-7 text-[#00D4FF] mb-3" />
                  <h3 className="text-white text-lg font-bold">Customer Support Chatbots</h3>
                  <p className="mt-2 text-[#C0C0C8]/70 text-sm">Web, WhatsApp, and custom channel agents. Handle 70-90% of tickets.</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#00D4FF] mt-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
            </BentoCard>

            {/* Lead Gen card */}
            <BentoCard span="min-h-[180px]" glow dataTestId="services-bento-card-lead" to="/services">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <Zap className="h-7 w-7 text-[#00D4FF] mb-3" />
                  <h3 className="text-white text-lg font-bold">Lead Generation &amp; Follow-Up</h3>
                  <p className="mt-2 text-[#C0C0C8]/70 text-sm">Capture, qualify, follow up across channels — never miss a lead again.</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#00D4FF] mt-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
            </BentoCard>

            {/* Booking card */}
            <BentoCard span="min-h-[180px]" glow dataTestId="services-bento-card-booking" to="/services">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <CalendarClock className="h-7 w-7 text-[#00D4FF] mb-3" />
                  <h3 className="text-white text-lg font-bold">Booking Automation</h3>
                  <p className="mt-2 text-[#C0C0C8]/70 text-sm">Bookings, reminders, no-show recovery — all hands-off.</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#00D4FF] mt-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
            </BentoCard>

            {/* E-Commerce card */}
            <BentoCard span="min-h-[180px]" glow dataTestId="services-bento-card-ecom" to="/services">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <ShoppingCart className="h-7 w-7 text-[#00D4FF] mb-3" />
                  <h3 className="text-white text-lg font-bold">E-Commerce Support</h3>
                  <p className="mt-2 text-[#C0C0C8]/70 text-sm">Orders, returns, recommendations, abandoned cart recovery.</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#00D4FF] mt-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
            </BentoCard>
          </div>
          <div className="mt-8 flex justify-center">
            <Link to="/services" data-testid="services-bento-see-all-link" className="inline-flex items-center gap-2 text-sm text-[#C0C0C8] hover:text-white transition-colors duration-200">
              See all services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — SVG FLOW */}
      <section className="ax-section bg-[#0A0A0F]" data-testid="how-it-works-section">
        <div className="ax-container">
          <Reveal>
            <div className="max-w-2xl">
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-3">How it works</div>
              <h2 className="text-white text-[32px] md:text-[48px] leading-[1.1] md:leading-[1.05] tracking-[-0.02em] md:tracking-[-0.03em] font-extrabold">From manual to AI-powered in 3 steps</h2>
            </div>
          </Reveal>
          <div className="mt-10 md:mt-14 rounded-[16px] bg-[#12121A] border border-white/10 p-6 md:p-10">
            <FlowDiagram />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="ax-section bg-[#0A0A0F]" data-testid="testimonials-section">
        <div className="ax-container">
          <Reveal>
            <div className="max-w-2xl">
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-3">Trusted by</div>
              <h2 className="text-white text-[32px] md:text-[48px] leading-[1.1] md:leading-[1.05] tracking-[-0.02em] md:tracking-[-0.03em] font-extrabold">Business owners who automated to win</h2>
            </div>
          </Reveal>
          <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 80}>
                <div className="h-full rounded-[16px] bg-[#12121A] border border-white/10 p-6 md:p-7 transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#00D4FF]/30" data-testid={`testimonial-card-${i}`}>
                  <Quote className="h-6 w-6 text-[#00D4FF]" />
                  <p className="mt-4 text-white text-[15px] md:text-base leading-relaxed">“{t.quote}”</p>
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-[#C0C0C8]/60 text-xs">{t.role}</div>
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/25 px-2.5 py-1">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#10B981]">{t.metric}</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="ax-section bg-[#0A0A0F]" data-testid="trust-section">
        <div className="ax-container">
          <Reveal>
            <h2 className="text-white text-[32px] md:text-[48px] leading-[1.1] md:leading-[1.05] tracking-[-0.02em] md:tracking-[-0.03em] font-extrabold max-w-2xl">Why Axovion.io</h2>
          </Reveal>
          <div className="mt-10 md:mt-14 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
            {TRUST_ITEMS.map((t, i) => (
              <Reveal key={t.label} delay={i * 40}>
                <div className="h-full rounded-[12px] bg-[#12121A] border border-white/8 px-5 py-4 flex items-center gap-3 transition-colors duration-200 hover:border-[#00D4FF]/25">
                  <t.icon className="h-5 w-5 text-[#00D4FF] shrink-0" />
                  <span className="text-[#C0C0C8] text-sm">{t.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="ax-section relative overflow-hidden bg-[#0A0A0F]" data-testid="final-cta-section">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -inset-24 bg-[radial-gradient(800px_circle_at_50%_50%,rgba(249,115,22,0.10),transparent_60%)]" />
        </div>
        <div className="relative ax-container text-center max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-white text-[32px] md:text-[56px] leading-[1.05] tracking-[-0.03em] font-extrabold">Ready to stop working harder and start scaling?</h2>
            <p className="mt-5 text-[#C0C0C8]/75 text-base md:text-lg max-w-2xl mx-auto">
              Get your free AI Audit. See exactly where AI can automate your business — with estimated ROI, monthly savings, and a clear implementation plan.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/audit"
                data-testid="final-cta-primary-button"
                className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-7 py-4 text-base font-bold transition-colors duration-200 hover:bg-[#FBBF24] ax-cta-pulse"
              >
                Start Free AI Audit <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                data-testid="final-cta-secondary-button"
                className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#12121A] text-white px-7 py-4 text-base font-semibold border border-white/15 transition-colors duration-200 hover:border-[#00D4FF]/45"
              >
                Book a Call
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};

const Metric = ({ label, value, hint }) => (
  <div className="rounded-[12px] bg-[#0A0A0F] border border-white/8 p-3">
    <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">{label}</div>
    <div className="text-white text-xl font-extrabold mt-1">{value}</div>
    <div className="text-[#C0C0C8]/55 text-[10px] mt-0.5">{hint}</div>
  </div>
);

const KPI = ({ label, value, hint }) => (
  <div className="rounded-[10px] bg-[#0A0A0F] border border-white/8 px-3 py-2">
    <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">{label}</div>
    <div className="text-[#00D4FF] text-base font-bold font-mono mt-0.5">{value}</div>
    <div className="text-[#C0C0C8]/55 text-[10px]">{hint}</div>
  </div>
);

const Sparkline = () => (
  <div className="mt-5 h-20 w-full relative">
    <svg width="100%" height="100%" viewBox="0 0 300 80" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 60 L30 56 L60 50 L90 52 L120 42 L150 38 L180 30 L210 26 L240 18 L270 14 L300 8 L300 80 L0 80 Z" fill="url(#sparkFill)" />
      <path d="M0 60 L30 56 L60 50 L90 52 L120 42 L150 38 L180 30 L210 26 L240 18 L270 14 L300 8" stroke="#00D4FF" strokeWidth="1.5" fill="none" />
    </svg>
  </div>
);

const FlowDiagram = () => {
  const pathRef = useRef(null);
  useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const el = pathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    if (reduced) {
      el.style.strokeDashoffset = '0';
      return;
    }
    el.style.strokeDashoffset = `${len}`;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          el.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.16, 1, 0.3, 1)';
          el.style.strokeDashoffset = '0';
          obs.disconnect();
        }
      });
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="relative" data-testid="how-it-works-flow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative z-10">
        {[
          { num: '01', title: 'Submit AI Audit', desc: 'Fill the form. We capture business workflows, tools, bottlenecks, and goals.', icon: ClipboardCheck },
          { num: '02', title: 'AI Analysis', desc: 'Our AI scans your business and generates a structured automation map with ROI.', icon: BrainCircuit },
          { num: '03', title: 'Custom Report + Call', desc: 'Receive an interactive report. Book a call with us to plan implementation.', icon: TrendingUp },
        ].map((s) => (
          <div key={s.num} className="rounded-[14px] bg-[#0A0A0F] border border-white/10 p-6 transition-colors duration-300 hover:border-[#00D4FF]/35">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-[10px] bg-[#00D4FF]/12 border border-[#00D4FF]/30 inline-flex items-center justify-center">
                <s.icon className="h-5 w-5 text-[#00D4FF]" />
              </div>
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Step {s.num}</span>
            </div>
            <h3 className="text-white text-lg font-bold mb-2">{s.title}</h3>
            <p className="text-[#C0C0C8]/70 text-sm leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
      <svg className="hidden md:block absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none w-full h-12" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
        <path
          ref={pathRef}
          d="M 60 20 Q 250 -20 500 20 T 940 20"
          stroke="#00D4FF"
          strokeWidth="1.5"
          fill="none"
          opacity="0.55"
        />
      </svg>
    </div>
  );
};

export default Home;
