import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { PixelBadge } from '@/shared/components/PixelBadge';
import { PixelEmptyState } from '@/shared/components/PixelEmptyState';
import { PixelSkeleton } from '@/shared/components/PixelSkeleton';
import { Colors } from '@/shared/theme/colors';
import { Report, ReportsService, ReportStatus } from '../services/reports.service';

interface ReportsListScreenProps {
    onNavigateDetail: (reportId: string) => void;
    onNavigateCreate: () => void;
}

const STATUS_FILTERS: { label: string; value: ReportStatus | 'ALL' }[] = [
    { label: 'Semua', value: 'ALL' },
    { label: 'Menunggu', value: 'PENDING' },
    { label: 'Diproses', value: 'IN_PROGRESS' },
    { label: 'Selesai', value: 'COMPLETED' },
    { label: 'Ditolak', value: 'REJECTED' },
];

export function ReportsListScreen({ onNavigateDetail, onNavigateCreate }: ReportsListScreenProps) {
    const [reports, setReports] = useState<Report[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'ALL'>('ALL');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadReports = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await ReportsService.listMine({
                status: selectedStatus === 'ALL' ? undefined : selectedStatus,
                limit: 20,
            });
            setReports(res.data);
        } catch (err) {
            console.error('Error loading reports:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadReports();
        }, [selectedStatus])
    );

    const onRefresh = useCallback(() => {
        loadReports(true);
    }, [selectedStatus]);

    const renderItem = ({ item }: { item: Report }) => {
        const dateStr = new Date(item.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        return (
            <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => onNavigateDetail(item.id)}
                style={styles.card}
            >
                <Image
                    source={{
                        uri: item.imageUrl || 'https://placehold.co/100x100/f1f5f9/94a3b8?text=IMG',
                    }}
                    style={styles.thumb}
                />

                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.description}
                    </Text>

                    <Text style={styles.cardLoc} numberOfLines={1}>
                        {item.address || `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`}
                    </Text>

                    <View style={styles.badgeRow}>
                        <PixelBadge type={item.status} />
                        {item.category && <PixelBadge type={item.category} />}
                    </View>

                    <Text style={styles.dateText}>{dateStr}</Text>
                </View>

                <Text style={styles.arrowIcon}>➔</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTag}>Riwayat Laporan</Text>
                    <Text style={styles.headerTitle}>Laporan Sampah Saya</Text>
                </View>
                <TouchableOpacity onPress={onNavigateCreate} style={styles.createBtn} activeOpacity={0.8}>
                    <Text style={styles.createBtnText}>+ Buat Laporan</Text>
                </TouchableOpacity>
            </View>

            {/* Filter Pills */}
            <View style={styles.filterWrap}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={STATUS_FILTERS}
                    keyExtractor={(item) => item.value}
                    contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
                    renderItem={({ item }) => {
                        const isSelected = selectedStatus === item.value;
                        return (
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setSelectedStatus(item.value)}
                                style={[
                                    styles.filterPill,
                                    isSelected && styles.filterPillActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.filterPillText,
                                        isSelected && styles.filterPillTextActive,
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {/* Main List */}
            {loading && reports.length === 0 ? (
                <View style={styles.skeletonContainer}>
                    {[1, 2, 3, 4].map((i) => (
                        <View key={i} style={styles.skeletonCard}>
                            <PixelSkeleton width={64} height={64} borderRadius={12} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <PixelSkeleton width="75%" height={14} style={{ marginBottom: 6 }} />
                                <PixelSkeleton width="50%" height={10} style={{ marginBottom: 8 }} />
                                <PixelSkeleton width={70} height={18} borderRadius={6} />
                            </View>
                        </View>
                    ))}
                </View>
            ) : (
                <FlatList
                    data={reports}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primary]}
                            tintColor={Colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        <PixelEmptyState
                            title="Tidak Ada Laporan"
                            description={
                                selectedStatus === 'ALL'
                                    ? 'Anda belum memiliki riwayat laporan sampah.'
                                    : `Tidak ada laporan sampah dengan status "${selectedStatus}".`
                            }
                            actionLabel="+ Buat Laporan Baru"
                            onAction={onNavigateCreate}
                        />
                    }
                />
            )}
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
    headerTag: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.primary,
        letterSpacing: 0.2,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginTop: 1,
    },
    createBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    createBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    filterWrap: {
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    filterPill: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
    },
    filterPillActive: {
        backgroundColor: '#16A34A',
    },
    filterPillText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    filterPillTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    listContent: {
        padding: 16,
        paddingBottom: 24,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 12,
        marginBottom: 10,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    thumb: {
        width: 64,
        height: 64,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
    },
    cardInfo: {
        flex: 1,
        marginLeft: 12,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    cardLoc: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginVertical: 2,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    dateText: {
        fontSize: 10,
        color: '#94A3B8',
        marginTop: 4,
    },
    arrowIcon: {
        fontSize: 14,
        color: '#CBD5E1',
        marginLeft: 8,
    },
    skeletonContainer: {
        padding: 18,
        gap: 10,
    },
    skeletonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 12,
    },
});
