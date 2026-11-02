import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, className = '', children, id, ...props }, ref) => {
        const selectId = id || props.name;

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-xs font-medium text-slate-700"
                    >
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={`w-full h-9 px-3 text-xs bg-white border rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-green-600 focus:border-green-600 transition-colors shadow-2xs ${
                        error
                            ? 'border-rose-500'
                            : 'border-slate-200 hover:border-slate-300'
                    } ${className}`}
                    {...props}
                >
                    {children}
                </select>
                {error && <p className="text-[11px] text-rose-500">{error}</p>}
            </div>
        );
    },
);

Select.displayName = 'Select';
