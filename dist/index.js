"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuccessTestNumbers = exports.getErrorTestNumbers = exports.getTestNumbersByCategory = exports.getTestNumberInfo = exports.isTestNumber = exports.TEST_NUMBER_INFO = exports.SANDBOX_TEST_NUMBERS = void 0;
__exportStar(require("./client"), exports);
__exportStar(require("./errors"), exports);
__exportStar(require("./resources/sms"), exports);
__exportStar(require("./types/message-types"), exports);
var test_numbers_1 = require("./constants/test-numbers");
Object.defineProperty(exports, "SANDBOX_TEST_NUMBERS", { enumerable: true, get: function () { return test_numbers_1.SANDBOX_TEST_NUMBERS; } });
Object.defineProperty(exports, "TEST_NUMBER_INFO", { enumerable: true, get: function () { return test_numbers_1.TEST_NUMBER_INFO; } });
Object.defineProperty(exports, "isTestNumber", { enumerable: true, get: function () { return test_numbers_1.isTestNumber; } });
Object.defineProperty(exports, "getTestNumberInfo", { enumerable: true, get: function () { return test_numbers_1.getTestNumberInfo; } });
Object.defineProperty(exports, "getTestNumbersByCategory", { enumerable: true, get: function () { return test_numbers_1.getTestNumbersByCategory; } });
Object.defineProperty(exports, "getErrorTestNumbers", { enumerable: true, get: function () { return test_numbers_1.getErrorTestNumbers; } });
Object.defineProperty(exports, "getSuccessTestNumbers", { enumerable: true, get: function () { return test_numbers_1.getSuccessTestNumbers; } });
//# sourceMappingURL=index.js.map