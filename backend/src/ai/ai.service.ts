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
            const form = new FormData();
            form.append('file', new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }), file.originalname);
            const res = await fetch(`${baseUrl}/predict`, {
                method: 'POST',
                body: form,
                signal: AbortSignal.timeout(30_000), // inference pertama bisa lambat
            });
            if (!res.ok) throw new Error(`ML API ${res.status}`);
            const data = (await res.json()) as MlResponse;
            return this.format(data.label, data.confidence, data.probabilities, false);
        } catch {
            throw new BadGatewayException('Layanan deteksi AI tidak tersedia');
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