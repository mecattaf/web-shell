import React, { useId } from 'react';
import '../styles/components.css';

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Checkbox label */
  label?: string;
}

/**
 * Checkbox - Styled checkbox
 *
 * A checkbox component with custom styling and optional label.
 */
export function Checkbox({
  label,
  className = '',
  id: providedId,
  ...props
}: CheckboxProps) {
  const autoId = useId();
  const id = providedId || autoId;

  return (
    <label className="ws-checkbox-wrapper">
      <input
        id={id}
        type="checkbox"
        className={`ws-checkbox ${className}`}
        {...props}
      />
      {label && <span className="ws-checkbox-label">{label}</span>}
    </label>
  );
}
