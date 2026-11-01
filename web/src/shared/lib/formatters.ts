export function formatDate(isoString: string): string {
    if (!isoString) return '-';
    try {
        return new Date(isoString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return isoString;
    }
}

export function formatDateTime(isoString: string): string {
    if (!isoString) return '-';
    try {
        return new Date(isoString).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return isoString;
    }
}

export function formatCoordinate(lat: number, lng: number): string {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function formatPercent(value: number): string {
    return `${(value * 100).toFixed(0)}%`;
}

