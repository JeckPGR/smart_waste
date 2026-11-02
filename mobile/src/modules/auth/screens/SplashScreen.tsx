import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/shared/theme/colors';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
    onGetStarted: () => void;
    onLoginPress: () => void;
}

interface SlideItem {
    step: string;
    tag: string;
    title: string;
    description: string;
    accentColor: string;
    bgAccent: string;
    icon: keyof typeof Feather.glyphMap;
    graphicType: 'ai' | 'gps' | 'clean';
}

const SLIDES: SlideItem[] = [
    {
        step: '01',
        tag: 'DETEKSI OTOMATIS',
        title: 'Foto Sampah &\nKlasifikasi AI',
        description:
            'Arahkan kamera ke tumpukan sampah. Model AI MobileNetV2 akurasi 96.7% otomatis mengenali sampah Organik, Plastik, atau Kertas.',
        accentColor: '#10B981',
        bgAccent: '#ECFDF5',
        icon: 'camera',
        graphicType: 'ai',
    },
    {
        step: '02',
        tag: 'LOKASI TEPAT SASARAN',
        title: 'Pelaporan Cepat\nBerbasis GPS',
        description:
            'Titik koordinat disematkan otomatis ke laporan agar satgas kebersihan meluncur tepat ke titik tumpukan tanpa tersesat.',
        accentColor: '#0284C7',
        bgAccent: '#F0F9FF',
        icon: 'map-pin',
        graphicType: 'gps',
    },
    {
        step: '03',
        tag: 'TRANSPARAN & BERSIH',
        title: 'Pantau Status\nHingga Selesai',
        description:
            'Lacak proses pembersihan secara real-time dari status Menunggu, Sedang Diproses, hingga lingkungan kembali asri dan bersih.',
        accentColor: '#8B5CF6',
        bgAccent: '#F5F3FF',
        icon: 'check-circle',
        graphicType: 'clean',
    },
];

