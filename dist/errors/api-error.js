"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
const base_error_1 = require("./base-error");
class ApiError extends base_error_1.BaseError {
    constructor(message, statusCode) {
        super(message, 'api_error');
        this.statusCode = statusCode;
        this.name = 'ApiError';
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=api-error.js.map