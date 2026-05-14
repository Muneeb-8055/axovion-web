import React, { useEffect, useRef, useState } from 'react';

/**
 * SplitText — splits text into word spans and reveals them with stagger.
 * Pure CSS-driven (no GSAP needed); uses ax-word + ax-word-ready classes.
 */
export const SplitText = ({ text, className = '', as: As = 'h1', staggerMs = 60, baseDelayMs = 100, dataTestId }) => {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setReady(true);
      return;
    }
    const t = setTimeout(() => setReady(true), 30);
    return () => clearTimeout(t);
  }, []);

  const lines = text.split('\n');

  let globalIdx = 0;
  return (
    <As ref={ref} className={className} data-testid={dataTestId}>
      {lines.map((line, li) => (
        <span key={li} className="block">
          {line.split(' ').map((w, wi) => {
            const idx = globalIdx++;
            const delay = baseDelayMs + idx * staggerMs;
            return (
              <span
                key={`${li}-${wi}`}
                className={`ax-word ${ready ? 'ax-word-ready' : ''}`}
                style={{ transitionDelay: ready ? `${delay}ms` : '0ms' }}
              >
                {w}
                {wi < line.split(' ').length - 1 && '\u00A0'}
              </span>
            );
          })}
        </span>
      ))}
    </As>
  );
};
