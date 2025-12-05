import React from 'react';
import { Icon } from '@iconify/react';

// text input field with optional error display
export function FormInput({ label, error, className = '', required, helperText, ...props }) {
    return (
        <div className={className}>
            <label className="block text-xs font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    {...props}
                    className={`w-full h-10 px-4 rounded-lg border ${
                        error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'
                    } text-sm focus:outline-none focus:ring-1 transition-colors`}
                />
            </div>
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            {helperText && !error && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
        </div>
    );
}

// dropdown select with optional error display
export function FormSelect({ label, error, options, required, ...props }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <select
                    {...props}
                    className={`w-full h-10 px-4 pr-10 rounded-lg border ${
                        error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'
                    } text-sm focus:outline-none focus:ring-1 transition-colors appearance-none bg-white`}
                >
                    <option value="">Select {label}</option>
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <Icon 
                    icon="hugeicons:arrow-down-01" 
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" 
                />
            </div>
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
}
