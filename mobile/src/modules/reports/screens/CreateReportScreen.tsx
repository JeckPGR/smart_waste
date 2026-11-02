import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { PixelBadge } from '@/shared/components/PixelBadge';
import { PixelButton } from '@/shared/components/PixelButton';
import { PixelCard } from '@/shared/components/PixelCard';
import { PixelInput } from '@/shared/components/PixelInput';
import { LocationService } from '@/shared/services/location.service';
import { Colors } from '@/shared/theme/colors';
import { ReportsService, WasteCategory } from '../services/reports.service';

interface CreateReportScreenProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function CreateReportScreen({ onSuccess, onCancel }: CreateReportScreenProps) {
    const insets = useSafeAreaInsets();
    const cachedLoc = LocationService.getCachedLocation();

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<WasteCategory>('ORGANIC');
    const [latitude, setLatitude] = useState(cachedLoc?.latitude || '-6.208800');
    const [longitude, setLongitude] = useState(cachedLoc?.longitude || '106.845600');
    const [address, setAddress] = useState(cachedLoc?.address || '');

    // AI Detection state
    const [isAiDetecting, setIsAiDetecting] = useState(false);
    const [aiResult, setAiResult] = useState<{ label: string; confidence: number } | null>(null);

    // Location loading state
    const [isLocating, setIsLocating] = useState(false);

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-fetch fresh GPS location in background on mount if available
    useEffect(() => {
        LocationService.fetchCurrentLocation().then((loc) => {
            if (loc) {
                setLatitude(loc.latitude);
                setLongitude(loc.longitude);
                if (loc.address) setAddress(loc.address);
            }
        });

        // Pulihkan foto jika Activity Android sempat reload oleh OS (misal saat kamera/QR memicu low-memory)
        ImagePicker.getPendingResultAsync().then((pending) => {
            if (pending && !('canceled' in pending && pending.canceled) && 'assets' in pending && pending.assets && pending.assets.length > 0) {
                setImageUri(pending.assets[0].uri);
                setAiResult(null);
                setError(null);
            }
        }).catch(() => { });
    }, []);

