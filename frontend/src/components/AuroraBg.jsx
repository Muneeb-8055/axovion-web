import React from 'react';

/**
 * AuroraBg -- subtle static background texture for hero sections.
 *
 * Replaces the animated purple/blue gradient blob that DESIGN.md bans.
 * No animation, no purple, no mesh-gradient. Just:
 *   1. A fine orthogonal grid at 3% opacity, masked with a radial vignette.
 *   2. An SVG fractal-noise layer at 2.5% opacity, blend-mode overlay.
 *   3. A very faint cyan vignette at the top edge (the only accent usage here).
 *
 * Exported API is identical to the old component so existing imports keep working.
 * Props are accepted but ignored (the original component took none; any future
 * callers that forward className or style will not break).
 */
export const AuroraBg = (props) => (
  <div
    className="ax-aurora"
    aria-hidden="true"
    data-testid="aurora-background"
  >
    <div className="ax-aurora-grid" />
    <div className="ax-aurora-noise" />
    <div className="ax-aurora-vignette" />
  </div>
);
