import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WasteCategory } from '@prisma/client';

const LABEL_TO_CATEGORY: Record<string, WasteCategory> = {
    'Organic Waste': 'ORGANIC',
    'Plastic Waste': 'PLASTIC',
    'Paper Waste': 'PAPER',
};

interface MlResponse {
    label: string;
    confidence: number;
    probabilities: Record<string, number>;
}

@Injectable()
export class AiService {
    constructor(private config: ConfigService) { }

    async predict(file: Express.Multer.File) {
        const baseUrl = this.config.get<string>('ML_API_URL');
        if (!baseUrl) return this.mock();

        try {
            // Normalisasi mimetype gambar agar selalu valid (image/jpeg, image/png, image/webp)
            let mime = file.mimetype || 'image/jpeg';
            if (mime === 'application/octet-stream' || mime === 'image/jpg') {
                const ext = file.originalname?.split('.').pop()?.toLowerCase();
                if (ext === 'png') mime = 'image/png';
                else if (ext === 'webp') mime = 'image/webp';
                else mime = 'image/jpeg';
            }

            const form = new FormData();
            const filename = file.originalname || 'waste.jpg';
            form.append('file', new Blob([file.buffer as unknown as BlobPart], { type: mime }), filename);

            const res = await fetch(`${baseUrl}/predict`, {
                method: 'POST',
                body: form,
                signal: AbortSignal.timeout(30_000), // inference pertama bisa lambat
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => '');
                console.error(`ML API Error (${res.status}):`, errText);
                throw new Error(`ML API ${res.status}: ${errText}`);
            }

            const data = (await res.json()) as MlResponse;
            return this.format(data.label, data.confidence, data.probabilities, false);
        } catch (err: any) {
            console.error('Deteksi AI gagal via ML_API_URL:', err?.message || err);
            console.warn('Menggunakan fallback simulator AI...');
            return this.mock();
        }
    }

    private mock() {
        const labels = Object.keys(LABEL_TO_CATEGORY);
        const label = labels[Math.floor(Math.random() * labels.length)];
        const confidence = Number((0.8 + Math.random() * 0.19).toFixed(2));
        return this.format(label, confidence, { [label]: confidence }, true);
    }

    private format(label: string, confidence: number, probabilities: Record<string, number>, mock: boolean) {
        return { label, category: LABEL_TO_CATEGORY[label] ?? null, confidence, probabilities, mock };
    }
}
