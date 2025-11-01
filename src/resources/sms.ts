import { ValidationError } from "../errors";
import { HttpClient } from "../utils/http-client";
import { MessageType, RoutingInfo } from "../types/message-types";

export interface SMSSendRequest {
  to: string;
  from?: string; // Optional - auto-selected if not provided
  text?: string; // Optional for MMS-only messages
  messageType?: MessageType;
  mediaUrls?: string[]; // For MMS support
  subject?: string; // MMS subject line
  webhookUrl?: string; // Webhook for delivery notifications
  webhookFailoverUrl?: string; // Backup webhook URL
  tags?: string[]; // For message tagging and analytics
}

export interface SMSSendResponse {
  id: string;
  status: "queued" | "sent" | "delivered" | "failed";
  from: string;
  to: string;
  text: string | null;
  created_at: string;
  segments: number;
  cost: number;
  direction: "outbound";
  routing: RoutingInfo;
  mediaUrls?: string[]; // For MMS responses
  subject?: string; // MMS subject line
  webhookUrl?: string; // Webhook for delivery notifications
  webhookFailoverUrl?: string; // Backup webhook URL
  tags?: string[]; // For message tagging and analytics
}

export class SMS {
  constructor(private httpClient: HttpClient) {}

  async send(request: SMSSendRequest): Promise<SMSSendResponse> {
    this.validateSendRequest(request);

    // Check for toll-free international routing error before sending
    if (request.from && this.isTollFree(request.from)) {
      const countryCode = this.getCountryCode(request.to);
      if (countryCode !== "1") {
        throw new ValidationError(
          `Toll-free number ${request.from} cannot send to international destination ${request.to}. Toll-free numbers only support US/Canada.`,
        );
      }
    }

    const payload: any = {
      to: request.to,
      messageType: request.messageType || "transactional",
    };

    if (request.from) payload.from = request.from;
    if (request.text) payload.text = request.text;
    if (request.mediaUrls) payload.mediaUrls = request.mediaUrls;
    if (request.subject) payload.subject = request.subject;
    if (request.webhookUrl) payload.webhookUrl = request.webhookUrl;
    if (request.webhookFailoverUrl)
      payload.webhookFailoverUrl = request.webhookFailoverUrl;
    if (request.tags) payload.tags = request.tags;

    return this.httpClient.post<SMSSendResponse>("/v1/send", payload);
  }

  private validateSendRequest(request: SMSSendRequest): void {
    if (!request.to) {
      throw new ValidationError("to is required");
    }

    // Either text or mediaUrls must be provided
    if (
      !request.text &&
      (!request.mediaUrls || request.mediaUrls.length === 0)
    ) {
      throw new ValidationError("Either text or mediaUrls must be provided");
    }

    if (!this.isValidPhoneNumber(request.to)) {
      throw new ValidationError("Invalid phone number format for to");
    }

    // from is optional - validate only if provided
    if (request.from && !this.isValidPhoneNumber(request.from)) {
      throw new ValidationError("Invalid phone number format for from");
    }

    // Validate mediaUrls if provided
    if (request.mediaUrls) {
      if (request.mediaUrls.length > 10) {
        throw new ValidationError("Maximum 10 media URLs allowed");
      }

      for (const url of request.mediaUrls) {
        if (!this.isValidUrl(url)) {
          throw new ValidationError("Invalid URL format in mediaUrls");
        }

        if (!url.startsWith("https://")) {
          throw new ValidationError("Media URLs must use HTTPS");
        }
      }
    }

    // Validate webhook URLs if provided
    if (request.webhookUrl) {
      if (!this.isValidUrl(request.webhookUrl)) {
        throw new ValidationError("Invalid webhook URL format");
      }

      if (!request.webhookUrl.startsWith("https://")) {
        throw new ValidationError("Webhook URL must use HTTPS");
      }
    }

    if (request.webhookFailoverUrl) {
      if (!this.isValidUrl(request.webhookFailoverUrl)) {
        throw new ValidationError("Invalid webhook failover URL format");
      }

      if (!request.webhookFailoverUrl.startsWith("https://")) {
        throw new ValidationError("Webhook failover URL must use HTTPS");
      }
    }

    // Validate tags if provided
    if (request.tags) {
      if (request.tags.length > 20) {
        throw new ValidationError("Maximum 20 tags allowed");
      }

      for (const tag of request.tags) {
        if (!tag || tag.trim() === "") {
          throw new ValidationError("Tags cannot be empty");
        }

        if (tag.length > 50) {
          throw new ValidationError("Tag length cannot exceed 50 characters");
        }
      }
    }

    // Validate messageType if provided
    if (request.messageType) {
      const validTypes: MessageType[] = [
        "transactional",
        "marketing",
        "otp",
        "alert",
        "promotional",
      ];
      if (!validTypes.includes(request.messageType)) {
        throw new ValidationError(
          `Invalid messageType. Must be one of: ${validTypes.join(", ")}`,
        );
      }
    }
  }

  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  private getCountryCode(phoneNumber: string): string {
    const cleanNumber = phoneNumber.replace(/[^\d]/g, "");

    if (cleanNumber.startsWith("1")) {
      return "1"; // US/Canada
    }
    if (cleanNumber.startsWith("44")) {
      return "44"; // UK
    }
    if (cleanNumber.startsWith("33")) {
      return "33"; // France
    }

    // For other countries, try to extract first 1-3 digits
    if (cleanNumber.length >= 10) {
      const twoDigit = cleanNumber.substring(0, 2);
      if (
        [
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
        ].includes(twoDigit)
      ) {
        return twoDigit;
      }
    }

    return "unknown";
  }

  private isTollFree(phoneNumber: string): boolean {
    const cleanNumber = phoneNumber.replace(/[^\d]/g, "");
    return cleanNumber.match(/^1(800|833|844|855|866|877|888)/) !== null;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
