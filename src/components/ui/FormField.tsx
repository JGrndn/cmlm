'use client';

import { useState } from 'react';
import { Eye, EyeOff, ToggleLeft, ToggleRight } from 'lucide-react';

interface FormFieldProps {
  label?: string;
  name?: string;
  type?: 'text' | 'email' | 'number' | 'date' | 'password' | 'checkbox' | 'toggle' | 'select' | 'textarea';
  value: any;
  onChange: (value: any) => void;
  options?: Array<{ value: any; label: string }>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  compact?: boolean;
  error?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
  helpText,
  compact = false,
  error,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: any) => {
    if (type === 'checkbox') {
      onChange(e.target.checked);
    } else if (type === 'number') {
      onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
    } else {
      onChange(e.target.value);
    }
  };

  const inputClasses = `${compact ? '' : 'mt-1'} block w-full rounded-md shadow-sm ${
    error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
  } ${disabled ? 'bg-gray-100' : ''} ${compact ? 'text-sm py-1 px-2' : ''}`;

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={name}
          name={name}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={compact ? 2 : 4}
          className={inputClasses}
          suppressHydrationWarning
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          id={name}
          name={name}
          value={value || ''}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          className={inputClasses}
          suppressHydrationWarning
        >
          <option value="">{placeholder ?? 'Sélectionner…'}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'checkbox') {
      return (
        <div className={compact ? '' : 'mt-2'}>
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={value || false}
            onChange={handleChange}
            disabled={disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            suppressHydrationWarning
          />
        </div>
      );
    }

    if (type === 'toggle') {
      const Icon = value ? ToggleRight : ToggleLeft;
      return (
        <div className={compact ? '' : 'mt-2'}>
          <button
            type="button"
            onClick={() => !disabled && onChange(!value)}
            disabled={disabled}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${value ? 'text-green-600' : 'text-gray-400'}`}
          >
            <Icon className="w-6 h-6" />
            <span className={`text-xs ${value ? 'text-green-700' : 'text-gray-500'}`}>
              {value ? 'Oui' : 'Non'}
            </span>
          </button>
        </div>
      );
    }

    if (type === 'password') {
      return (
        <div className="mt-1 relative">
          <input
            id={name}
            name={name}
            type={showPassword ? 'text' : 'password'}
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`${inputClasses} pr-10 mt-0`}
            suppressHydrationWarning
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      );
    }

    return (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={inputClasses}
        suppressHydrationWarning
      />
    );
  };

  if (compact) {
    return (
      <div>
        {renderInput()}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {helpText && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
