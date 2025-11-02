import { BaseError } from './base-error';
export declare class AuthenticationError extends BaseError {
    readonly statusCode: number;
    constructor(message: string, statusCode?: number);
}
//# sourceMappingURL=authentication-error.d.ts.map