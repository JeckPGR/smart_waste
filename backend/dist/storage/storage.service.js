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
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
let StorageService = class StorageService {
    config;
    dir = (0, path_1.join)(process.cwd(), 'uploads');
    constructor(config) {
        this.config = config;
        (0, fs_1.mkdirSync)(this.dir, { recursive: true });
    }
    async save(file) {
        const name = `${(0, crypto_1.randomUUID)()}${EXT[file.mimetype] ?? '.jpg'}`;
        await (0, promises_1.writeFile)((0, path_1.join)(this.dir, name), file.buffer);
        const base = this.config.get('PUBLIC_URL') ?? `http://localhost:${this.config.get('PORT') ?? 3000}`;
        return `${base}/uploads/${name}`;
    }
    async remove(url) {
        await (0, promises_1.unlink)((0, path_1.join)(this.dir, (0, path_1.basename)(url))).catch(() => undefined);
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map