import React from 'react';

export const VisuallyHidden = ({ children }) => (
  <span style={{
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    border: 0,
  }}>
    {children}
  </span>
);
