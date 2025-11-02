"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseError = void 0;
class BaseError extends Error {
    constructor(message, type) {
        super(message);
        this.type = type;
        this.name = 'BaseError';
    }
}
exports.BaseError = BaseError;
//# sourceMappingURL=base-error.js.map