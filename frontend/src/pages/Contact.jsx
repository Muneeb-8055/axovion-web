import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, CalendarCheck, Mail, Phone, MessageSquare } from 'lucide-react';
import { publicApi } from '../lib/api';
import { useScrollReveal } from '../lib/hooks';

/* ── Layout strategy:
   Two-column split: form is the hero (7 cols), sidebar holds the Calendly link
   and direct contact details (5 cols). The form is elevated first in DOM order
   and also visually dominant. Each field has a real visible label; validation
   messages appear below the field. Four component states handled: idle,
   submitting, success, error.
   Eyebrow budget: ceil(2 sections / 3) = 1 allowed. Using 0 (form speaks
   for itself, no need to label it with a tracking eyebrow).
── */

/* ── Zod schema (field names preserved exactly for the backend) ── */
const schema = z.object({
  name: z.string().min(1, 'Enter your name.'),
  email: z
    .string()
    .min(1, 'Enter your email address.')
    .email('Enter a valid email address, e.g. you@company.com.'),
  phone: z.string().optional(),
  preferredTime: z.string().optional(),
  message: z.string().optional(),
});

/* ── Field wrapper with label + error message ── */
const Field = ({ id, label, error, children, optional = false }) => (
  <div className="flex flex-col gap-1">
    <label
      htmlFor={id}
      className="text-sm font-medium"
      style={{ color: 'var(--ax-text)' }}
    >
      {label}
      {optional && (
        <span
          className="ml-1 font-normal text-xs"
          style={{ color: 'var(--ax-muted-2)' }}
        >
          (optional)
        </span>
      )}
    </label>
    {children}
    {error && (
      <p
        className="text-xs"
        style={{ color: 'var(--ax-error)' }}
        role="alert"
        aria-live="polite"
      >
        {error}
      </p>
    )}
  </div>
);

const inputStyle = {
  width: '100%',
  background: 'var(--ax-bg)',
  border: '1px solid var(--ax-border)',
  borderRadius: 'var(--ax-radius-control)',
  padding: '0.65rem 1rem',
  fontSize: '0.875rem',
  color: 'var(--ax-heading)',
  outline: 'none',
  minHeight: '44px',
  fontFamily: 'inherit',
};

const inputErrorStyle = {
  ...inputStyle,
  borderColor: 'rgba(239,68,68,0.55)',
};

function inputFocusHandlers(hasError) {
  return {
    onFocus: (e) => {
      e.currentTarget.style.borderColor = hasError
        ? 'rgba(239,68,68,0.75)'
        : 'rgba(0,212,255,0.45)';
    },
    onBlur: (e) => {
      e.currentTarget.style.borderColor = hasError
        ? 'rgba(239,68,68,0.55)'
        : 'var(--ax-border)';
    },
  };
}

