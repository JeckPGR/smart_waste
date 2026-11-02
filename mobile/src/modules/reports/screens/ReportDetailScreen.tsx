import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { PixelBadge } from '@/shared/components/PixelBadge';
import { PixelButton } from '@/shared/components/PixelButton';
import { PixelCard } from '@/shared/components/PixelCard';
import { SlateDialog } from '@/shared/components/SlateDialog';
import { Colors } from '@/shared/theme/colors';
import { Report, ReportsService } from '../services/reports.service';

interface ReportDetailScreenProps {
    reportId: string;
    onBack: () => void;
    onDeleted?: () => void;
}

export function ReportDetailScreen({ reportId, onBack, onDeleted }: ReportDetailScreenProps) {
    const insets = useSafeAreaInsets();
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const loadDetail = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        else setLoading(true);

        try {
            const data = await ReportsService.getDetail(reportId);
            setReport(data);
        } catch (err: unknown) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Gagal memuat detail laporan.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDetail();
    }, [reportId]);

    const handleRefresh = () => {
        loadDetail(true);
    };

    const handleOpenMaps = () => {
        if (!report) return;
        const url = `https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`;
        Linking.openURL(url);
    };

    const handleConfirmDelete = async () => {
        setDeleting(true);
        try {
            await ReportsService.delete(reportId);
            setShowDeleteDialog(false);
            if (onDeleted) onDeleted();
            else onBack();
        } catch (err: unknown) {
            Alert.alert('Gagal Hapus', err instanceof Error ? err.message : 'Laporan tidak dapat dihapus.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                    <Feather name="arrow-left" size={18} color={Colors.primary} />
                    <Text style={styles.backText}>Kembali</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Laporan</Text>
                <TouchableOpacity
                    onPress={handleRefresh}
                    style={styles.refreshBtn}
                    activeOpacity={0.7}
                    disabled={refreshing}
                >
                    {refreshing ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                        <Feather name="rotate-cw" size={16} color={Colors.primary} />
                    )}
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingCenter}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Memuat detail laporan sampah...</Text>
                </View>
            ) : !report ? (
                <View style={styles.loadingCenter}>
                    <Text style={styles.notFoundText}>Laporan tidak ditemukan.</Text>
                    <PixelButton title="Kembali" onPress={onBack} variant="secondary" size="sm" />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: Math.max(insets.bottom + 40, 80) },
                    ]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={[Colors.primary]}
                            tintColor={Colors.primary}
                        />
                    }
                >
                    {/* Big Photo Card */}
                    <View style={styles.photoCard}>
                        <Image
                            source={{
                                uri: report.imageUrl || 'https://placehold.co/400x300/f1f5f9/94a3b8?text=IMG',
                            }}
                            style={styles.mainPhoto}
                        />
                        <View style={styles.photoOverlayBadge}>
                            <PixelBadge type={report.status} />
                        </View>
                    </View>

                    {/* Primary Info */}
                    <PixelCard
                        badgeText="Deskripsi Laporan"
                        title={report.description}
                        subtitle={`Dibuat pada: ${new Date(report.createdAt).toLocaleString('id-ID')}`}
                    >
                        <View style={styles.badgesRow}>
                            {report.category && <PixelBadge type={report.category} />}
                            {report.aiConfidence !== null && report.aiConfidence !== undefined && (
                                <View style={styles.aiConfidenceBadge}>
                                    <Text style={styles.aiConfidenceText}>
                                        Akurasi AI: {(report.aiConfidence * 100).toFixed(0)}%
                                    </Text>
                                </View>
                            )}
                        </View>
                    </PixelCard>

                    {/* Location Card */}
                    <PixelCard
                        badgeText="Titik Lokasi GPS"
                        title={report.address || 'Alamat tidak dicantumkan'}
                        subtitle={`Koordinat: ${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}`}
                    >
                        <View style={{ marginTop: 8 }}>
                            <PixelButton
                                title="Buka di Google Maps"
                                onPress={handleOpenMaps}
                                variant="secondary"
                                size="sm"
                                icon={<Feather name="map-pin" size={14} color="#0F172A" />}
                            />
                        </View>
                    </PixelCard>

                    {/* Audit Logs Section */}
                    <PixelCard
                        badgeText="Status Penanganan"
                        title="Perjalanan Penanganan"
                        subtitle="Audit log resmi dari sistem dan verifikasi petugas"
                    >
                        {(() => {
                            const logs = (report.logs && report.logs.length > 0)
                                ? report.logs
                                : (report.statusLogs && report.statusLogs.length > 0)
                                ? report.statusLogs
                                : [];

                            if (logs.length === 0) {
                                return (
                                    <Text style={styles.noLogsText}>
                                        Belum ada riwayat pembaruan status oleh petugas.
                                    </Text>
                                );
                            }

                            return (
                                <View style={styles.logsList}>
                                    {logs.map((log) => {
                                        const logDate = new Date(log.createdAt).toLocaleString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        });

                                        return (
                                            <View key={log.id} style={styles.logItem}>
                                                <View style={styles.logDot} />
                                                <View style={styles.logTextWrap}>
                                                    <View style={styles.logHeader}>
                                                        <PixelBadge type={log.toStatus} />
                                                        <Text style={styles.logDate}>{logDate}</Text>
                                                    </View>
                                                    {log.changedBy?.name && (
                                                        <Text style={styles.logAuthor}>
                                                            Oleh: {log.changedBy.name}
                                                        </Text>
                                                    )}
                                                    {log.note && (
                                                        <Text style={styles.logNote}>
                                                            "{log.note}"
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            );
                        })()}
                    </PixelCard>

                    {/* Delete Option if Pending */}
                    {report.status === 'PENDING' && (
                        <View style={styles.deleteWrap}>
                            <PixelButton
                                title="Batalkan & Hapus Laporan"
                                onPress={() => setShowDeleteDialog(true)}
                                variant="danger"
                                size="md"
                                icon={<Feather name="trash-2" size={16} color="#FFFFFF" />}
                            />
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Minimalist Slate Delete Dialog */}
            <SlateDialog
                visible={showDeleteDialog}
                icon={<Feather name="trash-2" size={22} color={Colors.danger} />}
                title="Hapus Laporan Sampah?"
                description="Laporan ini akan dibatalkan dan dihapus permanen dari sistem Smart Waste."
                confirmText="Ya, Hapus"
                cancelText="Batal"
                isDestructive
                loading={deleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteDialog(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
    },
    refreshBtn: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#DCFCE7',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    backText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.primary,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    loadingCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 13,
        color: Colors.textSecondary,
    },
    notFoundText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 14,
    },
    scrollContent: {
        paddingHorizontal: 18,
        paddingTop: 16,
    },
    photoCard: {
        position: 'relative',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 14,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    mainPhoto: {
        width: '100%',
        height: 220,
        backgroundColor: '#F1F5F9',
    },
    photoOverlayBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    badgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 6,
    },
    aiConfidenceBadge: {
        backgroundColor: '#DCFCE7',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    aiConfidenceText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#15803D',
    },
    logsList: {
        marginTop: 4,
        paddingLeft: 4,
    },
    logItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    logDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        marginTop: 6,
        marginRight: 10,
    },
    logTextWrap: {
        flex: 1,
    },
    logHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    logDate: {
        fontSize: 11,
        color: '#94A3B8',
    },
    logAuthor: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
        marginBottom: 2,
    },
    logNote: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontStyle: 'italic',
        lineHeight: 16,
    },
    noLogsText: {
        fontSize: 12,
        color: '#94A3B8',
        paddingVertical: 4,
    },
    deleteWrap: {
        marginTop: 10,
        marginBottom: 20,
    },
});
