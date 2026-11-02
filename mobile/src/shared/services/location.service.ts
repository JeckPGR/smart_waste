import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const LOCATION_PROMPT_KEY = 'smart_waste_location_prompted';

export interface LocationData {
    latitude: string;
    longitude: string;
    address?: string;
}

const withTimeout = <T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
    ]);
};

class LocationServiceClass {
    private cachedLocation: LocationData | null = null;

    async hasPrompted(): Promise<boolean> {
        try {
            const val = await AsyncStorage.getItem(LOCATION_PROMPT_KEY);
            return val === 'true';
        } catch {
            return false;
        }
    }

    async setPrompted(): Promise<void> {
        try {
            await AsyncStorage.setItem(LOCATION_PROMPT_KEY, 'true');
        } catch {
            // ignore
        }
    }

    async checkPermission(): Promise<Location.PermissionStatus> {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            return status;
        } catch {
            return Location.PermissionStatus.UNDETERMINED;
        }
    }

    async requestPermission(): Promise<boolean> {
        try {
            await this.setPrompted();
            const { status } = await Location.requestForegroundPermissionsAsync();
            return status === Location.PermissionStatus.GRANTED;
        } catch {
            return false;
        }
    }

    getCachedLocation(): LocationData | null {
        return this.cachedLocation;
    }

    async fetchCurrentLocation(): Promise<LocationData | null> {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status !== Location.PermissionStatus.GRANTED) {
                return null;
            }

            // 1. Ambil posisi terakhir yang tersimpan di HP (langsung tersedia dalam 5ms)
            let loc = await Location.getLastKnownPositionAsync().catch(() => null);

            // 2. Jika tidak ada, panggil getCurrentPositionAsync dengan batas waktu maksimal 5 detik
            if (!loc) {
                const positionPromise = Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                loc = await withTimeout(positionPromise, 5000, null);
            }

            if (!loc && this.cachedLocation) {
                return this.cachedLocation;
            }

            if (!loc) {
                return null;
            }

            const lat = loc.coords.latitude.toFixed(6);
            const lng = loc.coords.longitude.toFixed(6);

            let address = this.cachedLocation?.address || '';
            try {
                // Reverse geocoding alamat dengan batas waktu maksimal 3.5 detik agar loading tidak menggantung
                const geocodePromise = Location.reverseGeocodeAsync({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });
                const geo = await withTimeout(geocodePromise, 3500, []);
                if (geo && geo[0]) {
                    const place = geo[0];
                    const parts = [place.street, place.district, place.city].filter(Boolean);
                    if (parts.length > 0) {
                        address = parts.join(', ');
                    }
                }
            } catch {
                // geocoding can fail silently
            }

            const data: LocationData = {
                latitude: lat,
                longitude: lng,
                address: address || undefined,
            };

            this.cachedLocation = data;
            return data;
        } catch (err) {
            console.warn('Failed to fetch location:', err);
            return this.cachedLocation;
        }
    }
}

export const LocationService = new LocationServiceClass();
