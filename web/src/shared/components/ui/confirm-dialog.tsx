import React from 'react';
import { Button } from './button';
import { Dialog } from './dialog';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    loading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    isDestructive = false,
    loading = false,
}: ConfirmDialogProps) {
    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
            <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                    {description}
                </p>
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={isDestructive ? 'danger' : 'primary'}
                        size="sm"
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}

