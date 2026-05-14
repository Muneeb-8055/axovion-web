import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Linkedin, Twitter, ArrowRight, UserPlus, Sparkles } from 'lucide-react';
import { useScrollReveal } from '../lib/hooks';

const FOUNDER_PHOTO = 'https://images.unsplash.com/photo-1710527304331-4186db4ee708?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=600';

const Reveal = ({ children, delay = 0 }) => {
  const ref = useScrollReveal();
  return <div ref={ref} className="ax-reveal" style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

const Team = () => {
  return (
    <>
      <Helmet>
        <title>Team | Axovion.io</title>
        <meta name="description" content="Meet the team behind Axovion.io — builders who deploy production-grade AI for business outcomes, not demos." />
      </Helmet>

      <section className="relative ax-section bg-[#0A0A0F]" data-testid="team-hero">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -inset-24 bg-[radial-gradient(700px_circle_at_30%_20%,rgba(0,212,255,0.10),transparent_60%)]" />
        </div>
        <div className="relative ax-container">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-4">Team</div>
          <h1 className="text-white text-[40px] md:text-[64px] leading-[1.05] tracking-[-0.03em] font-extrabold max-w-3xl">The people behind the agents</h1>
          <p className="mt-5 text-[#C0C0C8]/80 text-lg max-w-2xl">We build AI that works because we understand business — not just models.</p>
        </div>
      </section>

      <section className="pb-20 md:pb-[120px] bg-[#0A0A0F]">
        <div className="ax-container">
          <Reveal>
            <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-7 md:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-start" data-testid="founder-card">
              <div className="md:col-span-5">
                <div className="relative rounded-[16px] overflow-hidden border border-white/10 aspect-[4/5] max-w-sm bg-[#0A0A0F]">
                  <img src={FOUNDER_PHOTO} alt="Alex Morgan, Founder of Axovion.io" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-[#00D4FF]/15" />
                </div>
              </div>
              <div className="md:col-span-7">
                <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-3">Founder</div>
                <h2 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight">Alex Morgan</h2>
                <div className="text-[#C0C0C8]/70 mt-1">Founder &amp; AI Automation Strategist</div>
                <div className="mt-5 space-y-4 text-[#C0C0C8] text-base leading-relaxed">
                  <p>I started Axovion because I watched too many businesses hire to fix problems that AI could solve in a week. After 2+ years building production AI agents — chatbots, follow-up systems, booking, ops — I productized the playbook so any business can get ROI-focused automation in days.</p>
                  <p>Our edge isn't the AI. It's the focus on outcomes: every agent we ship has a tracked return. If it doesn't save you money or time, we don't build it.</p>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[12px] bg-[#0A0A0F] text-white px-4 py-2 text-sm border border-white/10 hover:border-[#00D4FF]/35 transition-colors duration-200" data-testid="founder-linkedin">
                    <Linkedin className="h-4 w-4 text-[#00D4FF]" /> LinkedIn
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[12px] bg-[#0A0A0F] text-white px-4 py-2 text-sm border border-white/10 hover:border-[#00D4FF]/35 transition-colors duration-200" data-testid="founder-twitter">
                    <Twitter className="h-4 w-4 text-[#00D4FF]" /> Twitter
                  </a>
                </div>
                <div className="mt-7 rounded-[14px] bg-[#0A0A0F] border border-[#00D4FF]/20 p-5">
                  <Sparkles className="h-5 w-5 text-[#00D4FF]" />
                  <p className="mt-3 text-white text-base leading-relaxed">“Most AI projects fail because they optimize for novelty, not outcomes. We build the boring stuff that compounds.”</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pb-20 md:pb-[120px] bg-[#0A0A0F]">
        <div className="ax-container">
          <h2 className="text-white text-[32px] md:text-[48px] leading-[1.05] tracking-[-0.03em] font-extrabold">Joining soon</h2>
          <p className="mt-4 text-[#C0C0C8]/75 max-w-2xl">We're scaling the team carefully. Roles opening up in 2026.</p>
          <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { role: 'AI Engineer', status: 'Hiring soon' },
              { role: 'Automation Specialist', status: 'Hiring soon' },
              { role: 'Client Success Manager', status: 'Hiring soon' },
            ].map((p, i) => (
              <Reveal key={p.role} delay={i * 80}>
                <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-7 transition-[border-color] duration-300 hover:border-[#00D4FF]/25">
                  <div className="h-14 w-14 rounded-full bg-[#0A0A0F] border border-white/10 inline-flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-[#C0C0C8]/55" />
                  </div>
                  <h3 className="mt-4 text-white text-lg font-bold">{p.role}</h3>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#FBBF24]/10 border border-[#FBBF24]/25 px-2.5 py-1">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#FBBF24]">{p.status}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="ax-section bg-[#0A0A0F]">
        <div className="ax-container text-center max-w-3xl mx-auto">
          <h2 className="text-white text-[32px] md:text-[44px] leading-[1.05] tracking-[-0.03em] font-extrabold">Want to join us?</h2>
          <p className="mt-4 text-[#C0C0C8]/75">Remote-first, async, AI-native workflows. We work the way we ship.</p>
          <a href="mailto:hello@axovion.io?subject=Joining%20Axovion" data-testid="team-join-button" className="mt-7 inline-flex items-center gap-2 rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-7 py-3.5 text-base font-bold transition-colors duration-200 hover:bg-[#FBBF24] ax-cta-pulse">
            Drop us a line <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </>
  );
};

export default Team;
