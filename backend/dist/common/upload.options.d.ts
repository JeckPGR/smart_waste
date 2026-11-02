export declare const imageUploadOptions: {
    limits: {
        fileSize: number;
    };
    fileFilter: (_req: unknown, file: {
        mimetype: string;
        originalname?: string;
    }, cb: (error: Error | null, accept: boolean) => void) => void;
};
