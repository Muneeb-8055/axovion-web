import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Instagram, Youtube, Facebook } from 'lucide-react';
import { LOGO_URL } from '../lib/content';

const SITE_LINKS = [
  { to: '/',         label: 'Home',     testId: 'footer-link-home' },
  { to: '/services', label: 'Services', testId: 'footer-link-services' },
  { to: '/audit',    label: 'AI Audit', testId: 'footer-link-audit' },
  { to: '/results',  label: 'Results',  testId: 'footer-link-results' },
  { to: '/contact',  label: 'Contact',  testId: 'footer-link-contact' },
];

const COMPANY_LINKS = [
  { to: '/about', label: 'About', testId: 'footer-link-about' },
  { to: '/team',  label: 'Team',  testId: 'footer-link-team' },
  { to: '/blog',  label: 'Blog',  testId: 'footer-link-blog' },
];

const SOCIAL = [
  { href: 'https://linkedin.com',  Icon: Linkedin,  label: 'LinkedIn',  testId: 'footer-social-linkedin' },
  { href: 'https://twitter.com',   Icon: Twitter,   label: 'X / Twitter', testId: 'footer-social-twitter' },
  { href: 'https://instagram.com', Icon: Instagram, label: 'Instagram', testId: 'footer-social-instagram' },
  { href: 'https://youtube.com',   Icon: Youtube,   label: 'YouTube',   testId: 'footer-social-youtube' },
  { href: 'https://facebook.com',  Icon: Facebook,  label: 'Facebook',  testId: 'footer-social-facebook' },
];

const footerLinkStyle = {
  color: 'var(--ax-muted)',
  transition: 'color var(--ax-duration-fast)',
};

const FooterLink = ({ to, label, testId }) => (
  <li>
    <Link
      to={to}
      data-testid={testId}
      className="text-sm transition-colors duration-200 rounded-[4px] inline-flex items-center"
      style={{ ...footerLinkStyle, minHeight: '44px', paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
      onMouseOver={(e) => { e.currentTarget.style.color = 'var(--ax-heading)'; }}
      onMouseOut={(e)  => { e.currentTarget.style.color = 'var(--ax-muted)'; }}
    >
      {label}
    </Link>
  </li>
);

const ColumnHeading = ({ children }) => (
  <div
    className="font-mono text-[11px] tracking-[0.18em] uppercase mb-4"
    style={{ color: 'var(--ax-muted-2)' }}
  >
    {children}
  </div>
);

export const Footer = () => (
  <footer
    className="mt-12"
    data-testid="site-footer"
    style={{
      background: 'var(--ax-bg)',
      borderTop: '1px solid var(--ax-border)',
    }}
  >
    <div className="ax-container py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

        {/* Brand column */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Axovion.io" className="h-10 w-10 rounded-md object-cover" />
            <div className="leading-none">
              <div className="text-white font-extrabold text-lg">
                Axovion<span style={{ color: 'var(--ax-accent)' }}>.io</span>
              </div>
              <div
                className="font-mono text-[10px] tracking-[0.18em] uppercase mt-1"
                style={{ color: 'var(--ax-muted-2)' }}
              >
                Automate to Win
              </div>
            </div>
          </div>
          <p
            className="mt-5 text-sm leading-relaxed max-w-xs"
            style={{ color: 'var(--ax-muted)' }}
          >
            ROI-focused AI automation agency. We build production-grade AI agents that handle
            support, leads, bookings, and repetitive workflows.
          </p>
        </div>

        {/* Site links */}
        <div>
          <ColumnHeading>Site</ColumnHeading>
          <ul className="space-y-3">
            {SITE_LINKS.map((l) => <FooterLink key={l.to} {...l} />)}
          </ul>
        </div>

        {/* Company links */}
        <div>
          <ColumnHeading>Company</ColumnHeading>
          <ul className="space-y-3">
            {COMPANY_LINKS.map((l) => <FooterLink key={l.to} {...l} />)}
            <li>
              <a
                href="mailto:hello@axovion.io"
                className="text-sm transition-colors duration-200 rounded-[4px] inline-flex items-center"
                style={{ ...footerLinkStyle, minHeight: '44px', paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
                onMouseOver={(e) => { e.currentTarget.style.color = 'var(--ax-heading)'; }}
                onMouseOut={(e)  => { e.currentTarget.style.color = 'var(--ax-muted)'; }}
              >
                hello@axovion.io
              </a>
            </li>
          </ul>
        </div>

        {/* Social icons */}
        <div>
          <ColumnHeading>Social</ColumnHeading>
          <div className="flex flex-wrap gap-3">
            {SOCIAL.map(({ href, Icon, label, testId }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                data-testid={testId}
                className="inline-flex items-center justify-center transition-colors duration-200 rounded-[12px]"
                style={{
                  height: '44px',
                  width: '44px',
                  background: 'var(--ax-surface)',
                  border: '1px solid var(--ax-border)',
                  color: 'var(--ax-muted)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = 'var(--ax-heading)';
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.35)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = 'var(--ax-muted)';
                  e.currentTarget.style.borderColor = 'var(--ax-border)';
                }}
              >
                <Icon strokeWidth={1.5} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="mt-12 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ borderTop: '1px solid var(--ax-border)' }}
      >
        <p className="text-xs" style={{ color: 'var(--ax-muted-2)' }}>
          &copy; {new Date().getFullYear()} Axovion.io. All rights reserved.
        </p>
        <div className="flex gap-6 text-xs" style={{ color: 'var(--ax-muted-2)' }}>
          <a
            href="/privacy"
            className="transition-colors duration-200 rounded-[4px] inline-flex items-center"
            style={{ minHeight: '44px', paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
            onMouseOver={(e) => { e.currentTarget.style.color = 'var(--ax-heading)'; }}
            onMouseOut={(e)  => { e.currentTarget.style.color = 'var(--ax-muted-2)'; }}
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="transition-colors duration-200 rounded-[4px] inline-flex items-center"
            style={{ minHeight: '44px', paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
            onMouseOver={(e) => { e.currentTarget.style.color = 'var(--ax-heading)'; }}
            onMouseOut={(e)  => { e.currentTarget.style.color = 'var(--ax-muted-2)'; }}
          >
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  </footer>
);
