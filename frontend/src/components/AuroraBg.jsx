import React from 'react';

/**
 * AuroraBg — flowing cyan/blue gradient light beams behind hero.
 * Use as absolutely positioned background inside a relative parent with overflow-hidden.
 */
export const AuroraBg = () => {
  return (
    <div className="ax-aurora" aria-hidden="true" data-testid="aurora-background">
      <div className="ax-aurora-layer ax-aurora-1" />
      <div className="ax-aurora-layer ax-aurora-2" />
      <div className="ax-aurora-layer ax-aurora-3" />
      <div className="ax-aurora-noise" />
    </div>
  );
};
