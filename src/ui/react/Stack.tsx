import React from 'react';
import '../styles/components.css';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Direction of the stack */
  direction?: 'vertical' | 'horizontal';
  /** Gap between items */
  gap?: 'xs' | 's' | 'm' | 'l' | 'xl';
  /** Alignment of items */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Justification of items */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  /** Child elements */
  children: React.ReactNode;
}

/**
 * Stack - Flex container with gap control
 *
 * A layout component for arranging items vertically or horizontally with consistent spacing.
 */
export function Stack({
  direction = 'vertical',
  gap = 'm',
  align,
  justify,
  children,
  className = '',
  ...props
}: StackProps) {
  const classes = [
    'ws-stack',
    direction === 'horizontal' && 'ws-stack--horizontal',
    `ws-stack--gap-${gap}`,
    align && `ws-stack--align-${align}`,
    justify && `ws-stack--justify-${justify}`,
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
