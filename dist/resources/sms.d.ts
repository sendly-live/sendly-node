import { HttpClient } from "../utils/http-client";
import { MessageType, RoutingInfo } from "../types/message-types";
export interface SMSSendRequest {
    to: string;
    from?: string;
    text?: string;
    messageType?: MessageType;
    mediaUrls?: string[];
    subject?: string;
    webhookUrl?: string;
    webhookFailoverUrl?: string;
    tags?: string[];
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
    mediaUrls?: string[];
    subject?: string;
    webhookUrl?: string;
    webhookFailoverUrl?: string;
    tags?: string[];
}
export declare class SMS {
    private httpClient;
    constructor(httpClient: HttpClient);
    send(request: SMSSendRequest): Promise<SMSSendResponse>;
    private validateSendRequest;
    private isValidPhoneNumber;
    private getCountryCode;
    private isTollFree;
    private isValidUrl;
}
//# sourceMappingURL=sms.d.ts.map