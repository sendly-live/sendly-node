import { BaseError } from "./base-error";
export declare class RateLimitError extends BaseError {
    readonly statusCode: number;
    readonly retryAfter: number | undefined;
    constructor(message: string, statusCode?: number, retryAfter?: number);
}
//# sourceMappingURL=rate-limit-error.d.ts.map