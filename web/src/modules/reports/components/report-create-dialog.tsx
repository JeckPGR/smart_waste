'use client';

import React, { useRef, useState } from 'react';
import { LocateFixed, Sparkles, UploadCloud } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { reportsService } from '../services/reports.service';
import { Report, WasteCategory } from '../types/reports.types';

interface ReportCreateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (report: Report) => void;
}

export function ReportCreateDialog({ isOpen, onClose, onCreated }: ReportCreateDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<WasteCategory>('ORGANIC');
    const [latitude, setLatitude] = useState('-6.208800');
    const [longitude, setLongitude] = useState('106.845600');
    const [address, setAddress] = useState('');
    const [aiConfidence, setAiConfidence] = useState<number | null>(null);

    const [isAiDetecting, setIsAiDetecting] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aiFeedback, setAiFeedback] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (selected: File) => {
        if (!selected.type.startsWith('image/')) {
            setError('File harus berupa gambar (JPG, PNG, WEBP)');
            return;
        }
        setFile(selected);
        setPreviewUrl(URL.createObjectURL(selected));
        setError(null);
        setAiFeedback(null);
        setAiConfidence(null);
    };

    const handleAiDetect = async () => {
        if (!file) {
            setError('Pilih foto sampah terlebih dahulu');
            return;
        }
        setIsAiDetecting(true);
        setError(null);
        setAiFeedback(null);

        try {
            const formData = new FormData();
            formData.append('image', file);
            const res = await reportsService.predictAi(formData);
            setCategory(res.category);
            setAiConfidence(res.confidence);
            setAiFeedback(`Terdeteksi: ${res.label} (${(res.confidence * 100).toFixed(0)}%)`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Gagal mendeteksi gambar');
        } finally {
            setIsAiDetecting(false);
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setError('Browser tidak mendukung deteksi lokasi');
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLatitude(pos.coords.latitude.toFixed(6));
                setLongitude(pos.coords.longitude.toFixed(6));
                setIsLocating(false);
            },
            (err) => {
                setError(`Gagal deteksi lokasi: ${err.message}`);
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 },
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Foto wajib diunggah');
            return;
        }
        if (!description.trim() || description.length < 3) {
            setError('Deskripsi minimal 3 karakter');
            return;
        }

        const latNum = parseFloat(latitude);
        const lngNum = parseFloat(longitude);
        if (isNaN(latNum) || isNaN(lngNum)) {
            setError('Koordinat lokasi tidak valid');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('description', description.trim());
            formData.append('category', category);
            formData.append('latitude', latNum.toString());
            formData.append('longitude', lngNum.toString());
            if (address.trim()) formData.append('address', address.trim());
            if (aiConfidence !== null) formData.append('aiConfidence', aiConfidence.toString());

            const created = await reportsService.create(formData);
            onCreated(created);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Gagal mengirim laporan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="Buat Laporan Sampah Baru"
            description="Laporkan tumpukan sampah untuk segera ditindaklanjuti"
            maxWidth="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Upload Section */}
                <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-700">
                        Foto Sampah <span className="text-rose-500">*</span>
                    </label>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                        }}
                    />

                    {previewUrl ? (
                        <div className="space-y-2">
                            <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-16/9 bg-slate-50 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Ganti Foto
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    loading={isAiDetecting}
                                    onClick={handleAiDetect}
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-slate-600" />
                                    Deteksi AI
                                </Button>
                            </div>
                            {aiFeedback && (
                                <p className="text-[11px] font-mono text-slate-600">
                                    ✓ {aiFeedback}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 rounded-xl p-6 text-center cursor-pointer transition-colors"
                        >
                            <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                            <p className="text-xs font-medium text-slate-700">
                                Klik untuk memilih file foto sampah
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                                Format JPG, PNG, WEBP (Maksimal 5MB)
                            </p>
                        </div>
                    )}
                </div>

                {/* Category & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Select
                        label="Kategori"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as WasteCategory)}
                    >
                        <option value="ORGANIC">Organik</option>
                        <option value="PLASTIC">Plastik</option>
                        <option value="PAPER">Kertas</option>
                    </Select>

                    <div className="sm:col-span-2">
                        <Input
                            label="Patokan / Alamat"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Contoh: Jl. Ahmad Yani No. 10"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700">
                        Deskripsi Laporan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Jelaskan kondisi tumpukan sampah atau volume..."
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 shadow-2xs"
                        required
                    />
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-slate-700">
                            Koordinat Lokasi
                        </label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            loading={isLocating}
                            onClick={handleGetLocation}
                        >
                            <LocateFixed className="w-3.5 h-3.5" />
                            Lokasi Saya
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            placeholder="Latitude"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            required
                        />
                        <Input
                            placeholder="Longitude"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
                        Batal
                    </Button>
                    <Button type="submit" variant="primary" size="sm" loading={loading}>
                        Kirim Laporan
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}
