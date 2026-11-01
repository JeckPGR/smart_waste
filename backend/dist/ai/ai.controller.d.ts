import { AiService } from './ai.service';
export declare class AiController {
    private ai;
    constructor(ai: AiService);
    predict(file?: Express.Multer.File): Promise<{
        label: string;
        category: import("@prisma/client").$Enums.WasteCategory;
        confidence: number;
        probabilities: Record<string, number>;
        mock: boolean;
    }>;
}
