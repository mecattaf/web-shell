import React from 'react';
import '../styles/components.css';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Child elements */
  children: React.ReactNode;
}

/**
 * Button - Primary/secondary/ghost variants
 *
 * An interactive button component with multiple visual variants and built-in accessibility.
 */
export function Button({
  variant = 'primary',
  size = 'medium',
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = [
    'ws-button',
    `ws-button--${variant}`,
    size !== 'medium' && `ws-button--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
