import { tokenStorage } from './token-storage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public details?: unknown,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function httpClient<T>(
    endpoint: string,
    options: RequestInit = {},
    customToken?: string | null,
): Promise<T> {
    const token = customToken !== undefined ? customToken : tokenStorage.get();

    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        let errorMessage = `HTTP Error ${res.status}`;
        let details: unknown = null;
        try {
            const errorJson = await res.json();
            details = errorJson;
            if (Array.isArray(errorJson.message)) {
                errorMessage = errorJson.message.join(', ');
            } else if (errorJson.message) {
                errorMessage = errorJson.message;
            }
        } catch {
            errorMessage = res.statusText || errorMessage;
        }
        throw new ApiError(res.status, errorMessage, details);
    }

    if (res.status === 204) {
        return {} as T;
    }

    return res.json();
}

