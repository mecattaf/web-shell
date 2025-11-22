import React from 'react';
import '../styles/components.css';

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Elevation level */
  elevation?: 'none' | 'low' | 'medium' | 'high';
  /** Child elements */
  children: React.ReactNode;
}

/**
 * Panel - Surface with elevation
 *
 * A container component with background, border radius, padding, and shadow elevation.
 */
export function Panel({
  elevation = 'medium',
  children,
  className = '',
  ...props
}: PanelProps) {
  const classes = [
    'ws-panel',
    `ws-panel--elevation-${elevation}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
