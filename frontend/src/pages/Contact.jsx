import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, CalendarCheck, Mail, MessageSquare, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { publicApi } from '../lib/api';
import { useScrollReveal } from '../lib/hooks';

const Reveal = ({ children, delay = 0 }) => {
  const ref = useScrollReveal();
  return <div ref={ref} className="ax-reveal" style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

const Contact = () => {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', preferredTime: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { publicApi.getSettings().then((r) => setSettings(r.data)).catch(() => {}); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { toast.error('Name &amp; email are required.'); return; }
    setSubmitting(true);
    try {
      await publicApi.createBooking({ ...form, source: 'contact-form' });
      toast.success('Thanks! We\'ll be in touch shortly.');
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', message: '', preferredTime: '' });
    } catch (err) {
      toast.error('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const calendlyLink = settings?.calendlyLink || 'https://calendly.com/axovion/30min';
  const contactEmail = settings?.contactEmail || 'hello@axovion.io';
  const whatsapp = settings?.whatsapp || '';

  return (
    <>
      <Helmet>
        <title>Contact &amp; Book a Call | Axovion.io</title>
        <meta name="description" content="Book a free 15-30 minute consultation with Axovion.io. We'll show you exactly where AI can help your business." />
      </Helmet>

      <section className="relative ax-section bg-[#0A0A0F] pb-12" data-testid="contact-hero">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -inset-24 bg-[radial-gradient(700px_circle_at_30%_20%,rgba(0,212,255,0.10),transparent_60%)]" />
        </div>
        <div className="relative ax-container">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-4">Contact</div>
          <h1 className="text-white text-[40px] md:text-[64px] leading-[1.05] tracking-[-0.03em] font-extrabold max-w-3xl">Let's talk AI automation</h1>
          <p className="mt-5 text-[#C0C0C8]/80 text-lg max-w-2xl">Book a free 15-30 minute consultation. We'll discuss your business and show you exactly where AI can help.</p>
        </div>
      </section>

      <section className="pb-20 md:pb-[120px] bg-[#0A0A0F]">
        <div className="ax-container grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-7">
            <Reveal>
              <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-6 md:p-8 min-h-[640px] flex flex-col" data-testid="calendly-placeholder">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-[#00D4FF]" />
                    <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#00D4FF]">Schedule</div>
                  </div>
                  <span className="text-xs text-[#C0C0C8]/55">Free · 15-30 min</span>
                </div>
                <h2 className="text-white text-2xl font-extrabold tracking-tight">Pick a time that works</h2>
                <p className="mt-2 text-[#C0C0C8]/75 text-sm">Direct calendar access — we'll send a Google Meet link automatically.</p>
                <div className="mt-6 flex-1 rounded-[12px] bg-[#0A0A0F] border border-dashed border-white/12 flex items-center justify-center p-8">
                  <div className="text-center max-w-sm">
                    <CalendarCheck className="h-10 w-10 text-[#00D4FF] mx-auto" />
                    <h3 className="mt-4 text-white text-lg font-bold">Calendly embed</h3>
                    <p className="mt-2 text-[#C0C0C8]/65 text-sm">Click below to open Calendly and book a time.</p>
                    <a href={calendlyLink} target="_blank" rel="noreferrer" data-testid="calendly-open-button" className="mt-6 inline-flex items-center gap-2 rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-6 py-3 text-sm font-bold transition-colors duration-200 hover:bg-[#FBBF24] ax-cta-pulse">
                      Open Calendly <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={100}>
              <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-6 md:p-8" data-testid="contact-form-card">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="h-4 w-4 text-[#00D4FF]" />
                  <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#00D4FF]">Or message us</div>
                </div>
                <h2 className="text-white text-2xl font-extrabold tracking-tight mt-1">Send a message</h2>
                <p className="mt-2 text-[#C0C0C8]/75 text-sm">Prefer not to schedule yet? Drop us a line and we'll get back within 1 business day.</p>
                {submitted ? (
                  <div className="mt-7 rounded-[12px] bg-[#10B981]/10 border border-[#10B981]/30 p-5" data-testid="contact-form-success">
                    <h3 className="text-white font-bold">Got it.</h3>
                    <p className="mt-1 text-[#C0C0C8]/75 text-sm">Thanks — we've received your message and will reach out shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={submit} className="mt-6 space-y-4" data-testid="contact-form">
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" required data-testid="contact-form-name" className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-4 py-2.5 text-sm text-white placeholder:text-[#C0C0C8]/40 focus:outline-none focus:border-[#00D4FF]/45" />
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" required data-testid="contact-form-email" className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-4 py-2.5 text-sm text-white placeholder:text-[#C0C0C8]/40 focus:outline-none focus:border-[#00D4FF]/45" />
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone / WhatsApp (optional)" data-testid="contact-form-phone" className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-4 py-2.5 text-sm text-white placeholder:text-[#C0C0C8]/40 focus:outline-none focus:border-[#00D4FF]/45" />
                    <input value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} placeholder="Preferred time (optional)" data-testid="contact-form-time" className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-4 py-2.5 text-sm text-white placeholder:text-[#C0C0C8]/40 focus:outline-none focus:border-[#00D4FF]/45" />
                    <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows="4" placeholder="What would you like to chat about?" data-testid="contact-form-message" className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-4 py-2.5 text-sm text-white placeholder:text-[#C0C0C8]/40 focus:outline-none focus:border-[#00D4FF]/45" />
                    <button type="submit" disabled={submitting} data-testid="contact-form-submit" className="w-full inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-5 py-3 text-sm font-bold transition-colors duration-200 hover:bg-[#FBBF24] disabled:opacity-60">
                      {submitting ? 'Sending…' : 'Send Message'} <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-6 rounded-[16px] bg-[#12121A] border border-white/10 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-4 w-4 text-[#00D4FF]" />
                  <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#00D4FF]">Direct</div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-[#C0C0C8]/55" />
                    <a href={`mailto:${contactEmail}`} className="text-white hover:text-[#00D4FF] transition-colors">{contactEmail}</a>
                  </li>
                  {whatsapp && (
                    <li className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-[#C0C0C8]/55" />
                      <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-white hover:text-[#00D4FF] transition-colors">WhatsApp: {whatsapp}</a>
                    </li>
                  )}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