const Reveal = ({ children, delay = 0 }) => {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="ax-reveal" style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const Contact = () => {
  const [settings, setSettings] = useState(null);

  /* Form state: idle | submitting | success | error */
  const [submitState, setSubmitState] = useState('idle');
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    publicApi.getSettings().then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      preferredTime: '',
      message: '',
    },
  });

  const onSubmit = async (data) => {
    setSubmitState('submitting');
    setServerError('');
    try {
      await publicApi.createBooking({ ...data, source: 'contact-form' });
      setSubmitState('success');
      reset();
    } catch {
      setSubmitState('error');
      setServerError(
        'Submission failed. Please try again or email us directly at hello@axovion.io.'
      );
    }
  };

  const calendlyLink = settings?.calendlyLink ?? 'https://calendly.com/axovion/30min';
  const contactEmail = settings?.contactEmail ?? 'hello@axovion.io';
  const whatsapp = settings?.whatsapp ?? '';

  return (
    <>
      <Helmet>
        <title>Contact &amp; Book a Call | Axovion.io</title>
        <meta
          name="description"
          content="Book a free 15-30 minute consultation with Axovion.io. We'll show you exactly where AI can help your business."
        />
      </Helmet>

      {/* ── Section 1: Page header (left-aligned, no eyebrow) ── */}
      <section
        className="relative ax-section"
        style={{ background: 'var(--ax-bg)', paddingBottom: '2.5rem' }}
        data-testid="contact-hero"
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(640px circle at 15% 10%, rgba(0,212,255,0.07), transparent 60%)',
          }}
        />
        <div className="relative ax-container">
          <h1
            className="text-white font-extrabold tracking-[-0.03em] leading-[1.05]"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)', maxWidth: '24ch', textWrap: 'balance' }}
          >
            {"Let's talk AI automation"}
          </h1>
          <p
            className="mt-5 text-lg leading-relaxed"
            style={{ color: 'var(--ax-text)', maxWidth: '50ch' }}
          >
            Book a free 15-30 minute consultation. We will discuss your business
            and show you exactly where AI can help.
          </p>
        </div>
      </section>

      {/* ── Section 2: Form hero + sidebar ── */}
      <section
        className="pb-20 md:pb-[120px]"
        style={{ background: 'var(--ax-bg)' }}
      >
        <div className="ax-container grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">

          {/* ── Primary: contact form (7/12 cols) ── */}
          <div className="lg:col-span-7">
            <Reveal>
              <div
                style={{
                  borderRadius: 'var(--ax-radius-panel)',
                  background: 'var(--ax-surface)',
                  border: '1px solid var(--ax-border)',
                  padding: '1.75rem',
                }}
                data-testid="contact-form-card"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare
                    strokeWidth={1.5}
                    className="h-4 w-4"
                    style={{ color: 'var(--ax-accent)' }}
                    aria-hidden="true"
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--ax-accent)' }}
                  >
                    Send a message
                  </span>
                </div>
                <h2
                  className="text-white font-extrabold tracking-tight mt-1"
                  style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)' }}
                >
                  Tell us about your business
                </h2>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: 'var(--ax-muted)' }}
                >
                  Prefer not to schedule yet? Drop us a note and we will get back
                  within one business day.
                </p>

                {/* Success state */}
                {submitState === 'success' && (
                  <div
                    className="mt-7 p-5"
                    style={{
                      borderRadius: 'var(--ax-radius-control)',
                      background: 'rgba(16,185,129,0.08)',
                      border: '1px solid rgba(16,185,129,0.28)',
                    }}
                    data-testid="contact-form-success"
                    role="status"
                    aria-live="polite"
                  >
                    <h3
                      className="text-white font-semibold"
                    >
                      Got it.
                    </h3>
                    <p
                      className="mt-1 text-sm leading-relaxed"
                      style={{ color: 'var(--ax-muted)' }}
                    >
                      Thanks. We have received your message and will reach out shortly.
                    </p>
                    <button
                      className="mt-4 text-sm font-medium underline underline-offset-2"
                      style={{ color: 'var(--ax-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      onClick={() => setSubmitState('idle')}
                    >
                      Send another message
                    </button>
                  </div>
                )}

                {/* Form (idle or error state) */}
                {submitState !== 'success' && (
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-6 flex flex-col gap-5"
                    noValidate
                    data-testid="contact-form"
                  >
                    {/* Name */}
                    <Field id="name" label="Your name" error={errors.name?.message}>
                      <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        data-testid="contact-form-name"
                        style={errors.name ? inputErrorStyle : inputStyle}
                        {...inputFocusHandlers(!!errors.name)}
                        {...register('name')}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                    </Field>

                    {/* Email */}
                    <Field id="email" label="Email address" error={errors.email?.message}>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        data-testid="contact-form-email"
                        style={errors.email ? inputErrorStyle : inputStyle}
                        {...inputFocusHandlers(!!errors.email)}
                        {...register('email')}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                    </Field>

                    {/* Phone */}
                    <Field id="phone" label="Phone or WhatsApp" error={errors.phone?.message} optional>
                      <input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        data-testid="contact-form-phone"
                        style={errors.phone ? inputErrorStyle : inputStyle}
                        {...inputFocusHandlers(!!errors.phone)}
                        {...register('phone')}
                      />
                    </Field>

                    {/* Preferred time */}
                    <Field id="preferredTime" label="Preferred contact time" error={errors.preferredTime?.message} optional>
                      <input
                        id="preferredTime"
                        type="text"
                        placeholder="e.g. Tuesday mornings, after 2 pm UTC"
                        data-testid="contact-form-time"
                        style={errors.preferredTime ? inputErrorStyle : inputStyle}
                        {...inputFocusHandlers(!!errors.preferredTime)}
                        {...register('preferredTime')}
                      />
                    </Field>

                    {/* Message */}
                    <Field id="message" label="What would you like to discuss?" error={errors.message?.message} optional>
                      <textarea
                        id="message"
                        rows={4}
                        data-testid="contact-form-message"
                        style={{
                          ...inputStyle,
                          minHeight: 'auto',
                          resize: 'vertical',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(0,212,255,0.45)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--ax-border)';
                        }}
                        {...register('message')}
                      />
                    </Field>

                    {/* Server error */}
                    {submitState === 'error' && serverError && (
                      <p
                        className="text-sm"
                        style={{ color: 'var(--ax-error)' }}
                        role="alert"
                        aria-live="assertive"
                      >
                        {serverError}
                      </p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting || submitState === 'submitting'}
                      data-testid="contact-form-submit"
                      className="inline-flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-200 active:scale-[0.98]"
                      style={{
                        padding: '0.8rem 1.5rem',
                        minHeight: '48px',
                        borderRadius: 'var(--ax-radius-control)',
                        background: 'var(--ax-accent)',
                        color: 'var(--ax-on-accent)',
                        opacity: isSubmitting || submitState === 'submitting' ? 0.65 : 1,
                        cursor:
                          isSubmitting || submitState === 'submitting'
                            ? 'not-allowed'
                            : 'pointer',
                      }}
                      onMouseOver={(e) => {
                        if (!(isSubmitting || submitState === 'submitting'))
                          e.currentTarget.style.background = 'var(--ax-accent-dim)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'var(--ax-accent)';
                      }}
                    >
                      {isSubmitting || submitState === 'submitting'
                        ? 'Sending...'
                        : 'Send message'}
                      {!(isSubmitting || submitState === 'submitting') && (
                        <ArrowRight strokeWidth={1.5} className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>

          {/* ── Sidebar: schedule + direct contact (5/12 cols) ── */}
          <aside className="lg:col-span-5 flex flex-col gap-5">
            {/* Schedule via Calendly */}
            <Reveal delay={100}>
              <div
                style={{
                  borderRadius: 'var(--ax-radius-panel)',
                  background: 'var(--ax-surface)',
                  border: '1px solid var(--ax-border)',
                  padding: '1.75rem',
                }}
                data-testid="calendly-placeholder"
              >
                <div className="flex items-center gap-2 mb-1">
                  <CalendarCheck
                    strokeWidth={1.5}
                    className="h-4 w-4"
                    style={{ color: 'var(--ax-accent)' }}
                    aria-hidden="true"
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--ax-accent)' }}
                  >
                    Book a call
                  </span>
                </div>
                <h2
                  className="text-white font-extrabold tracking-tight mt-1"
                  style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)' }}
                >
                  Pick a time that works
                </h2>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: 'var(--ax-muted)' }}
                >
                  Free, 15-30 minutes. We send a Google Meet link automatically.
                </p>
                <a
                  href={calendlyLink}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="calendly-open-button"
                  className="mt-6 inline-flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-200 active:scale-[0.98]"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    minHeight: '48px',
                    borderRadius: 'var(--ax-radius-control)',
                    background: 'var(--ax-surface-2)',
                    color: 'var(--ax-heading)',
                    border: '1px solid var(--ax-border-strong)',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0,212,255,0.35)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ax-border-strong)';
                  }}
                >
                  Open calendar <ArrowRight strokeWidth={1.5} className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </Reveal>

            {/* Direct contact details */}
            <Reveal delay={180}>
              <div
                style={{
                  borderRadius: 'var(--ax-radius-panel)',
                  background: 'var(--ax-surface)',
                  border: '1px solid var(--ax-border)',
                  padding: '1.75rem',
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Mail
                    strokeWidth={1.5}
                    className="h-4 w-4"
                    style={{ color: 'var(--ax-accent)' }}
                    aria-hidden="true"
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--ax-accent)' }}
                  >
                    Direct contact
                  </span>
                </div>

                <ul className="flex flex-col gap-3">
                  <li className="flex items-center gap-3 text-sm">
                    <Mail
                      strokeWidth={1.5}
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: 'var(--ax-muted-2)' }}
                      aria-hidden="true"
                    />
                    <a
                      href={`mailto:${contactEmail}`}
                      className="transition-colors duration-200"
                      style={{ color: 'var(--ax-heading)' }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = 'var(--ax-accent)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = 'var(--ax-heading)';
                      }}
                    >
                      {contactEmail}
                    </a>
                  </li>
                  {whatsapp && (
                    <li className="flex items-center gap-3 text-sm">
                      <Phone
                        strokeWidth={1.5}
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: 'var(--ax-muted-2)' }}
                        aria-hidden="true"
                      />
                      <a
                        href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="transition-colors duration-200"
                        style={{ color: 'var(--ax-heading)' }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.color = 'var(--ax-accent)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.color = 'var(--ax-heading)';
                        }}
                      >
                        WhatsApp: {whatsapp}
                      </a>
                    </li>
                  )}
                </ul>

                {/* Response time note */}
                <p
                  className="mt-5 text-xs leading-relaxed"
                  style={{ color: 'var(--ax-muted-2)' }}
                >
                  We reply within one business day.
                </p>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  );
};

export default Contact;
