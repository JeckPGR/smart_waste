import React, { useEffect, useState, useCallback } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/shared/theme/colors';
import { DashboardService, LeaderboardUser } from '../services/dashboard.service';

interface LeaderboardScreenProps {
    onBack?: () => void;
}

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const data = await DashboardService.getLeaderboard();
            setLeaderboard(data);
        } catch (err) {
            console.error('Failed to load leaderboard:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const top1 = leaderboard.find((u) => u.rank === 1);
    const top2 = leaderboard.find((u) => u.rank === 2);
    const top3 = leaderboard.find((u) => u.rank === 3);
    const remaining = leaderboard.filter((u) => u.rank >= 4 && u.rank <= 10);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                {onBack ? (
                    <TouchableOpacity
                        onPress={onBack}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.iconBox}>
                        <Ionicons name="trophy" size={20} color={Colors.primary} />
                    </View>
                )}

                <View style={styles.headerTextWrap}>
                    <Text style={styles.headerTitle}>Podium & Peringkat Warga</Text>
                    <Text style={styles.headerSubtitle}>
                        Top 10 Jawara Pembersih Lingkungan
                    </Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Memuat data leaderboard...</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => loadData(true)}
                            colors={[Colors.primary]}
                            tintColor={Colors.primary}
                        />
                    }
                >
                    {/* Mission info banner */}
                    <View style={styles.infoBanner}>
                        <Ionicons name="sparkles" size={16} color={Colors.primary} style={{ marginTop: 1 }} />
                        <Text style={styles.infoBannerText}>
                            Laporkan sampah liar (+50 XP) dan raih bonus (+50 XP) saat laporan berhasil diverifikasi hingga tuntas!
                        </Text>
                    </View>

                    {/* ================= PODIUM SECTION (TOP 1 - 3) ================= */}
                    <View style={styles.podiumContainer}>
                        {/* Rank 2 (Silver - Left) */}
                        <View style={styles.podiumColumn}>
                            {top2 ? (
                                <View style={styles.podiumUserWrap}>
                                    <View style={[styles.avatarWrap, styles.avatarSilver]}>
                                        <Text style={styles.avatarInitials}>
                                            {top2.name.slice(0, 2).toUpperCase()}
                                        </Text>
                                        <View style={[styles.rankMedalBadge, styles.medalSilver]}>
                                            <Text style={styles.medalText}>2</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.podiumName} numberOfLines={1}>
                                        {top2.name}
                                    </Text>
                                    <Text style={styles.podiumLevel}>LVL {top2.level}</Text>
                                    <View style={styles.podiumXpBadge}>
                                        <Text style={styles.podiumXpText}>{top2.xp} XP</Text>
                                    </View>
                                    <View style={styles.podiumMiniStats}>
                                        <Text style={styles.podiumStatItem}>🗑️ {top2.totalReports}</Text>
                                        <Text style={styles.podiumStatItem}>✅ {top2.completedReports}</Text>
                                    </View>
                                </View>
                            ) : null}
                            <View style={[styles.podiumBlock, styles.podiumBlockSilver]}>
                                <Text style={styles.podiumNumberText}>2</Text>
                                <Text style={styles.podiumPedestalSub}>PERAK</Text>
                            </View>
                        </View>

                        {/* Rank 1 (Gold - Center) */}
                        <View style={styles.podiumColumn}>
                            {top1 ? (
                                <View style={styles.podiumUserWrap}>
                                    <View style={styles.crownWrap}>
                                        <Text style={styles.crownEmoji}>👑</Text>
                                    </View>
                                    <View style={[styles.avatarWrap, styles.avatarGold]}>
                                        <Text style={styles.avatarInitialsGold}>
                                            {top1.name.slice(0, 2).toUpperCase()}
                                        </Text>
                                        <View style={[styles.rankMedalBadge, styles.medalGold]}>
                                            <Text style={styles.medalTextGold}>1</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.podiumName, styles.podiumNameGold]} numberOfLines={1}>
                                        {top1.name}
                                    </Text>
                                    <Text style={[styles.podiumLevel, { color: '#B45309' }]}>
                                        LVL {top1.level}
                                    </Text>
                                    <View style={[styles.podiumXpBadge, styles.podiumXpBadgeGold]}>
                                        <Text style={styles.podiumXpTextGold}>{top1.xp} XP</Text>
                                    </View>
                                    <View style={styles.podiumMiniStats}>
                                        <Text style={styles.podiumStatItem}>🗑️ {top1.totalReports}</Text>
                                        <Text style={styles.podiumStatItem}>✅ {top1.completedReports}</Text>
                                    </View>
                                </View>
                            ) : null}
                            <View style={[styles.podiumBlock, styles.podiumBlockGold]}>
                                <Text style={styles.podiumNumberTextGold}>1</Text>
                                <Text style={styles.podiumPedestalSubGold}>EMAS</Text>
                            </View>
                        </View>

                        {/* Rank 3 (Bronze - Right) */}
                        <View style={styles.podiumColumn}>
                            {top3 ? (
                                <View style={styles.podiumUserWrap}>
                                    <View style={[styles.avatarWrap, styles.avatarBronze]}>
                                        <Text style={styles.avatarInitials}>
                                            {top3.name.slice(0, 2).toUpperCase()}
                                        </Text>
                                        <View style={[styles.rankMedalBadge, styles.medalBronze]}>
                                            <Text style={styles.medalText}>3</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.podiumName} numberOfLines={1}>
                                        {top3.name}
                                    </Text>
                                    <Text style={styles.podiumLevel}>LVL {top3.level}</Text>
                                    <View style={styles.podiumXpBadge}>
                                        <Text style={styles.podiumXpText}>{top3.xp} XP</Text>
                                    </View>
                                    <View style={styles.podiumMiniStats}>
                                        <Text style={styles.podiumStatItem}>🗑️ {top3.totalReports}</Text>
                                        <Text style={styles.podiumStatItem}>✅ {top3.completedReports}</Text>
                                    </View>
                                </View>
                            ) : null}
                            <View style={[styles.podiumBlock, styles.podiumBlockBronze]}>
                                <Text style={styles.podiumNumberText}>3</Text>
                                <Text style={styles.podiumPedestalSub}>PERUNGGU</Text>
                            </View>
                        </View>
                    </View>

                    {/* ================= CARDS NYAMPING (RANK 4 - 10) ================= */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Peringkat 4 - 10</Text>
                        <Text style={styles.sectionSubtitle}>Warga Terverifikasi</Text>
                    </View>

                    <View style={styles.cardsList}>
                        {remaining.map((item) => (
                            <View key={item.id} style={styles.sideCard}>
                                {/* Left Rank Number */}
                                <View style={styles.rankPill}>
                                    <Text style={styles.rankPillText}>#{item.rank}</Text>
                                </View>

                                {/* Avatar Initials */}
                                <View style={styles.cardAvatar}>
                                    <Text style={styles.cardAvatarText}>
                                        {item.name.slice(0, 2).toUpperCase()}
                                    </Text>
                                </View>

                                {/* User Info */}
                                <View style={styles.cardUserInfo}>
                                    <Text style={styles.cardUserName} numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                    <View style={styles.cardSubRow}>
                                        <View style={styles.levelTag}>
                                            <Text style={styles.levelTagText}>LVL {item.level}</Text>
                                        </View>
                                        <Text style={styles.wasteStatsText}>
                                            Temuan: <Text style={styles.statBold}>{item.totalReports}</Text> • Selesai: <Text style={styles.statBold}>{item.completedReports}</Text>
                                        </Text>
                                    </View>
                                </View>

                                {/* Right XP Badge */}
                                <View style={styles.cardXpBadge}>
                                    <Ionicons name="flash" size={12} color="#D97706" />
                                    <Text style={styles.cardXpText}>{item.xp} XP</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
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
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 14,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerTextWrap: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    headerSubtitle: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginTop: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    loadingText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 36,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: '#DCFCE7',
        borderWidth: 1,
        borderColor: '#BBF7D0',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    infoBannerText: {
        flex: 1,
        fontSize: 11,
        color: '#15803D',
        lineHeight: 16,
        fontWeight: '500',
    },
    // ================= PODIUM STYLES =================
    podiumContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 10,
        paddingTop: 18,
        paddingBottom: 10,
        marginBottom: 20,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    podiumColumn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    podiumUserWrap: {
        alignItems: 'center',
        marginBottom: 8,
        width: '100%',
        paddingHorizontal: 2,
    },
    crownWrap: {
        marginBottom: -6,
        zIndex: 10,
    },
    crownEmoji: {
        fontSize: 22,
    },
    avatarWrap: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: '#F8FAFC',
        borderWidth: 3,
    },
    avatarGold: {
        width: 62,
        height: 62,
        borderRadius: 31,
        borderColor: '#F59E0B',
        backgroundColor: '#FEF3C7',
    },
    avatarSilver: {
        borderColor: '#94A3B8',
        backgroundColor: '#F1F5F9',
    },
    avatarBronze: {
        borderColor: '#D97706',
        backgroundColor: '#FFEDD5',
    },
    avatarInitials: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    avatarInitialsGold: {
        fontSize: 18,
        fontWeight: '800',
        color: '#B45309',
    },
    rankMedalBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 20,
        height: 20,
        borderRadius: 10,
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
    medalText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    medalTextGold: {
        fontSize: 10,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    podiumName: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginTop: 6,
        textAlign: 'center',
    },
    podiumNameGold: {
        fontSize: 12,
        fontWeight: '800',
        color: '#92400E',
    },
    podiumLevel: {
        fontSize: 10,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginTop: 1,
    },
    podiumXpBadge: {
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginTop: 3,
    },
    podiumXpBadgeGold: {
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    podiumXpText: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    podiumXpTextGold: {
        fontSize: 11,
        fontWeight: '800',
        color: '#B45309',
    },
    podiumMiniStats: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 3,
    },
    podiumStatItem: {
        fontSize: 9,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    // Podium Pedestal Blocks
    podiumBlock: {
        width: '92%',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        paddingVertical: 8,
    },
    podiumBlockGold: {
        height: 100,
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#FDE68A',
        borderBottomWidth: 0,
    },
    podiumBlockSilver: {
        height: 74,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderBottomWidth: 0,
    },
    podiumBlockBronze: {
        height: 56,
        backgroundColor: '#FFEDD5',
        borderWidth: 1,
        borderColor: '#FED7AA',
        borderBottomWidth: 0,
    },
    podiumNumberText: {
        fontSize: 22,
        fontWeight: '900',
        color: '#475569',
    },
    podiumNumberTextGold: {
        fontSize: 26,
        fontWeight: '900',
        color: '#B45309',
    },
    podiumPedestalSub: {
        fontSize: 9,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 0.5,
    },
    podiumPedestalSubGold: {
        fontSize: 9,
        fontWeight: '800',
        color: '#D97706',
        letterSpacing: 0.5,
    },
    // ================= SIDE CARDS (RANK 4 - 10) =================
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    sectionSubtitle: {
        fontSize: 11,
        color: Colors.textSecondary,
    },
    cardsList: {
        gap: 8,
    },
    sideCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
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
    rankPill: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    rankPillText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#475569',
    },
    cardAvatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    cardAvatarText: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    cardUserInfo: {
        flex: 1,
        minWidth: 0,
    },
    cardUserName: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    cardSubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
    },
    levelTag: {
        backgroundColor: '#DCFCE7',
        borderRadius: 4,
        paddingHorizontal: 5,
        paddingVertical: 1,
    },
    levelTagText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#15803D',
    },
    wasteStatsText: {
        fontSize: 10,
        color: '#64748B',
    },
    statBold: {
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    cardXpBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#FDE68A',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginLeft: 6,
    },
    cardXpText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#B45309',
    },
});

