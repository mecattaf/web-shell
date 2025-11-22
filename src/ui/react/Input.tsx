import React, { useId } from 'react';
import '../styles/components.css';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input label */
  label?: string;
  /** Helper text or error message */
  helperText?: string;
}

/**
 * Input - Text input with label
 *
 * A text input component with optional label and helper text.
 */
export function Input({
  label,
  helperText,
  className = '',
  id: providedId,
  ...props
}: InputProps) {
  const autoId = useId();
  const id = providedId || autoId;

  return (
    <div className="ws-input-wrapper">
      {label && (
        <label htmlFor={id} className="ws-input-label">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`ws-input ${className}`}
        {...props}
      />
      {helperText && (
        <span className="ws-text ws-text--size-xs ws-text--secondary">
          {helperText}
        </span>
      )}
    </div>
  );
}
