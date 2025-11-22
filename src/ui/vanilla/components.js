/**
 * WebShell UI Components - Vanilla JavaScript
 *
 * Minimal, unopinionated component library using design tokens
 * These are factory functions that return DOM elements
 */

import '../styles/components.css';

/**
 * Merges class names, filtering out falsy values
 */
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Sets attributes on an element
 */
function setAttributes(element, attrs) {
  Object.entries(attrs || {}).forEach(([key, value]) => {
    if (key === 'className' || key === 'class') {
      element.className = value;
    } else if (key.startsWith('on') && typeof value === 'function') {
      const event = key.substring(2).toLowerCase();
      element.addEventListener(event, value);
    } else if (value !== undefined && value !== null) {
      element.setAttribute(key, value);
    }
  });
}

// ========================================
// Layout Components
// ========================================

/**
 * Stack - Flex container with gap control
 */
export function Stack({
  direction = 'vertical',
  gap = 'm',
  align,
  justify,
  children = [],
  ...attrs
} = {}) {
  const div = document.createElement('div');
  div.className = classNames(
    'ws-stack',
    direction === 'horizontal' && 'ws-stack--horizontal',
    `ws-stack--gap-${gap}`,
    align && `ws-stack--align-${align}`,
    justify && `ws-stack--justify-${justify}`
  );

  if (Array.isArray(children)) {
    children.forEach((child) => div.appendChild(child));
  } else if (children instanceof Node) {
    div.appendChild(children);
  }

  setAttributes(div, attrs);
  return div;
}

/**
 * Grid - CSS Grid wrapper
 */
export function Grid({ columns, gap = 'm', children = [], ...attrs } = {}) {
  const div = document.createElement('div');
  div.className = classNames(
    'ws-grid',
    columns && `ws-grid--cols-${columns}`,
    `ws-grid--gap-${gap}`
  );

  if (Array.isArray(children)) {
    children.forEach((child) => div.appendChild(child));
  } else if (children instanceof Node) {
    div.appendChild(children);
  }

  setAttributes(div, attrs);
  return div;
}

/**
 * Panel - Surface with elevation
 */
export function Panel({ elevation = 'medium', children = [], ...attrs } = {}) {
  const div = document.createElement('div');
  div.className = classNames('ws-panel', `ws-panel--elevation-${elevation}`);

  if (Array.isArray(children)) {
    children.forEach((child) => div.appendChild(child));
  } else if (children instanceof Node) {
    div.appendChild(children);
  } else if (typeof children === 'string') {
    div.textContent = children;
  }

  setAttributes(div, attrs);
  return div;
}

/**
 * Surface - Basic container with theme background
 */
export function Surface({ variant = 'default', children = [], ...attrs } = {}) {
  const div = document.createElement('div');
  div.className = classNames(
    'ws-surface',
    variant !== 'default' && `ws-surface--${variant}`
  );

  if (Array.isArray(children)) {
    children.forEach((child) => div.appendChild(child));
  } else if (children instanceof Node) {
    div.appendChild(children);
  } else if (typeof children === 'string') {
    div.textContent = children;
  }

  setAttributes(div, attrs);
  return div;
}

// ========================================
// Typography Components
// ========================================

/**
 * Text - Styled text with size variants
 */
export function Text({
  size = 'm',
  weight = 'normal',
  variant = 'default',
  monospace = false,
  as = 'p',
  children = '',
  ...attrs
} = {}) {
  const element = document.createElement(as);
  element.className = classNames(
    'ws-text',
    `ws-text--size-${size}`,
    `ws-text--weight-${weight}`,
    variant === 'secondary' && 'ws-text--secondary',
    monospace && 'ws-text--monospace'
  );

  if (typeof children === 'string') {
    element.textContent = children;
  } else if (children instanceof Node) {
    element.appendChild(children);
  } else if (Array.isArray(children)) {
    children.forEach((child) => element.appendChild(child));
  }

  setAttributes(element, attrs);
  return element;
}

/**
 * Heading - Semantic headings
 */
export function Heading({ level = 2, children = '', ...attrs } = {}) {
  const element = document.createElement(`h${level}`);
  element.className = classNames('ws-heading', `ws-heading--h${level}`);

  if (typeof children === 'string') {
    element.textContent = children;
  } else if (children instanceof Node) {
    element.appendChild(children);
  } else if (Array.isArray(children)) {
    children.forEach((child) => element.appendChild(child));
  }

  setAttributes(element, attrs);
  return element;
}

// ========================================
// Control Components
// ========================================

/**
 * Button - Primary/secondary/ghost variants
 */
