import React, { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PixelButton } from '@/shared/components/PixelButton';
import { PixelInput } from '@/shared/components/PixelInput';
import { Colors } from '@/shared/theme/colors';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
    onNavigateRegister: () => void;
}

export function LoginScreen({ onNavigateRegister }: LoginScreenProps) {
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            setError('Email dan kata sandi wajib diisi');
            return;
        }

        setError(null);
        setLoading(true);

        try {
            await login({ email: email.trim(), password });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login gagal');
        } finally {
            setLoading(false);
        }
    };

    const handleFillDemoUser = () => {
        setEmail('warga@smartwaste.id');
        setPassword('Warga123!');
        setError(null);
    };

    const handleFillDemoAdmin = () => {
        setEmail('admin@smartwaste.id');
        setPassword('Admin123!');
        setError(null);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Brand */}
                    <View style={styles.header}>
                        <View style={styles.mascotBox}>
                            <Image
                                source={require('../../../../assets/smart-waste-mascot.png')}
                                style={styles.mascotImage}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.appTitle}>Masuk ke Akun</Text>
                        <Text style={styles.subtitle}>
                            Silakan masukkan kredensial akun Anda untuk melanjutkan.
                        </Text>
                    </View>

                    {/* Login Card */}
                    <View style={styles.card}>
                        {error && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>⚠ {error}</Text>
                            </View>
                        )}

                        <PixelInput
                            label="Alamat Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="nama@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <PixelInput
                            label="Kata Sandi"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            secureTextEntry
                        />

                        <View style={styles.actionWrap}>
                            <PixelButton
                                title="Masuk Sekarang ➔"
                                onPress={handleLogin}
                                variant="primary"
                                size="md"
                                loading={loading}
                            />
                        </View>

                        {/* Demo Accounts */}
                        <View style={styles.demoSection}>
                            <Text style={styles.demoTitle}>Akun Demo Cepat (1-Klik):</Text>
                            <View style={styles.demoButtonsRow}>
                                <View style={styles.demoButtonWrap}>
                                    <PixelButton
                                        title="👤 Demo Warga"
                                        onPress={handleFillDemoUser}
                                        variant="secondary"
                                        size="sm"
                                    />
                                </View>
                                <View style={styles.demoButtonWrap}>
                                    <PixelButton
                                        title="🛡️ Demo Admin"
                                        onPress={handleFillDemoAdmin}
                                        variant="secondary"
                                        size="sm"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Register Link */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={onNavigateRegister}
                        style={styles.registerLink}
                    >
                        <Text style={styles.registerText}>
                            Belum memiliki akun? <Text style={styles.registerBold}>Daftar warga baru</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 22,
        paddingTop: 24,
        paddingBottom: 40,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    mascotBox: {
        width: 72,
        height: 72,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    mascotImage: {
        width: 52,
        height: 52,
    },
    appTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.3,
    },
    subtitle: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
        marginTop: 4,
        paddingHorizontal: 12,
    },
    card: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 20,
        marginBottom: 16,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    errorBox: {
        backgroundColor: '#FFE4E6',
        borderWidth: 1,
        borderColor: '#FECDD3',
        borderRadius: 10,
        padding: 10,
        marginBottom: 14,
    },
    errorText: {
        fontSize: 12,
        color: Colors.danger,
        fontWeight: '600',
    },
    actionWrap: {
        marginTop: 6,
    },
    demoSection: {
        marginTop: 18,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    demoTitle: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 10,
    },
    demoButtonsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    demoButtonWrap: {
        flex: 1,
    },
    registerLink: {
        paddingVertical: 10,
        marginBottom: 12,
    },
    registerText: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    registerBold: {
        color: Colors.primary,
        fontWeight: '700',
    },
});
