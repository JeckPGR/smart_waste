import { ApiConfig } from '@/config/api.config';
import { StorageService } from './storage.service';

interface RequestOptions extends RequestInit {
    skipAuth?: boolean;
}

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: unknown,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const baseUrl = await ApiConfig.getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;

    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
    };

    if (!options.skipAuth) {
        const token = await StorageService.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    // Only set Content-Type to application/json if not FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    // Set a 10s timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        const data = isJson ? await response.json() : await response.text();

        if (!response.ok) {
            const message =
                (typeof data === 'object' && data !== null && 'message' in data
                    ? Array.isArray((data as { message: unknown }).message)
                        ? (data as { message: string[] }).message.join(', ')
                        : (data as { message: string }).message
                    : null) ||
                `HTTP Error ${response.status}: ${response.statusText}`;

            throw new ApiError(message, response.status, data);
        }

        return data as T;
    } catch (err: unknown) {
        clearTimeout(timeoutId);
        if (err instanceof ApiError) throw err;
        if (err instanceof Error && err.name === 'AbortError') {
            throw new ApiError(
                'Server sedang bangun atau koneksi lambat. Tunggu sebentar lalu coba lagi.',
                0,
            );
        }
        throw new ApiError(
            err instanceof Error ? err.message : 'Gagal terhubung ke server Smart Waste',
            0,
        );
    }
}

export const ApiClient = {
    get: <T>(endpoint: string, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
        request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),

    patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
        request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'DELETE' }),
};

