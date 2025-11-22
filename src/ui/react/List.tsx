import React from 'react';
import '../styles/components.css';

export interface ListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  /** Make the list item interactive (adds hover effects) */
  interactive?: boolean;
  /** Child elements */
  children: React.ReactNode;
}

/**
 * ListItem - Individual list item
 *
 * A single item in a list with optional interactivity.
 */
export function ListItem({
  interactive = false,
  children,
  className = '',
  ...props
}: ListItemProps) {
  const classes = [
    'ws-list-item',
    interactive && 'ws-list-item--interactive',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li className={classes} {...props}>
      {children}
    </li>
  );
}

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  /** Child elements */
  children: React.ReactNode;
}

/**
 * List - Vertical list with items
 *
 * A container for list items with consistent styling.
 */
export function List({
  children,
  className = '',
  ...props
}: ListProps) {
  const classes = ['ws-list', className].filter(Boolean).join(' ');

  return (
    <ul className={classes} {...props}>
      {children}
    </ul>
  );
}

// Attach ListItem as a static property
List.Item = ListItem;
