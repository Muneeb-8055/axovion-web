import React, { useEffect, useRef, useState } from 'react';

/**
 * SplitText -- splits text into word spans and reveals them with stagger.
 *
 * Animation is triggered by IntersectionObserver (not window scroll events),
 * which satisfies the hard ban on window.addEventListener('scroll', ...).
 * The visible class is toggled once when the element first enters the viewport.
 *
 * Under prefers-reduced-motion the words are immediately visible with no
 * transition, matching the global reduced-motion CSS block.
 *
 * Exported API is unchanged:
 *   text         -- string, required. Newlines split into block spans.
 *   className    -- forwarded to the wrapper element.
 *   as           -- element type for the wrapper (default 'h1').
 *   staggerMs    -- per-word delay in ms (default 60).
 *   baseDelayMs  -- initial delay before the first word (default 100).
 *   dataTestId   -- forwarded as data-testid.
 */
export const SplitText = ({
  text,
  className = '',
  as: As = 'h1',
  staggerMs = 60,
  baseDelayMs = 100,
  dataTestId,
}) => {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    /* Honour prefers-reduced-motion: show immediately, no IntersectionObserver needed */
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setVisible(true);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect(); /* fire once */
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const lines = text.split('\n');
  let globalIdx = 0;

  return (
    <As ref={containerRef} className={className} data-testid={dataTestId}>
      {lines.map((line, li) => (
        <span key={li} className="block">
          {line.split(' ').map((word, wi) => {
            const idx = globalIdx++;
            const delay = baseDelayMs + idx * staggerMs;
            return (
              <span
                key={`${li}-${wi}`}
                className={`ax-word${visible ? ' ax-word-ready' : ''}`}
                style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
              >
                {word}
                {wi < line.split(' ').length - 1 && ' '}
              </span>
            );
          })}
        </span>
      ))}
    </As>
  );
};
