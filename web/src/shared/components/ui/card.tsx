import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    description?: string;
    action?: React.ReactNode;
}

export function Card({
    title,
    description,
    action,
    children,
    className = '',
    ...props
}: CardProps) {
    return (
        <div
            className={`bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs ${className}`}
            {...props}
        >
            {(title || action) && (
                <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                    <div>
                        {title && (
                            <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                                {title}
                            </h3>
                        )}
                        {description && (
                            <p className="text-xs text-slate-500 mt-0.5">
                                {description}
                            </p>
                        )}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            {children}
        </div>
    );
}
