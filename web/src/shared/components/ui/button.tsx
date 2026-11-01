import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            loading = false,
            disabled,
            className = '',
            ...props
        },
        ref,
    ) => {
        const baseStyle =
            'inline-flex items-center justify-center font-medium rounded-lg transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none';

        const sizes = {
            sm: 'h-8 px-3 text-xs gap-1.5',
            md: 'h-9 px-3.5 text-xs tracking-tight gap-2',
            lg: 'h-10 px-4 text-sm gap-2',
        };

        const variants = {
            primary:
                'bg-slate-900 text-white hover:bg-slate-800 shadow-2xs',
            secondary:
                'bg-slate-100 text-slate-900 hover:bg-slate-200',
            outline:
                'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-900 shadow-2xs',
            danger:
                'bg-rose-600 text-white hover:bg-rose-700 shadow-2xs',
            ghost:
                'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        };

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`}
                {...props}
            >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
                {children}
            </button>
        );
    },
);

Button.displayName = 'Button';
