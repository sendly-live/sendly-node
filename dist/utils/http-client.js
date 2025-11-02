"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const api_error_1 = require("../errors/api-error");
const rate_limit_error_1 = require("../errors/rate-limit-error");
const authentication_error_1 = require("../errors/authentication-error");
class HttpClient {
    constructor(options) {
        this.options = options;
        this.maxRetries = 3;
        this.baseDelay = 1000;
    }
    async post(endpoint, data) {
        return this.makeRequest("POST", endpoint, data);
    }
    async get(endpoint, queryParams) {
        let url = endpoint;
        if (queryParams) {
            const searchParams = new URLSearchParams();
            for (const [key, value] of Object.entries(queryParams)) {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach((item) => searchParams.append(key, String(item)));
                    }
                    else {
                        searchParams.append(key, String(value));
                    }
                }
            }
            const queryString = searchParams.toString();
            if (queryString) {
                url += "?" + queryString;
            }
        }
        return this.makeRequest("GET", url);
    }
    async makeRequest(method, endpoint, data) {
        const url = `${this.options.baseUrl}${endpoint}`;
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await (0, node_fetch_1.default)(url, {
                    method,
                    headers: {
                        Authorization: `Bearer ${this.options.apiKey}`,
                        "Content-Type": "application/json",
                        "User-Agent": "@sendly/node@0.1.0",
                    },
                    body: data ? JSON.stringify(data) : undefined,
                });
                if (response.ok) {
                    return response.json();
                }
                let errorData;
                try {
                    errorData = await response.json();
                }
                catch {
                    errorData = { error: "unknown", message: response.statusText };
                }
                if (this.isRetryableError(response.status) &&
                    attempt < this.maxRetries) {
                    const delay = this.calculateDelay(attempt, errorData.retry_after);
                    await this.sleep(delay);
                    continue;
                }
                if (response.status === 429) {
                    throw new rate_limit_error_1.RateLimitError(attempt >= this.maxRetries
                        ? "Max retry attempts exceeded"
                        : errorData.message || "Rate limit exceeded", response.status, errorData.retry_after);
                }
                else if (response.status === 401 || response.status === 403) {
                    throw new authentication_error_1.AuthenticationError(errorData.message || "Authentication failed", response.status);
                }
                else {
                    throw new api_error_1.ApiError(errorData.message ||
                        `HTTP ${response.status}: ${response.statusText}`, response.status);
                }
            }
            catch (error) {
                if (error instanceof rate_limit_error_1.RateLimitError ||
                    error instanceof api_error_1.ApiError ||
                    error instanceof authentication_error_1.AuthenticationError) {
                    throw error;
                }
                if (attempt < this.maxRetries) {
                    const delay = this.calculateDelay(attempt);
                    await this.sleep(delay);
                    continue;
                }
                throw error;
            }
        }
        throw new rate_limit_error_1.RateLimitError("Max retry attempts exceeded", 429);
    }
    isRetryableError(statusCode) {
        return statusCode === 429 || (statusCode >= 500 && statusCode < 600);
    }
    calculateDelay(attempt, retryAfter) {
        if (retryAfter) {
            return retryAfter * 1000;
        }
        return this.baseDelay * Math.pow(2, attempt);
    }
    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=http-client.js.map