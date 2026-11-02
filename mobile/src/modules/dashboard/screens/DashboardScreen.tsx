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
import { DashboardService, LeaderboardUser, UserDashboardStats } from '../services/dashboard.service';

interface DashboardScreenProps {
    onNavigateCreateReport: () => void;
    onNavigateReportsList: () => void;
    onNavigateDetail: (reportId: string) => void;
    onNavigateLeaderboard?: () => void;
}

export function DashboardScreen({
    onNavigateCreateReport,
    onNavigateReportsList,
    onNavigateDetail,
    onNavigateLeaderboard,
}: DashboardScreenProps) {
    const { user, logout } = useAuth();

    const [stats, setStats] = useState<UserDashboardStats | null>(null);
    const [recentReports, setRecentReports] = useState<Report[]>([]);
    const [topLeaderboard, setTopLeaderboard] = useState<LeaderboardUser[]>([]);
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
            const [statsRes, reportsRes, leaderboardRes] = await Promise.all([
                DashboardService.getMyStats(),
                ReportsService.listMine({ page: 1, limit: 3 }),
                DashboardService.getLeaderboard().catch(() => []),
            ]);
            setStats(statsRes);
            setRecentReports(reportsRes.data);
            setTopLeaderboard(leaderboardRes.slice(0, 3));
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
        setShowLocationDialog(false);
        await LocationService.setPrompted();
    };

    const onRefresh = useCallback(() => {
        loadData(true);
    }, [user]);

    const totalReports = stats?.totalReports || 0;
    const completedReports = stats?.byStatus.COMPLETED || 0;
    const ecoXp = (totalReports * 50) + (completedReports * 50);
    const userLevel = Math.max(1, Math.floor(ecoXp / 150) + 1);

    const rank1 = topLeaderboard.find((u) => u.rank === 1) || topLeaderboard[0];
    const rank2 = topLeaderboard.find((u) => u.rank === 2) || topLeaderboard[1];
    const rank3 = topLeaderboard.find((u) => u.rank === 3) || topLeaderboard[2];

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
                        <Text style={styles.levelLabel}>LVL {userLevel}</Text>
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

                {/* Top 3 Eco Warga & Podium Card */}
                <View style={styles.podiumPreviewCard}>
                    <View style={styles.podiumPreviewHeader}>
                        <View>
                            <View style={styles.podiumBadge}>
                                <Ionicons name="trophy" size={11} color="#B45309" />
                                <Text style={styles.podiumBadgeText}>Top 3 Jawara</Text>
                            </View>
                            <Text style={styles.podiumPreviewTitle}>Peringkat Warga Teraktif</Text>
                        </View>
                        {onNavigateLeaderboard && (
                            <TouchableOpacity
                                onPress={onNavigateLeaderboard}
                                activeOpacity={0.7}
                                style={styles.podiumQuickBtn}
                            >
                                <Text style={styles.podiumQuickBtnText}>Lihat Podium ➔</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Mini Podium Row */}
                    <View style={styles.podiumMiniRow}>
                        {/* Rank 2 (Left) */}
                        <View style={styles.podiumMiniCol}>
                            {rank2 ? (
                                <>
                                    <View style={[styles.miniAvatar, styles.miniAvatarSilver]}>
                                        <Text style={styles.miniAvatarText}>
                                            {rank2.name.slice(0, 2).toUpperCase()}
                                        </Text>
                                        <View style={[styles.miniMedal, styles.medalSilver]}>
                                            <Text style={styles.miniMedalText}>2</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.miniName} numberOfLines={1}>
                                        {rank2.name}
                                    </Text>
                                    <Text style={styles.miniLevel}>LVL {rank2.level}</Text>
                                    <Text style={styles.miniXp}>{rank2.xp} XP</Text>
                                </>
                            ) : (
                                <View style={styles.miniEmptyWrap}>
                                    <View style={[styles.miniAvatar, styles.miniAvatarEmpty]}>
                                        <Text style={styles.miniAvatarTextEmpty}>2</Text>
                                    </View>
                                    <Text style={styles.emptySlotText}>Tersedia</Text>
                                </View>
                            )}
                        </View>

                        {/* Rank 1 (Center - Gold) */}
                        <View style={styles.podiumMiniCol}>
                            {rank1 ? (
                                <>
                                    <Text style={styles.miniCrown}>👑</Text>
                                    <View style={[styles.miniAvatar, styles.miniAvatarGold]}>
                                        <Text style={styles.miniAvatarTextGold}>
                                            {rank1.name.slice(0, 2).toUpperCase()}
                                        </Text>
                                        <View style={[styles.miniMedal, styles.medalGold]}>
                                            <Text style={styles.miniMedalText}>1</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.miniName, styles.miniNameGold]} numberOfLines={1}>
                                        {rank1.name}
                                    </Text>
                                    <Text style={[styles.miniLevel, { color: '#B45309' }]}>
                                        LVL {rank1.level}
                                    </Text>
                                    <Text style={styles.miniXpGold}>{rank1.xp} XP</Text>
                                </>
                            ) : (
                                <View style={styles.miniEmptyWrap}>
                                    <View style={[styles.miniAvatar, styles.miniAvatarEmpty]}>
                                        <Text style={styles.miniAvatarTextEmpty}>1</Text>
                                    </View>
                                    <Text style={styles.emptySlotText}>Tersedia</Text>
                                </View>
                            )}
                        </View>

                        {/* Rank 3 (Right) */}
                        <View style={styles.podiumMiniCol}>
                            {rank3 ? (
                                <>
                                    <View style={[styles.miniAvatar, styles.miniAvatarBronze]}>
                                        <Text style={styles.miniAvatarText}>
                                            {rank3.name.slice(0, 2).toUpperCase()}
                                        </Text>
                                        <View style={[styles.miniMedal, styles.medalBronze]}>
                                            <Text style={styles.miniMedalText}>3</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.miniName} numberOfLines={1}>
                                        {rank3.name}
                                    </Text>
                                    <Text style={styles.miniLevel}>LVL {rank3.level}</Text>
                                    <Text style={styles.miniXp}>{rank3.xp} XP</Text>
                                </>
                            ) : (
                                <View style={styles.miniEmptyWrap}>
                                    <View style={[styles.miniAvatar, styles.miniAvatarEmpty]}>
                                        <Text style={styles.miniAvatarTextEmpty}>3</Text>
                                    </View>
                                    <Text style={styles.emptySlotText}>Tersedia</Text>
                                </View>
                            )}
                        </View>
                    </View>
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
                                        source={{ uri: item.imageUrl }}
                                        style={styles.recentThumb}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.recentInfo}>
                                        <Text style={styles.recentDesc} numberOfLines={1}>
                                            {item.description}
                                        </Text>
                                        <Text style={styles.recentLoc} numberOfLines={1}>
                                            📍 {item.address || `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`}
                                        </Text>
                                        <View style={styles.badgeRow}>
                                            {item.category && <PixelBadge type={item.category} />}
                                            <PixelBadge type={item.status} />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* UX-Friendly Minimalist Slate Location Dialog */}
            <SlateDialog
                visible={showLocationDialog}
                icon={<Ionicons name="location" size={24} color={Colors.primary} />}
                title="Aktifkan Akses Lokasi?"
                description="Smart Waste membutuhkan titik GPS Anda agar petugas dapat menjemput dan menangani tumpukan sampah secara presisi di peta."
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
        paddingTop: 8,
        paddingBottom: 28,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingHorizontal: 2,
    },
    userGreeting: {
        flex: 1,
    },
    welcomeSubtitle: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    userName: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.3,
        marginTop: 2,
    },
    levelBadge: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignItems: 'flex-end',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    levelLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.primary,
        letterSpacing: 0.5,
    },
    xpLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#D97706',
    },
    actionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 14,
        marginBottom: 14,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    actionCardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
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
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: -0.2,
    },
    actionCardDesc: {
        fontSize: 11,
        color: Colors.textSecondary,
        lineHeight: 15,
        marginTop: 2,
    },
    statsSection: {
        marginBottom: 12,
    },
    sectionHeaderTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 8,
        paddingHorizontal: 2,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 6,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingVertical: 10,
        paddingHorizontal: 4,
        alignItems: 'center',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
    },
    statLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    statNumber: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.textPrimary,
    },
    statSub: {
        fontSize: 8,
        color: Colors.textSecondary,
        marginTop: 2,
        textAlign: 'center',
    },
    // ================= PODIUM PREVIEW CARD =================
    podiumPreviewCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 12,
        marginBottom: 12,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    podiumPreviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    podiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FEF3C7',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        alignSelf: 'flex-start',
        marginBottom: 2,
    },
    podiumBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#B45309',
        letterSpacing: 0.3,
    },
    podiumPreviewTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    podiumQuickBtn: {
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    podiumQuickBtnText: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.primaryDark,
    },
    podiumMiniRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingTop: 8,
        paddingHorizontal: 6,
    },
    podiumMiniCol: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: 4,
    },
    miniCrown: {
        fontSize: 15,
        marginBottom: -3,
        zIndex: 5,
    },
    miniAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8FAFC',
        borderWidth: 2.5,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    miniAvatarGold: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderColor: '#F59E0B',
        backgroundColor: '#FEF3C7',
    },
    miniAvatarSilver: {
        borderColor: '#94A3B8',
        backgroundColor: '#F1F5F9',
    },
    miniAvatarBronze: {
        borderColor: '#D97706',
        backgroundColor: '#FFEDD5',
    },
    miniAvatarText: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    miniAvatarTextGold: {
        fontSize: 15,
        fontWeight: '800',
        color: '#B45309',
    },
    miniMedal: {
        position: 'absolute',
        bottom: -3,
        right: -3,
        width: 17,
        height: 17,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    medalGold: {
        backgroundColor: '#F59E0B',
    },
    medalSilver: {
        backgroundColor: '#94A3B8',
    },
    medalBronze: {
        backgroundColor: '#D97706',
    },
    miniMedalText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    miniName: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginTop: 4,
        textAlign: 'center',
    },
    miniNameGold: {
        fontSize: 11,
        fontWeight: '800',
        color: '#92400E',
    },
    miniLevel: {
        fontSize: 9,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    miniXp: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginTop: 1,
    },
    miniXpGold: {
        fontSize: 10,
        fontWeight: '900',
        color: '#B45309',
        marginTop: 1,
    },
    emptySlot: {
        fontSize: 12,
        color: '#CBD5E1',
    },
    miniEmptyWrap: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    miniAvatarEmpty: {
        borderColor: '#CBD5E1',
        borderStyle: 'dashed',
        backgroundColor: '#F8FAFC',
    },
    miniAvatarTextEmpty: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
    },
    emptySlotText: {
        fontSize: 9,
        fontWeight: '600',
        color: '#94A3B8',
        marginTop: 3,
        textAlign: 'center',
    },
    // Quest card
    questCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 12,
        marginBottom: 14,
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
