import React, { useCallback, useEffect, useState } from 'react';
import {
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { Report, ReportsService } from '@/modules/reports/services/reports.service';
import { PixelBadge } from '@/shared/components/PixelBadge';
import { PixelButton } from '@/shared/components/PixelButton';
import { PixelEmptyState } from '@/shared/components/PixelEmptyState';
import { PixelSkeleton } from '@/shared/components/PixelSkeleton';
import { SlateDialog } from '@/shared/components/SlateDialog';
import { LocationService } from '@/shared/services/location.service';
import { Colors } from '@/shared/theme/colors';
import { DashboardService, UserDashboardStats } from '../services/dashboard.service';

interface DashboardScreenProps {
    onNavigateCreateReport: () => void;
    onNavigateReportsList: () => void;
    onNavigateDetail: (reportId: string) => void;
}

export function DashboardScreen({
    onNavigateCreateReport,
    onNavigateReportsList,
    onNavigateDetail,
}: DashboardScreenProps) {
    const { user, logout } = useAuth();

    const [stats, setStats] = useState<UserDashboardStats | null>(null);
    const [recentReports, setRecentReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // UX-Friendly Location Request State
    const [showLocationDialog, setShowLocationDialog] = useState(false);
    const [requestingLocation, setRequestingLocation] = useState(false);

    const loadData = async (isManual = false) => {
        if (!user) return;
        if (isManual) setRefreshing(true);
        else setLoading(true);

        try {
            const [statsRes, reportsRes] = await Promise.all([
                DashboardService.getMyStats(),
                ReportsService.listMine({ page: 1, limit: 3 }),
            ]);
            setStats(statsRes);
            setRecentReports(reportsRes.data);
        } catch (err: any) {
            if (err?.status === 401) {
                // Session expired or token invalid - gracefully clear session
                await logout();
            } else {
                console.warn('Dashboard load notice:', err?.message || err);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [user])
    );

    // Check location permission softly on login / initial dashboard mount
    useEffect(() => {
        const checkLocationPrompt = async () => {
            const status = await LocationService.checkPermission();
            if (status === 'granted') {
                // Silently fetch current location to pre-warm coordinates
                LocationService.fetchCurrentLocation();
                return;
            }

            const hasPrompted = await LocationService.hasPrompted();
            if (!hasPrompted) {
                // Smooth delay so the user lands on the dashboard first
                const timer = setTimeout(() => {
                    setShowLocationDialog(true);
                }, 600);
                return () => clearTimeout(timer);
            }
        };

        checkLocationPrompt();
    }, []);

    const handleAllowLocation = async () => {
        setRequestingLocation(true);
        try {
            const granted = await LocationService.requestPermission();
            if (granted) {
                await LocationService.fetchCurrentLocation();
            }
        } finally {
            setRequestingLocation(false);
            setShowLocationDialog(false);
        }
    };

    const handleDismissLocation = async () => {
        await LocationService.setPrompted();
        setShowLocationDialog(false);
    };

    const onRefresh = useCallback(() => {
        loadData(true);
    }, [user]);

    const totalReports = stats?.totalReports || 0;
    const ecoXp = totalReports * 50;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                        tintColor={Colors.primary}
                    />
                }
            >
                {/* Header Profile / Citizen Level */}
                <View style={styles.headerRow}>
                    <View style={styles.userGreeting}>
                        <Text style={styles.welcomeSubtitle}>Portal Warga</Text>
                        <Text style={styles.userName}>Halo, {user?.name || 'Warga'}! 👋</Text>
                    </View>
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelLabel}>LVL 1</Text>
                        <Text style={styles.xpLabel}>{ecoXp} XP</Text>
                    </View>
                </View>

                {/* Primary Action Card (Slate Modern) */}
                <View style={styles.actionCard}>
                    <View style={styles.actionCardHeader}>
                        <View style={styles.actionCardIconBox}>
                            <Text style={styles.actionCardEmoji}>📸</Text>
                        </View>
                        <View style={styles.actionCardTextWrap}>
                            <Text style={styles.actionCardTitle}>Temukan Tumpukan Sampah?</Text>
                            <Text style={styles.actionCardDesc}>
                                Ambil foto & deteksi jenis sampah otomatis dengan AI untuk dilaporkan ke petugas.
                            </Text>
                        </View>
                    </View>
                    <PixelButton
                        title="+ Buat Laporan Baru"
                        onPress={onNavigateCreateReport}
                        variant="primary"
                        size="md"
                    />
                </View>

                {/* Stats Section */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionHeaderTitle}>Statistik Laporan Saya</Text>

                    {loading && !stats ? (
                        <View style={styles.statsGrid}>
                            {[1, 2, 3, 4].map((i) => (
                                <View key={i} style={styles.statBox}>
                                    <PixelSkeleton width={50} height={12} style={{ marginBottom: 6 }} />
                                    <PixelSkeleton width={36} height={20} />
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.statsGrid}>
                            <View style={styles.statBox}>
                                <Text style={styles.statLabel}>TOTAL</Text>
                                <Text style={styles.statNumber}>{stats?.totalReports || 0}</Text>
                                <Text style={styles.statSub}>Laporan Masuk</Text>
                            </View>

                            <View style={[styles.statBox, { borderLeftColor: '#F59E0B', borderLeftWidth: 3 }]}>
                                <Text style={[styles.statLabel, { color: '#B45309' }]}>MENUNGGU</Text>
                                <Text style={[styles.statNumber, { color: '#B45309' }]}>
                                    {stats?.byStatus.PENDING || 0}
                                </Text>
                                <Text style={styles.statSub}>Verifikasi Petugas</Text>
                            </View>

                            <View style={[styles.statBox, { borderLeftColor: '#0EA5E9', borderLeftWidth: 3 }]}>
                                <Text style={[styles.statLabel, { color: '#0369A1' }]}>DIPROSES</Text>
                                <Text style={[styles.statNumber, { color: '#0369A1' }]}>
                                    {stats?.byStatus.IN_PROGRESS || 0}
                                </Text>
                                <Text style={styles.statSub}>Sedang Ditangani</Text>
                            </View>

                            <View style={[styles.statBox, { borderLeftColor: '#16A34A', borderLeftWidth: 3 }]}>
                                <Text style={[styles.statLabel, { color: '#15803D' }]}>SELESAI</Text>
                                <Text style={[styles.statNumber, { color: '#15803D' }]}>
                                    {stats?.byStatus.COMPLETED || 0}
                                </Text>
                                <Text style={styles.statSub}>Lingkungan Bersih</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Daily Eco Quest Card (Compact & Modern) */}
                <View style={styles.questCard}>
                    <View style={styles.questHeader}>
                        <View style={styles.questBadge}>
                            <Text style={styles.questBadgeText}>Misi Eco Warga</Text>
                        </View>
                        <Text style={styles.questXpBadge}>+50 XP</Text>
                    </View>
                    <Text style={styles.questTitle}>Jaga Lingkungan Hari Ini</Text>
                    <Text style={styles.questDesc}>
                        Dapatkan poin XP untuk setiap Laporan sampah yang terverifikasi.
                    </Text>
                </View>

                {/* Recent Reports Section */}
                <View style={styles.recentSection}>
                    <View style={styles.recentHeader}>
                        <Text style={styles.sectionHeaderTitle}>Laporan Terakhir Anda</Text>
                        <TouchableOpacity onPress={onNavigateReportsList} activeOpacity={0.7}>
                            <Text style={styles.seeAllText}>Semua ➔</Text>
                        </TouchableOpacity>
                    </View>

                    {loading && recentReports.length === 0 ? (
                        <View style={{ gap: 10 }}>
                            {[1, 2].map((i) => (
                                <View key={i} style={styles.recentSkeletonCard}>
                                    <PixelSkeleton width={52} height={52} borderRadius={10} />
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <PixelSkeleton width="70%" height={14} style={{ marginBottom: 6 }} />
                                        <PixelSkeleton width="40%" height={10} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : recentReports.length === 0 ? (
                        <PixelEmptyState
                            title="Belum Ada Laporan"
                            description="Anda belum pernah membuat laporan sampah. Mulai laporkan sekarang!"
                            actionLabel="+ Buat Laporan"
                            onAction={onNavigateCreateReport}
                        />
                    ) : (
                        <View style={{ gap: 8 }}>
                            {recentReports.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    activeOpacity={0.75}
                                    onPress={() => onNavigateDetail(item.id)}
                                    style={styles.recentItemCard}
                                >
                                    <Image
                                        source={{
                                            uri: item.imageUrl || 'https://placehold.co/100x100/f1f5f9/94a3b8?text=IMG',
                                        }}
                                        style={styles.recentThumb}
                                    />
                                    <View style={styles.recentInfo}>
                                        <Text style={styles.recentDesc} numberOfLines={1}>
                                            {item.description}
                                        </Text>
                                        <Text style={styles.recentLoc} numberOfLines={1}>
                                            {item.address || `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`}
                                        </Text>
                                        <View style={styles.badgeRow}>
                                            <PixelBadge type={item.status} />
                                            {item.category && <PixelBadge type={item.category} />}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}

                            <View style={{ marginTop: 6 }}>
                                <PixelButton
                                    title="Lihat Seluruh Riwayat ➔"
                                    onPress={onNavigateReportsList}
                                    variant="secondary"
                                    size="sm"
                                />
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* UX-Friendly Location Permission Dialog */}
            <SlateDialog
                visible={showLocationDialog}
                title="Aktifkan Akses Lokasi"
                description="Smart Waste membutuhkan izin akses lokasi GPS untuk menandai titik koordinat tumpukan sampah secara otomatis saat Anda membuat laporan."
                icon={<Ionicons name="location-outline" size={24} color={Colors.primary} />}
                confirmText="Izinkan Lokasi"
                cancelText="Nanti Saja"
                loading={requestingLocation}
                onConfirm={handleAllowLocation}
                onCancel={handleDismissLocation}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 24, // Balanced, natural padding that fits cleanly above the tab bar
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    userGreeting: {
        flex: 1,
    },
    welcomeSubtitle: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.primary,
        letterSpacing: 0.5,
    },
    userName: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginTop: 2,
    },
    levelBadge: {
        backgroundColor: '#DCFCE7',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#BBF7D0',
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignItems: 'center',
    },
    levelLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#15803D',
        letterSpacing: 0.5,
    },
    xpLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#B45309',
    },
    actionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 12,
        marginBottom: 10,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    actionCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    actionCardIconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: '#DCFCE7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    actionCardEmoji: {
        fontSize: 18,
    },
    actionCardTextWrap: {
        flex: 1,
    },
    actionCardTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    actionCardDesc: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginTop: 2,
        lineHeight: 15,
    },
    statsSection: {
        marginBottom: 10,
    },
    sectionHeaderTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statBox: {
        flex: 1,
        minWidth: '46%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingVertical: 10,
        paddingHorizontal: 12,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.textSecondary,
        letterSpacing: 0.5,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginVertical: 2,
    },
    statSub: {
        fontSize: 10,
        color: Colors.textSecondary,
    },
    questCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 12,
        marginBottom: 10,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    questHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    questBadge: {
        backgroundColor: '#DCFCE7',
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    questBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#15803D',
    },
    questXpBadge: {
        fontSize: 11,
        fontWeight: '800',
        color: '#B45309',
    },
    questTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    questDesc: {
        fontSize: 11,
        color: Colors.textSecondary,
        lineHeight: 15,
    },
    recentSection: {
        marginTop: 2,
    },
    recentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    seeAllText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.primary,
    },
    recentItemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 10,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    recentThumb: {
        width: 52,
        height: 52,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
    },
    recentInfo: {
        flex: 1,
        marginLeft: 10,
    },
    recentDesc: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    recentLoc: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginVertical: 2,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 3,
    },
    recentSkeletonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 10,
    },
});
