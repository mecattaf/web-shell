import React from 'react';
import '../styles/components.css';

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Surface variant */
  variant?: 'default' | 'high' | 'highest' | 'low';
  /** Child elements */
  children: React.ReactNode;
}

/**
 * Surface - Basic container with theme background
 *
 * A simple container with themed background color and text color.
 */
export function Surface({
  variant = 'default',
  children,
  className = '',
  ...props
}: SurfaceProps) {
  const classes = [
    'ws-surface',
    variant !== 'default' && `ws-surface--${variant}`,
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
