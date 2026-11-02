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
            'inline-flex items-center justify-center font-medium rounded-lg transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-green-500 disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none';

        const sizes = {
            sm: 'h-8 px-3 text-xs gap-1.5',
            md: 'h-9 px-3.5 text-xs tracking-tight gap-2',
            lg: 'h-10 px-4 text-sm gap-2',
        };

        const variants = {
            primary:
                'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-2xs font-semibold',
            secondary:
                'bg-green-50 text-green-700 border border-green-200/80 hover:bg-green-100 hover:text-green-800 font-medium',
            outline:
                'border border-slate-200 bg-white text-slate-700 hover:bg-green-50 hover:text-green-700 hover:border-green-300 shadow-2xs',
            danger:
                'bg-rose-600 text-white hover:bg-rose-700 shadow-2xs',
            ghost:
                'text-green-700 hover:bg-green-50 hover:text-green-800',
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
