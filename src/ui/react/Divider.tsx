import React from 'react';
import '../styles/components.css';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  /** Orientation of the divider */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Divider - Separator line
 *
 * A visual separator for dividing content horizontally or vertically.
 */
export function Divider({
  orientation = 'horizontal',
  className = '',
  ...props
}: DividerProps) {
  const classes = [
    'ws-divider',
    orientation === 'vertical' && 'ws-divider--vertical',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <hr className={classes} {...props} />;
}
