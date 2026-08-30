import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Chatbot } from './Chatbot';

/**
 * PublicLayout wraps every public-facing page.
 *
 * Accessibility anchors:
 *   - Skip-to-content link is the first focusable element in the DOM.
 *   - <main id="main"> is the primary landmark; the skip link targets it.
 *
 * Scroll restoration:
 *   - Scrolls to the top on every route change so users start fresh on
 *     each page without relying on browser default behaviour, which can
 *     restore the previous position when navigating via the back button.
 */
export const PublicLayout = ({ children }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div
      className="flex flex-col"
      style={{ minHeight: '100dvh', background: 'var(--ax-bg)' }}
    >
      {/*
        Skip-to-content: visually hidden until focused via keyboard.
        Positioned first in DOM so it is the first Tab stop.
      */}
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100]"
        style={{
          padding: '0.5rem 1rem',
          borderRadius: 'var(--ax-radius-control)',
          background: 'var(--ax-accent)',
          color: 'var(--ax-on-accent)',
          fontWeight: 600,
          fontSize: '0.875rem',
          textDecoration: 'none',
          outline: 'none',
        }}
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main" className="flex-1" tabIndex={-1}>
        {children}
      </main>

      <Footer />
      <Chatbot />
    </div>
  );
};
