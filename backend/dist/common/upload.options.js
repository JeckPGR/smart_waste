"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageUploadOptions = void 0;
const common_1 = require("@nestjs/common");
exports.imageUploadOptions = {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!/^image\/(jpeg|png|webp)$/.test(file.mimetype)) {
            return cb(new common_1.BadRequestException('Hanya file JPG, PNG, atau WEBP'), false);
        }
        cb(null, true);
    },
};
//# sourceMappingURL=upload.options.js.map