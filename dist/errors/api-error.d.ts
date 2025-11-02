import { BaseError } from './base-error';
export declare class ApiError extends BaseError {
    readonly statusCode: number;
    constructor(message: string, statusCode: number);
}
//# sourceMappingURL=api-error.d.ts.map