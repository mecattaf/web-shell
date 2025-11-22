import React from 'react';
import '../styles/components.css';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /** Text size variant */
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  /** Font weight */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Text variant */
  variant?: 'default' | 'secondary';
  /** Use monospace font */
  monospace?: boolean;
  /** HTML element to render as */
  as?: 'p' | 'span' | 'div';
  /** Child elements */
  children: React.ReactNode;
}

/**
 * Text - Styled text with size variants
 *
 * A typography component for body text with size and weight variants.
 */
export function Text({
  size = 'm',
  weight = 'normal',
  variant = 'default',
  monospace = false,
  as: Component = 'p',
  children,
  className = '',
  ...props
}: TextProps) {
  const classes = [
    'ws-text',
    `ws-text--size-${size}`,
    `ws-text--weight-${weight}`,
    variant === 'secondary' && 'ws-text--secondary',
    monospace && 'ws-text--monospace',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
