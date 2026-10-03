import React from 'react';

export const Switch = ({ checked, onChange, label, description, disabled = false, className = '' }) => {
  return (
    <label className={`inline-flex items-center justify-between cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {(label || description) && (
        <div className="mr-3">
          {label && <span className="text-sm font-semibold text-slate-200">{label}</span>}
          {description && <p className="text-xs text-slate-400">{description}</p>}
        </div>
      )}
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => !disabled && onChange && onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
            checked ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'
          }`}
        />
        <div
          className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 ease-in-out shadow-md ${
            checked ? 'transform translate-x-5' : 'transform translate-x-0'
          }`}
        />
      </div>
    </label>
  );
};
