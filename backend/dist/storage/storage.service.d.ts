import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private config;
    private readonly logger;
    private readonly localDir;
    private readonly s3Client;
    private readonly r2Bucket;
    private readonly r2PublicUrl;
    constructor(config: ConfigService);
    save(file: Express.Multer.File, folder?: string): Promise<string>;
    remove(url: string): Promise<void>;
}
