import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Instagram, Youtube, Facebook } from 'lucide-react';
import { SOCIAL_LINKS, LOGO_URL } from '../lib/content';

export const Footer = () => {
  return (
    <footer className="bg-[#0A0A0F] border-t border-white/8 mt-12" data-testid="site-footer">
      <div className="ax-container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Axovion.io" className="h-10 w-10 rounded-md" />
              <div className="leading-none">
                <div className="text-white font-extrabold text-lg">Axovion<span className="text-[#00D4FF]">.io</span></div>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55 mt-1">Automate to Win</div>
              </div>
            </div>
            <p className="mt-5 text-sm text-[#C0C0C8]/70 max-w-xs leading-relaxed">
              ROI-focused AI automation agency. We build production-grade AI agents that handle support, leads, bookings, and repetitive workflows.
            </p>
          </div>

          <div>
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#C0C0C8]/55 mb-4">Site</div>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="text-[#C0C0C8]/80 hover:text-white transition-colors duration-200" data-testid="footer-link-home">Home</Link></li>
              <li><Link to="/services" className="text-[#C0C0C8]/80 hover:text-white transition-colors duration-200" data-testid="footer-link-services">Services</Link></li>
              <li><Link to="/audit" className="text-[#C0C0C8]/80 hover:text-white transition-colors duration-200" data-testid="footer-link-audit">AI Audit</Link></li>
              <li><Link to="/results" className="text-[#C0C0C8]/80 hover:text-white transition-colors duration-200" data-testid="footer-link-results">Results</Link></li>
              <li><Link to="/contact" className="text-[#C0C0C8]/80 hover:text-white transition-colors duration-200" data-testid="footer-link-contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#C0C0C8]/55 mb-4">Company</div>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="text-[#C0C0C8]/80 hover:text-white transition-colors duration-200" data-testid="footer-link-about">About</Link></li>
              <li><a href="mailto:hello@axovion.io" className="text-[#C0C0C8]/80 hover:text-white transition-colors duration-200">hello@axovion.io</a></li>
            </ul>
          </div>

          <div>
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#C0C0C8]/55 mb-4">Social</div>
            <div className="flex flex-wrap gap-3">
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-[12px] bg-[#12121A] border border-white/10 inline-flex items-center justify-center text-[#C0C0C8]/80 hover:text-white hover:border-[#00D4FF]/35 transition-colors duration-200" aria-label="LinkedIn" data-testid="footer-social-linkedin"><Linkedin className="h-4 w-4" /></a>
              <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-[12px] bg-[#12121A] border border-white/10 inline-flex items-center justify-center text-[#C0C0C8]/80 hover:text-white hover:border-[#00D4FF]/35 transition-colors duration-200" aria-label="X / Twitter" data-testid="footer-social-twitter"><Twitter className="h-4 w-4" /></a>
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-[12px] bg-[#12121A] border border-white/10 inline-flex items-center justify-center text-[#C0C0C8]/80 hover:text-white hover:border-[#00D4FF]/35 transition-colors duration-200" aria-label="Instagram" data-testid="footer-social-instagram"><Instagram className="h-4 w-4" /></a>
              <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-[12px] bg-[#12121A] border border-white/10 inline-flex items-center justify-center text-[#C0C0C8]/80 hover:text-white hover:border-[#00D4FF]/35 transition-colors duration-200" aria-label="YouTube" data-testid="footer-social-youtube"><Youtube className="h-4 w-4" /></a>
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-[12px] bg-[#12121A] border border-white/10 inline-flex items-center justify-center text-[#C0C0C8]/80 hover:text-white hover:border-[#00D4FF]/35 transition-colors duration-200" aria-label="Facebook" data-testid="footer-social-facebook"><Facebook className="h-4 w-4" /></a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-[#C0C0C8]/55">© {new Date().getFullYear()} Axovion.io. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-[#C0C0C8]/55">
            <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
