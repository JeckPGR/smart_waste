import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { PixelButton } from '@/shared/components/PixelButton';
import { PixelCard } from '@/shared/components/PixelCard';
import { SlateDialog } from '@/shared/components/SlateDialog';
import { Colors } from '@/shared/theme/colors';

export function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const { user, logout } = useAuth();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const handleConfirmLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setLoggingOut(false);
            setShowLogoutDialog(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTag}>Pengaturan Akun</Text>
                    <Text style={styles.headerTitle}>Profil & Preferensi Warga</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: 24 },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Hero Card */}
                <View style={styles.profileHeroCard}>
                    <View style={styles.avatarBox}>
                        <Feather name="user" size={32} color={Colors.primary} />
                    </View>
                    <Text style={styles.profileName}>{user?.name || 'Warga'}</Text>
                    <Text style={styles.profileEmail}>{user?.email}</Text>
                    <View style={styles.roleTag}>
                        <Text style={styles.roleTagText}>Peran: {user?.role || 'USER'}</Text>
                    </View>
                </View>

                {/* Citizen Stats Card */}
                <PixelCard
                    badgeText="Status Eco Warga"
                    title="Pencapaian Lingkungan"
                    subtitle="Terus laporkan tumpukan sampah untuk menaikkan level"
                >
                    <View style={styles.ecoRow}>
                        <View style={styles.ecoItem}>
                            <Text style={styles.ecoNum}>LVL 1</Text>
                            <Text style={styles.ecoDesc}>Pangkat Warga</Text>
                        </View>
                        <View style={styles.ecoItem}>
                            <Text style={[styles.ecoNum, { color: Colors.primary }]}>AKTIF</Text>
                            <Text style={styles.ecoDesc}>Status Akun</Text>
                        </View>
                        <View style={styles.ecoItem}>
                            <Text style={[styles.ecoNum, { color: Colors.pixelGold }]}>100 XP</Text>
                            <Text style={styles.ecoDesc}>Eco XP</Text>
                        </View>
                    </View>
                </PixelCard>

                {/* Contact Info Card */}
                <PixelCard
                    badgeText="Informasi Kontak"
                    title="Rincian Pribadi"
                >
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Nama Lengkap</Text>
                        <Text style={styles.infoVal}>{user?.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email Terdaftar</Text>
                        <Text style={styles.infoVal}>{user?.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Nomor Telepon</Text>
                        <Text style={styles.infoVal}>{user?.phone || 'Belum diisi'}</Text>
                    </View>
                </PixelCard>

                {/* Logout Button */}
                <View style={styles.logoutWrap}>
                    <PixelButton
                        title="Keluar dari Akun"
                        onPress={() => setShowLogoutDialog(true)}
                        variant="danger"
                        size="md"
                        icon={<Feather name="log-out" size={16} color="#FFFFFF" />}
                    />
                </View>
            </ScrollView>

            {/* Minimalist Slate Logout Dialog */}
            <SlateDialog
                visible={showLogoutDialog}
                icon={<Feather name="log-out" size={22} color={Colors.danger} />}
                title="Keluar dari Akun?"
                description="Anda akan keluar dari aplikasi Smart Waste. Anda bisa kembali dengan kredensial akun yang sama"
                confirmText="Ya, Keluar"
                cancelText="Batal"
                isDestructive
                loading={loggingOut}
                onConfirm={handleConfirmLogout}
                onCancel={() => setShowLogoutDialog(false)}
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
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerTag: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.primary,
        letterSpacing: 0.8,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginTop: 2,
    },
    scrollContent: {
        padding: 18,
    },
    profileHeroCard: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingVertical: 22,
        paddingHorizontal: 16,
        marginBottom: 14,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    avatarBox: {
        width: 64,
        height: 64,
        backgroundColor: '#DCFCE7',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    profileEmail: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    roleTag: {
        backgroundColor: '#F1F5F9',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginTop: 8,
    },
    roleTagText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#475569',
    },
    ecoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 4,
    },
    ecoItem: {
        alignItems: 'center',
        flex: 1,
    },
    ecoNum: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.textPrimary,
    },
    ecoDesc: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    infoLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    infoVal: {
        fontSize: 12,
        color: Colors.textPrimary,
        fontWeight: '600',
    },
    logoutWrap: {
        marginTop: 10,
        marginBottom: 20,
    },
});
