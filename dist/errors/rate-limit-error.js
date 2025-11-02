"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitError = void 0;
const base_error_1 = require("./base-error");
class RateLimitError extends base_error_1.BaseError {
    constructor(message, statusCode = 429, retryAfter) {
        super(message, "rate_limit_error");
        this.statusCode = statusCode;
        this.retryAfter = retryAfter;
        this.name = "RateLimitError";
    }
}
exports.RateLimitError = RateLimitError;
//# sourceMappingURL=rate-limit-error.js.map