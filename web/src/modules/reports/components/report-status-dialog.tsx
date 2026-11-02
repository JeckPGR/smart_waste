'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, RotateCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { Select } from '@/shared/components/ui/select';
import { reportsService } from '../services/reports.service';
import { Report, ReportStatus } from '../types/reports.types';
import { ReportStatusBadge } from './report-status-badge';

interface ReportStatusDialogProps {
    report: Report | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: (report: Report) => void;
}

export function ReportStatusDialog({
    report,
    isOpen,
    onClose,
    onUpdated,
}: ReportStatusDialogProps) {
    const [selectedStatus, setSelectedStatus] = useState<ReportStatus>('PENDING');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (report) {
            setSelectedStatus(report.status);
            setNote('');
            setError(null);
        }
    }, [report]);

    if (!isOpen || !report) return null;

    const isChanged = selectedStatus !== report.status || note.trim().length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isChanged) {
            setError('Pilih status baru atau isi catatan tindakan');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const updated = await reportsService.updateStatus(report.id, {
                status: selectedStatus,
                note: note.trim() || undefined,
            });
            onUpdated(updated);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Gagal memperbarui status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="Update Status Laporan"
            description={`Laporan: "${report.description}"`}
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Status Transition Preview */}
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Perubahan Status
                    </span>
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <div>
                            <span className="text-[10px] text-slate-400 block mb-1">Saat ini</span>
                            <ReportStatusBadge status={report.status} />
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 mt-3" />
                        <div>
                            <span className="text-[10px] text-slate-400 block mb-1">Status Baru</span>
                            <ReportStatusBadge status={selectedStatus} />
                        </div>
                    </div>
                </div>

                <Select
                    label="Pilih Status Baru"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as ReportStatus)}
                >
                    <option value="PENDING">Menunggu (Pending)</option>
                    <option value="IN_PROGRESS">Sedang Diproses (In Progress)</option>
                    <option value="COMPLETED">Selesai Ditangani (Completed)</option>
                    <option value="REJECTED">Ditolak (Rejected)</option>
                </Select>

                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700">
                        Catatan Petugas (Opsional)
                    </label>
                    <textarea
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Contoh: Petugas kebersihan telah dikirim ke lokasi untuk penanganan."
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-green-600 focus:border-green-600 shadow-2xs transition-colors"
                    />
                    <p className="text-[11px] text-slate-400">
                        Catatan akan tercatat secara permanen di riwayat audit laporan.
                    </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        loading={loading}
                        disabled={!isChanged}
                    >
                        Simpan Perubahan
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}
