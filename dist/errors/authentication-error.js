"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationError = void 0;
const base_error_1 = require("./base-error");
class AuthenticationError extends base_error_1.BaseError {
    constructor(message, statusCode = 401) {
        super(message, 'authentication_error');
        this.statusCode = statusCode;
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
//# sourceMappingURL=authentication-error.js.map