export function Button({
  variant = 'primary',
  size = 'medium',
  children = '',
  onClick,
  ...attrs
} = {}) {
  const button = document.createElement('button');
  button.className = classNames(
    'ws-button',
    `ws-button--${variant}`,
    size !== 'medium' && `ws-button--${size}`
  );
  button.type = attrs.type || 'button';

  if (typeof children === 'string') {
    button.textContent = children;
  } else if (children instanceof Node) {
    button.appendChild(children);
  } else if (Array.isArray(children)) {
    children.forEach((child) => button.appendChild(child));
  }

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  setAttributes(button, attrs);
  return button;
}

/**
 * Input - Text input with label
 */
export function Input({ label, helperText, ...attrs } = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'ws-input-wrapper';

  if (label) {
    const labelEl = document.createElement('label');
    labelEl.className = 'ws-input-label';
    labelEl.textContent = label;
    labelEl.htmlFor = attrs.id || `input-${Math.random().toString(36).substr(2, 9)}`;
    wrapper.appendChild(labelEl);
  }

  const input = document.createElement('input');
  input.className = 'ws-input';
  if (label && !attrs.id) {
    input.id = `input-${Math.random().toString(36).substr(2, 9)}`;
  }

  setAttributes(input, attrs);
  wrapper.appendChild(input);

  if (helperText) {
    const helper = document.createElement('span');
    helper.className = 'ws-text ws-text--size-xs ws-text--secondary';
    helper.textContent = helperText;
    wrapper.appendChild(helper);
  }

  return wrapper;
}

/**
 * Checkbox - Styled checkbox
 */
export function Checkbox({ label, ...attrs } = {}) {
  const wrapper = document.createElement('label');
  wrapper.className = 'ws-checkbox-wrapper';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'ws-checkbox';
  checkbox.id = attrs.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  setAttributes(checkbox, attrs);
  wrapper.appendChild(checkbox);

  if (label) {
    const labelSpan = document.createElement('span');
    labelSpan.className = 'ws-checkbox-label';
    labelSpan.textContent = label;
    wrapper.appendChild(labelSpan);
  }

  return wrapper;
}

/**
 * Select - Dropdown select
 */
export function Select({ label, options = [], ...attrs } = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'ws-select-wrapper';

  if (label) {
    const labelEl = document.createElement('label');
    labelEl.className = 'ws-select-label';
    labelEl.textContent = label;
    labelEl.htmlFor = attrs.id || `select-${Math.random().toString(36).substr(2, 9)}`;
    wrapper.appendChild(labelEl);
  }

  const select = document.createElement('select');
  select.className = 'ws-select';
  if (label && !attrs.id) {
    select.id = `select-${Math.random().toString(36).substr(2, 9)}`;
  }

  options.forEach((opt) => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    if (opt.disabled) {
      option.disabled = true;
    }
    select.appendChild(option);
  });

  setAttributes(select, attrs);
  wrapper.appendChild(select);

  return wrapper;
}

// ========================================
// Feedback Components
// ========================================

/**
 * Card - Content container
 */
export function Card({ interactive = false, children = [], ...attrs } = {}) {
  const div = document.createElement('div');
  div.className = classNames(
    'ws-card',
    interactive && 'ws-card--interactive'
  );

  if (Array.isArray(children)) {
    children.forEach((child) => div.appendChild(child));
  } else if (children instanceof Node) {
    div.appendChild(children);
  } else if (typeof children === 'string') {
    div.textContent = children;
  }

  setAttributes(div, attrs);
  return div;
}

/**
 * List - Vertical list with items
 */
export function List({ children = [], ...attrs } = {}) {
  const ul = document.createElement('ul');
  ul.className = 'ws-list';

  if (Array.isArray(children)) {
    children.forEach((child) => ul.appendChild(child));
  } else if (children instanceof Node) {
    ul.appendChild(children);
  }

  setAttributes(ul, attrs);
  return ul;
}

/**
 * ListItem - Individual list item
 */
export function ListItem({ interactive = false, children = '', ...attrs } = {}) {
  const li = document.createElement('li');
  li.className = classNames(
    'ws-list-item',
    interactive && 'ws-list-item--interactive'
  );

  if (typeof children === 'string') {
    li.textContent = children;
  } else if (children instanceof Node) {
    li.appendChild(children);
  } else if (Array.isArray(children)) {
    children.forEach((child) => li.appendChild(child));
  }

  setAttributes(li, attrs);
  return li;
}

/**
 * Divider - Separator line
 */
export function Divider({ orientation = 'horizontal', ...attrs } = {}) {
  const hr = document.createElement('hr');
  hr.className = classNames(
    'ws-divider',
    orientation === 'vertical' && 'ws-divider--vertical'
  );

  setAttributes(hr, attrs);
  return hr;
}
