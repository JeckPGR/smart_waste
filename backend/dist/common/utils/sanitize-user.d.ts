export declare function sanitizeUser<T extends {
    password: string;
}>(user: T): Omit<T, 'password'>;
