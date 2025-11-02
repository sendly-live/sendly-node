"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMS = void 0;
const errors_1 = require("../errors");
class SMS {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async send(request) {
        this.validateSendRequest(request);
        if (request.from && this.isTollFree(request.from)) {
            const countryCode = this.getCountryCode(request.to);
            if (countryCode !== "1") {
                throw new errors_1.ValidationError(`Toll-free number ${request.from} cannot send to international destination ${request.to}. Toll-free numbers only support US/Canada.`);
            }
        }
        const payload = {
            to: request.to,
            messageType: request.messageType || "transactional",
        };
        if (request.from)
            payload.from = request.from;
        if (request.text)
            payload.text = request.text;
        if (request.mediaUrls)
            payload.mediaUrls = request.mediaUrls;
        if (request.subject)
            payload.subject = request.subject;
        if (request.webhookUrl)
            payload.webhookUrl = request.webhookUrl;
        if (request.webhookFailoverUrl)
            payload.webhookFailoverUrl = request.webhookFailoverUrl;
        if (request.tags)
            payload.tags = request.tags;
        return this.httpClient.post("/v1/send", payload);
    }
    validateSendRequest(request) {
        if (!request.to) {
            throw new errors_1.ValidationError("to is required");
        }
        if (!request.text &&
            (!request.mediaUrls || request.mediaUrls.length === 0)) {
            throw new errors_1.ValidationError("Either text or mediaUrls must be provided");
        }
        if (!this.isValidPhoneNumber(request.to)) {
            throw new errors_1.ValidationError("Invalid phone number format for to");
        }
        if (request.from && !this.isValidPhoneNumber(request.from)) {
            throw new errors_1.ValidationError("Invalid phone number format for from");
        }
        if (request.mediaUrls) {
            if (request.mediaUrls.length > 10) {
                throw new errors_1.ValidationError("Maximum 10 media URLs allowed");
            }
            for (const url of request.mediaUrls) {
                if (!this.isValidUrl(url)) {
                    throw new errors_1.ValidationError("Invalid URL format in mediaUrls");
                }
                if (!url.startsWith("https://")) {
                    throw new errors_1.ValidationError("Media URLs must use HTTPS");
                }
            }
        }
        if (request.webhookUrl) {
            if (!this.isValidUrl(request.webhookUrl)) {
                throw new errors_1.ValidationError("Invalid webhook URL format");
            }
            if (!request.webhookUrl.startsWith("https://")) {
                throw new errors_1.ValidationError("Webhook URL must use HTTPS");
            }
        }
        if (request.webhookFailoverUrl) {
            if (!this.isValidUrl(request.webhookFailoverUrl)) {
                throw new errors_1.ValidationError("Invalid webhook failover URL format");
            }
            if (!request.webhookFailoverUrl.startsWith("https://")) {
                throw new errors_1.ValidationError("Webhook failover URL must use HTTPS");
            }
        }
        if (request.tags) {
            if (request.tags.length > 20) {
                throw new errors_1.ValidationError("Maximum 20 tags allowed");
            }
            for (const tag of request.tags) {
                if (!tag || tag.trim() === "") {
                    throw new errors_1.ValidationError("Tags cannot be empty");
                }
                if (tag.length > 50) {
                    throw new errors_1.ValidationError("Tag length cannot exceed 50 characters");
                }
            }
        }
        if (request.messageType) {
            const validTypes = [
                "transactional",
                "marketing",
                "otp",
                "alert",
                "promotional",
            ];
            if (!validTypes.includes(request.messageType)) {
                throw new errors_1.ValidationError(`Invalid messageType. Must be one of: ${validTypes.join(", ")}`);
            }
        }
    }
    isValidPhoneNumber(phone) {
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        return phoneRegex.test(phone);
    }
    getCountryCode(phoneNumber) {
        const cleanNumber = phoneNumber.replace(/[^\d]/g, "");
        if (cleanNumber.startsWith("1")) {
            return "1";
        }
        if (cleanNumber.startsWith("44")) {
            return "44";
        }
        if (cleanNumber.startsWith("33")) {
            return "33";
        }
        if (cleanNumber.length >= 10) {
            const twoDigit = cleanNumber.substring(0, 2);
            if ([
                "27",
                "34",
                "39",
                "41",
                "43",
                "45",
                "46",
                "47",
                "48",
                "81",
                "82",
                "86",
                "91",
                "92",
                "93",
                "94",
                "95",
            ].includes(twoDigit)) {
                return twoDigit;
            }
        }
        return "unknown";
    }
    isTollFree(phoneNumber) {
        const cleanNumber = phoneNumber.replace(/[^\d]/g, "");
        return cleanNumber.match(/^1(800|833|844|855|866|877|888)/) !== null;
    }
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.SMS = SMS;
//# sourceMappingURL=sms.js.map