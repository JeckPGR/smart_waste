"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const LABEL_TO_CATEGORY = {
    'Organic Waste': 'ORGANIC',
    'Plastic Waste': 'PLASTIC',
    'Paper Waste': 'PAPER',
};
let AiService = class AiService {
    config;
    constructor(config) {
        this.config = config;
    }
    async predict(file) {
        const baseUrl = this.config.get('ML_API_URL');
        if (!baseUrl)
            return this.mock();
        try {
            let mime = file.mimetype || 'image/jpeg';
            if (mime === 'application/octet-stream' || mime === 'image/jpg') {
                const ext = file.originalname?.split('.').pop()?.toLowerCase();
                if (ext === 'png')
                    mime = 'image/png';
                else if (ext === 'webp')
                    mime = 'image/webp';
                else
                    mime = 'image/jpeg';
            }
            const form = new FormData();
            const filename = file.originalname || 'waste.jpg';
            form.append('file', new Blob([file.buffer], { type: mime }), filename);
            const res = await fetch(`${baseUrl}/predict`, {
                method: 'POST',
                body: form,
                signal: AbortSignal.timeout(30_000),
            });
            if (!res.ok) {
                const errText = await res.text().catch(() => '');
                console.error(`ML API Error (${res.status}):`, errText);
                throw new Error(`ML API ${res.status}: ${errText}`);
            }
            const data = (await res.json());
            return this.format(data.label, data.confidence, data.probabilities, false);
        }
        catch (err) {
            console.error('Deteksi AI gagal via ML_API_URL:', err?.message || err);
            console.warn('Menggunakan fallback simulator AI...');
            return this.mock();
        }
    }
    mock() {
        const labels = Object.keys(LABEL_TO_CATEGORY);
        const label = labels[Math.floor(Math.random() * labels.length)];
        const confidence = Number((0.8 + Math.random() * 0.19).toFixed(2));
        return this.format(label, confidence, { [label]: confidence }, true);
    }
    format(label, confidence, probabilities, mock) {
        return { label, category: LABEL_TO_CATEGORY[label] ?? null, confidence, probabilities, mock };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map