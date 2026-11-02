import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { PixelButton } from '@/shared/components/PixelButton';
import { Colors } from '@/shared/theme/colors';

interface SplashScreenProps {
    onGetStarted: () => void;
    onLoginPress: () => void;
}

export function SplashScreen({ onGetStarted, onLoginPress }: SplashScreenProps) {
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: Math.max(insets.bottom + 20, 40) },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Top Badge */}
                <View style={styles.topBadge}>
                    <Text style={styles.topBadgeText}>Aplikasi Warga Peduli Lingkungan</Text>
                </View>

                {/* Mascot Illustration */}
                <View style={styles.mascotContainer}>
                    <View style={styles.mascotBox}>
                        <Image
                            source={require('../../../../assets/smart-waste-mascot.png')}
                            style={styles.mascotImage}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Hero Title & Subtitle */}
                <View style={styles.heroTextContainer}>
                    <Text style={styles.heroTitle}>Smart Waste</Text>
                    <Text style={styles.heroVersion}>Platform Pelaporan & Daur Ulang Cerdas</Text>
                    <Text style={styles.heroTagline}>
                        Foto tumpukan sampah di sekitar Anda, deteksi otomatis jenisnya dengan AI, dan pantau proses pembersihannya hingga selesai.
                    </Text>
                </View>

                {/* Feature Highlights (Slate Cards with Clean Line Icons) */}
                <View style={styles.featuresContainer}>
                    <View style={styles.featureCard}>
                        <View style={[styles.featureIconBox, { backgroundColor: '#DCFCE7' }]}>
                            <Feather name="camera" size={20} color="#15803D" />
                        </View>
                        <View style={styles.featureTextWrap}>
                            <Text style={styles.featureTitle}>Deteksi AI Cerdas</Text>
                            <Text style={styles.featureDesc}>
                                Kenali otomatis kategori sampah organik, plastik, atau kertas dengan model visi komputer akurat.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.featureCard}>
                        <View style={[styles.featureIconBox, { backgroundColor: '#E0F2FE' }]}>
                            <Feather name="map-pin" size={20} color="#0284C7" />
                        </View>
                        <View style={styles.featureTextWrap}>
                            <Text style={styles.featureTitle}>GPS Presisi Otomatis</Text>
                            <Text style={styles.featureDesc}>
                                Titik koordinat disematkan otomatis agar petugas lapangan tiba tepat di lokasi tumpukan.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.featureCard}>
                        <View style={[styles.featureIconBox, { backgroundColor: '#FEF3C7' }]}>
                            <Feather name="activity" size={20} color="#B45309" />
                        </View>
                        <View style={styles.featureTextWrap}>
                            <Text style={styles.featureTitle}>Pemantauan Real-Time</Text>
                            <Text style={styles.featureDesc}>
                                Riwayat transparan dari status Menunggu, Sedang Diproses, hingga Lingkungan Bersih.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    <PixelButton
                        title="Mulai Sekarang ➔"
                        onPress={onGetStarted}
                        variant="primary"
                        size="lg"
                    />

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={onLoginPress}
                        style={styles.loginLink}
                    >
                        <Text style={styles.loginLinkText}>
                            Sudah punya akun? <Text style={styles.loginLinkBold}>Masuk di sini</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        paddingHorizontal: 22,
        paddingTop: 20,
        alignItems: 'center',
    },
    topBadge: {
        backgroundColor: '#DCFCE7',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginBottom: 20,
    },
    topBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#15803D',
        letterSpacing: 0.2,
    },
    mascotContainer: {
        marginBottom: 16,
    },
    mascotBox: {
        width: 100,
        height: 100,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    mascotImage: {
        width: 80,
        height: 80,
    },
    heroTextContainer: {
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
    },
    heroVersion: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.primary,
        marginTop: 4,
        marginBottom: 8,
    },
    heroTagline: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 19,
    },
    featuresContainer: {
        width: '100%',
        gap: 10,
        marginBottom: 24,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 14,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    featureIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    featureTextWrap: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    featureDesc: {
        fontSize: 12,
        color: Colors.textSecondary,
        lineHeight: 17,
    },
    actionsContainer: {
        width: '100%',
        alignItems: 'center',
        gap: 12,
    },
    loginLink: {
        paddingVertical: 8,
    },
    loginLinkText: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    loginLinkBold: {
        color: Colors.primary,
        fontWeight: '700',
    },
});
