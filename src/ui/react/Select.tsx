import React, { useId } from 'react';
import '../styles/components.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Select label */
  label?: string;
  /** Options for the select */
  options: SelectOption[];
}

/**
 * Select - Dropdown select
 *
 * A select dropdown component with label and options.
 */
export function Select({
  label,
  options,
  className = '',
  id: providedId,
  ...props
}: SelectProps) {
  const autoId = useId();
  const id = providedId || autoId;

  return (
    <div className="ws-select-wrapper">
      {label && (
        <label htmlFor={id} className="ws-select-label">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`ws-select ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