    // Image Picker - Camera (Full capture, 0.7 quality to prevent Android LMK reload)
    const handlePickCamera = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Izin Kamera', 'Izin kamera diperlukan untuk mengambil foto sampah');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: 0.7,
                allowsEditing: false,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                setImageUri(result.assets[0].uri);
                setAiResult(null);
                setError(null);
            }
        } catch (err: unknown) {
            Alert.alert('Kamera', 'Gagal membuka kamera: ' + (err instanceof Error ? err.message : String(err)));
        }
    };

    // Image Picker - Gallery (Full image without forced crop)
    const handlePickGallery = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Izin Galeri', 'Izin galeri diperlukan untuk memilih foto sampah');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.7,
                allowsEditing: false,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                setImageUri(result.assets[0].uri);
                setAiResult(null);
                setError(null);
            }
        } catch (err: unknown) {
            Alert.alert('Galeri', 'Gagal membuka galeri: ' + (err instanceof Error ? err.message : String(err)));
        }
    };

    // Helper: Convert URI to standard Blob with explicit image MIME type
    const uriToBlob = async (uri: string): Promise<Blob> => {
        const ext = uri.split('.').pop()?.toLowerCase();
        let mime = 'image/jpeg';
        if (ext === 'png') mime = 'image/png';
        else if (ext === 'webp') mime = 'image/webp';

        try {
            // Gunakan XMLHttpRequest untuk membaca file lokal Android secara stabil
            const blobFromXhr = await new Promise<Blob>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = () => {
                    const res = xhr.response as Blob;
                    if (res && res.size > 200) {
                        resolve(res.slice(0, res.size, mime));
                    } else {
                        reject(new Error('Ukuran foto tidak valid'));
                    }
                };
                xhr.onerror = () => reject(new Error('XHR gagal membaca file'));
                xhr.responseType = 'blob';
                xhr.open('GET', uri, true);
                xhr.send(null);
            });
            return blobFromXhr;
        } catch {
            // Fallback via fetch standar
            const response = await fetch(uri);
            const blob = await response.blob();
            return blob.slice(0, blob.size, mime);
        }
    };

    // AI Detection
    const handleDetectAi = async () => {
        if (!imageUri) {
            Alert.alert('Foto Kosong', 'Ambil atau pilih foto sampah terlebih dahulu.');
            return;
        }

        setIsAiDetecting(true);
        setError(null);

        try {
            const blob = await uriToBlob(imageUri);
            if (!blob || blob.size < 500) {
                throw new Error('File foto tidak valid atau gagal dibaca dari memori HP. Silakan potret ulang.');
            }

            const ext = imageUri.split('.').pop()?.toLowerCase();
            const validExt = ext === 'png' || ext === 'webp' ? ext : 'jpg';
            const filename = `waste_${Date.now()}.${validExt}`;

            const formData = new FormData();
            formData.append('image', blob, filename);

            const res = await ReportsService.predictAi(formData);
            setCategory(res.category);
            setAiResult({
                label: res.label,
                confidence: res.confidence,
            });
            Alert.alert(
                'AI Berhasil Mendeteksi',
                `Kategori terdeteksi: ${res.category} (${(res.confidence * 100).toFixed(0)}% akurasi)`,
            );
        } catch (err: unknown) {
            Alert.alert('Gagal Deteksi AI', err instanceof Error ? err.message : 'Koneksi ke modul AI gagal.');
        } finally {
            setIsAiDetecting(false);
        }
    };

    // GPS Location Fetch
    const handleGetGps = async () => {
        setIsLocating(true);
        try {
            const hasPerm = await LocationService.requestPermission();
            if (!hasPerm) {
                Alert.alert('Izin Lokasi', 'Izin lokasi diperlukan untuk mendapatkan titik koordinat akurat.');
                setIsLocating(false);
                return;
            }

            const loc = await LocationService.fetchCurrentLocation();
            if (loc) {
                setLatitude(loc.latitude);
                setLongitude(loc.longitude);
                if (loc.address) setAddress(loc.address);
            } else {
                Alert.alert('Gagal Deteksi Lokasi', 'Lokasi GPS tidak dapat diperoleh. Pastikan GPS aktif.');
            }
        } catch (err: unknown) {
            Alert.alert('Gagal Deteksi Lokasi', err instanceof Error ? err.message : 'Lokasi GPS tidak dapat diperoleh.');
        } finally {
            setIsLocating(false);
        }
    };

    // Submit Report
    const handleSubmit = async () => {
        if (!imageUri) {
            setError('Foto sampah wajib diunggah.');
            return;
        }
        const latNum = parseFloat(latitude);
        const lngNum = parseFloat(longitude);
        if (isNaN(latNum) || isNaN(lngNum)) {
            setError('Koordinat lokasi tidak valid.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const blob = await uriToBlob(imageUri);
            if (!blob || blob.size < 500) {
                throw new Error('File foto tidak valid atau gagal dibaca dari memori HP. Silakan potret ulang.');
            }

            const ext = imageUri.split('.').pop()?.toLowerCase();
            const validExt = ext === 'png' || ext === 'webp' ? ext : 'jpg';
            const filename = `waste_report_${Date.now()}.${validExt}`;

            const catLabel = category === 'ORGANIC' ? 'Organik' : category === 'PLASTIC' ? 'Plastik' : 'Kertas';
            const finalDescription = description.trim() || `Laporan Sampah ${catLabel}`;

            const formData = new FormData();
            formData.append('image', blob, filename);
            formData.append('description', finalDescription);
            formData.append('category', category);
            formData.append('latitude', latNum.toString());
            formData.append('longitude', lngNum.toString());
            if (address.trim()) formData.append('address', address.trim());
            if (aiResult) formData.append('aiConfidence', aiResult.confidence.toString());

            await ReportsService.create(formData);
            Alert.alert('Sukses', 'Laporan sampah Anda berhasil dikirim ke sistem.');
            onSuccess();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Gagal mengirim laporan sampah.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onCancel} style={styles.backButton} activeOpacity={0.7}>
                        <Text style={styles.backText}>Batal</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Buat Laporan Baru</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: Math.max(insets.bottom + 40, 80) },
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    {error && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>⚠ {error}</Text>
                        </View>
                    )}

                    {/* Step 1: Foto Sampah (Wajib) */}
                    <PixelCard
                        badgeText="Langkah 1 dari 3"
                        title="Foto Tumpukan Sampah"
                        required
                        subtitle="Ambil foto langsung atau pilih dari galeri HP Anda"
                    >
                        {imageUri ? (
                            <View style={styles.imagePreviewWrap}>
                                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                                <View style={styles.imageActionsRow}>
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        <PixelButton
                                            title="Ganti Foto"
                                            onPress={handlePickCamera}
                                            variant="secondary"
                                            size="sm"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <PixelButton
                                            title={isAiDetecting ? 'Menganalisis...' : 'Deteksi AI'}
                                            onPress={handleDetectAi}
                                            variant="primary"
                                            size="sm"
                                            loading={isAiDetecting}
                                        />
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.photoPickerBox}>
                                <Text style={styles.photoPickerTitle}>Unggah Foto Sampah</Text>
                                <Text style={styles.photoPickerSub}>Format JPG, PNG, atau WEBP</Text>
                                <View style={styles.photoPickerButtons}>
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        <PixelButton
                                            title="Kamera"
                                            onPress={handlePickCamera}
                                            variant="primary"
                                            size="sm"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <PixelButton
                                            title="Galeri"
                                            onPress={handlePickGallery}
                                            variant="secondary"
                                            size="sm"
                                        />
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* AI Detection Banner */}
                        {aiResult && (
                            <View style={styles.aiBadgeBox}>
                                <Text style={styles.aiBadgeTitle}>Hasil Deteksi AI:</Text>
                                <Text style={styles.aiBadgeDesc}>
                                    Sampah dikenali sebagai <Text style={{ fontWeight: '700' }}>{aiResult.label}</Text> dengan keyakinan{' '}
                                    <Text style={{ fontWeight: '700' }}>{(aiResult.confidence * 100).toFixed(0)}%</Text>.
                                </Text>
                            </View>
                        )}
                    </PixelCard>

                    {/* Step 2: Kategori Sampah (Wajib) */}
                    <PixelCard
                        badgeText="Langkah 2 dari 3"
                        title="Pilih Kategori Sampah"
                        required
                        subtitle="Kategori otomatis terisi jika menggunakan deteksi AI"
                    >
                        <View style={styles.categoryRow}>
                            {(['ORGANIC', 'PLASTIC', 'PAPER'] as const).map((catKey) => {
                                const isSelected = category === catKey;
                                const label = catKey === 'ORGANIC' ? 'Organik' : catKey === 'PLASTIC' ? 'Plastik' : 'Kertas';
                                return (
                                    <TouchableOpacity
                                        key={catKey}
                                        activeOpacity={0.8}
                                        onPress={() => setCategory(catKey)}
                                        style={[
                                            styles.categoryBtn,
                                            isSelected && styles.categoryBtnActive,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryBtnText,
                                                isSelected && styles.categoryBtnTextActive,
                                            ]}
                                        >
                                            {label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </PixelCard>

                    {/* Step 3: Lokasi & Deskripsi */}
                    <PixelCard
                        badgeText="Langkah 3 dari 3"
                        title="Lokasi & Deskripsi"
                        subtitle="Pastikan titik koordinat dan rincian lokasi jelas"
                    >
                        <View style={styles.locationSection}>
                            <View style={styles.coordsRow}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <PixelInput
                                        label="Latitude"
                                        required
                                        value={latitude}
                                        onChangeText={setLatitude}
                                        placeholder="-6.208800"
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <PixelInput
                                        label="Longitude"
                                        required
                                        value={longitude}
                                        onChangeText={setLongitude}
                                        placeholder="106.845600"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View style={{ marginBottom: 12 }}>
                                <PixelButton
                                    title={isLocating ? 'Mendapatkan Lokasi...' : 'Ambil Titik Lokasi GPS'}
                                    onPress={handleGetGps}
                                    variant="secondary"
                                    size="sm"
                                    loading={isLocating}
                                />
                            </View>

                            {/* Alamat dibuat tinggi satu tingkat / 2 baris multiline */}
                            <PixelInput
                                label="Alamat / Patokan Lokasi (Opsional)"
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Contoh: Jl. Merdeka No. 12, dekat tiang listrik"
                                multiline
                                numberOfLines={2}
                                wrapperStyle={{ minHeight: 64 }}
                                style={{ minHeight: 48 }}
                            />

                            {/* Deskripsi Sampah Opsional */}
                            <PixelInput
                                label="Deskripsi Sampah (Opsional)"
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Jelaskan kondisi tumpukan sampah secara singkat..."
                                multiline
                                numberOfLines={3}
                                wrapperStyle={{ minHeight: 88 }}
                                style={{ minHeight: 68 }}
                            />
                        </View>
                    </PixelCard>

                    {/* Submit Button */}
                    <View style={styles.submitWrap}>
                        <PixelButton
                            title="Kirim Laporan Sampah"
                            onPress={handleSubmit}
                            variant="primary"
                            size="lg"
                            loading={submitting}
                        />
                    </View>
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
    backButton: {
        paddingVertical: 4,
    },
    backText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    scrollContent: {
        paddingHorizontal: 18,
        paddingTop: 16,
    },
    errorBox: {
        backgroundColor: '#FFE4E6',
        borderWidth: 1,
        borderColor: '#FECDD3',
        borderRadius: 12,
        padding: 12,
        marginBottom: 14,
    },
    errorText: {
        fontSize: 12,
        color: Colors.danger,
        fontWeight: '600',
    },
    photoPickerBox: {
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: '#CBD5E1',
        borderRadius: 16,
        paddingVertical: 24,
        paddingHorizontal: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
    },
    photoPickerTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    photoPickerSub: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginTop: 2,
        marginBottom: 14,
    },
    photoPickerButtons: {
        flexDirection: 'row',
        width: '100%',
    },
    imagePreviewWrap: {
        width: '100%',
    },
    imagePreview: {
        width: '100%',
        height: 190,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 12,
    },
    imageActionsRow: {
        flexDirection: 'row',
    },
    aiBadgeBox: {
        marginTop: 12,
        backgroundColor: '#DCFCE7',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#BBF7D0',
        padding: 12,
    },
    aiBadgeTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#15803D',
        marginBottom: 2,
    },
    aiBadgeDesc: {
        fontSize: 12,
        color: '#166534',
        lineHeight: 17,
    },
    categoryRow: {
        flexDirection: 'row',
        gap: 8,
    },
    categoryBtn: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryBtnActive: {
        backgroundColor: '#DCFCE7',
        borderColor: '#16A34A',
    },
    categoryBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    categoryBtnTextActive: {
        color: '#15803D',
        fontWeight: '700',
    },
    locationSection: {
        width: '100%',
    },
    coordsRow: {
        flexDirection: 'row',
    },
    submitWrap: {
        marginTop: 8,
        marginBottom: 24,
    },
});
