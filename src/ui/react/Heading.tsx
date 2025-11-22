import React from 'react';
import '../styles/components.css';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading level */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Child elements */
  children: React.ReactNode;
}

/**
 * Heading - Semantic headings
 *
 * A typography component for semantic heading elements with appropriate sizing.
 */
export function Heading({
  level = 2,
  children,
  className = '',
  ...props
}: HeadingProps) {
  const Component = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const classes = ['ws-heading', `ws-heading--h${level}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