export function SplashScreen({ onGetStarted, onLoginPress }: SplashScreenProps) {
    const insets = useSafeAreaInsets();
    const [currentStep, setCurrentStep] = useState(0); // 0, 1, 2, or 3 (Mascot finale)
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Slide transition animation
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Mascot Climax animation
    const mascotScale = useRef(new Animated.Value(0.6)).current;
    const mascotTranslateY = useRef(new Animated.Value(0)).current;
    const mascotOpacity = useRef(new Animated.Value(1)).current;

    // Timer ref for auto-advance every 2.5s
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-advance logic
    useEffect(() => {
        if (currentStep < 3 && !isTransitioning) {
            timerRef.current = setTimeout(() => {
                goToStep(currentStep + 1);
            }, 2500);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [currentStep, isTransitioning]);

    const goToStep = (nextStep: number) => {
        if (isTransitioning) return;
        if (timerRef.current) clearTimeout(timerRef.current);

        setIsTransitioning(true);

        // Animate out current slide
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 180,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -30,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setCurrentStep(nextStep);
            slideAnim.setValue(30);

            if (nextStep === 3) {
                // Trigger Mascot Entrance animation
                mascotScale.setValue(0.5);
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.spring(mascotScale, {
                        toValue: 1,
                        friction: 5,
                        tension: 80,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    setIsTransitioning(false);
                });
            } else {
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 250,
                        useNativeDriver: true,
                    }),
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 250,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    setIsTransitioning(false);
                });
            }
        });
    };

    const handleNext = () => {
        if (currentStep < 3) {
            goToStep(currentStep + 1);
        } else {
            handleMascotFlyUpToLogin();
        }
    };

    const handleSkip = () => {
        goToStep(3);
    };

    // The signature animation: Mascot flies UPWARDS into the exact header position of LoginScreen!
    const handleMascotFlyUpToLogin = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);

        Animated.parallel([
            Animated.timing(mascotTranslateY, {
                toValue: -220,
                duration: 480,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                useNativeDriver: true,
            }),
            Animated.timing(mascotScale, {
                toValue: 0.65,
                duration: 480,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                useNativeDriver: true,
            }),
            Animated.timing(mascotOpacity, {
                toValue: 0.2,
                duration: 480,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onLoginPress();
        });
    };

    const renderSlideGraphic = (type: 'ai' | 'gps' | 'clean', accent: string) => {
        if (type === 'ai') {
            return (
                <View style={[styles.graphicCard, { borderColor: '#A7F3D0' }]}>
                    <View style={styles.viewfinderBox}>
                        <View style={[styles.cornerTL, { borderColor: accent }]} />
                        <View style={[styles.cornerTR, { borderColor: accent }]} />
                        <View style={[styles.cornerBL, { borderColor: accent }]} />
                        <View style={[styles.cornerBR, { borderColor: accent }]} />
                        <View style={styles.cameraIconCenter}>
                            <Feather name="camera" size={38} color={accent} />
                            <View style={styles.aiLaserLine} />
                        </View>
                    </View>
                    <View style={styles.chipRow}>
                        <View style={[styles.chip, { backgroundColor: '#DCFCE7' }]}>
                            <Text style={[styles.chipText, { color: '#15803D' }]}>🌿 Organik</Text>
                        </View>
                        <View style={[styles.chip, { backgroundColor: '#E0F2FE' }]}>
                            <Text style={[styles.chipText, { color: '#0369A1' }]}>🥤 Plastik</Text>
                        </View>
                        <View style={[styles.chip, { backgroundColor: '#FEF3C7' }]}>
                            <Text style={[styles.chipText, { color: '#B45309' }]}>📄 Kertas</Text>
                        </View>
                    </View>
                </View>
            );
        }

        if (type === 'gps') {
            return (
                <View style={[styles.graphicCard, { borderColor: '#BAE6FD' }]}>
                    <View style={styles.radarContainer}>
                        <View style={styles.radarRingOuter} />
                        <View style={styles.radarRingInner} />
                        <View style={[styles.mapPinPulse, { backgroundColor: accent }]}>
                            <Feather name="map-pin" size={26} color="#FFFFFF" />
                        </View>
                    </View>
                    <View style={styles.coordBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.coordText}>GPS Auto-Lock: Akurat ±3 Meter</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={[styles.graphicCard, { borderColor: '#DDD6FE' }]}>
                <View style={styles.timelineBox}>
                    <View style={styles.timelineItem}>
                        <View style={[styles.timelineIcon, { backgroundColor: '#DCFCE7' }]}>
                            <Feather name="upload" size={16} color="#15803D" />
                        </View>
                        <Text style={styles.timelineLabel}>Laporan Terkirim</Text>
                    </View>
                    <View style={styles.timelineConnector} />
                    <View style={styles.timelineItem}>
                        <View style={[styles.timelineIcon, { backgroundColor: '#E0F2FE' }]}>
                            <Feather name="truck" size={16} color="#0284C7" />
                        </View>
                        <Text style={styles.timelineLabel}>Satgas Bergerak</Text>
                    </View>
                    <View style={styles.timelineConnector} />
                    <View style={styles.timelineItem}>
                        <View style={[styles.timelineIcon, { backgroundColor: '#FEF3C7' }]}>
                            <Feather name="check" size={16} color="#B45309" />
                        </View>
                        <Text style={styles.timelineLabel}>Bersih Tuntas</Text>
                    </View>
                </View>
                <View style={styles.verifiedRow}>
                    <Feather name="award" size={16} color="#8B5CF6" />
                    <Text style={styles.verifiedText}>Dapatkan Poin & Pantau Real-Time</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <View
                style={[
                    styles.container,
                    { paddingBottom: Math.max(insets.bottom + 16, 28) },
                ]}
            >
                {/* Top Bar */}
                <View style={styles.topBar}>
                    <View style={styles.brandPill}>
                        <Text style={styles.brandPillText}>🌱 Smart Waste</Text>
                    </View>

                    {currentStep < 3 && (
                        <TouchableOpacity
                            onPress={handleSkip}
                            activeOpacity={0.7}
                            style={styles.skipButton}
                        >
                            <Text style={styles.skipText}>Lewati</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Slides 0 - 2 */}
                {currentStep < 3 ? (
                    <Animated.View
                        style={[
                            styles.contentArea,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateX: slideAnim }],
                            },
                        ]}
                    >
                        {/* Step Pill */}
                        <View
                            style={[
                                styles.stepBadge,
                                {
                                    backgroundColor: SLIDES[currentStep].bgAccent,
                                    borderColor: SLIDES[currentStep].accentColor + '40',
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.stepBadgeText,
                                    { color: SLIDES[currentStep].accentColor },
                                ]}
                            >
                                {SLIDES[currentStep].step} • {SLIDES[currentStep].tag}
                            </Text>
                        </View>

                        {/* Visual Card */}
                        {renderSlideGraphic(
                            SLIDES[currentStep].graphicType,
                            SLIDES[currentStep].accentColor
                        )}

                        {/* Title & Description */}
                        <Text style={styles.slideTitle}>
                            {SLIDES[currentStep].title}
                        </Text>
                        <Text style={styles.slideDesc}>
                            {SLIDES[currentStep].description}
                        </Text>
                    </Animated.View>
                ) : (
                    /* Final Slide: Mascot Welcome & Transition Climax */
                    <Animated.View
                        style={[
                            styles.mascotClimaxArea,
                            {
                                opacity: fadeAnim,
                            },
                        ]}
                    >
                        <Animated.View
                            style={[
                                styles.mascotHeroBox,
                                {
                                    transform: [
                                        { scale: mascotScale },
                                        { translateY: mascotTranslateY },
                                    ],
                                    opacity: mascotOpacity,
                                },
                            ]}
                        >
                            <View style={styles.mascotAura} />
                            <Image
                                source={require('../../../../assets/smart-waste-mascot.png')}
                                style={styles.mascotHeroImage}
                                resizeMode="contain"
                            />
                        </Animated.View>

                        <Text style={styles.climaxTitle}>Selamat Datang!</Text>
                        <Text style={styles.climaxSubtitle}>
                            Saya maskot resmi Smart Waste.{'\n'}Mari bersama wujudkan kota yang bersih, sehat, dan lestari.
                        </Text>

                        <View style={styles.climaxButtonWrap}>
                            <TouchableOpacity
                                style={styles.mascotPrimaryButton}
                                activeOpacity={0.85}
                                onPress={handleMascotFlyUpToLogin}
                            >
                                <Text style={styles.mascotButtonText}>
                                    Masuk ke Akun Sekarang
                                </Text>
                                <Feather name="arrow-right" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}

                {/* Bottom Navigation Bar */}
                {currentStep < 3 && (
                    <View style={styles.bottomBar}>
                        {/* Pagination Dots */}
                        <View style={styles.paginationRow}>
                            {SLIDES.map((_, idx) => {
                                const isActive = idx === currentStep;
                                return (
                                    <View
                                        key={idx}
                                        style={[
                                            styles.dot,
                                            isActive ? styles.dotActive : styles.dotInactive,
                                        ]}
                                    />
                                );
                            })}
                        </View>

                        {/* Next Button */}
                        <TouchableOpacity
                            style={styles.nextButton}
                            activeOpacity={0.85}
                            onPress={handleNext}
                        >
                            <Text style={styles.nextButtonText}>Selanjutnya</Text>
                            <View style={styles.nextIconBox}>
                                <Feather name="arrow-right" size={16} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 8,
        minHeight: 44,
    },
    brandPill: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    brandPillText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
    },
    skipButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    skipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    contentArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
    },
    stepBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 20,
    },
    stepBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.6,
    },
    graphicCard: {
        width: width - 48,
        height: 220,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 14,
        elevation: 3,
        padding: 20,
    },
    // Graphic: AI
    viewfinderBox: {
        width: 110,
        height: 110,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: 16,
    },
    cornerTL: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 18,
        height: 18,
        borderTopWidth: 3,
        borderLeftWidth: 3,
        borderRadius: 3,
    },
    cornerTR: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 18,
        height: 18,
        borderTopWidth: 3,
        borderRightWidth: 3,
        borderRadius: 3,
    },
    cornerBL: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 18,
        height: 18,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
        borderRadius: 3,
    },
    cornerBR: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 18,
        height: 18,
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderRadius: 3,
    },
    cameraIconCenter: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiLaserLine: {
        width: 70,
        height: 2,
        backgroundColor: '#10B981',
        marginTop: 6,
        borderRadius: 1,
        opacity: 0.8,
    },
    chipRow: {
        flexDirection: 'row',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    chipText: {
        fontSize: 11,
        fontWeight: '700',
    },
    // Graphic: GPS
    radarContainer: {
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: 14,
    },
    radarRingOuter: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 1,
        borderColor: '#BAE6FD',
        backgroundColor: '#F0F9FF',
    },
    radarRingInner: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: '#7DD3FC',
    },
    mapPinPulse: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    coordBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#0284C7',
    },
    coordText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#334155',
    },
    // Graphic: Clean
    timelineBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 8,
        marginBottom: 16,
    },
    timelineItem: {
        alignItems: 'center',
        width: 72,
    },
    timelineIcon: {
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    timelineLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#334155',
        textAlign: 'center',
    },
    timelineConnector: {
        flex: 1,
        height: 2,
        backgroundColor: '#E2E8F0',
        marginBottom: 20,
    },
    verifiedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F5F3FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    verifiedText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#7C3AED',
    },
    // Text
    slideTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
        lineHeight: 33,
        letterSpacing: -0.4,
        marginBottom: 10,
    },
    slideDesc: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 21,
        paddingHorizontal: 10,
    },
    // Mascot Climax
    mascotClimaxArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    mascotHeroBox: {
        width: 170,
        height: 170,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    mascotAura: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#DCFCE7',
        opacity: 0.6,
    },
    mascotHeroImage: {
        width: 140,
        height: 140,
    },
    climaxTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0F172A',
        textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    climaxSubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    climaxButtonWrap: {
        width: '100%',
        paddingHorizontal: 10,
    },
    mascotPrimaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#16A34A',
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 4,
    },
    mascotButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    // Bottom Bar
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
    },
    paginationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    dotActive: {
        width: 26,
        backgroundColor: '#16A34A',
    },
    dotInactive: {
        width: 8,
        backgroundColor: '#CBD5E1',
    },
    nextButton: {
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
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    nextIconBox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#15803D',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
