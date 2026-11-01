import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { unlink, writeFile } from 'fs/promises';
import { basename, join } from 'path';

const EXT: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

@Injectable()
export class StorageService {
    private readonly dir = join(process.cwd(), 'uploads');

    constructor(private config: ConfigService) {
        mkdirSync(this.dir, { recursive: true });
    }

    /** Simpan file, kembalikan URL publik. */
    async save(file: Express.Multer.File): Promise<string> {
        const name = `${randomUUID()}${EXT[file.mimetype] ?? '.jpg'}`;
        await writeFile(join(this.dir, name), file.buffer);
        const base = this.config.get<string>('PUBLIC_URL') ?? `http://localhost:${this.config.get('PORT') ?? 3000}`;
        return `${base}/uploads/${name}`;
    }

    async remove(url: string): Promise<void> {
        await unlink(join(this.dir, basename(url))).catch(() => undefined);
    }
}