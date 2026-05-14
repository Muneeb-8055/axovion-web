import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Check, ClipboardCheck, MessageSquare, Zap, CalendarClock, ShoppingCart, PackageSearch, MailPlus, Compass } from 'lucide-react';
import { SERVICES } from '../lib/content';
import { useScrollReveal } from '../lib/hooks';

const ICONS = { ClipboardCheck, MessageSquareBot: MessageSquare, Zap, CalendarClock, ShoppingCart, PackageSearch, MailPlus, Compass };

const Reveal = ({ children, delay = 0 }) => {
  const ref = useScrollReveal();
  return <div ref={ref} className="ax-reveal" style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

const Services = () => {
  return (
    <>
      <Helmet>
        <title>AI Automation Services | Axovion.io</title>
        <meta name="description" content="End-to-end AI agent development — customer support chatbots, lead follow-up, booking automation, e-commerce, CRM &amp; email automation, AI consulting." />
      </Helmet>

      <section className="relative ax-section bg-[#0A0A0F]" data-testid="services-hero">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -inset-24 bg-[radial-gradient(700px_circle_at_30%_20%,rgba(0,212,255,0.10),transparent_60%)]" />
        </div>
        <div className="relative ax-container">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-4">Services</div>
          <h1 className="text-white text-[40px] md:text-[64px] leading-[1.05] tracking-[-0.03em] font-extrabold max-w-3xl">AI automation services</h1>
          <p className="mt-5 text-[#C0C0C8]/80 text-lg max-w-2xl">End-to-end AI agent development for businesses ready to scale without scaling headcount.</p>
        </div>
      </section>

      <section className="pb-20 md:pb-[120px] bg-[#0A0A0F]">
        <div className="ax-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {SERVICES.map((s, idx) => {
              const Icon = ICONS[s.icon] || ClipboardCheck;
              return (
                <Reveal key={s.slug} delay={idx * 50}>
                  <article
                    className="h-full rounded-[16px] bg-[#12121A] border border-white/10 p-7 md:p-8 transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#00D4FF]/35 hover:shadow-[0_0_0_1px_rgba(0,212,255,0.22),0_0_28px_rgba(0,212,255,0.14)]"
                    data-testid={`service-card-${s.slug}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="h-12 w-12 rounded-[12px] bg-[#00D4FF]/12 border border-[#00D4FF]/30 inline-flex items-center justify-center">
                        <Icon className="h-6 w-6 text-[#00D4FF]" />
                      </div>
                      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">{String(idx + 1).padStart(2, '0')}</div>
                    </div>
                    <h2 className="mt-5 text-white text-2xl font-extrabold tracking-tight" dangerouslySetInnerHTML={{ __html: s.title }} />
                    <p className="mt-3 text-[#C0C0C8]/75 text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: s.full }} />
                    <ul className="mt-5 space-y-2.5">
                      {s.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2.5 text-sm text-[#C0C0C8]">
                          <Check className="h-4 w-4 text-[#00D4FF] mt-0.5 shrink-0" />
                          <span dangerouslySetInnerHTML={{ __html: b }} />
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 pt-5 border-t border-white/8 flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {s.industries.map((ind) => (
                          <span key={ind} className="text-[11px] font-mono uppercase tracking-widest text-[#C0C0C8]/60 bg-[#0A0A0F] border border-white/8 px-2.5 py-1 rounded-full">{ind}</span>
                        ))}
                      </div>
                      <Link to="/audit" data-testid={`service-card-cta-${s.slug}`} className="inline-flex items-center gap-1.5 text-sm text-[#00D4FF] hover:text-white transition-colors duration-200">
                        Get AI Audit <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ax-section bg-[#0A0A0F]" data-testid="services-final-cta">
        <div className="ax-container text-center max-w-3xl mx-auto">
          <h2 className="text-white text-[32px] md:text-[44px] leading-[1.05] tracking-[-0.03em] font-extrabold">Not sure which service fits?</h2>
          <p className="mt-4 text-[#C0C0C8]/75 text-base md:text-lg">Start with a free AI Audit. We'll tell you exactly what to automate first.</p>
          <Link to="/audit" data-testid="services-final-cta-button" className="mt-7 inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-7 py-3.5 text-base font-bold ax-cta-pulse transition-colors duration-200 hover:bg-[#FBBF24]">
            Start Free AI Audit <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
};

export default Services;
