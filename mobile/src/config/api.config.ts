import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_API_URL = 'smartwaste_custom_api_url';

// 192.168.1.10 is laptop's LAN IP for physical phones connected to same Wi-Fi
export const PRESETS = {
    LAN: 'http://192.168.1.10:3000/api/v1',
    EMULATOR: 'http://10.0.2.2:3000/api/v1',
    LOCALHOST: 'http://localhost:3000/api/v1',
};

// Default to LAN IP so physical phones work immediately out of the box!
const DEFAULT_URL = PRESETS.LAN;

let currentApiUrl = DEFAULT_URL;

export const ApiConfig = {
    async getBaseUrl(): Promise<string> {
        try {
            const custom = await AsyncStorage.getItem(STORAGE_KEY_API_URL);
            // Jika sebelumnya tersimpan 10.0.2.2, otomatis hapus karena di HP fisik 10.0.2.2 tidak bisa dipakai
            if (custom && custom.includes('10.0.2.2')) {
                await AsyncStorage.removeItem(STORAGE_KEY_API_URL);
                currentApiUrl = PRESETS.LAN;
                return currentApiUrl;
            }
            if (custom && custom.trim().length > 0) {
                currentApiUrl = custom.trim();
                return currentApiUrl;
            }
        } catch {
            // fallback
        }
        return currentApiUrl;
    },

    getCurrentUrl(): string {
        return currentApiUrl;
    },

    async setBaseUrl(url: string): Promise<void> {
        currentApiUrl = url.trim();
        await AsyncStorage.setItem(STORAGE_KEY_API_URL, currentApiUrl);
    },

    async resetBaseUrl(): Promise<string> {
        currentApiUrl = DEFAULT_URL;
        await AsyncStorage.removeItem(STORAGE_KEY_API_URL);
        return currentApiUrl;
    },

    DEFAULT_URL,
    PRESETS,
};
