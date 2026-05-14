import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { LOGO_URL } from '../lib/content';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './ui/sheet';
import { VisuallyHidden } from './VisuallyHidden';

const NAV_LINKS = [
  { to: '/services', label: 'Services' },
  { to: '/results', label: 'Results' },
  { to: '/about', label: 'About' },
  { to: '/team', label: 'Team' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <nav
      data-testid="site-navbar"
      className={`sticky top-0 z-50 bg-[#0A0A0F] border-b transition-colors duration-200 ${
        scrolled ? 'border-white/10 backdrop-blur-md' : 'border-transparent'
      }`}
    >
      <div className="ax-container h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group" data-testid="navbar-logo-link">
          <img src={LOGO_URL} alt="Axovion.io" className="h-9 w-9 rounded-md object-cover" />
          <span className="hidden sm:flex flex-col leading-none">
            <span className="text-white font-extrabold text-lg tracking-tight">
              Axovion<span className="text-[#00D4FF]">.io</span>
            </span>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55 mt-0.5">Automate to Win</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`navbar-link-${l.label.toLowerCase()}`}
              className={`text-sm transition-colors duration-200 ${
                location.pathname === l.to ? 'text-white' : 'text-[#C0C0C8]/80 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/audit"
            data-testid="navbar-primary-cta-button"
            className="inline-flex items-center justify-center rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-4 py-2 text-sm font-bold transition-colors duration-200 hover:bg-[#FBBF24] ax-cta-pulse"
          >
            Start Free AI Audit
          </Link>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-md text-white hover:bg-[#161622] ax-focus-ring"
              aria-label="Open navigation"
              data-testid="mobile-nav-open-button"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-[#12121A] border-l border-white/10 text-white w-[88vw] max-w-[360px]">
            <VisuallyHidden>
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>Axovion site navigation</SheetDescription>
            </VisuallyHidden>
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img src={LOGO_URL} alt="" className="h-8 w-8 rounded-md" />
                <span className="text-white font-extrabold">Axovion<span className="text-[#00D4FF]">.io</span></span>
              </div>
              <button
                className="h-9 w-9 inline-flex items-center justify-center rounded-md text-white hover:bg-[#161622]"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                data-testid="mobile-nav-close-button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col py-2">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  data-testid={`mobile-nav-link-${l.label.toLowerCase()}`}
                  className="py-3 text-base text-white border-b border-white/5 last:border-0"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/audit"
                data-testid="mobile-nav-cta-button"
                className="mt-4 inline-flex items-center justify-center rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-4 py-3 text-sm font-bold"
              >
                Start Free AI Audit
              </Link>
              <Link
                to="/contact"
                data-testid="mobile-nav-secondary-cta-button"
                className="mt-3 inline-flex items-center justify-center rounded-[12px] bg-[#12121A] text-white px-4 py-3 text-sm font-semibold border border-white/15"
              >
                Book a Call
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};
