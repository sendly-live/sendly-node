"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendlyClient = void 0;
const errors_1 = require("./errors");
const sms_1 = require("./resources/sms");
const http_client_1 = require("./utils/http-client");
class SendlyClient {
    constructor(options = {}) {
        if (options.apiKey === undefined || options.apiKey === null) {
            throw new errors_1.ValidationError('API key is required');
        }
        if (!this.isValidApiKey(options.apiKey)) {
            throw new errors_1.ValidationError('Invalid API key format. Expected: sl_test_*** or sl_live_***');
        }
        this.apiKey = options.apiKey;
        this.baseUrl = options.baseUrl || 'https://sendly.live/api';
        this.timeout = options.timeout || 30000;
        this.httpClient = new http_client_1.HttpClient({
            baseUrl: this.baseUrl,
            apiKey: this.apiKey,
            timeout: this.timeout
        });
        this.sms = new sms_1.SMS(this.httpClient);
    }
    isValidApiKey(key) {
        const apiKeyRegex = /^sl_(test|live)_[a-zA-Z0-9_-]{24,50}$/;
        return apiKeyRegex.test(key);
    }
}
exports.SendlyClient = SendlyClient;
//# sourceMappingURL=client.js.map