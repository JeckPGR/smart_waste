"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageUploadOptions = void 0;
const common_1 = require("@nestjs/common");
exports.imageUploadOptions = {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const isAllowedMime = /^image\/(jpeg|png|webp)$/i.test(file.mimetype);
        const isAllowedExt = /\.(jpe?g|png|webp)$/i.test(file.originalname || '');
        if (!isAllowedMime && !isAllowedExt) {
            return cb(new common_1.BadRequestException('Hanya file JPG, PNG, atau WEBP'), false);
        }
        if (!isAllowedMime && isAllowedExt) {
            const ext = (file.originalname || '').split('.').pop()?.toLowerCase();
            if (ext === 'png')
                file.mimetype = 'image/png';
            else if (ext === 'webp')
                file.mimetype = 'image/webp';
            else
                file.mimetype = 'image/jpeg';
        }
        cb(null, true);
    },
};
//# sourceMappingURL=upload.options.js.map