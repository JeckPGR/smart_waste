import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { unlink, writeFile } from 'fs/promises';
import { basename, join } from 'path';

const EXT: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
};

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private readonly localDir = join(process.cwd(), 'uploads');
    private readonly s3Client: S3Client | null = null;
    private readonly r2Bucket: string;
    private readonly r2PublicUrl: string;

    constructor(private config: ConfigService) {
        mkdirSync(this.localDir, { recursive: true });

        const accountId = this.config.get<string>('R2_ACCOUNT_ID');
        const accessKeyId = this.config.get<string>('R2_ACCESS_KEY_ID');
        const secretAccessKey = this.config.get<string>('R2_SECRET_ACCESS_KEY');
        this.r2Bucket = this.config.get<string>('R2_BUCKET_NAME') ?? 'smart-waste';
        this.r2PublicUrl = (
            this.config.get<string>('R2_PUBLIC_URL') ??
            'https://pub-7e2a8256c49745feba42a03a12485fbd.r2.dev'
        ).replace(/\/$/, '');

        if (accountId && accessKeyId && secretAccessKey) {
            this.s3Client = new S3Client({
                region: 'auto',
                endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId,
                    secretAccessKey,
                },
            });
            this.logger.log(`Cloudflare R2 Storage diaktifkan untuk bucket: ${this.r2Bucket}`);
        } else {
            this.logger.warn(
                'Kredensial Cloudflare R2 belum lengkap di .env (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY). Menggunakan penyimpanan disk lokal sementara.',
            );
        }
    }

    /**
     * Simpan file gambar ke Cloudflare R2 (atau disk lokal jika R2 belum terkonfigurasi)
     * dan kembalikan URL publiknya.
     */
    async save(file: Express.Multer.File, folder = 'reports'): Promise<string> {
        const ext = EXT[file.mimetype] ?? '.jpg';
        const filename = `${randomUUID()}${ext}`;
        const key = `${folder}/${filename}`;

        // Jika Cloudflare R2 aktif, upload langsung ke R2
        if (this.s3Client) {
            try {
                await this.s3Client.send(
                    new PutObjectCommand({
                        Bucket: this.r2Bucket,
                        Key: key,
                        Body: file.buffer,
                        ContentType: file.mimetype,
                    }),
                );
                const publicUrl = `${this.r2PublicUrl}/${key}`;
                this.logger.log(`File berhasil diunggah ke Cloudflare R2: ${publicUrl}`);
                return publicUrl;
            } catch (err) {
                this.logger.error('Gagal mengunggah file ke Cloudflare R2, fallback ke disk lokal:', err);
            }
        }

        // Fallback ke penyimpanan disk lokal
        await writeFile(join(this.localDir, filename), file.buffer);
        const base =
            this.config.get<string>('PUBLIC_URL') ??
            `http://localhost:${this.config.get('PORT') ?? 3000}`;
        return `${base}/uploads/${filename}`;
    }

    /**
     * Hapus file dari Cloudflare R2 atau disk lokal
     */
    async remove(url: string): Promise<void> {
        if (!url) return;

        // Jika URL dari Cloudflare R2
        if (this.s3Client && url.startsWith(this.r2PublicUrl)) {
            const key = url.replace(`${this.r2PublicUrl}/`, '');
            try {
                await this.s3Client.send(
                    new DeleteObjectCommand({
                        Bucket: this.r2Bucket,
                        Key: key,
                    }),
                );
                this.logger.log(`File dihapus dari Cloudflare R2: ${key}`);
                return;
            } catch (err) {
                this.logger.warn(`Gagal menghapus file dari Cloudflare R2 (${key}):`, err);
            }
        }

        // Hapus dari disk lokal
        await unlink(join(this.localDir, basename(url))).catch(() => undefined);
    }
}
