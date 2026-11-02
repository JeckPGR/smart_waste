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
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const EXT = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
};
let StorageService = StorageService_1 = class StorageService {
    config;
    logger = new common_1.Logger(StorageService_1.name);
    localDir = (0, path_1.join)(process.cwd(), 'uploads');
    s3Client = null;
    r2Bucket;
    r2PublicUrl;
    constructor(config) {
        this.config = config;
        (0, fs_1.mkdirSync)(this.localDir, { recursive: true });
        const accountId = this.config.get('R2_ACCOUNT_ID');
        const accessKeyId = this.config.get('R2_ACCESS_KEY_ID');
        const secretAccessKey = this.config.get('R2_SECRET_ACCESS_KEY');
        this.r2Bucket = this.config.get('R2_BUCKET_NAME') ?? 'smart-waste';
        this.r2PublicUrl = (this.config.get('R2_PUBLIC_URL') ??
            'https://pub-7e2a8256c49745feba42a03a12485fbd.r2.dev').replace(/\/$/, '');
        if (accountId && accessKeyId && secretAccessKey) {
            this.s3Client = new client_s3_1.S3Client({
                region: 'auto',
                endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId,
                    secretAccessKey,
                },
            });
            this.logger.log(`Cloudflare R2 Storage diaktifkan untuk bucket: ${this.r2Bucket}`);
        }
        else {
            this.logger.warn('Kredensial Cloudflare R2 belum lengkap di .env (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY). Menggunakan penyimpanan disk lokal sementara.');
        }
    }
    async save(file, folder = 'reports') {
        if (!file.buffer || file.buffer.length < 100) {
            throw new common_1.BadRequestException('File gambar kosong atau tidak terbaca dengan benar');
        }
        const ext = EXT[file.mimetype] ?? '.jpg';
        const filename = `${(0, crypto_1.randomUUID)()}${ext}`;
        const key = `${folder}/${filename}`;
        if (this.s3Client) {
            try {
                await this.s3Client.send(new client_s3_1.PutObjectCommand({
                    Bucket: this.r2Bucket,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                }));
                const publicUrl = `${this.r2PublicUrl}/${key}`;
                this.logger.log(`File berhasil diunggah ke Cloudflare R2: ${publicUrl}`);
                return publicUrl;
            }
            catch (err) {
                this.logger.error('Gagal mengunggah file ke Cloudflare R2, fallback ke disk lokal:', err);
            }
        }
        await (0, promises_1.writeFile)((0, path_1.join)(this.localDir, filename), file.buffer);
        const base = this.config.get('PUBLIC_URL') ??
            `http://localhost:${this.config.get('PORT') ?? 3000}`;
        return `${base}/uploads/${filename}`;
    }
    async remove(url) {
        if (!url)
            return;
        if (this.s3Client && url.startsWith(this.r2PublicUrl)) {
            const key = url.replace(`${this.r2PublicUrl}/`, '');
            try {
                await this.s3Client.send(new client_s3_1.DeleteObjectCommand({
                    Bucket: this.r2Bucket,
                    Key: key,
                }));
                this.logger.log(`File dihapus dari Cloudflare R2: ${key}`);
                return;
            }
            catch (err) {
                this.logger.warn(`Gagal menghapus file dari Cloudflare R2 (${key}):`, err);
            }
        }
        await (0, promises_1.unlink)((0, path_1.join)(this.localDir, (0, path_1.basename)(url))).catch(() => undefined);
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map