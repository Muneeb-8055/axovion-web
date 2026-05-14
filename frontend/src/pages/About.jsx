import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Target, Zap, Eye, Handshake } from 'lucide-react';
import { VALUES, TIMELINE } from '../lib/content';
import { useScrollReveal } from '../lib/hooks';

const VALUE_ICONS = [Target, Zap, Eye, Handshake];
const Reveal = ({ children, delay = 0 }) => {
  const ref = useScrollReveal();
  return <div ref={ref} className="ax-reveal" style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

const About = () => {
  return (
    <>
      <Helmet>
        <title>About | Axovion.io — Automate to Win</title>
        <meta name="description" content="Axovion.io is an AI automation agency on a mission to help businesses reclaim their time. Learn our story, values, and how we work." />
      </Helmet>

      <section className="relative ax-section bg-[#0A0A0F]" data-testid="about-hero">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -inset-24 bg-[radial-gradient(700px_circle_at_30%_20%,rgba(0,212,255,0.10),transparent_60%)]" />
        </div>
        <div className="relative ax-container">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-4">About</div>
          <h1 className="text-white text-[40px] md:text-[64px] leading-[1.05] tracking-[-0.03em] font-extrabold max-w-3xl">We automate to win.</h1>
          <p className="mt-5 text-[#C0C0C8]/80 text-lg max-w-2xl">Axovion.io was built on a simple belief: business owners shouldn't drown in repetitive work that AI can handle today.</p>
        </div>
      </section>

      <section className="pb-20 md:pb-[120px] bg-[#0A0A0F]">
        <div className="ax-container grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5">
            <Reveal>
              <div className="sticky top-24">
                <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-4">Our mission</div>
                <h2 className="text-white text-[28px] md:text-[40px] leading-[1.1] tracking-[-0.02em] font-extrabold">Help business owners reclaim their time.</h2>
              </div>
            </Reveal>
          </div>
          <div className="md:col-span-7 text-[#C0C0C8] text-base md:text-lg leading-relaxed space-y-5">
            <Reveal>
              <p>We don't just build chatbots. We build systems that run your business while you sleep — customer support, lead follow-up, booking, repetitive ops — so you can focus on the work only humans can do.</p>
            </Reveal>
            <Reveal delay={100}>
              <p>Every agent we ship comes with a tracked return. If it doesn't save money or time, we don't build it. That's what "ROI-focused" actually means.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-[120px] bg-[#0A0A0F]">
        <div className="ax-container">
          <h2 className="text-white text-[32px] md:text-[48px] leading-[1.05] tracking-[-0.03em] font-extrabold max-w-2xl">Our story</h2>
          <div className="mt-10 md:mt-14 relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />
            <div className="space-y-8">
              {TIMELINE.map((t, i) => (
                <Reveal key={t.year} delay={i * 80}>
                  <div className={`relative grid grid-cols-1 md:grid-cols-2 gap-6 ${i % 2 === 0 ? '' : 'md:[&>*:first-child]:order-2'}`}>
                    <div className={`pl-12 md:pl-0 ${i % 2 === 0 ? 'md:pr-10 md:text-right' : 'md:pl-10'}`}>
                      <div className="font-mono text-[#00D4FF] text-sm tracking-widest">{t.year}</div>
                      <h3 className="text-white text-xl font-bold mt-1">{t.title}</h3>
                      <p className="text-[#C0C0C8]/75 text-sm mt-2 leading-relaxed">{t.description}</p>
                    </div>
                    <div className="hidden md:block" />
                    <div className="absolute left-4 md:left-1/2 top-2 -translate-x-1/2 h-3 w-3 rounded-full bg-[#00D4FF] ring-4 ring-[#0A0A0F]" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-[120px] bg-[#0A0A0F]">
        <div className="ax-container">
          <h2 className="text-white text-[32px] md:text-[48px] leading-[1.05] tracking-[-0.03em] font-extrabold max-w-2xl">Values that ship</h2>
          <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-5">
            {VALUES.map((v, i) => {
              const Icon = VALUE_ICONS[i] || Target;
              return (
                <Reveal key={v.title} delay={i * 80}>
                  <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-7 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-[#00D4FF]/30" data-testid={`value-card-${i}`}>
                    <div className="h-11 w-11 rounded-[12px] bg-[#00D4FF]/12 border border-[#00D4FF]/30 inline-flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-[#00D4FF]" />
                    </div>
                    <h3 className="text-white text-xl font-bold">{v.title}</h3>
                    <p className="mt-2 text-[#C0C0C8]/75 leading-relaxed">{v.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ax-section bg-[#0A0A0F]">
        <div className="ax-container text-center max-w-3xl mx-auto">
          <h2 className="text-white text-[32px] md:text-[44px] leading-[1.05] tracking-[-0.03em] font-extrabold">Want to work with us?</h2>
          <Link to="/contact" data-testid="about-final-cta-button" className="mt-7 inline-flex items-center gap-2 rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-7 py-3.5 text-base font-bold ax-cta-pulse transition-colors duration-200 hover:bg-[#FBBF24]">
            Book a Call <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
};

export default About;
