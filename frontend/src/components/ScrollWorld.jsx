import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import scrubEngine from '../vendor/scroll-world/scrub-engine';
import { worldUrl, isCdnConfigured } from '../lib/assetUrl';
import './ScrollWorld.css';

/* The vendored engine is a CommonJS script (it also self-registers on window).
   Default-import interop hands us its module.exports object. */
const mountScrollWorld = (scrubEngine && scrubEngine.mountScrollWorld) || null;

/**
 * Decide whether the scroll cinematic is allowed to run.
 *
 * Returning false here means not one video byte is requested: the static
 * sequence is rendered instead. Three signals veto the cinematic, plus any
 * environment where we cannot ask the question at all.
 */
export function canPlayCinematic() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (typeof window.matchMedia !== 'function') return false;
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;

    const conn =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      if (conn.saveData === true) return false;
      if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

/* ---------------------------------------------------------------------------
   Error boundary. A video failure must never blank the homepage, so a thrown
   render or effect swaps in the same content as flat images.
   --------------------------------------------------------------------------- */
class CinematicBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[ScrollWorld] cinematic failed, showing the static sequence.', error);
    }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* ---------------------------------------------------------------------------
   Live cinematic
   --------------------------------------------------------------------------- */
const Cinematic = ({ config, onFail }) => {
  const hostRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    if (typeof mountScrollWorld !== 'function') {
      onFail();
      return undefined;
    }

    let destroy = null;
    try {
      destroy = mountScrollWorld(host, config);
    } catch (err) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[ScrollWorld] mount threw, showing the static sequence.', err);
      }
      onFail();
      return undefined;
    }

    /* The engine's sky, stage, copy and rail layers are position:fixed for the
       whole mount. Once the cinematic band is off screen they have to stop
       covering the sections underneath. */
    host.dataset.inview = 'true';
    let observer = null;
    if (typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) host.dataset.inview = entry.isIntersecting ? 'true' : 'false';
        },
        { threshold: 0 }
      );
      observer.observe(host);
    }

    return () => {
      if (observer) observer.disconnect();
      if (typeof destroy === 'function') destroy();
    };
  }, [config, onFail]);

  /* The engine writes plain anchors for its CTAs. Keep internal hrefs inside
     the SPA so a click does not reload the whole app. Bound imperatively on the
     host, which is the element that actually owns the engine's DOM. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target.closest && event.target.closest('a[href]');
      if (!anchor || anchor.target === '_blank') return;
      const href = anchor.getAttribute('href');
      if (!href || href.charAt(0) !== '/' || href.charAt(1) === '/') return;
      event.preventDefault();
      navigate(href);
    };

    host.addEventListener('click', onClick);
    return () => host.removeEventListener('click', onClick);
  }, [navigate]);

  return <div ref={hostRef} className="ax-sw-host" data-testid="scroll-world-cinematic" />;
};

/* ---------------------------------------------------------------------------
   Static sequence
   The designed no-video state. Same five beats, same order, same words, same
   CTAs, laid out as a reading sequence rather than a flight.
   --------------------------------------------------------------------------- */
const StaticSequence = ({ scenes }) => (
  <div className="ax-container pt-12 pb-4 md:pt-16 md:pb-8" data-testid="scroll-world-static">
    <ol className="list-none m-0 p-0">
      {scenes.map((scene, index) => (
        <li
          key={scene.id}
          className={[
            'grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center',
            'py-12 md:py-16',
            index > 0 ? 'border-t border-[color:var(--ax-border)]' : '',
          ].join(' ')}
        >
          <div className="lg:col-span-5">
            <span
              className="block font-mono text-[11px] uppercase tracking-[0.18em]"
              style={{ color: 'var(--ax-accent)' }}
            >
              {scene.eyebrow}
            </span>
            <h2 className="mt-4 text-[30px] md:text-[42px] font-semibold leading-[1.05] tracking-[-0.03em]">
              {scene.title}
            </h2>
            <p
              className="mt-4 text-base md:text-lg leading-relaxed max-w-[46ch]"
              style={{ color: 'var(--ax-text)' }}
            >
              {scene.body}
            </p>

            {scene.cta ? (
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to={scene.cta.primary.href}
                  data-testid="hero-primary-cta-button"
                  className="inline-flex items-center justify-center rounded-[12px] px-6 text-sm font-semibold transition-colors duration-200 active:scale-[0.98]"
                  style={{
                    minHeight: 48,
                    background: 'var(--ax-accent)',
                    color: 'var(--ax-on-accent)',
                  }}
                >
                  {scene.cta.primary.label}
                </Link>
                <Link
                  to={scene.cta.secondary.href}
                  data-testid="hero-secondary-cta-button"
                  className="inline-flex items-center justify-center rounded-[12px] px-6 text-sm font-semibold transition-colors duration-200"
                  style={{
                    minHeight: 48,
                    background: 'var(--ax-surface)',
                    color: 'var(--ax-heading)',
                    border: '1px solid var(--ax-border-strong)',
                  }}
                >
                  {scene.cta.secondary.label}
                </Link>
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-7">
            <figure className="ax-sw-still m-0">
              <img src={worldUrl(scene.still)} alt={scene.alt} width="1920" height="1080" loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
            </figure>
          </div>
        </li>
      ))}
    </ol>
  </div>
);

/* ---------------------------------------------------------------------------
   Public component
   --------------------------------------------------------------------------- */
export const ScrollWorld = ({
  scenes,
  connectors = [],
  connectorsMobile = [],
  diveScroll = 1.25,
  connScroll = 0.8,
}) => {
  /* Resolved before the first paint, so there is never a frame of cinematic
     for someone who asked for no motion or no data. */
  const [live, setLive] = useState(() => canPlayCinematic());
  const onFail = useCallback(() => setLive(false), []);

  const config = useMemo(
    () => ({
      brand: null,
      nav: false,
      atmosphere: false,
      diveScroll,
      connScroll,
      crossfade: 0.12,
      // Use 'src' when assets are on a remote CDN so the engine assigns the URL
      // directly to video.src, bypassing fetch and avoiding CORS preflight.
      // Same-origin assets keep the proven 'blob' path (fetch -> object URL).
      loadMode: isCdnConfigured ? 'src' : 'blob',
      sections: scenes.map((scene) => ({
        id: scene.id,
        label: scene.label,
        still: worldUrl(scene.still),
        clip: worldUrl(scene.clip),
        clipMobile: worldUrl(scene.clipMobile),
        scroll: scene.scroll,
        linger: scene.linger,
        eyebrow: scene.eyebrow,
        title: scene.title,
        body: scene.body,
        cta: scene.cta,
      })),
      // Connectors may be null (crossfade directly between two dives).
      // The null is meaningful: do not rewrite it to a string.
      connectors: connectors.map((c) => (c == null ? c : worldUrl(c))),
      connectorsMobile: connectorsMobile.map((c) => (c == null ? c : worldUrl(c))),
    }),
    [scenes, connectors, connectorsMobile, diveScroll, connScroll]
  );

  const fallback = <StaticSequence scenes={scenes} />;

  if (!live) return fallback;

  return (
    <CinematicBoundary fallback={fallback}>
      <Cinematic config={config} onFail={onFail} />
    </CinematicBoundary>
  );
};

export default ScrollWorld;
