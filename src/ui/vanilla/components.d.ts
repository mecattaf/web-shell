/**
 * TypeScript definitions for Vanilla JavaScript components
 */

export interface BaseComponentProps {
  className?: string;
  id?: string;
  style?: Partial<CSSStyleDeclaration>;
  [key: string]: any;
}

// Layout Components

export interface StackOptions extends BaseComponentProps {
  direction?: 'vertical' | 'horizontal';
  gap?: 'xs' | 's' | 'm' | 'l' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  children?: Node | Node[] | string;
}

export function Stack(options?: StackOptions): HTMLDivElement;

export interface GridOptions extends BaseComponentProps {
  columns?: 2 | 3 | 4;
  gap?: 'xs' | 's' | 'm' | 'l';
  children?: Node | Node[] | string;
}

export function Grid(options?: GridOptions): HTMLDivElement;

export interface PanelOptions extends BaseComponentProps {
  elevation?: 'none' | 'low' | 'medium' | 'high';
  children?: Node | Node[] | string;
}

export function Panel(options?: PanelOptions): HTMLDivElement;

export interface SurfaceOptions extends BaseComponentProps {
  variant?: 'default' | 'high' | 'highest' | 'low';
  children?: Node | Node[] | string;
}

export function Surface(options?: SurfaceOptions): HTMLDivElement;

// Typography Components

export interface TextOptions extends BaseComponentProps {
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  variant?: 'default' | 'secondary';
  monospace?: boolean;
  as?: 'p' | 'span' | 'div';
  children?: Node | Node[] | string;
}

export function Text(options?: TextOptions): HTMLElement;

export interface HeadingOptions extends BaseComponentProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children?: Node | Node[] | string;
}

export function Heading(
  options?: HeadingOptions
): HTMLHeadingElement;

// Control Components

export interface ButtonOptions extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  children?: Node | Node[] | string;
  onClick?: (event: MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function Button(options?: ButtonOptions): HTMLButtonElement;

export interface InputOptions extends BaseComponentProps {
  label?: string;
  helperText?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
}

export function Input(options?: InputOptions): HTMLDivElement;

export interface CheckboxOptions extends BaseComponentProps {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export function Checkbox(options?: CheckboxOptions): HTMLLabelElement;

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectOptions extends BaseComponentProps {
  label?: string;
  options?: SelectOption[];
  value?: string;
  disabled?: boolean;
  required?: boolean;
}

export function Select(options?: SelectOptions): HTMLDivElement;

// Feedback Components

export interface CardOptions extends BaseComponentProps {
  interactive?: boolean;
  children?: Node | Node[] | string;
}

export function Card(options?: CardOptions): HTMLDivElement;

export interface ListOptions extends BaseComponentProps {
  children?: Node | Node[];
}

export function List(options?: ListOptions): HTMLUListElement;

export interface ListItemOptions extends BaseComponentProps {
  interactive?: boolean;
  children?: Node | Node[] | string;
}

export function ListItem(options?: ListItemOptions): HTMLLIElement;

export interface DividerOptions extends BaseComponentProps {
  orientation?: 'horizontal' | 'vertical';
}

export function Divider(options?: DividerOptions): HTMLHRElement;
