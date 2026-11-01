import React from 'react';
import { ExternalLink, MapPin, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { formatCoordinate, formatDateTime, formatPercent } from '@/shared/lib/formatters';
import { Report } from '../types/reports.types';
import { ReportCategoryBadge } from './report-category-badge';
import { ReportStatusBadge, statusLabels } from './report-status-badge';

interface ReportDetailDialogProps {
    report: Report | null;
    isOpen: boolean;
    isAdmin: boolean;
    currentUserId?: string;
    onClose: () => void;
    onUpdateStatus?: (report: Report) => void;
    onDelete?: (report: Report) => void;
}

export function ReportDetailDialog({
    report,
    isOpen,
    isAdmin,
    currentUserId,
    onClose,
    onUpdateStatus,
    onDelete,
}: ReportDetailDialogProps) {
    if (!isOpen || !report) return null;

    const mapsUrl = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;
    const canDelete = isAdmin || (report.userId === currentUserId && report.status === 'PENDING');

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="Detail Laporan Sampah"
            maxWidth="xl"
        >
            <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
                {/* Photo and Primary Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-4/3 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={report.imageUrl}
                            alt="Foto Sampah"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    'https://placehold.co/400x300/f1f5f9/94a3b8?text=Foto';
                            }}
                        />
                        <a
                            href={report.imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-medium rounded-md backdrop-blur-2xs transition-colors"
                        >
                            Buka Foto ↗
                        </a>
                    </div>

                    <div className="space-y-3 text-xs">
                        <div>
                            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                                Status & Kategori
                            </span>
                            <div className="mt-1 flex items-center gap-2">
                                <ReportStatusBadge status={report.status} />
                                <ReportCategoryBadge category={report.category} />
                                {report.aiConfidence !== null && report.aiConfidence !== undefined && (
                                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-md">
                                        <Sparkles className="w-3 h-3 text-slate-500" />
                                        AI: {formatPercent(report.aiConfidence)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div>
                            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                                Pelapor
                            </span>
                            <p className="font-medium text-slate-900 mt-0.5">
                                {report.user?.name || 'Anonim'}{' '}
                                {report.user?.email && (
                                    <span className="text-slate-500 font-normal">
                                        ({report.user.email})
                                    </span>
                                )}
                            </p>
                        </div>

                        <div>
                            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                                Lokasi & Koordinat
                            </span>
                            <p className="text-slate-800 mt-0.5 font-medium">
                                {report.address || 'Tidak ada patokan alamat'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[11px] text-slate-500">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>{formatCoordinate(report.latitude, report.longitude)}</span>
                            </div>
                            <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 mt-1.5 font-medium text-xs text-slate-900 hover:underline underline-offset-2"
                            >
                                <ExternalLink className="w-3 h-3" />
                                Buka di Google Maps
                            </a>
                        </div>

                        <div>
                            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                                Waktu Laporan
                            </span>
                            <p className="font-mono text-[11px] text-slate-600 mt-0.5">
                                {formatDateTime(report.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                        Deskripsi Laporan
                    </span>
                    <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {report.description}
                    </p>
                </div>

                {/* Admin Note if any */}
                {report.adminNote && (
                    <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl">
                        <span className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                            Catatan Petugas Admin
                        </span>
                        <p className="text-xs text-slate-900 font-medium">
                            {report.adminNote}
                        </p>
                    </div>
                )}

                {/* Status Audit Log Timeline */}
                <div className="space-y-2">
                    <span className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                        Riwayat Perubahan Status ({report.logs?.length || 0})
                    </span>

                    {!report.logs || report.logs.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Belum ada catatan riwayat status.</p>
                    ) : (
                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                            {report.logs.map((log) => (
                                <div key={log.id} className="p-3 bg-white flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                            {log.fromStatus ? (
                                                <>
                                                    <span className="text-slate-400">
                                                        {statusLabels[log.fromStatus]}
                                                    </span>
                                                    <span>→</span>
                                                </>
                                            ) : null}
                                            <ReportStatusBadge status={log.toStatus} />
                                        </div>
                                        <span className="font-mono text-[10px] text-slate-400">
                                            {formatDateTime(log.createdAt)}
                                        </span>
                                    </div>
                                    {log.note && (
                                        <p className="text-slate-700 text-[11px] mt-0.5">
                                            Catatan: {log.note}
                                        </p>
                                    )}
                                    {log.changedBy && (
                                        <span className="text-[10px] text-slate-400 mt-0.5">
                                            Oleh: {log.changedBy.name}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                        {canDelete && onDelete && (
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => onDelete(report)}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Hapus
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isAdmin && onUpdateStatus && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onUpdateStatus(report)}
                            >
                                Ubah Status
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={onClose}>
                            Tutup
                        </Button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
