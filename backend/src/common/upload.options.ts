import { BadRequestException } from '@nestjs/common';

export const imageUploadOptions = {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (
        _req: unknown,
        file: { mimetype: string },
        cb: (error: Error | null, accept: boolean) => void,
    ) => {
        if (!/^image\/(jpeg|png|webp)$/.test(file.mimetype)) {
            return cb(new BadRequestException('Hanya file JPG, PNG, atau WEBP'), false);
        }
        cb(null, true);
    },
};