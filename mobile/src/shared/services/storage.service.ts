import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'smartwaste_auth_token';
const USER_KEY = 'smartwaste_auth_user';
const HAS_SEEN_SPLASH_KEY = 'smartwaste_has_seen_splash';

export interface StoredUser {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'USER';
    phone?: string | null;
    isActive: boolean;
}

export const StorageService = {
    async setToken(token: string): Promise<void> {
        await AsyncStorage.setItem(TOKEN_KEY, token);
    },

    async getToken(): Promise<string | null> {
        return AsyncStorage.getItem(TOKEN_KEY);
    },

    async setUser(user: StoredUser): Promise<void> {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    async getUser(): Promise<StoredUser | null> {
        const raw = await AsyncStorage.getItem(USER_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },

    async clearAuth(): Promise<void> {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    },

    async setHasSeenSplash(value: boolean): Promise<void> {
        await AsyncStorage.setItem(HAS_SEEN_SPLASH_KEY, value ? 'true' : 'false');
    },

    async getHasSeenSplash(): Promise<boolean> {
        const val = await AsyncStorage.getItem(HAS_SEEN_SPLASH_KEY);
        return val === 'true';
    },
};

