import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private config;
    private readonly dir;
    constructor(config: ConfigService);
    save(file: Express.Multer.File): Promise<string>;
    remove(url: string): Promise<void>;
}
