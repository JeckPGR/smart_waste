import React, { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PixelButton } from '@/shared/components/PixelButton';
import { PixelInput } from '@/shared/components/PixelInput';
import { Colors } from '@/shared/theme/colors';
import { useAuth } from '../context/AuthContext';

interface RegisterScreenProps {
    onNavigateLogin: () => void;
    onRegisterSuccess?: (email: string) => void;
}

export function RegisterScreen({ onNavigateLogin, onRegisterSuccess }: RegisterScreenProps) {
    const { register } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async () => {
        if (!name.trim()) {
            setError('Nama lengkap wajib diisi');
            return;
        }
        if (!email.trim()) {
            setError('Email wajib diisi');
            return;
        }
        if (password.length < 8) {
            setError('Kata sandi minimal 8 karakter');
            return;
        }
        if (password !== confirmPassword) {
            setError('Konfirmasi kata sandi tidak cocok');
            return;
        }

        setError(null);
        setLoading(true);

        try {
            await register({
                name: name.trim(),
                email: email.trim(),
                password,
                phone: phone.trim() || undefined,
            });

            if (Platform.OS === 'android') {
                ToastAndroid.show('Akun berhasil terbuat! Silakan login untuk melanjutkan.', ToastAndroid.LONG);
            }

            if (onRegisterSuccess) {
                onRegisterSuccess(email.trim());
            } else {
                onNavigateLogin();
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Registrasi gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.mascotBox}>
                            <Image
                                source={require('../../../../assets/smart-waste-mascot.png')}
                                style={styles.mascotImage}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.appTitle}>Daftar Warga Baru</Text>
                        <Text style={styles.subtitle}>
                            Bergabung bersama komunitas warga untuk menjaga kebersihan dan kelestarian lingkungan kita.
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.card}>
                        {error && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>⚠ {error}</Text>
                            </View>
                        )}

                        <PixelInput
                            label="Nama Lengkap"
                            value={name}
                            onChangeText={setName}
                            placeholder="Contoh: Budi Santoso"
                        />

                        <PixelInput
                            label="Alamat Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="nama@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <PixelInput
                            label="Nomor Telepon (Opsional)"
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="081234567890"
                            keyboardType="phone-pad"
                        />

                        <PixelInput
                            label="Kata Sandi (Min. 8 karakter)"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            secureTextEntry
                        />

                        <PixelInput
                            label="Konfirmasi Kata Sandi"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="••••••••"
                            secureTextEntry
                        />

                        <View style={styles.actionWrap}>
                            <PixelButton
                                title="Daftar Akun Baru"
                                onPress={handleRegister}
                                variant="primary"
                                size="md"
                                loading={loading}
                            />
                        </View>
                    </View>

                    {/* Back to Login */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={onNavigateLogin}
                        style={styles.loginLink}
                    >
                        <Text style={styles.loginText}>
                            Sudah memiliki akun? <Text style={styles.loginBold}>Masuk di sini</Text>
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
        width: 68,
        height: 68,
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
        width: 48,
        height: 48,
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
        paddingHorizontal: 16,
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
        marginTop: 8,
    },
    loginLink: {
        paddingVertical: 8,
        marginBottom: 12,
    },
    loginText: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    loginBold: {
        color: Colors.primary,
        fontWeight: '700',
    },
});
