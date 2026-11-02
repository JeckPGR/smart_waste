import { BadRequestException } from '@nestjs/common';

export const imageUploadOptions = {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (
        _req: unknown,
        file: { mimetype: string; originalname?: string },
        cb: (error: Error | null, accept: boolean) => void,
    ) => {
        const isAllowedMime = /^image\/(jpeg|png|webp)$/i.test(file.mimetype);
        const isAllowedExt = /\.(jpe?g|png|webp)$/i.test(file.originalname || '');

        if (!isAllowedMime && !isAllowedExt) {
            return cb(new BadRequestException('Hanya file JPG, PNG, atau WEBP'), false);
        }

        // Jika mimetype dari client mobile berupa generic octet-stream, normalisasi berdasarkan ekstensi file
        if (!isAllowedMime && isAllowedExt) {
            const ext = (file.originalname || '').split('.').pop()?.toLowerCase();
            if (ext === 'png') file.mimetype = 'image/png';
            else if (ext === 'webp') file.mimetype = 'image/webp';
            else file.mimetype = 'image/jpeg';
        }

        cb(null, true);
    },
};
