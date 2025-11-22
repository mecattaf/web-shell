import React from 'react';
import '../styles/components.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Make the card interactive (adds hover effects) */
  interactive?: boolean;
  /** Child elements */
  children: React.ReactNode;
}

/**
 * Card - Content container
 *
 * A container component for grouping related content with optional interactivity.
 */
export function Card({
  interactive = false,
  children,
  className = '',
  ...props
}: CardProps) {
  const classes = [
    'ws-card',
    interactive && 'ws-card--interactive',
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
