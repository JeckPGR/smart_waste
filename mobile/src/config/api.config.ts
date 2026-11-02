import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_API_URL = 'smartwaste_custom_api_url';

export const PRESETS = {
    PRODUCTION: 'https://smart-waste-backend-50bs.onrender.com/api/v1',
    LAN: 'http://192.168.1.10:3000/api/v1',
    EMULATOR: 'http://10.0.2.2:3000/api/v1',
    LOCALHOST: 'http://localhost:3000/api/v1',
};

// Default langsung ke server Render Cloud Production!
const DEFAULT_URL = PRESETS.PRODUCTION;

let currentApiUrl = DEFAULT_URL;

export const ApiConfig = {
    async getBaseUrl(): Promise<string> {
        try {
            const custom = await AsyncStorage.getItem(STORAGE_KEY_API_URL);
            // Jika sebelumnya tersimpan IP lokal (10.0.2.2 atau 192.168.x.x), migrasikan otomatis ke Render Cloud
            if (custom && (custom.includes('10.0.2.2') || custom.includes('192.168.'))) {
                await AsyncStorage.removeItem(STORAGE_KEY_API_URL);
                currentApiUrl = PRESETS.PRODUCTION;
                return currentApiUrl;
            }
            if (custom && custom.trim().length > 0) {
                currentApiUrl = custom.trim();
                return currentApiUrl;
            }
        } catch {
            // fallback
        }
        currentApiUrl = DEFAULT_URL;
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
