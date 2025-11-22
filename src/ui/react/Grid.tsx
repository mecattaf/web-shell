import React from 'react';
import '../styles/components.css';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns */
  columns?: 2 | 3 | 4;
  /** Gap between items */
  gap?: 'xs' | 's' | 'm' | 'l';
  /** Child elements */
  children: React.ReactNode;
}

/**
 * Grid - CSS Grid wrapper
 *
 * A layout component for creating grid-based layouts with responsive columns.
 */
export function Grid({
  columns,
  gap = 'm',
  children,
  className = '',
  ...props
}: GridProps) {
  const classes = [
    'ws-grid',
    columns && `ws-grid--cols-${columns}`,
    `ws-grid--gap-${gap}`,
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
