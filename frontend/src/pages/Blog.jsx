import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Mail, Search, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { BLOG_POSTS } from '../lib/content';
import { publicApi } from '../lib/api';
import { useScrollReveal } from '../lib/hooks';

const CATEGORIES = ['All', 'Strategy', 'Case Studies', 'Tools', 'Trends'];

const Reveal = ({ children, delay = 0 }) => {
  const ref = useScrollReveal();
  return <div ref={ref} className="ax-reveal" style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

const Blog = () => {
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const filtered = BLOG_POSTS.filter((p) => {
    if (cat !== 'All' && p.category !== cat) return false;
    if (q && !(p.title + ' ' + p.excerpt).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Enter your email.'); return; }
    setSubscribing(true);
    try {
      await publicApi.newsletterSignup({ email, source: 'blog' });
      toast.success('Subscribed! Check your inbox.');
      setEmail('');
    } catch (e) {
      toast.error('Subscription failed. Try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Blog &amp; Resources | Axovion.io</title>
        <meta name="description" content="Practical AI automation guides, case studies, and strategies for business owners." />
      </Helmet>

      <section className="relative ax-section bg-[#0A0A0F]" data-testid="blog-page">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -inset-24 bg-[radial-gradient(700px_circle_at_30%_20%,rgba(0,212,255,0.10),transparent_60%)]" />
        </div>
        <div className="relative ax-container">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-4">Blog</div>
          <h1 className="text-white text-[40px] md:text-[64px] leading-[1.05] tracking-[-0.03em] font-extrabold max-w-3xl">AI automation insights</h1>
          <p className="mt-5 text-[#C0C0C8]/80 text-lg max-w-2xl">Practical guides, case studies, and strategies for business owners.</p>
        </div>
      </section>

      <section className="pb-20 md:pb-[120px] bg-[#0A0A0F]">
        <div className="ax-container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  data-testid={`blog-filter-${c.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`text-sm px-3.5 py-2 rounded-full border transition-colors duration-200 ${
                    cat === c
                      ? 'bg-[#00D4FF]/12 border-[#00D4FF]/40 text-[#00D4FF]'
                      : 'bg-[#12121A] border-white/10 text-[#C0C0C8] hover:text-white hover:border-[#00D4FF]/25'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="relative md:w-72">
              <Search className="h-4 w-4 text-[#C0C0C8]/55 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search articles…"
                data-testid="blog-search"
                className="w-full bg-[#12121A] border border-white/10 rounded-[12px] pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-[#C0C0C8]/40 focus:outline-none focus:border-[#00D4FF]/45"
              />
            </div>
          </div>

          {featured && (
            <Reveal>
              <article className="rounded-[16px] bg-[#12121A] border border-white/10 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 hover:border-[#00D4FF]/30 transition-colors duration-300" data-testid="blog-featured-post">
                <div className="lg:col-span-6 aspect-[16/10] bg-[#0A0A0F] overflow-hidden">
                  <img src={featured.image} alt={featured.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="lg:col-span-6 p-7 md:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#00D4FF] bg-[#00D4FF]/10 border border-[#00D4FF]/25 px-2.5 py-1 rounded-full">{featured.category}</span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C0C0C8]/55">Featured</span>
                  </div>
                  <h2 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">{featured.title}</h2>
                  <p className="mt-3 text-[#C0C0C8]/75 leading-relaxed">{featured.excerpt}</p>
                  <div className="mt-6 flex items-center gap-4 text-xs text-[#C0C0C8]/60">
                    <span>{new Date(featured.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {featured.readTime}</span>
                  </div>
                </div>
              </article>
            </Reveal>
          )}

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((p, i) => (
              <Reveal key={p.slug} delay={i * 60}>
                <article className="h-full rounded-[16px] bg-[#12121A] border border-white/10 overflow-hidden transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-[#00D4FF]/30" data-testid={`blog-post-${p.slug}`}>
                  <div className="aspect-[16/10] bg-[#0A0A0F] overflow-hidden">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-6">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#00D4FF] bg-[#00D4FF]/10 border border-[#00D4FF]/25 px-2.5 py-1 rounded-full">{p.category}</span>
                    <h3 className="mt-4 text-white text-lg font-bold leading-snug">{p.title}</h3>
                    <p className="mt-2 text-[#C0C0C8]/70 text-sm leading-relaxed">{p.excerpt}</p>
                    <div className="mt-5 pt-4 border-t border-white/8 flex items-center justify-between text-xs text-[#C0C0C8]/60">
                      <span>{new Date(p.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {p.readTime}</span>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#C0C0C8]/60">No articles match your filter.</p>
            </div>
          )}

          <Reveal>
            <div className="mt-16 rounded-[16px] bg-[#12121A] border border-white/10 p-7 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center" data-testid="blog-newsletter-section">
              <div>
                <div className="inline-flex items-center gap-2 mb-3">
                  <Mail className="h-4 w-4 text-[#00D4FF]" />
                  <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#00D4FF]">Weekly</div>
                </div>
                <h3 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Get AI automation tips weekly</h3>
                <p className="mt-3 text-[#C0C0C8]/75">One short note a week: a real automation we shipped, how it was built, and the ROI numbers. No fluff.</p>
              </div>
              <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  aria-label="Email"
                  data-testid="blog-newsletter-email"
                  className="flex-1 bg-[#0A0A0F] border border-white/10 rounded-[12px] px-4 py-3 text-sm text-white placeholder:text-[#C0C0C8]/40 focus:outline-none focus:border-[#00D4FF]/45"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  data-testid="blog-newsletter-submit"
                  className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-6 py-3 text-sm font-bold transition-colors duration-200 hover:bg-[#FBBF24] disabled:opacity-60"
                >
                  Subscribe <ArrowRight className="h-4 w-4" />
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
