import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Search, ClipboardCheck } from 'lucide-react';

/**
 * Real 404 surface.
 *
 * Previously the catch-all route rendered <Home />, which returned a 200-equivalent
 * client render for every mistyped or retired URL. That let search engines index
 * unlimited duplicate copies of the homepage and gave visitors no signal that they
 * had landed somewhere that does not exist.
 *
 * The noindex tag is the part that actually protects the site's SEO, since a static
 * host cannot send a real 404 status for a client-routed path.
 */
export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page not found | Axovion.io</title>
        <meta name="description" content="This page does not exist. Head back to the homepage or run a free AI audit." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <section className="mx-auto w-full max-w-[1400px] px-5 py-24 md:px-8 md:py-32 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="ax-nums font-mono text-sm tracking-[0.12em] text-[color:var(--ax-muted-2)]">
              404
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-[color:var(--ax-heading)] md:text-6xl">
              We could not find that page.
            </h1>
            <p className="mt-6 max-w-[60ch] text-base leading-relaxed text-[color:var(--ax-text)] md:text-lg">
              The link may be out of date, or the address may have a typo in it. Everything
              below still works.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-[12px] bg-[color:var(--ax-accent)] px-5 text-sm font-semibold text-[color:var(--ax-on-accent)] transition-colors duration-200 hover:bg-[color:var(--ax-accent-dim)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ax-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ax-bg)] active:scale-[0.98]"
              >
                <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
                Back to homepage
              </Link>
              <Link
                to="/audit"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-[12px] border border-[color:var(--ax-border-strong)] px-5 text-sm font-medium text-[color:var(--ax-heading)] transition-colors duration-200 hover:border-[color:var(--ax-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ax-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ax-bg)] active:scale-[0.98]"
              >
                <ClipboardCheck size={16} strokeWidth={1.5} aria-hidden="true" />
                Run a free audit
              </Link>
            </div>
          </div>

          <nav aria-label="Popular pages" className="lg:col-span-4 lg:col-start-9">
            <h2 className="flex items-center gap-2 text-sm font-medium text-[color:var(--ax-muted)]">
              <Search size={15} strokeWidth={1.5} aria-hidden="true" />
              Looking for one of these?
            </h2>
            <ul className="mt-4 divide-y divide-[color:var(--ax-border)] border-t border-[color:var(--ax-border)]">
              {[
                { to: '/services', label: 'Services', hint: 'What we build and run' },
                { to: '/results', label: 'Results', hint: 'Outcomes from past engagements' },
                { to: '/about', label: 'About', hint: 'How the company works' },
                { to: '/blog', label: 'Blog', hint: 'Notes on applied AI' },
                { to: '/contact', label: 'Contact', hint: 'Start a conversation' },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="group flex min-h-[44px] items-baseline justify-between gap-4 py-3 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ax-accent)]"
                  >
                    <span className="text-base font-medium text-[color:var(--ax-heading)] group-hover:text-[color:var(--ax-accent)]">
                      {item.label}
                    </span>
                    <span className="text-right text-xs text-[color:var(--ax-muted-2)]">
                      {item.hint}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </>
  );
}
