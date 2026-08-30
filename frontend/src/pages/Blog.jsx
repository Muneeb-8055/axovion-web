import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Search, Clock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { BLOG_POSTS } from '../lib/content';
import { publicApi } from '../lib/api';
import { useScrollReveal } from '../lib/hooks';

/* ── Layout strategy:
   Filter bar + search flush left. Featured post: full-width editorial banner
   (image spans one column, headline huge, no card). Secondary posts: a
   deliberately non-uniform list with date, category, and a horizontal rule
   between each item, so it reads like a table of contents rather than a tile
   grid. Newsletter panel: 2-col split at the bottom. Four layout families
   across the page.
   Eyebrow budget: ceil(4 / 3) = 2 allowed. Using 1 (Newsletter panel).
── */

const CATEGORIES = ['All', 'Strategy', 'Case Studies', 'Tools', 'Trends'];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const Reveal = ({ children, delay = 0 }) => {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="ax-reveal" style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const Blog = () => {
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const filtered = BLOG_POSTS.filter((p) => {
    if (cat !== 'All' && p.category !== cat) return false;
    if (
      q &&
      !(p.title + ' ' + p.excerpt).toLowerCase().includes(q.toLowerCase())
    )
      return false;
    return true;
  });

  const featured = filtered[0] ?? null;
  const rest = filtered.slice(1);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Enter your email.');
      return;
    }
    setSubscribing(true);
    try {
      await publicApi.newsletterSignup({ email, source: 'blog' });
      toast.success('Subscribed. Check your inbox.');
      setEmail('');
    } catch {
      toast.error('Subscription failed. Try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Blog &amp; Resources | Axovion.io</title>
        <meta
          name="description"
          content="Practical AI automation guides, case studies, and strategies for business owners."
        />
      </Helmet>

      {/* ── Section 1: Page header (left-aligned, no eyebrow) ── */}
      <section
        className="ax-section"
        style={{ background: 'var(--ax-bg)', paddingBottom: '2rem' }}
        data-testid="blog-page"
      >
        <div className="ax-container">
          <h1
            className="text-white font-extrabold tracking-[-0.03em] leading-[1.05]"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)', maxWidth: '28ch', textWrap: 'balance' }}
          >
            AI automation insights
          </h1>
          <p
            className="mt-5 text-lg leading-relaxed"
            style={{ color: 'var(--ax-text)', maxWidth: '52ch' }}
          >
            Practical guides, case studies, and strategies for business owners.
          </p>
        </div>
      </section>

      {/* ── Section 2: Filter bar + search ── */}
      <section
        className="pb-10"
        style={{ background: 'var(--ax-bg)' }}
      >
        <div className="ax-container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Category pills */}
            <div className="flex flex-wrap gap-2" role="list" aria-label="Filter by category">
              {CATEGORIES.map((c) => {
                const active = cat === c;
                return (
                  <button
                    key={c}
                    role="listitem"
                    onClick={() => setCat(c)}
                    data-testid={`blog-filter-${c.toLowerCase().replace(/\s+/g, '-')}`}
                    style={{
                      padding: '0.4rem 1rem',
                      minHeight: '44px',
                      borderRadius: 'var(--ax-radius-pill)',
                      border: active
                        ? '1px solid rgba(0,212,255,0.4)'
                        : '1px solid var(--ax-border)',
                      background: active
                        ? 'rgba(0,212,255,0.1)'
                        : 'var(--ax-surface)',
                      color: active ? 'var(--ax-accent)' : 'var(--ax-text)',
                      fontSize: '0.875rem',
                      fontWeight: active ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'border-color 200ms, color 200ms, background 200ms',
                    }}
                    aria-pressed={active}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="flex-shrink-0 w-full md:w-72">
              <label
                htmlFor="blog-search-input"
                className="flex items-center gap-1.5 mb-1.5 text-sm font-medium"
                style={{ color: 'var(--ax-muted)' }}
              >
                <Search
                  strokeWidth={1.5}
                  className="h-4 w-4"
                  style={{ color: 'var(--ax-accent)' }}
                  aria-hidden="true"
                />
                Search articles
              </label>
              <input
                id="blog-search-input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Type to filter..."
                aria-label="Search articles"
                data-testid="blog-search"
                style={{
                  width: '100%',
                  background: 'var(--ax-surface)',
                  border: '1px solid var(--ax-border)',
                  borderRadius: 'var(--ax-radius-control)',
                  paddingLeft: '0.75rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.6rem',
                  paddingBottom: '0.6rem',
                  fontSize: '0.875rem',
                  color: 'var(--ax-heading)',
                  outline: 'none',
                  minHeight: '44px',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.45)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ax-border)';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Featured post (full-width editorial banner) ── */}
      {featured && (
        <section
          className="pb-0"
          style={{ background: 'var(--ax-bg)' }}
        >
          <div className="ax-container">
            <Reveal>
              <article
                className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden"
                style={{
                  borderRadius: 'var(--ax-radius-panel)',
                  border: '1px solid var(--ax-border)',
                  background: 'var(--ax-surface)',
                }}
                data-testid="blog-featured-post"
              >
                {/* Image */}
                <div
                  className="lg:col-span-5 relative"
                  style={{ minHeight: '280px', background: 'var(--ax-bg)' }}
                >
                  <img
                    src={featured.image}
                    alt={featured.title}
                    loading="lazy"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>

                {/* Text */}
                <div
                  className="lg:col-span-7 flex flex-col justify-center p-7 md:p-10"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontFamily: 'JetBrains Mono, monospace',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--ax-accent)',
                        background: 'rgba(0,212,255,0.08)',
                        border: '1px solid rgba(0,212,255,0.25)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--ax-radius-pill)',
                      }}
                    >
                      {featured.category}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--ax-muted-2)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Featured
                    </span>
                  </div>

                  <h2
                    className="text-white font-extrabold tracking-tight leading-snug"
                    style={{ fontSize: 'clamp(1.25rem, 2.5vw, 2rem)' }}
                  >
                    {featured.title}
                  </h2>

                  <p
                    className="mt-3 text-base leading-relaxed"
                    style={{ color: 'var(--ax-muted)', maxWidth: '55ch' }}
                  >
                    {featured.excerpt}
                  </p>

                  <div
                    className="mt-6 flex items-center gap-4 text-sm"
                    style={{ color: 'var(--ax-muted-2)' }}
                  >
                    <time dateTime={featured.date}>{formatDate(featured.date)}</time>
                    <span className="inline-flex items-center gap-1">
                      <Clock strokeWidth={1.5} className="h-3.5 w-3.5" aria-hidden="true" />
                      {featured.readTime}
                    </span>
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Section 4: Rest of posts as editorial list ── */}
      {rest.length > 0 && (
        <section
          className="pt-10 pb-20 md:pb-[120px]"
          style={{ background: 'var(--ax-bg)' }}
        >
          <div className="ax-container">
            <div
              style={{ borderTop: '1px solid var(--ax-border)' }}
            >
              {rest.map((p, i) => (
                <Reveal key={p.slug} delay={i * 60}>
                  <article
                    className="grid grid-cols-1 sm:grid-cols-12 gap-4 py-7"
                    style={{ borderBottom: '1px solid var(--ax-border)' }}
                    data-testid={`blog-post-${p.slug}`}
                  >
                    {/* Thumbnail: compact, not dominant */}
                    <div
                      className="sm:col-span-3 relative overflow-hidden"
                      style={{
                        borderRadius: 'var(--ax-radius-control)',
                        background: 'var(--ax-surface)',
                        aspectRatio: '16/9',
                      }}
                    >
                      <img
                        src={p.image}
                        alt={p.title}
                        loading="lazy"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>

                    {/* Text block */}
                    <div className="sm:col-span-7 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontFamily: 'JetBrains Mono, monospace',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'var(--ax-accent)',
                            background: 'rgba(0,212,255,0.08)',
                            border: '1px solid rgba(0,212,255,0.25)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--ax-radius-pill)',
                          }}
                        >
                          {p.category}
                        </span>
                      </div>
                      <h3
                        className="text-white font-semibold leading-snug"
                        style={{ fontSize: 'clamp(1rem, 1.8vw, 1.2rem)' }}
                      >
                        {p.title}
                      </h3>
                      <p
                        className="mt-2 text-sm leading-relaxed"
                        style={{ color: 'var(--ax-muted)', maxWidth: '60ch' }}
                      >
                        {p.excerpt}
                      </p>
                    </div>

                    {/* Meta: date + read time, right-aligned on desktop */}
                    <div
                      className="sm:col-span-2 flex sm:flex-col sm:items-end sm:justify-center gap-2 text-xs"
                      style={{ color: 'var(--ax-muted-2)' }}
                    >
                      <time dateTime={p.date}>{formatDate(p.date)}</time>
                      <span className="inline-flex items-center gap-1">
                        <Clock strokeWidth={1.5} className="h-3 w-3" aria-hidden="true" />
                        {p.readTime}
                      </span>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <section className="pb-20" style={{ background: 'var(--ax-bg)' }}>
          <div className="ax-container">
            <p
              className="py-16 text-base"
              style={{ color: 'var(--ax-muted)' }}
            >
              No articles match your filter. Try a different category or clear your search.
            </p>
          </div>
        </section>
      )}

      {/* ── Section 5: Newsletter (2-col split) ── */}
      <section
        className="pb-20 md:pb-[120px]"
        style={{ background: 'var(--ax-bg)' }}
      >
        <div className="ax-container">
          <Reveal>
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center p-7 md:p-10"
              style={{
                borderRadius: 'var(--ax-radius-panel)',
                background: 'var(--ax-surface)',
                border: '1px solid var(--ax-border)',
              }}
              data-testid="blog-newsletter-section"
            >
              <div>
                <div
                  className="flex items-center gap-2 mb-3"
                >
                  <Mail
                    strokeWidth={1.5}
                    className="h-4 w-4"
                    style={{ color: 'var(--ax-accent)' }}
                    aria-hidden="true"
                  />
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.68rem',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'var(--ax-accent)',
                    }}
                  >
                    Weekly digest
                  </span>
                </div>
                <h2
                  className="text-white font-extrabold tracking-tight"
                  style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}
                >
                  One automation a week
                </h2>
                <p
                  className="mt-3 text-base leading-relaxed"
                  style={{ color: 'var(--ax-muted)', maxWidth: '44ch' }}
                >
                  A real automation we shipped, how it was built, and the ROI numbers.
                  No filler, no announcements.
                </p>
              </div>

              <form
                onSubmit={subscribe}
                className="flex flex-col sm:flex-row gap-3"
                noValidate
              >
                <label className="flex-1 flex flex-col gap-1">
                  <span className="sr-only">Your email address</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    aria-label="Email address"
                    data-testid="blog-newsletter-email"
                    style={{
                      background: 'var(--ax-bg)',
                      border: '1px solid var(--ax-border)',
                      borderRadius: 'var(--ax-radius-control)',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: 'var(--ax-heading)',
                      outline: 'none',
                      minHeight: '44px',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0,212,255,0.45)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--ax-border)';
                    }}
                  />
                </label>
                <button
                  type="submit"
                  disabled={subscribing}
                  data-testid="blog-newsletter-submit"
                  className="inline-flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-200 active:scale-[0.98]"
                  style={{
                    padding: '0.75rem 1.5rem',
                    minHeight: '44px',
                    borderRadius: 'var(--ax-radius-control)',
                    background: 'var(--ax-accent)',
                    color: 'var(--ax-on-accent)',
                    cursor: subscribing ? 'not-allowed' : 'pointer',
                    opacity: subscribing ? 0.6 : 1,
                    whiteSpace: 'nowrap',
                  }}
                  onMouseOver={(e) => {
                    if (!subscribing)
                      e.currentTarget.style.background = 'var(--ax-accent-dim)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = subscribing
                      ? 'var(--ax-accent)'
                      : 'var(--ax-accent)';
                  }}
                >
                  {subscribing ? 'Subscribing...' : 'Subscribe'}
                  {!subscribing && (
                    <ArrowRight strokeWidth={1.5} className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};

export default Blog;
