import { ConfigService } from '@nestjs/config';
export declare class AiService {
    private config;
    constructor(config: ConfigService);
    predict(file: Express.Multer.File): Promise<{
        label: string;
        category: import("@prisma/client").$Enums.WasteCategory;
        confidence: number;
        probabilities: Record<string, number>;
        mock: boolean;
    }>;
    private mock;
    private format;
}
