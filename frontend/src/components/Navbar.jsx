import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { LOGO_URL } from '../lib/content';

const NAV_LINKS = [
  { to: '/services', label: 'Services' },
  { to: '/results', label: 'Results' },
  { to: '/about', label: 'About' },
  { to: '/team', label: 'Team' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
];

/* All focusable elements inside the mobile drawer */
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const drawerRef = useRef(null);
  const openBtnRef = useRef(null);

  /* Scroll detection via IntersectionObserver on a sentinel div */
  const sentinelRef = useRef(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Close drawer on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  /* Body scroll lock when drawer is open */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  /* Focus trap inside drawer */
  const handleDrawerKeyDown = useCallback((e) => {
    if (!mobileOpen) return;

    if (e.key === 'Escape') {
      setMobileOpen(false);
      openBtnRef.current?.focus();
      return;
    }

    if (e.key !== 'Tab') return;

    const focusable = Array.from(drawerRef.current?.querySelectorAll(FOCUSABLE) ?? []);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [mobileOpen]);

  /* Move focus into drawer when it opens */
  useEffect(() => {
    if (mobileOpen && drawerRef.current) {
      const focusable = drawerRef.current.querySelectorAll(FOCUSABLE);
      focusable[0]?.focus();
    }
  }, [mobileOpen]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Scroll sentinel: sits just below the page top */}
      <div ref={sentinelRef} aria-hidden="true" style={{ position: 'absolute', top: 0, height: 1, width: '100%', pointerEvents: 'none' }} />

      <nav
        data-testid="site-navbar"
        aria-label="Primary navigation"
        style={{ height: '68px' }}
        className={[
          'sticky top-0 z-50 flex items-center',
          'border-b transition-colors',
          'duration-200',
          scrolled
            ? 'bg-[color:var(--ax-bg)]/90 backdrop-blur-md border-[color:var(--ax-border)]'
            : 'bg-[color:var(--ax-bg)] border-transparent',
        ].join(' ')}
      >
        <div className="ax-container w-full flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group rounded-[4px]"
            data-testid="navbar-logo-link"
            style={{ minHeight: '44px' }}
          >
            <img
              src={LOGO_URL}
              alt="Axovion.io home"
              className="h-9 w-9 rounded-md object-cover"
            />
            <span className="hidden sm:flex flex-col leading-none">
              <span className="text-white font-extrabold text-lg tracking-tight">
                Axovion<span style={{ color: 'var(--ax-accent)' }}>.io</span>
              </span>
              <span
                className="font-mono text-[10px] tracking-[0.18em] uppercase mt-0.5"
                style={{ color: 'var(--ax-muted-2)' }}
              >
                Automate to Win
              </span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div
            className="hidden lg:flex items-center gap-7"
            role="list"
          >
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                role="listitem"
                data-testid={`navbar-link-${l.label.toLowerCase()}`}
                className={[
                  'text-sm rounded-[4px] py-0.5 px-1',
                  'transition-colors duration-200',
                  isActive(l.to)
                    ? 'font-semibold'
                    : 'hover:text-white',
                ].join(' ')}
                style={{
                  color: isActive(l.to) ? 'var(--ax-accent)' : 'var(--ax-muted)',
                }}
                aria-current={isActive(l.to) ? 'page' : undefined}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/audit"
              data-testid="navbar-primary-cta-button"
              className={[
                'inline-flex items-center justify-center',
                'rounded-[12px] px-5 py-2 text-sm font-semibold',
                'transition-colors duration-200',
                'active:scale-[0.98]',
              ].join(' ')}
              style={{
                background: 'var(--ax-accent)',
                color: 'var(--ax-on-accent)',
                borderRadius: 'var(--ax-radius-control)',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'var(--ax-accent-dim)'; }}
              onMouseOut={(e)  => { e.currentTarget.style.background = 'var(--ax-accent)'; }}
            >
              Start Free AI Audit
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            ref={openBtnRef}
            className={[
              'lg:hidden inline-flex items-center justify-center',
              'rounded-md transition-colors duration-200',
              'text-white',
            ].join(' ')}
            style={{ height: '44px', width: '44px' }}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            data-testid="mobile-nav-open-button"
            onClick={() => setMobileOpen(true)}
          >
            <Menu strokeWidth={1.5} className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 59,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Mobile drawer */}
      <div
        id="mobile-nav-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        onKeyDown={handleDrawerKeyDown}
        data-testid="mobile-nav-drawer"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 60,
          width: 'min(88vw, 360px)',
          background: 'var(--ax-surface)',
          borderLeft: '1px solid var(--ax-border)',
          display: 'flex',
          flexDirection: 'column',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform var(--ax-duration) var(--ax-ease-out)',
          overflowY: 'auto',
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--ax-border)' }}
        >
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="" aria-hidden="true" className="h-8 w-8 rounded-md" />
            <span className="text-white font-extrabold">
              Axovion<span style={{ color: 'var(--ax-accent)' }}>.io</span>
            </span>
          </div>
          <button
            className="inline-flex items-center justify-center rounded-md text-white transition-colors duration-200"
            style={{
              height: '44px',
              width: '44px',
              background: 'transparent',
            }}
            onClick={() => { setMobileOpen(false); openBtnRef.current?.focus(); }}
            aria-label="Close navigation menu"
            data-testid="mobile-nav-close-button"
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--ax-surface-2)'; }}
            onMouseOut={(e)  => { e.currentTarget.style.background = 'transparent'; }}
          >
            <X strokeWidth={1.5} className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav aria-label="Mobile navigation" className="flex flex-col px-5 py-3">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`mobile-nav-link-${l.label.toLowerCase()}`}
              className="py-3 text-base rounded-[4px] transition-colors duration-200"
              style={{
                color: isActive(l.to) ? 'var(--ax-accent)' : 'var(--ax-text)',
                borderBottom: '1px solid var(--ax-border)',
                fontWeight: isActive(l.to) ? 600 : 400,
              }}
              aria-current={isActive(l.to) ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Drawer CTAs */}
        <div className="px-5 pt-2 pb-8 flex flex-col gap-3">
          <Link
            to="/audit"
            data-testid="mobile-nav-cta-button"
            className="inline-flex items-center justify-center text-sm font-semibold transition-colors duration-200 active:scale-[0.98]"
            style={{
              height: '48px',
              borderRadius: 'var(--ax-radius-control)',
              background: 'var(--ax-accent)',
              color: 'var(--ax-on-accent)',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--ax-accent-dim)'; }}
            onMouseOut={(e)  => { e.currentTarget.style.background = 'var(--ax-accent)'; }}
          >
            Start Free AI Audit
          </Link>
          <Link
            to="/contact"
            data-testid="mobile-nav-secondary-cta-button"
            className="inline-flex items-center justify-center text-sm font-semibold transition-colors duration-200"
            style={{
              height: '48px',
              borderRadius: 'var(--ax-radius-control)',
              background: 'var(--ax-surface-2)',
              color: 'var(--ax-text)',
              border: '1px solid var(--ax-border-strong)',
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.35)'; }}
            onMouseOut={(e)  => { e.currentTarget.style.borderColor = 'var(--ax-border-strong)'; }}
          >
            Book a Call
          </Link>
        </div>
      </div>
    </>
  );
};
