import React, { useRef, useState } from 'react';
import {
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/shared/theme/colors';

interface SplashScreenProps {
    onGetStarted: () => void;
    onLoginPress: () => void;
}

interface SlideItem {
    id: string;
    tag?: string;
    title: string;
    description: string;
    isWelcome?: boolean;
    iconName?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    iconBg?: string;
}

export function SplashScreen({ onGetStarted, onLoginPress }: SplashScreenProps) {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<FlatList>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const slides: SlideItem[] = [
        {
            id: 'slide-1',
            tag: 'Langkah 1',
            title: 'Foto Sampah di Sekitar',
            description:
                'Cukup ambil foto tumpukan sampah liar yang Anda temukan. Sistem pintar akan langsung mengenali jenis sampahnya.',
            iconName: 'camera',
            iconColor: '#16A34A',
            iconBg: '#DCFCE7',
        },
        {
            id: 'slide-2',
            tag: 'Langkah 2',
            title: 'Lokasi Otomatis Terdeteksi',
            description:
                'Titik lokasi disematkan otomatis pada laporan Anda, sehingga petugas kebersihan dapat segera datang ke lokasi.',
            iconName: 'location',
            iconColor: '#0284C7',
            iconBg: '#E0F2FE',
        },
        {
            id: 'slide-3',
            tag: 'Langkah 3',
            title: 'Pantau Sampai Bersih',
            description:
                'Ikuti pembaruan status laporan secara langsung hingga sampah selesai dibersihkan dan lingkungan kembali asri.',
            iconName: 'sparkles',
            iconColor: '#D97706',
            iconBg: '#FEF3C7',
        },
        {
            id: 'welcome',
            isWelcome: true,
            title: 'Selamat Datang di\nSmart Waste',
            description:
                'Bersama kita wujudkan lingkungan yang bersih, sehat, dan nyaman untuk semua warga.',
        },
    ];

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollOffset / width);
        if (index !== activeIndex && index >= 0 && index < slides.length) {
            setActiveIndex(index);
        }
    };

    const handleNext = () => {
        if (activeIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: activeIndex + 1,
                animated: true,
            });
        } else {
            onLoginPress();
        }
    };

    const handleSkip = () => {
        flatListRef.current?.scrollToIndex({
            index: slides.length - 1,
            animated: true,
        });
    };

    const renderSlide = ({ item }: { item: SlideItem }) => {
        if (item.isWelcome) {
            return (
                <View style={[styles.slideContainer, { width }]}>
                    <View style={styles.welcomeCenterWrap}>
                        <View style={styles.mascotAuraCircle}>
                            <Image
                                source={require('../../../../assets/smart-waste-mascot.png')}
                                style={styles.mascotImage}
                                resizeMode="contain"
                            />
                        </View>

                        <Text style={styles.welcomeTitle}>{item.title}</Text>
                        <Text style={styles.welcomeDesc}>{item.description}</Text>

                        <TouchableOpacity
                            style={styles.welcomeButton}
                            activeOpacity={0.85}
                            onPress={onLoginPress}
                        >
                            <Text style={styles.welcomeButtonText}>Mulai Sekarang</Text>
                            <Feather name="arrow-right" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return (
            <View style={[styles.slideContainer, { width }]}>
                <View style={styles.stepContentWrap}>
                    {/* Tag Langkah */}
                    {item.tag && (
                        <View style={styles.tagBadge}>
                            <Text style={styles.tagText}>{item.tag}</Text>
                        </View>
                    )}

                    {/* Major Hero Icon (Tanpa Kotak Container yang Ramai) */}
                    <View
                        style={[
                            styles.heroIconCircle,
                            { backgroundColor: item.iconBg },
                        ]}
                    >
                        {item.iconName && (
                            <Ionicons
                                name={item.iconName}
                                size={56}
                                color={item.iconColor}
                            />
                        )}
                    </View>

                    {/* Judul & Deskripsi Sederhana Bahasa User */}
                    <Text style={styles.slideTitle}>{item.title}</Text>
                    <Text style={styles.slideDesc}>{item.description}</Text>
                </View>
            </View>
        );
    };

    const isLastSlide = activeIndex === slides.length - 1;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <View
                style={[
                    styles.root,
                    { paddingBottom: Math.max(insets.bottom + 16, 28) },
                ]}
            >
                {/* Header Atas: Bersih & Minimalis */}
                <View style={styles.headerRow}>
                    <View style={styles.appBrandWrap}>
                        <Text style={styles.appBrandText}>🌱 Smart Waste</Text>
                    </View>

                    {!isLastSlide && (
                        <TouchableOpacity
                            onPress={handleSkip}
                            activeOpacity={0.7}
                            style={styles.skipBtn}
                        >
                            <Text style={styles.skipText}>Lewati</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Carousel Paging */}
                <FlatList
                    ref={flatListRef}
                    data={slides}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    renderItem={renderSlide}
                    style={styles.carouselList}
                />

                {/* Navigasi Bawah (Hanya untuk Langkah 1-3) */}
                {!isLastSlide ? (
                    <View style={styles.bottomNavRow}>
                        {/* Indikator Titik Halaman */}
                        <View style={styles.indicatorWrap}>
                            {slides.slice(0, 3).map((_, idx) => {
                                const isActive = idx === activeIndex;
                                return (
                                    <View
                                        key={idx}
                                        style={[
                                            styles.indicatorDot,
                                            isActive
                                                ? styles.indicatorDotActive
                                                : styles.indicatorDotInactive,
                                        ]}
                                    />
                                );
                            })}
                        </View>

                        {/* Tombol Selanjutnya */}
                        <TouchableOpacity
                            style={styles.nextBtn}
                            activeOpacity={0.85}
                            onPress={handleNext}
                        >
                            <Text style={styles.nextBtnText}>Selanjutnya</Text>
                            <Feather name="arrow-right" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.bottomPlaceholder} />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    root: {
        flex: 1,
        justifyContent: 'space-between',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 8,
        minHeight: 44,
    },
    appBrandWrap: {
        paddingVertical: 6,
    },
    appBrandText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.2,
    },
    skipBtn: {
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    skipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    carouselList: {
        flex: 1,
    },
    slideContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    stepContentWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    tagBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 28,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
        letterSpacing: 0.2,
    },
    heroIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 36,
    },
    slideTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
        letterSpacing: -0.3,
        marginBottom: 12,
        lineHeight: 32,
    },
    slideDesc: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 8,
    },
    // Halaman Selamat Datang (Presisi di Tengah Layar)
    welcomeCenterWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 20,
    },
    mascotAuraCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#DCFCE7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
    },
    mascotImage: {
        width: 100,
        height: 100,
    },
    welcomeTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#0F172A',
        textAlign: 'center',
        letterSpacing: -0.4,
        lineHeight: 34,
        marginBottom: 12,
    },
    welcomeDesc: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 12,
        marginBottom: 36,
    },
    welcomeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#16A34A',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 3,
    },
    welcomeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    // Bottom Bar
    bottomNavRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 12,
    },
    indicatorWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    indicatorDot: {
        height: 8,
        borderRadius: 4,
    },
    indicatorDotActive: {
        width: 24,
        backgroundColor: '#16A34A',
    },
    indicatorDotInactive: {
        width: 8,
        backgroundColor: '#E2E8F0',
    },
    nextBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#16A34A',
        paddingVertical: 12,
        paddingLeft: 18,
        paddingRight: 14,
        borderRadius: 24,
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    nextBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    bottomPlaceholder: {
        height: 12,
    },
});
